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
(myData.photo || "https://files.catbox.moe/7n2m2x.jpg") + "?t=" + Date.now();


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

<img src="${user.photo||'https://i.imgur.com/7k12EPD.png'}">

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
  (user.photo || "https://files.catbox.moe/7n2m2x.jpg") + "?t=" + Date.now();

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

const msg=docSnap.data();

const div=document.createElement("div");

div.className=
msg.sender===myUid
?
"message me"
:
"message other";

let jam="";

if(msg.time){

const d=msg.time.toDate();

jam=d.toLocaleTimeString([],{
hour:"2-digit",
minute:"2-digit"
});

}

  let text = msg.text

// Escape HTML
.replace(/&/g, "&amp;")
.replace(/</g, "&lt;")
.replace(/>/g, "&gt;")

// URL
.replace(
    /(https?:\/\/[^\s<]+)/gi,
    '<a href="$1" target="_blank">$1</a>'
)

// Email
.replace(
    /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,})/gi,
    '<a href="mailto:$1">$1</a>'
)

// Bold **text**
.replace(/\*\*(.*?)\*\*/gs, "<b>$1</b>")

// Italic *text*
.replace(/\*(.*?)\*/gs, "<i>$1</i>")

// Underline __text__
.replace(/__(.*?)__/gs, "<u>$1</u>")

// Strike ~~text~~
.replace(/~~(.*?)~~/gs, "<s>$1</s>")

// Spoiler ||text||
.replace(/\|\|(.*?)\|\|/gs,
'<span class="spoiler">$1</span>')

// Inline Code
.replace(/`([^`]+)`/g,
"<code>$1</code>")

// Code Block
.replace(
/```([\s\S]*?)```/g,
"<pre><code>$1</code></pre>"
)

// Quote
.replace(/^> (.*)$/gm,
"<blockquote>$1</blockquote>")

// Heading
.replace(/^# (.*)$/gm,"<h1>$1</h1>")
.replace(/^## (.*)$/gm,"<h2>$1</h2>")
.replace(/^### (.*)$/gm,"<h3>$1</h3>")

// Bullet List
.replace(/^- (.*)$/gm,"• $1")

// Mention @username
.replace(
/@([a-zA-Z0-9_]+)/g,
'<span class="mention">@$1</span>'
)

// Hashtag
.replace(
/#([a-zA-Z0-9_]+)/g,
'<span class="hashtag">#$1</span>'
)

// Baris baru
.replace(/\n/g,"<br>");


div.innerHTML = `
<div class="bubble">
    ${text}
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
  const text = input.value.trim();

  if (text === "") return;

  try {

    await addDoc(
      collection(db, "rooms", roomId, "messages"),
      {
        sender: myUid,
        text: text,
        time: serverTimestamp()
      }
    );

    input.value = "";

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