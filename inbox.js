import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
  collection,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

// ==========================
// AUTH CHECK
// ==========================

onAuthStateChanged(auth, (user) => {

  if (!user) {
    location.href = "login.html";
    return;
  }

  loadInbox(user.uid);

});

// ==========================
// LOAD INBOX REALTIME
// ==========================

function loadInbox(myUid) {

  const box = document.getElementById("chatList");

  const q = query(collection(db, "users"));

  onSnapshot(q, (snapshot) => {

    box.innerHTML = "";

    snapshot.forEach((docSnap) => {

      if (docSnap.id === myUid) return;

      const u = docSnap.data();

      const roomId = [myUid, docSnap.id].sort().join("_");

      const div = document.createElement("div");
      div.className = "chat-item";

      div.onclick = () => {
        location.href = "chat.html?uid=" + docSnap.id;
      };

      div.innerHTML = `
        <img src="${u.photo || 'https://iili.io/C5r365x.th.jpg'}">

        <div class="chat-info">
          <b>${u.displayName || u.username}</b>

          <small id="last-${docSnap.id}">
            Loading...
          </small>
        </div>
      `;

      box.appendChild(div);

      // ==========================
      // REALTIME LAST MESSAGE
      // ==========================

      const msgQuery = query(
        collection(db, "rooms", roomId, "messages"),
        orderBy("time", "desc")
      );

      onSnapshot(msgQuery, (msgSnap) => {

        const el = document.getElementById("last-" + docSnap.id);
        if (!el) return;

        if (!msgSnap.empty) {
          el.innerText = msgSnap.docs[0].data().text;
        } else {
          el.innerText = "Belum ada pesan";
        }

      });

    });

  });

}