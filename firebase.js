<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
  import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
  import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

  const firebaseConfig = {
    apiKey: "JOUW_API_KEY",
    authDomain: "JOUW_PROJECT_ID.firebaseapp.com",
    projectId: "JOUW_PROJECT_ID",
    storageBucket: "JOUW_PROJECT_ID.appspot.com",
    messagingSenderId: "JOUW_SENDER_ID",
    appId: "JOUW_APP_ID"
  };

  const app = initializeApp(firebaseConfig);
  window.auth = getAuth(app);
  window.db = getFirestore(app);
</script>
