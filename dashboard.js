
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc, getDoc, collection, addDoc, getDocs, query, where, updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const content = document.getElementById('content');

onAuthStateChanged(auth, async user => {
  if (!user) return window.location.href = "index.html";
  const userSnap = await getDoc(doc(db, "users", user.uid));
  const data = userSnap.data();
  if (!data) return;

  if (data.role === "admin") showAdminPanel();
  else if (data.role === "ceo") showCEOPanel(data);
  else showWerknemerPanel(data);
});

async function showAdminPanel() {
  content.innerHTML = `
    <h3>Admin-panel</h3>
    <input id="jobName" placeholder="Nieuwe baan">
    <button onclick="createJob()">Maak baan</button><br><br>
    <input id="ceoEmail" placeholder="Email CEO">
    <input id="ceoJob" placeholder="Baan">
    <button onclick="setCEO()">Stel CEO aan</button><br><br>
    <button onclick="showAllUsers()">Toon alle gebruikers</button>
    <ul id="userList"></ul>
  `;
}

async function createJob() {
  const name = document.getElementById('jobName').value;
  await addDoc(collection(db, "jobs"), { name });
  alert("Baan aangemaakt!");
}

async function setCEO() {
  const email = document.getElementById('ceoEmail').value;
  const job = document.getElementById('ceoJob').value;

  const q = query(collection(db, "users"), where("email", "==", email));
  const snap = await getDocs(q);
  if (!snap.empty) {
    const docRef = snap.docs[0].ref;
    await updateDoc(docRef, { role: "ceo", job });
    alert("CEO ingesteld");
  } else {
    alert("Gebruiker niet gevonden");
  }
}

async function showAllUsers() {
  const snap = await getDocs(collection(db, "users"));
  const list = document.getElementById("userList");
  list.innerHTML = "";

  snap.forEach(docSnap => {
    const data = docSnap.data();
    const li = document.createElement("li");
    li.innerText = `${data.name} (${data.role})`;

    if (data.role !== "admin") {
      const btn = document.createElement("button");
      btn.textContent = "Ontsla";
      btn.onclick = async () => {
        await updateDoc(doc(db, "users", docSnap.id), {
          role: "werknemer",
          job: ""
        });
        alert(`${data.name} is ontslagen`);
        showAllUsers();
      };
      li.appendChild(btn);
    }

    list.appendChild(li);
  });
}

async function showCEOPanel(userData) {
  content.innerHTML = `
    <h3>CEO-panel (${userData.job})</h3>
    <input id="vacancyTitle" placeholder="Vacature titel">
    <button onclick="createVacancy()">Open vacature</button><br><br>
    <button onclick="loadEmployees()">Toon werknemers</button>
    <ul id="employeeList"></ul>
    <h4>Sollicitaties voor ${userData.job}</h4>
    <ul id="sollicitatieList"></ul>
  `;
  loadSollicitaties(userData.job);
}

async function createVacancy() {
  const title = document.getElementById('vacancyTitle').value;
  const userSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
  await addDoc(collection(db, "vacancies"), {
    title,
    job: userSnap.data().job,
    postedBy: auth.currentUser.uid
  });
  alert("Vacature geplaatst");
}

async function loadEmployees() {
  const userSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
  const job = userSnap.data().job;

  const q = query(collection(db, "users"), where("job", "==", job), where("role", "==", "werknemer"));
  const snap = await getDocs(q);
  const list = document.getElementById("employeeList");
  list.innerHTML = "";
  snap.forEach(doc => {
    const li = document.createElement("li");
    li.innerText = doc.data().name;
    list.appendChild(li);
  });
}

async function loadSollicitaties(job) {
  const snap = await getDocs(query(collection(db, "applications"), where("job", "==", job), where("status", "==", "open")));
  const list = document.getElementById("sollicitatieList");
  list.innerHTML = "";

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    const userSnap = await getDoc(doc(db, "users", data.uid));
    const li = document.createElement("li");
    li.innerHTML = `<b>${userSnap.data().name}</b>: ${data.motivation}`;

    const acceptBtn = document.createElement("button");
    acceptBtn.innerText = "Stuur contract";
    acceptBtn.onclick = async () => {
      await addDoc(collection(db, "contracts"), {
        to: data.uid,
        from: auth.currentUser.uid,
        job,
        status: "open",
        timestamp: Date.now()
      });
      await updateDoc(doc(db, "applications", docSnap.id), { status: "contract_sent" });
      alert("Contract gestuurd!");
    };
    li.appendChild(acceptBtn);

    list.appendChild(li);
  }
}

function showWerknemerPanel(userData) {
  content.innerHTML = `
    <h3>Welkom ${userData.name}</h3>
    <p>Je bent ${userData.role}</p>
    <h4>Beschikbare vacatures:</h4>
    <ul id="vacList"></ul>
    <h4>Open contracten:</h4>
    <ul id="contractList"></ul>
  `;
  loadVacatures();
  loadContracten();
}

async function loadVacatures() {
  const list = document.getElementById("vacList");
  list.innerHTML = "";
  const snap = await getDocs(collection(db, "vacancies"));
  snap.forEach(docSnap => {
    const data = docSnap.data();
    const li = document.createElement("li");
    li.innerText = `${data.title} (${data.job})`;

    const btn = document.createElement("button");
    btn.innerText = "Solliciteer";
    btn.onclick = () => showSollicitatieForm(data.job, docSnap.id);
    li.appendChild(btn);

    list.appendChild(li);
  });
}

function showSollicitatieForm(job, vacancyId) {
  const motivation = prompt(`Waarom wil je bij ${job}?`);
  if (!motivation) return;
  addDoc(collection(db, "applications"), {
    uid: auth.currentUser.uid,
    job,
    motivation,
    vacancyId,
    status: "open"
  }).then(() => alert("Sollicitatie verzonden!"));
}

async function loadContracten() {
  const list = document.getElementById("contractList");
  list.innerHTML = "";
  const q = query(collection(db, "contracts"), where("to", "==", auth.currentUser.uid), where("status", "==", "open"));
  const snap = await getDocs(q);

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    const li = document.createElement("li");
    li.innerText = `Contract voor ${data.job}`;

    const accept = document.createElement("button");
    accept.innerText = "Accepteer";
    accept.onclick = async () => {
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        role: "werknemer",
        job: data.job
      });
      await updateDoc(doc(db, "contracts", docSnap.id), {
        status: "accepted",
        timestamp: Date.now()
      });
      await addDoc(collection(db, "logs"), {
        action: "Contract geaccepteerd",
        user: auth.currentUser.uid,
        by: data.from,
        job: data.job,
        timestamp: Date.now()
      });
      alert("Je hebt het contract geaccepteerd!");
      loadContracten();
    };

    const reject = document.createElement("button");
    reject.innerText = "Weiger";
    reject.onclick = async () => {
      await updateDoc(doc(db, "contracts", docSnap.id), { status: "rejected" });
      alert("Je hebt het contract geweigerd.");
      loadContracten();
    };

    li.appendChild(accept);
    li.appendChild(reject);
    list.appendChild(li);
  }
}
