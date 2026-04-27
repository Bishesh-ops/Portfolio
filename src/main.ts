import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { resumeData } from './resume';
import { openModal, closeModal, setLenis } from './modal';

gsap.registerPlugin(ScrollTrigger);

const videoElement = document.getElementById('webcam') as HTMLVideoElement;
const canvasElement = document.getElementById('output_canvas') as HTMLCanvasElement;
const canvasCtx = canvasElement.getContext('2d')!;

let handLandmarker: HandLandmarker;
let lastVideoTime = -1;
let unlockFrames = 0;
let isUnlocked = false;

async function initializeAI() {
  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
  );

  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
      delegate: 'GPU',
    },
    runningMode: 'VIDEO',
    numHands: 1,
  });

  enableCam();
}

async function enableCam() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
    videoElement.srcObject = stream;
    videoElement.addEventListener('loadeddata', predictWebcam);
  } catch {
    videoElement.classList.add('hidden');
    canvasElement.classList.add('hidden');

    const fallback = document.getElementById('terminal-fallback')!;
    fallback.classList.remove('hidden');

    const input = document.getElementById('override-input') as HTMLInputElement;
    input.focus();

    input.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      if (input.value.trim().toLowerCase() === 'password') {
        triggerUnlock();
      } else {
        input.value = '';
        input.placeholder = "Try 'password'";
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

    if (results.landmarks?.length > 0 && !isUnlocked) {
      const landmarks = results.landmarks[0];

      canvasCtx.fillStyle = '#ff0000';
      for (const landmark of landmarks) {
        canvasCtx.beginPath();
        canvasCtx.arc(landmark.x * canvasElement.width, landmark.y * canvasElement.height, 4, 0, 2 * Math.PI);
        canvasCtx.fill();
      }

      const indexUp  = landmarks[8].y  < landmarks[6].y;
      const middleUp = landmarks[12].y < landmarks[10].y;
      const ringDown = landmarks[16].y > landmarks[14].y;
      const pinkyDown= landmarks[20].y > landmarks[18].y;

      if (indexUp && middleUp && ringDown && pinkyDown) {
        unlockFrames++;
        if (unlockFrames > 5) triggerUnlock();
      } else {
        unlockFrames = 0;
      }
    }
  }

  if (!isUnlocked) window.requestAnimationFrame(predictWebcam);
}

function triggerUnlock() {
  isUnlocked = true;

  if (videoElement.srcObject) {
    (videoElement.srcObject as MediaStream).getTracks().forEach(t => t.stop());
  }

  const gateway = document.getElementById('gateway-screen')!;
  const portfolio = document.getElementById('portfolio-screen')!;

  gateway.classList.add('fade-out');

  setTimeout(() => {
    gateway.classList.add('hidden');
    portfolio.classList.remove('hidden');
    setTimeout(() => {
      portfolio.classList.add('fade-in');
      initializeHighEndUI();
    }, 50);
  }, 800);
}

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
  document.querySelector('.projects-section h3')!.textContent = 'Experience';

  resumeData.experience.forEach(job => {
    const bulletsHtml = job.bullets.map(b => `<li style="margin-bottom: 0.8rem; color: var(--text-secondary); margin-left: 1.2rem;">${b}</li>`).join('');
    const article = document.createElement('article');
    article.className = 'project-card';
    article.style.cssText = 'grid-column: 1 / -1; cursor: default;';
    article.innerHTML = `
      <h4 style="color: var(--text-primary); font-size: 1.3rem;">${job.role}</h4>
      <p style="color: var(--accent-color); font-size: 1rem; margin-bottom: 0.2rem;">${job.company}</p>
      <p style="color: #555; font-size: 0.9rem; margin-bottom: 1.5rem;">${job.date}</p>
      <ul style="line-height: 1.6;">${bulletsHtml}</ul>
    `;
    expContainer.appendChild(article);
  });

  const projContainer = document.getElementById('projects-container')!;
  document.querySelectorAll('.projects-section h3')[1].textContent = 'Selected Work';

  resumeData.projects.forEach(proj => {
    const techHtml = proj.tech?.map(t => `<span class="tech-pill">${t}</span>`).join('') ?? '';
    const article = document.createElement('article');
    article.className = 'project-card interactive-card';
    article.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
        <h4 style="color: var(--text-primary); font-size: 1.2rem;">${proj.title}</h4>
        <span style="color: #555;">↗</span>
      </div>
      <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 1.5rem; flex-grow: 1;">${proj.description}</p>
      <div class="tech-stack">${techHtml}</div>
    `;
    article.addEventListener('click', () => openModal(proj.title));
    projContainer.appendChild(article);
  });

  const portfolioScreen = document.getElementById('portfolio-screen')!;
  const footer = document.createElement('div');
  footer.innerHTML = `
    <div style="margin-top: 6rem; padding-top: 3rem; border-top: 1px solid rgba(255,255,255,0.05); text-align: center; padding-bottom: 4rem;">
      <h2 style="font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem; color: var(--text-primary);">Let's Build Something.</h2>
      <p style="color: var(--text-secondary); max-width: 500px; margin: 0 auto 2rem auto; line-height: 1.6;">
        I am currently seeking full-time roles as an Associate Software Engineer or Frontend Developer. My inbox is always open.
      </p>
      <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
        <a href="mailto:bisheshshr@gmail.com" style="background: var(--text-primary); color: var(--bg-dark); padding: 0.8rem 1.5rem; border-radius: 8px; text-decoration: none; font-weight: 600; transition: transform 0.2s ease;">Get In Touch</a>
        <a href="https://github.com/Bishesh-ops" target="_blank" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: var(--text-primary); padding: 0.8rem 1.5rem; border-radius: 8px; text-decoration: none; font-weight: 500; transition: background 0.2s ease;">GitHub</a>
        <a href="/Bishesh_Shrestha_Resume.pdf" target="_blank" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: var(--text-primary); padding: 0.8rem 1.5rem; border-radius: 8px; text-decoration: none; font-weight: 500; transition: background 0.2s ease;">📄 Download Resume</a>
      </div>
    </div>
  `;
  portfolioScreen.appendChild(footer);
}

function initializeHighEndUI() {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
  });

  setLenis(lenis);

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);

  gsap.fromTo(
    '#hero-container > *',
    { y: 50, opacity: 0, filter: 'blur(10px)' },
    { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.2, stagger: 0.15, ease: 'power3.out', delay: 0.2 }
  );

  gsap.utils.toArray<HTMLElement>('.project-card').forEach((card, i) => {
    gsap.fromTo(card,
      { y: 80, opacity: 0, scale: 0.95, rotateX: 5 },
      {
        scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none reverse' },
        y: 0, opacity: 1, scale: 1, rotationX: 0,
        duration: 1, ease: 'expo.out',
        delay: i % 2 === 0 ? 0 : 0.1,
      }
    );
  });
}

document.querySelector('.modal-backdrop')!.addEventListener('click', closeModal);
document.querySelector('.close-btn')!.addEventListener('click', closeModal);

window.addEventListener('message', (e) => {
  if (e.data === 'closeModal') closeModal();
});

renderPortfolio();
initializeAI();