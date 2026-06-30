// ==========================
// FIREBASE IMPORT
// ==========================

import {

onAuthStateChanged

} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {

doc,
getDoc,
setDoc,

collection,
getDocs,
addDoc,

query,
orderBy,

onSnapshot,

serverTimestamp

} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import { auth, db } from "./firebase.js";

// ==========================
// VARIABLE
// ==========================

let myUid = "";

let myData = {};

let selectedUser = null;

let roomId = "";

// ==========================
// LOGIN CHECK
// ==========================

onAuthStateChanged(auth, async(user)=>{

if(!user){

location.href="login.html";

return;

}

myUid=user.uid;

await loadMyProfile();

loadUsers();

});

// ==========================
// LOAD MY PROFILE
// ==========================

async function loadMyProfile(){

const snap = await getDoc(
doc(db,"users",myUid)
);

if(!snap.exists()) return;

myData = snap.data();

document.getElementById("myName").innerHTML =
myData.displayName || myData.username;

document.getElementById("myPhoto").src =
(myData.photo || "https://iili.io/C5r365x.th.jpg") + "?t=" + Date.now();


}

// ==========================
// LOAD USERS
// ==========================

async function loadUsers(){

const list=document.getElementById("userList");

list.innerHTML="";

const users=await getDocs(

collection(db,"users")

);

users.forEach((docSnap)=>{

if(docSnap.id===myUid)return;

const user=docSnap.data();

const div=document.createElement("div");

div.className="user";

div.dataset.uid=docSnap.id;

div.innerHTML=

`

<img src="${user.photo||'https://iili.io/C5r365x.th.jpg'}">

<div class="user-info">

<b>${user.displayName||user.username}</b>

<small>

${user.online?"🟢 Online":"⚫ Offline"}

</small>

</div>

`;

div.onclick=()=>{

openChat(

docSnap.id,

user

);

};

list.appendChild(div);

});

}

// ==========================
// SEARCH USER
// ==========================

document

.getElementById("searchUser")

.addEventListener("keyup",()=>{

const key=

document

.getElementById("searchUser")

.value

.toLowerCase();

document

.querySelectorAll(".user")

.forEach((item)=>{

const txt=

item.innerText

.toLowerCase();

item.style.display=

txt.includes(key)?

"flex":

"none";

});

});

// ==========================
// ROOM ID
// ==========================

function createRoom(uid1, uid2) {
  return (
    [uid1, uid2].sort().join("_")
  );
}

// ==========================
// OPEN CHAT
// ==========================

async function openChat(uid,user){

selectedUser=uid;

roomId=createRoom(

myUid,

uid

);

document

.getElementById("chatName")

.innerHTML=

user.displayName||

user.username;

document

.getElementById("chatStatus")

.innerHTML=

user.online?

"🟢 Online":

"⚫ Offline";

document.getElementById("chatBio").innerHTML =
user.bio || "Belum ada bio.";

document.getElementById("chatPhoto").src =
  (user.photo || "https://iili.io/C5r365x.th.jpg") + "?t=" + Date.now();

await setDoc(

doc(db,"rooms",roomId),

{

participants:[

myUid,

uid

]

},

{

merge:true

}

);

loadMessages();

}
// ==========================
// LOAD MESSAGES
// ==========================

