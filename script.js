const socialLinks = [
"https://whatsapp.com/channel/0029Vb7aIVe2UPBK5qaTPP1V",
"https://www.youtube.com/@DezZXMods",
"https://t.me/+nmDgMfjt-t9jYzA1",
"https://www.tiktok.com/@dezz_realmods",
"https://sociabuzz.com/dezzreal"
];

function goLink(id){

const links = {
1: "https://sub4unlock.co/vAp7Z",
2: "https://sub4unlock.co/vAp7Z",
3: "https://sub4unlock.co/vAp7Z",
4: "https://sub4unlock.co/vAp7Z",
5: "https://sub4unlock.co/vAp7Z",
6: "https://sub4unlock.co/vAp7Z",
7: "https://sub4unlock.co/vAp7Z",
8: "https://sub4unlock.co/vAp7Z",
9: "https://sub4unlock.co/vAp7Z",
10: "https://sub4unlock.co/vAp7Z"
};

window.open(links[id], "_blank", "noopener,noreferrer");

// refresh halaman ini setelah 0,1 detik
setTimeout(() => {
  location.reload();
}, 100);

}

let current = 1;
let lastClick = 0;

for(let i = 1; i <= 5; i++){

const step = document.getElementById("step" + i);

step.dataset.text = step.innerHTML;

step.onclick = () => {

if(i !== current){
alert("⚠️ Selesaikan langkah sebelumnya terlebih dahulu!");
return;
}

const now = Date.now();

if(current > 1 && now - lastClick < 15000){
alert("⏳ Tunggu 15 detik sebelum lanjut!");
return;
}

lastClick = now;

window.open(
socialLinks[i - 1],
"_blank"
);

step.style.pointerEvents = "none";

let countdown = 15;

step.innerHTML =
`⏳ Tunggu ${countdown} detik`;

const timer = setInterval(() => {

countdown--;

if(countdown <= 0){

clearInterval(timer);

step.classList.add("done");

step.innerHTML =
step.dataset.text + " ✅";

current++;

const selesai = current - 1;
const persen = (selesai / 5) * 100;

document.getElementById("progressFill").style.width = persen + "%";

document.getElementById("progressText").innerHTML =
`${selesai}/5 Langkah Selesai (${persen}%)`;

if(current === 6){

document.getElementById("unlockMenu").style.display = "block";

}

}else{

step.innerHTML =
`⏳ Tunggu ${countdown} detik`;

}

},1000);

};

}

function startWebsite(){

  document.getElementById("welcomeOverlay")
  .style.display = "none";

}