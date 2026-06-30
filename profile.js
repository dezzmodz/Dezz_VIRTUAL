import { auth, db } from "./firebase.js";

import {
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
doc,
getDoc,
updateDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

// ==========================
// LOAD PROFILE
// ==========================

onAuthStateChanged(auth, async(user)=>{

if(!user){

location.href="login.html";

return;

}

const snap=await getDoc(
doc(db,"users",user.uid)
);

if(!snap.exists()) return;

const data=snap.data();

document.getElementById("displayName").value=
data.displayName||"";

document.getElementById("bio").value=
data.bio||"";

document.getElementById("photo").value=
data.photo||"";

document.getElementById("photoPreview").src=
data.photo||"https://iili.io/C5r365x.th.jpg";

});

// ==========================
// PREVIEW FOTO
// ==========================

document.getElementById("photo").addEventListener("input",()=>{

document.getElementById("photoPreview").src=
document.getElementById("photo").value;

});

// ==========================
// SAVE PROFILE
// ==========================

window.saveProfile = async function(){

const uid=auth.currentUser.uid;

await updateDoc(

doc(db,"users",uid),

{

displayName:
document.getElementById("displayName").value.trim(),

bio:
document.getElementById("bio").value.trim(),

photo:
document.getElementById("photo").value.trim()

}

);

alert("Profil berhasil disimpan.");

location.href = "chat.html";

}