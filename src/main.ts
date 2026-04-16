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
        if (input.value.trim().toLowerCase() === 'password') {
          triggerUnlock();
        } else {
          input.value = '';
          input.placeholder = "Wrong Passcode. Try 'password'";
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
(window as any).openModal = (projectTitle: string) => {
  const modal = document.getElementById('os-modal')!;
  const modalTitle = document.getElementById('modal-title')!;
  const modalContent = document.getElementById('modal-content')!;

  modalTitle.innerText = `~/projects/${projectTitle.toLocaleLowerCase().replace(/\s+/g, '_')}.exe`;
  modalContent.innerHTML = `
    <h3 style="color: var(--accent-color); margin-bottom: 1rem;">Executing ${projectTitle}...</h3>
    <p style="color: var(--text-secondary);">Booting container environment. Stand by.</p>
  `;

  modal.classList.add('modal-open');
  document.body.style.overflow = 'hidden';
};

(window as any).closeModal = () => {
  const modal = document.getElementById('os-modal')!;
  modal.classList.remove('modal-open');
  document.body.style.overflow = 'auto';
};

function renderPortfolio() {
  const heroContainer = document.getElementById('hero-container')!;
  heroContainer.innerHTML = `
    <h1 style="font-size: 3.5rem; font-weight: 700; letter-spacing: -0.03em; margin-bottom: 0.5rem; background: linear-gradient(135deg, #fff 0%, #a1a1a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
      ${resumeData.header.name}
    </h1>
    <h2 style="color: var(--accent-color); font-size: 1.4rem; font-weight: 500; margin-bottom: 1.5rem;">${resumeData.header.title}</h2>
    <p style="color: var(--text-secondary); max-width: 650px; line-height: 1.7; font-size: 1.1rem;">
      I'm a recent CS grad (with a minor in AI) operating out of ${resumeData.header.location}. I love bridging the gap between heavy, complex backend systems and creative, interactive frontend experiences. 
    </p>
  `;

  const expContainer = document.getElementById('experience-container')!;
  document.querySelector('.projects-section h3')!.innerHTML = "Experience"; 
  
  resumeData.experience.forEach(job => {
    const bulletsHtml = job.bullets.map(b => `<li style="margin-bottom: 0.8rem; color: var(--text-secondary); margin-left: 1.2rem;">${b}</li>`).join('');
    
    expContainer.innerHTML += `
      <article class="project-card" style="grid-column: 1 / -1; cursor: default;">
        <h4 style="color: var(--text-primary); font-size: 1.3rem;">${job.role}</h4>
        <p style="color: var(--accent-color); font-size: 1rem; margin-bottom: 0.2rem;">${job.company}</p>
        <p style="color: #555; font-size: 0.9rem; margin-bottom: 1.5rem;">${job.date}</p>
        <ul style="line-height: 1.6;">
          ${bulletsHtml}
        </ul>
      </article>
    `;
  });

  const projContainer = document.getElementById('projects-container')!;
  document.querySelectorAll('.projects-section h3')[1].innerHTML = "Selected Work";

  resumeData.projects.forEach(proj => {
    const techHtml = proj.tech?.map(t => `<span class="tech-pill">${t}</span>`).join('') || '';

    projContainer.innerHTML += `
      <article class="project-card interactive-card" onclick="openModal('${proj.title}')">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
          <h4 style="color: var(--text-primary); font-size: 1.2rem;">${proj.title}</h4>
          <span style="color: #555;">↗</span>
        </div>
        <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 1.5rem; flex-grow: 1;">${proj.description}</p>
        <div class="tech-stack">
          ${techHtml}
        </div>
      </article>
    `;
  });
}
renderPortfolio();
initializeAI();
