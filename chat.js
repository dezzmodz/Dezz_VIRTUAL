import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

/* ================= FIREBASE ================= */

const firebaseConfig = {
apiKey: "AIzaSyCrp6zG18rZ4ori1rossW6-2Ho1OBdvT0c",
authDomain: "dezzofm-chat.firebaseapp.com",
projectId: "dezzofm-chat",
storageBucket: "dezzofm-chat.firebasestorage.app",
messagingSenderId: "85498233362",
appId: "1:85498233362:web:c70040692873a8216fcecb"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ================= ADMIN ================= */

function isAdmin() {
return localStorage.getItem("isAdmin") === "true";
}

window.adminLogin = async function () {

const code =
document.getElementById("adminCode").value.trim();

const snap =
await getDoc(doc(db, "settings", "admin"));

if (!snap.exists()) {
alert("Data admin tidak ditemukan");
return;
}

if (code === snap.data().code) {

localStorage.setItem(
  "isAdmin",
  "true"
);

alert("Login admin berhasil");
location.reload();

} else {

alert("Kode admin salah");

}
};

window.adminLogout = function () {

localStorage.removeItem("isAdmin");

alert("Logout berhasil");

location.reload();
};

/* ================= BAN ================= */

window.banUser = async function (username) {

if (!isAdmin()) {
alert("Bukan admin");
return;
}

const reason =
prompt("Alasan ban:");

await setDoc(
doc(
db,
"bannedUsers",
username.toLowerCase()
),
{
reason: reason || "spam",
time: serverTimestamp(),
by: "admin"
}
);

alert(username + " berhasil diban");
};

/* ================= UNBAN ================= */

window.unbanUser = async function (username) {

if (!isAdmin()) {
alert("Bukan admin");
return;
}

await deleteDoc(
doc(
db,
"bannedUsers",
username.toLowerCase()
)
);

alert(username + " berhasil di-unban");
};

/* ================= SEND MESSAGE ================= */

window.sendMessage = async function () {

const name =
document
.getElementById("username")
.value
.trim()
.toLowerCase();

const message =
document
.getElementById("message")
.value
.trim();

if (!name || !message) {

alert("Isi nama dan pesan dulu");
return;

}

localStorage.setItem(
"dezz_user",
name
);

/* CEK BAN */

const banSnap =
await getDoc(
doc(
db,
"bannedUsers",
name
)
);

if (banSnap.exists()) {

alert("Kamu dibanned dari chat");
return;

}

/* COOLDOWN 15 MENIT */

const lastSend =
localStorage.getItem("lastSend");

if (
lastSend &&
Date.now() - Number(lastSend) < 900000
) {

alert(
  "⏳ Tunggu 15 menit sebelum kirim lagi"
);

return;

}

localStorage.setItem(
"lastSend",
Date.now()
);

await addDoc(
collection(db, "messages"),
{
name,
message,
time: serverTimestamp()
}
);

document.getElementById(
"message"
).value = "";
};
window.clearAllMessages = async function(){

  if(!isAdmin()){
    alert("Bukan admin");
    return;
  }

  if(!confirm("Hapus SEMUA pesan?")) return;

  const snap = await getDocs(
    collection(db,"messages")
  );

  for(const d of snap.docs){
    await deleteDoc(d.ref);
  }

  alert("Semua pesan berhasil dihapus");
}
const btn = document.getElementById("clearChatBtn");

if(btn && isAdmin()){
  btn.style.display = "block";
}
if (isAdmin()) {
  document.getElementById("logoutBtn").style.display = "block";
}
/* ================= CHAT ================= */

const q = query(
  collection(db, "messages"),
  orderBy("time")
);

onSnapshot(q, (snapshot) => {

  const box = document.getElementById("messages");
  if (!box) return;

  box.innerHTML = "";

  snapshot.forEach((d) => {

    const data = d.data();

    const isMe =
      data.name === localStorage.getItem("dezz_user");

    const waktu =
      data.time?.toDate
        ? data.time.toDate()
        : new Date();

    box.innerHTML += `
      <div style="
        background:${isMe ? "#2563eb" : "#1f2937"};
        color:white;
        padding:10px;
        margin:8px 0;
        border-radius:12px;
        max-width:80%;
        float:${isMe ? "right" : "left"};
        clear:both;
      ">

        <b>${data.name}</b>

        <div style="
          margin-top:5px;
          word-break:break-word;
        ">
          ${data.message}
        </div>

        <small style="
          display:block;
          margin-top:5px;
          color:#94a3b8;
        ">
          ${waktu.toLocaleDateString("id-ID")}
          -
          ${waktu.toLocaleTimeString("id-ID")}
        </small>

        ${
          isAdmin()
            ? `
              <button
                onclick="banUser('${data.name}')"
                style="
                  margin-top:6px;
                  background:#dc2626;
                  color:white;
                  border:none;
                  border-radius:4px;
                  padding:2px 8px;
                  font-size:11px;
                  cursor:pointer;
                ">
                 Ban
              </button>
            `
            : ""
        }

      </div>
    `;

  });

});

/* ================= BAN LIST ================= */

onSnapshot(
  collection(db, "bannedUsers"),
  (snapshot) => {

    const box = document.getElementById("banList");
    if (!box) return;

    box.innerHTML = "<h3> Daftar User Dibanned</h3>";

    snapshot.forEach((d) => {

      const data = d.data();


      const waktu =
        data.time?.toDate
          ? data.time.toDate()
          : new Date();

      box.innerHTML += `
        <div style="
          background:#1f2937;
          color:white;
          padding:10px;
          margin:8px 0;
          border-radius:10px;
        ">

          <b>${d.id}</b><br>

          Alasan: ${data.reason || "-"}<br>

          Diban oleh: ${data.by || "-"}<br>

          <small style="color:#94a3b8;">
            ${waktu.toLocaleDateString("id-ID")}
            -
            ${waktu.toLocaleTimeString("id-ID")}
          </small>

          ${
            isAdmin()
              ? `
                <br><br>
                <button
                  onclick="unbanUser('${d.id}')"
                  style="
                    background:#16a34a;
                    color:white;
                    border:none;
                    border-radius:4px;
                    padding:4px 10px;
                    cursor:pointer;
                  ">
                   Unban
                </button>
              `
              : ""
          }

        </div>
      `;
    });

  }
);