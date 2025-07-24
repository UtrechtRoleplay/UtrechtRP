<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
  import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
  import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

  const firebaseConfig = {
    export const firebaseConfig = {
  apiKey: "AIzaSyBl1JNsn64WjiPorFpCN48aboNdSzS1Py4",
  authDomain: "utrechtcontracten.firebaseapp.com",
  projectId: "utrechtcontracten",
  storageBucket: "utrechtcontracten.firebasestorage.app",
  messagingSenderId: "1088300511903",
  appId: "1:1088300511903:web:f10ba519b201acc237a8aa",
  measurementId: "G-ZRF8GZDNLV"
};
  };

  const app = initializeApp(firebaseConfig);
  window.auth = getAuth(app);
  window.db = getFirestore(app);
</script>
