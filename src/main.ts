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

        const progress = unlockFrames / 5;
        canvasCtx.beginPath();
        canvasCtx.arc(canvasElement.width / 2, 40, 20, -Math.PI / 2, -Math.PI / 2 + progress * 2 * Math.PI);
        canvasCtx.strokeStyle = '#2997ff';
        canvasCtx.lineWidth = 4;
        canvasCtx.lineCap = 'round';
        canvasCtx.stroke();

        if (unlockFrames > 5) {
          triggerUnlock();
        }
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
    const stream = videoElement.srcObject as MediaStream;
    stream.getTracks().forEach(track => track.stop());
  }

  renderPortfolio();

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
    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem; flex-wrap: wrap;">
      <h1 style="font-size: 3.5rem; font-weight: 700; letter-spacing: -0.03em; margin: 0; background: linear-gradient(135deg, #fff 0%, #a1a1a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
        ${resumeData.header.name}
      </h1>
      <div style="display: flex; align-items: center; gap: 0.5rem; background: rgba(46, 204, 113, 0.1); border: 1px solid rgba(46, 204, 113, 0.2); padding: 0.4rem 0.8rem; border-radius: 20px;">
        <div style="width: 8px; height: 8px; background: #2ecc71; border-radius: 50%; animation: pulse 2s infinite;"></div>
        <span style="color: #2ecc71; font-size: 0.85rem; font-weight: 600;">Available for roles</span>
      </div>
    </div>
    <h2 style="color: var(--accent-color); font-size: 1.4rem; font-weight: 500; margin-bottom: 1.5rem;">${resumeData.header.title}</h2>
    <p style="color: var(--text-secondary); max-width: 650px; line-height: 1.7; font-size: 1.1rem;">
      ${resumeData.header.tagline}
    </p>
  `;

  const expContainer = document.getElementById('experience-container')!;

  if ((resumeData as any).skills) {
    const skillsHtml = (resumeData as any).skills.map((skill: string) => `<span class="tech-pill">${skill}</span>`).join('');
    const skillsSection = document.createElement('section');
    skillsSection.className = 'projects-section';
    skillsSection.innerHTML = `
      <h3> Core Stack</h3>
      <div class="tech-stack" style="gap: 0.8rem; margin-bottom: 2rem;">
        ${skillsHtml}
      </div>
    `;
    expContainer.parentElement!.before(skillsSection);
  }


const expHeader = expContainer.previousElementSibling;
  if (expHeader && expHeader.tagName === 'H3') {
    expHeader.innerHTML = "Experience";
  }

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
  const projHeader = projContainer.previousElementSibling;
    if (projHeader && projHeader.tagName === 'H3') {
      projHeader.innerHTML = "Selected Work";
    }

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
        <a href="/Bishesh_Shrestha_Resume.pdf" target="_blank" style="background: var(--accent-color); color: #fff; padding: 0.8rem 1.5rem; border-radius: 8px; text-decoration: none; font-weight: 600; box-shadow: 0 4px 15px rgba(41, 151, 255, 0.3); transition: transform 0.2s ease, box-shadow 0.2s ease;">📄 Download Resume</a>
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
  const cursor = document.getElementById('cursor');
  if (cursor) {
    let xTo = gsap.quickTo(cursor, "x", {duration: 0.1, ease: "power3"}),
        yTo = gsap.quickTo(cursor, "y", {duration: 0.1, ease: "power3"});
    
    window.addEventListener("mousemove", e => {
      xTo(e.clientX);
      yTo(e.clientY);
    });
  }
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

  const cards = document.querySelectorAll('.interactive-card');
  cards.forEach((card) => {
    const article = card as HTMLElement;
    article.addEventListener('mousemove', (e) => {
      const rect = article.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      article.style.transform = `perspective(600px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateZ(10px)`;
      article.style.transition = 'none'; // Instant response during mousemove
    });
    article.addEventListener('mouseleave', () => {
      article.style.transform = '';
      article.style.transition = 'transform 0.5s ease';
    });
  });
}

document.querySelector('.modal-backdrop')!.addEventListener('click', closeModal);
document.querySelector('.close-btn')!.addEventListener('click', closeModal);

window.addEventListener('message', (e) => {
  if (e.data === 'closeModal') closeModal();
});
function addFilmGrain() {
  const canvas = document.createElement('canvas');
  canvas.id = 'noise-overlay';
  canvas.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 9999; opacity: 0.03;';
  document.body.appendChild(canvas);
  
  const ctx = canvas.getContext('2d')!;
  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  window.addEventListener('resize', resize);
  resize();

  function drawNoise() {
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const value = Math.random() * 255;
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
      data[i + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
    requestAnimationFrame(drawNoise);
  }
  drawNoise();
}

function initGravityMesh() {
  const container = document.querySelector('.ambient-background')!;
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; mix-blend-mode: screen; opacity: 0.6;';
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d')!;
  let width = 0, height = 0;
  let particles: Particle[] = [];
  
  // Track mouse coordinates
  let mouse = { x: -1000, y: -1000 };
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    initParticles();
  }

  class Particle {
    x: number; y: number; vx: number; vy: number; radius: number;
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.radius = Math.random() * 1.5;
    }

    update() {
      // Basic drift
      this.x += this.vx;
      this.y += this.vy;

      // Wrap around edges seamlessly
      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;

      // Gravity effect from mouse
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // If mouse is close, pull particles slightly
      if (distance < 200) {
        const force = (200 - distance) / 200;
        this.vx += (dx / distance) * force * 0.02;
        this.vy += (dy / distance) * force * 0.02;
        
        // Add some drag so they don't orbit infinitely fast
        this.vx *= 0.98;
        this.vy *= 0.98;
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(161, 161, 166, 0.8)'; // Apple-esque silver/grey
      ctx.fill();
    }
  }

  function initParticles() {
    particles = [];
    // Adjust particle count based on screen size for performance
    const particleCount = Math.floor((width * height) / 12000); 
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Update and draw all particles
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();

      // Draw constellation lines between close particles
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = dx * dx + dy * dy;

        if (distance < 12000) { // Approx 110px radius
          const opacity = 1 - (distance / 12000);
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          // Tint lines slightly blue/purple to match your accent color
          ctx.strokeStyle = `rgba(41, 151, 255, ${opacity * 0.15})`; 
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', resize);
  resize();
  animate();
}

initializeAI();
addFilmGrain();
initGravityMesh();