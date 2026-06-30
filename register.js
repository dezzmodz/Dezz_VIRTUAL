import { auth, db } from "./firebase.js";

import {
createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
doc,
setDoc,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

async function register() {

const username =
document.getElementById("username").value.trim();

const displayName =
document.getElementById("displayName").value.trim();

const email =
document.getElementById("email").value.trim();

const password =
document.getElementById("password").value;

const password2 =
document.getElementById("password2").value;

if(password !== password2){

alert("Password tidak sama.");

return;

}

if(
!username ||
!displayName ||
!email ||
!password ||
!password2
){
alert("Lengkapi semua data.");
return;
}

try{

const result =
await createUserWithEmailAndPassword(

auth,
email,
password

);

const uid = result.user.uid;

await setDoc(

doc(db,"users",uid),

{

username,

displayName,

email,

photo:"https://iili.io/C54s38X.jpg",

bio:"",

role:"user",

online:true,

lastSeen:serverTimestamp(),

createdAt:serverTimestamp()

}

);

alert("Register berhasil!");

location.href="login.html";

}catch(err){

alert(err.message);

}

}
document.getElementById("registerBtn").addEventListener("click", register);