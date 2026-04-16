import './style.css';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { resumeData } from './resume';


const videoElement = document.getElementById('webcam') as HTMLVideoElement;
const canvasElement = document.getElementById('output_canvas') as HTMLCanvasElement;
const canvasCtx = canvasElement.getContext('2d')!;

let handLandmarker: HandLandmarker;
let lastVideoTime = -1;
let unlockFrames = 0;
let isUnlocked = false;

async function initializeAI() {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
  );

  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
      delegate: "GPU"
    },
    runningMode: "VIDEO",
    numHands: 1
  });
  enableCam();
}

async function enableCam() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
    videoElement.srcObject = stream;

    videoElement.addEventListener("loadeddata", predictWebcam);
  } catch (error) {
    console.warn("Camera access denied or unavailable. Triggering fallback.");

    videoElement.classList.add('hidden');
    canvasElement.classList.add('hidden');
    
    const fallback = document.getElementById('terminal-fallback')!;
    fallback.classList.remove('hidden');
    

    const input = document.getElementById('override-input') as HTMLInputElement;
    input.focus();
    
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        if (input.value.trim().toLowerCase() === 'sudo unlock') {
          triggerUnlock();
        } else {
          input.value = '';
          input.placeholder = "Command not found. Try 'sudo unlock'";
        }
      }
    });
  }
}

async function predictWebcam() {
  canvasElement.width = videoElement.videoWidth;
  canvasElement.height = videoElement.videoHeight;

  if (videoElement.currentTime !== lastVideoTime) {
    lastVideoTime = videoElement.currentTime;

    const results = handLandmarker.detectForVideo(videoElement, performance.now());

    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    if (results.landmarks && results.landmarks.length > 0 && !isUnlocked) {
      const landmarks = results.landmarks[0];

      canvasCtx.fillStyle = "#ff0000";
      for (const landmark of landmarks) {
        canvasCtx.beginPath();
        canvasCtx.arc(landmark.x * canvasElement.width, landmark.y * canvasElement.height, 4, 0, 2 * Math.PI);
        canvasCtx.fill();
      }

      const indexUp = landmarks[8].y < landmarks[6].y;
      const middleUp = landmarks[12].y < landmarks[10].y;
      const ringDown = landmarks[16].y > landmarks[14].y;
      const pinkyDown = landmarks[20].y > landmarks[18].y;

      // FIX 1: Correctly placed else block
      if (indexUp && middleUp && ringDown && pinkyDown) {
        unlockFrames++;
        if (unlockFrames > 5) {
          triggerUnlock();
        }
      } else {
        unlockFrames = 0; 
      }
    }
  }

  if (!isUnlocked) {
    window.requestAnimationFrame(predictWebcam);
  }
}

function triggerUnlock() {
  isUnlocked = true;
  console.log("ACCESS GRANTED");

  if (videoElement.srcObject) {
    const stream = videoElement.srcObject as MediaStream;
    stream.getTracks().forEach(track => track.stop());
  }

  const gateway = document.getElementById('gateway-screen')!;
  const portfolio = document.getElementById('portfolio-screen')!;

  gateway.classList.add('fade-out');

  setTimeout(() => {
    gateway.classList.add('hidden');
    
    portfolio.classList.remove('hidden');
    
    setTimeout(() => {
      portfolio.classList.add('fade-in');
    }, 50);

  }, 800);
}

function renderPortfolio() {
  const heroContainer = document.getElementById('hero-container')!;
  heroContainer.innerHTML = `
    < h1 class="accent" > ${ resumeData.header.name } </h1>
    <h2>${resumeData.header.title}</h2>
    <p class="tagline">${resumeData.header.tagline}</p>
    <p class="location" style="margin-top: 1rem; color: var(--text-secondary);">${resumeData.header.location}</p>
  `;
  const expContainer = document.getElementById('experience-container')!;
  resumeData.experience.forEach(job => {
    const bulletsHtml = job.bullets.map(b=>`<li style="margin-bottom: 0.5rem; color: #ccc;">> ${b}</li>`).join('');
    
    expContainer.innerHTML += `
      <article class="project-card" style="grid-column: 1 / -1;">
        <h4>${job.role} @ ${job.company}</h4>
        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem;">${job.date}</p>
        <ul style="list-style: none; padding-left: 0;">
          ${bulletsHtml}
        </ul>
      </article>
      `;
  });
  const projContainer = document.getElementById('projects-container')!;
  resumeData.projects.forEach(proj => {
    const techHtml = proj.tech?.map(t => `<span>${t}</span>`).join('') || '';
    
    projContainer.innerHTML += `
      <article class="project-card">
        <h4>${proj.title}</h4>
        <p>${proj.description}</p>
        <div class="tech-stack">
          ${techHtml}
        </div>
      </article>
    `;
  });
}
renderPortfolio();
initializeAI();
