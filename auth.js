import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
getFirestore,
collection,
addDoc,
query,
where,
getDocs,
doc,
getDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

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

window.loginUser = async function(){

if(localStorage.getItem("dezz_user")){

  alert("⚠️ Perangkat ini sudah pernah login!");

  return;

}

const name =
document.getElementById("loginName")
.value.trim().toLowerCase();

if(!name){
alert("Masukkan nama dulu!");
return;
}
if(name.length < 3){
  alert("Nama minimal 3 karakter");
  return;
}

if(name.length > 12){
  alert("Nama maksimal 12 karakter");
  return;
}
const regex = /^[a-zA-Z0-9_]+$/;

if(!regex.test(name)){
alert("Nama hanya boleh huruf, angka, dan underscore (_)");
return;
}

const cekNama = query(
  collection(db,"users"),
  where("name","==",name)
);

const hasil = await getDocs(cekNama);

if(!hasil.empty){

  alert("❌ The name is already registered, please use another name.");

  return;

}
const semuaUser = await getDocs(
  collection(db,"users")
);

if(semuaUser.size >= 100){

  alert("🚫 Pendaftaran sudah penuh!");

  return;

}

try{

await addDoc(
  collection(db,"users"),
  {
  name: name,
  createdAt: Date.now(),
  device: navigator.userAgent
}
);

localStorage.setItem(
  "dezz_user",
  name
);

document.getElementById("userInfo").innerHTML =
  `✅ Welcome ${name}`;

document.getElementById("startBtn").disabled = false;

}catch(err){

alert("Gagal menyimpan data");

console.log(err);

}

};

window.addEventListener("load",()=>{

const saved =
localStorage.getItem("dezz_user");

if(saved){

document.getElementById("userInfo").innerHTML =
  `✅ Welcome ${saved}`;

document.getElementById("startBtn").disabled = false;

}

});

window.logoutUser = async function(){

const kodeInput =
prompt("Masukkan kode admin:");

if(!kodeInput) return;

try{

const adminRef =
doc(db,"settings","admin");

const adminSnap =
await getDoc(adminRef);

console.log("exists:", adminSnap.exists());
console.log("data:", adminSnap.data());

if(!adminSnap.exists()){

  alert("Data admin tidak ditemukan");

  return;

}

const adminCode =
adminSnap.data().code;

if(kodeInput !== adminCode){

  alert("❌ Kode salah!");

  return;

}

localStorage.removeItem("dezz_user");

alert("✅ Logout berhasil");

location.reload();

}catch(err){

console.log(err);

alert("Gagal membaca data admin");

}

};