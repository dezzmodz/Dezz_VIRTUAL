import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "API_KEY_KAMU",
  authDomain: "dezzofm-chat.firebaseapp.com",
  projectId: "dezzofm-chat",
  storageBucket: "dezzofm-chat.firebasestorage.app",
  messagingSenderId: "85498233362",
  appId: "1:85498233362:web:c70040692873a8216fcecb"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.sendMessage = async function(){

  const name =
  document.getElementById("chatName").value;

  const message =
  document.getElementById("chatInput").value;

  if(!name || !message) return;

  await addDoc(
    collection(db,"messages"),
    {
      name,
      message,
      time: Date.now()
    }
  );

  document.getElementById("chatInput").value = "";
};

const q = query(
  collection(db,"messages"),
  orderBy("time")
);

onSnapshot(q,(snapshot)=>{

  const box =
  document.getElementById("chatMessages");

  box.innerHTML = "";

  snapshot.forEach((doc)=>{

    const data = doc.data();

    box.innerHTML += `
      <div class="message">
        <b>${data.name}</b><br>
        ${data.message}
      </div>
    `;
  });

});