import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, addDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const msg = document.getElementById("msg");

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "dashboard.html";
  } catch (err) {
    msg.textContent = "Fout bij inloggen: " + err.message;
  }
}

async function register() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;
    const role = (email === "admin@admin.com") ? "admin" : "werknemer";
    await setDoc(doc(db, "users", uid), {
      email,
      role
    });
    window.location.href = "dashboard.html";
  } catch (err) {
    msg.textContent = "Fout bij registratie: " + err.message;
  }
}

async function logout() {
  await signOut(auth);
  window.location.href = "index.html";
}

auth.onAuthStateChanged(async user => {
  if (!user) return;

  const uid = user.uid;
  const snap = await getDoc(doc(db, "users", uid));
  const data = snap.data();
  if (!data) return;

  const content = document.getElementById("content");
  const welcome = document.getElementById("welcome");
  welcome.textContent = `Welkom ${data.email} (${data.role})`;

  if (data.role === "werknemer") {
    content.innerHTML = "<p>📄 Je ziet hier je contractgegevens.</p>";
  }

  if (data.role === "ceo") {
    content.innerHTML = `
      <p>✍️ Contract opstellen</p>
      <p>✅ Werknemers beheren</p>
    `;
  }

  if (data.role === "admin") {
    content.innerHTML = `
      <p>👑 Gebruikers promoten tot CEO</p>
      <input type="text" id="promoteEmail" placeholder="E-mail van gebruiker" />
      <button onclick="promote()">Promoveer tot CEO</button>
      <hr/>
      <p>➕ Vacature toevoegen</p>
      <input type="text" id="vacature" placeholder="Vacaturetitel" />
      <button onclick="addVacature()">Toevoegen</button>
      <ul id="vacatureList"></ul>
    `;
    loadVacatures();
  }
});

window.promote = async function() {
  const email = document.getElementById("promoteEmail").value;
  const usersSnap = await getDocs(collection(db, "users"));
  for (const docSnap of usersSnap.docs) {
    if (docSnap.data().email === email) {
      await updateDoc(doc(db, "users", docSnap.id), { role: "ceo" });
      alert("Promotie uitgevoerd!");
      return;
    }
  }
  alert("Gebruiker niet gevonden.");
};

window.addVacature = async function() {
  const title = document.getElementById("vacature").value;
  if (!title) return;
  await addDoc(collection(db, "vacatures"), { title });
  alert("Vacature toegevoegd!");
  loadVacatures();
};

async function loadVacatures() {
  const list = document.getElementById("vacatureList");
  list.innerHTML = "";
  const snap = await getDocs(collection(db, "vacatures"));
  snap.forEach(doc => {
    const li = document.createElement("li");
    li.textContent = doc.data().title;
    list.appendChild(li);
  });
}

if (document.getElementById("login")) window.login = login;
if (document.getElementById("register")) window.register = register;