function loadMessages(){

const box=document.getElementById("messages");

box.innerHTML="";

const q=query(
collection(db,"rooms",roomId,"messages"),
orderBy("time","asc")
);

onSnapshot(q,(snapshot)=>{

box.innerHTML="";

snapshot.forEach((docSnap)=>{

    const msg = docSnap.data();

    const div = document.createElement("div");

    div.className = msg.sender === myUid
        ? "message me"
        : "message other";

    let jam = "";

    if(msg.time){
        const d = msg.time.toDate();
        jam = d.toLocaleTimeString([],{
            hour:"2-digit",
            minute:"2-digit"
        });
    }

    let text = (msg.text || "")

    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")

    .replace(/(https?:\/\/[^\s<]+)/gi,
        '<a href="$1" target="_blank">$1</a>')

    .replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,})/gi,
        '<a href="mailto:$1">$1</a>')

    .replace(/\*\*(.*?)\*\*/gs,"<b>$1</b>")
    .replace(/\*(.*?)\*/gs,"<i>$1</i>")
    .replace(/__(.*?)__/gs,"<u>$1</u>")
    .replace(/~~(.*?)~~/gs,"<s>$1</s>")

    .replace(/\|\|(.*?)\|\|/gs,
        '<span class="spoiler">$1</span>')

    .replace(/`([^`]+)`/g,"<code>$1</code>")

    .replace(/```([\s\S]*?)```/g,
        "<pre><code>$1</code></pre>")

    .replace(/^> (.*)$/gm,
        "<blockquote>$1</blockquote>")

    .replace(/^### (.*)$/gm,"<h3>$1</h3>")
    .replace(/^## (.*)$/gm,"<h2>$1</h2>")
    .replace(/^# (.*)$/gm,"<h1>$1</h1>")

    .replace(/^- (.*)$/gm,"• $1")

    .replace(/@([a-zA-Z0-9_]+)/g,
        '<span class="mention">@$1</span>')

    .replace(/#([a-zA-Z0-9_]+)/g,
        '<span class="hashtag">#$1</span>')

    .replace(/\n/g,"<br>");

let isi = "";

if (msg.image) {
    isi += `
        <img src="${msg.image}" class="chat-image">
    `;
}

if (text) {
    isi += `
        <div class="chat-text">${text}</div>
    `;
}

    div.innerHTML = `
    <div class="bubble">
        ${isi}
        <span class="time">${jam}</span>
    </div>
    `;

    box.appendChild(div);

});

box.scrollTop=box.scrollHeight;

});

}

// ==========================
// SEND MESSAGE
// ==========================

window.sendMessage = async function () {

    if (!selectedUser) {
        alert("Pilih pengguna dulu.");
        return;
    }

    const input = document.getElementById("message");
const photoInput = document.getElementById("photoInput");
const photo = photoInput.files[0];

    const text = input.value.trim();
    
    // kalau kosong semua
    if (!text && !photo) return;

    try {

        let imageUrl = "";

        // Upload gambar dulu kalau ada
        if (photo) {
            imageUrl = await uploadImage(photo);
        }

        // Simpan ke Firebase
        await addDoc(
    collection(db,"rooms",roomId,"messages"),
    {
        sender: myUid,
        text: text,
        image: imageUrl,
        time: serverTimestamp()
    }
);

        // Reset
        input.value = "";
        input.style.height = "50px";
        document.getElementById("photoInput").value = "";

    } catch (err) {

        console.error(err);
        alert(err.message);

    }

}

// ==========================
// ENTER = SEND
// ==========================

document.getElementById("message").addEventListener("keydown", (e) => {

// Enter = baris baru  
if (e.key === "Enter" && !e.ctrlKey) {  
    return;  
}  

// Ctrl + Enter = kirim pesan  
if (e.key === "Enter" && e.ctrlKey) {  
    e.preventDefault();  
    sendMessage();  
}

});

// ==========================
// AUTO RESIZE TEXTAREA
// ==========================

const textarea=document.getElementById("message");

textarea.addEventListener("input",()=>{

textarea.style.height="50px";

textarea.style.height=
textarea.scrollHeight+"px";

});

// ==========================
// DEFAULT CHAT
// ==========================

document.getElementById("messages").innerHTML=

`

<div style="

margin:auto;

color:#8696a0;

text-align:center;

padding-top:120px;

font-size:18px;

">

💬

<br><br>

Pilih pengguna untuk mulai chat.

</div>

`;
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("spoiler")) {
        e.target.classList.toggle("hidden");
    }
});
document.getElementById("photoBtn").onclick = () => {
    document.getElementById("photoInput").click();
};

    const IMGBB_API_KEY = "513fb30ed6cefebbb37a4700f2e7098d";
// atau gunakan key yang satunya jika ini tidak bekerja

async function uploadImage(file){

    const form = new FormData();
    form.append("image", file);

    const res = await fetch(
        `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
        {
            method: "POST",
            body: form
        }
    );

    const data = await res.json();

    if(!data.success){
        console.log(data);
        throw new Error("Upload gagal");
    }

    return data.data.url;
}
