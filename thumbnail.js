function getThumbnail(){

  const url = document.getElementById("ytUrl").value.trim();

  let videoId = "";

  if(url.includes("youtu.be/")){
    videoId = url.split("youtu.be/")[1].split("?")[0];
  }
  else if(url.includes("/shorts/")){
    videoId = url.split("/shorts/")[1].split("?")[0];
  }
  else if(url.includes("watch?v=")){
    videoId = new URL(url).searchParams.get("v");
  }

  if(!videoId){
    alert("Link tidak valid");
    return;
  }

  const thumbUrl =
  `https://img.youtube.com/vi/${videoId}/dezzofm.jpg`;

  const img = document.getElementById("thumbnail");
  img.src = thumbUrl;
  img.style.display = "block";

  const downloadBtn =
  document.getElementById("downloadThumb");

  downloadBtn.href = thumbUrl;
  downloadBtn.style.display = "block";
}
