const video = document.getElementById("videoElement"); 
let currentStream = null; 
const picker = document.getElementById("filePicker"); 
const resizeBtn = document.getElementById("resizeBtn"); 
let currentPath = null; 
const pickBtn = document.getElementById("pickBtn");

const startTime = document.getElementById('startTime');
const endTime = document.getElementById('endTime');
const trimBtn = document.getElementById("trimBtn");

const muted = document.getElementById('muted');
const mp3 = document.getElementById('mp3');
const audioPath = null;

pickBtn.addEventListener("click", async () => {
  const filePath = await window.electronAPI.openFile();
  if (filePath) {
    currentPath = filePath;
    video.src = `file://${filePath}`;
  }
});

// Resolution stuff
const res480p = {
    width: 854,
    height: 480
};
const res720p = {
    width: 1280,
    height: 480
};
const res1080p = {
    width: 1920,
    height: 1080
};

resizeBtn.addEventListener("click", async (event) => {
  if (!currentPath) 
    return;
  let width = null;
  let height = null;
  let res = document.getElementById('resolutions').value;
  if(res == '480p'){
    width = res480p.width;
    height = res480p.height;
  }
  else if(res == '720p'){
    width = res720p.width;
    height = res720p.height;
  }
  else if(res == '1080p'){
    width = res1080p.width;
    height = res1080p.height;
  }
  const resizedPath = await window.electronAPI.resizeVideo({
    input: currentPath,
    width: width,
    height: height,
  });
  video.src = `file://${resizedPath}`;
});

// Trimming stuff
trimBtn.addEventListener("click", async () => {
    if (!currentPath) 
        return;
    let start = startTime.value;
    let end = endTime.value;
    const trimmedPath = await window.electronAPI.trimVideo({
        input: currentPath,
        start: start,
        end: end
    });
    video.src = `file://${trimmedPath}`;
});

// Add Caption stuff
addCaptionBtn.addEventListener("click", async ()=>{
    if(!currentPath)
        return;
    let height = document.getElementById('captionHeight').value;
    let captionBGcolor = document.getElementById('captionBGcolors').value;
    let caption = document.getElementById('caption').value;
    let font = document.getElementById('fonts').value;
    let fontColor = document.getElementById('colors').value;
    let fontSize = document.getElementById('fontSize').value;
    const captionedPath = await window.electronAPI.addCaption({
        input: currentPath,
        captionHeight: height,
        captionBGcolor: captionBGcolor,
        caption: caption,
        font: font,
        fontColor: fontColor,
        fontSize: fontSize
    });
    video.src = `file://${captionedPath}`;
});

// Format processor stuff
muted.addEventListener("click", async() => {
    if(!currentPath)
        return;
    const mutedPath = await window.electronAPI.muted({
        input: currentPath
    });
    video.src = `file://${mutedPath}`;
});

mp3.addEventListener("click", async() => {
    if(!currentPath)
        return;
    const mp3Path = await window.electronAPI.mp3({
        input: currentPath
    });
    video.src = `file://${mp3Path}`;
});

insertAudio.addEventListener("click", async() => {
    const filePath = await window.electronAPI.openFile();
    if (filePath) {
        audioPath = filePath;
        console.log("Audio Video merging not working fully. Check the code for source command to try and fix :D");
        // I am yet to add the logic for audio and video merging logic
        // Got stuck with ffmpeg stream and filters : 
        // ffmpeg -i input.mp4 -i audio.mp3 -filter_complex "[1:a]aloop=loop=-1:size=2e9[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -shortest output.mp4 
        // not fully working. check
    }
});

// Webcam stuff 
async function openCamera() { 
    try { 
        currentStream = await navigator.mediaDevices.getUserMedia({ video: true }); 
        video.srcObject = currentStream; 
    } catch (err) { 
        console.error("Error accessing webcam:", err); 
    } 
} 

function closeCamera() { 
    try { 
        if (currentStream) { 
            currentStream.getTracks().forEach(track => track.stop()); 
            video.srcObject = null; currentStream = null; 
        } 
    } catch (err) { 
        console.error("Error closing webcam:", err); 
    } 
}