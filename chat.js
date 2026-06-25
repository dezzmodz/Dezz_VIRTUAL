import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

/* FIREBASE */
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

/* ================= SEND MESSAGE #dezz================= */
let cooldown = false;

window.sendMessage = async function () {

  const name = document.getElementById("username").value.trim();
  const message = document.getElementById("message").value.trim();

  if (!name || !message) {
    alert("Isi nama & pesan dulu");
    return;
  }

  if(message.length > 4096){
  alert("Pesan maksimal 4096 karakter");
  return;
}

  if(cooldown){
    alert("Tunggu 10 detik sebelum kirim lagi");
    return;
  }

  cooldown = true;

  try{

    await addDoc(
      collection(db,"messages"),
      {
        name,
        message,
        time: serverTimestamp()
      }
    );

    document.getElementById("message").value = "";

  }catch(err){

    console.log(err);
    alert("Gagal kirim pesan");

  }

  setTimeout(()=>{
    cooldown = false;
  },10000);
};


/* ================= PINNED MESSAGE ================= */
onSnapshot(doc(db, "settings", "pinned"), (snap) => {

  const pinBox = document.getElementById("pinnedMessage");
  if (!pinBox) return;

  if (!snap.exists()) {
    pinBox.innerHTML = "📌 Belum ada pesan disematkan";
    return;
  }

  const pins = snap.data().pins || [];

  pinBox.innerHTML = pins.map((pin, i) => `
    <div class="pin-item">
      <b>📌 ${i + 1}. ${pin.name}</b>
      <div>${pin.message}</div>
    </div>
  `).join("");

});

/* ================= CHAT REALTIME ================= */
const q = query(collection(db, "messages"), orderBy("time"));

onSnapshot(q, (snapshot) => {

  const box = document.getElementById("messages");
  if (!box) return;

  box.innerHTML = "";

  snapshot.forEach((docSnap) => {

    const data = docSnap.data();

    const waktu = data.time?.toDate ? data.time.toDate() : new Date();

    let textWithLinks = (data.message || "").replace(
      /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})/g,
      (url) => {
        let link = url.startsWith("http") ? url : "https://" + url;
        return `<a href="${link}" target="_blank" style="color:#4ea3ff;text-decoration:underline;">${url}</a>`;
      }
    );

    box.innerHTML += `
      <div class="msg">
        <div class="bubble">

          <b>${data.name}</b>

          <div>${textWithLinks}</div>

          <small>
            ${waktu.toLocaleDateString("id-ID")} -
            ${waktu.toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"})}
          </small>

          <button onclick="copyMessage(\`${data.message.replace(/`/g,"\\`")}\`)">
            📋 Salin
          </button>

          <button onclick='pinMessage(${JSON.stringify(data.name)},${JSON.stringify(data.message)})'>
            📌 Semat
          </button>

        </div>
      </div>
    `;
  });
});

/* ================= PIN MESSAGE (MAX 3 AUTO SHIFT) ================= */
window.pinMessage = async function (name, message) {

  try {

    const pinRef = doc(db, "settings", "pinned");
    const snap = await getDoc(pinRef);

    let pins = snap.exists() ? (snap.data().pins || []) : [];

    pins.push({ name, message });

    if (pins.length > 3) {
      pins.shift(); // auto hapus paling lama
    }

    await setDoc(pinRef, { pins });

  } catch (err) {
    console.log(err);
    alert("Gagal menyematkan");
  }
};

/* ================= COPY MESSAGE ================= */
window.copyMessage = function (text) {
  navigator.clipboard.writeText(text);
  alert("📋 Pesan disalin");
};