import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { resumeData } from './resume';
import { compilerData } from './compilerMock';

gsap.registerPlugin(ScrollTrigger);

const videoElement = document.getElementById('webcam') as HTMLVideoElement;
const canvasElement = document.getElementById('output_canvas') as HTMLCanvasElement;
const canvasCtx = canvasElement.getContext('2d')!;

let handLandmarker: HandLandmarker;
let lastVideoTime = -1;
let unlockFrames = 0;
let isUnlocked = false;
let lenis: any;

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
    console.warn("Camera access denied or unavailable. Triggering terminal fallback.");

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
          input.placeholder = "Try 'password'";
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
      initializeHighEndUI()
    }, 50);

  }, 800);
}

(window as any).openModal = (projectTitle: string) => {
  const modal = document.getElementById('os-modal')!;
  const modalTitle = document.getElementById('modal-title')!;
  const modalContent = document.getElementById('modal-content')!;

  modalTitle.innerText = `~/projects/${projectTitle.toLocaleLowerCase().replace(/\s+/g, '_')}.exe`;

  if (projectTitle === "2D Falling Sand Engine") {
    modalContent.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
        <h3 style="color: var(--text-primary); margin-bottom: 0.5rem;">Thermodynamic Simulation [WASM]</h3>
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">Compiled from Go/Ebitengine.</p>
        <div style="width: 640px; aspect-ratio: 4/3; background: #000; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5)">
          <iframe src="/sim.html" style="width: 100%; height: 100%; border: none; outline: none;"></iframe>
        </div>
      </div>
    `;
  } else if (projectTitle === "C-Compiler Visualization") {
    modalContent.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100%; width: 100%; max-width: 1000px; margin: 0 auto;">
        <div style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: flex-end; flex-shrink: 0;">
          <div>
            <h3 style="color: var(--text-primary); margin-bottom: 0.25rem;">C++17 Compiler Engine [Playback]</h3>
            <p style="color: var(--text-secondary); font-size: 0.9rem;">Lexical Analysis → Parsing → CodeGen</p>
          </div>
          <div id="compiler-status" style="color: #f39c12; font-family: monospace; font-size: 0.9rem; opacity: 0;">Status: Awaiting Input...</div>
        </div>
        
        <div style="display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 1rem; height: 60vh; min-height: 0;">
          <div style="background: rgba(10, 10, 12, 0.8); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; display: flex; flex-direction: column; overflow: hidden;">
            <div style="padding: 0.5rem 1rem; background: rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.05); font-family: monospace; font-size: 0.8rem; color: #888; flex-shrink: 0;">input.c</div>
            <div style="flex: 1; overflow: auto; min-height: 0; padding: 1rem;">
              <pre style="margin: 0;"><code id="mock-editor" style="display: block; font-family: monospace; color: #d4d4d4; font-size: 0.85rem; white-space: pre;"></code></pre>
            </div>
          </div>

          <div style="background: rgba(10, 10, 12, 0.8); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; display: flex; flex-direction: column; overflow: hidden;">
            <div style="display: flex; background: rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.05); flex-shrink: 0;">
              <button class="comp-tab active" data-target="ast" style="padding: 0.5rem 1rem; background: transparent; border: none; color: var(--accent-color); font-family: monospace; cursor: pointer; border-bottom: 2px solid var(--accent-color);">AST JSON</button>
              <button class="comp-tab" data-target="asm" style="padding: 0.5rem 1rem; background: transparent; border: none; color: #888; font-family: monospace; cursor: pointer;">x86 Assembly</button>
              <button class="comp-tab" data-target="hex" style="padding: 0.5rem 1rem; background: transparent; border: none; color: #888; font-family: monospace; cursor: pointer;">Hex Dump</button>
            </div>
            <div style="flex: 1; overflow: auto; min-height: 0; padding: 1rem;">
              <pre style="margin: 0;"><code id="mock-output" style="display: block; font-family: monospace; color: #a6e22e; font-size: 0.85rem; white-space: pre; opacity: 0;"></code></pre>
            </div>
          </div>
        </div>
      </div>
    `;
    runCompilerPlayback();
  } else if (projectTitle === "Personal Finance Tracker") {
    modalContent.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100%; width: 100%; max-width: 900px; margin: 0 auto; background: rgba(10, 10, 12, 0.9); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; overflow: hidden; box-shadow: 0 25px 50px rgba(0,0,0,0.5);">
        <div style="padding: 1.5rem 2rem; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02);">
          <div>
            <h3 style="color: var(--text-primary); margin: 0 0 0.2rem 0; font-size: 1.4rem;">Financial Overview</h3>
            <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0;">Containerized Full-Stack Demo</p>
          </div>
          <button id="mock-add-btn" style="background: var(--accent-color); color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; cursor: pointer; font-weight: 500; transition: transform 0.2s ease;">+ Add Transaction</button>
        </div>
        
        <div style="padding: 2rem; overflow-y: auto; flex: 1;">
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2.5rem;">
            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 10px;">
              <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem; font-weight: 500;">Total Balance</p>
              <h2 style="color: var(--text-primary); font-size: 2.2rem; margin: 0; font-variant-numeric: tabular-nums;">$<span id="mock-balance">0.00</span></h2>
            </div>
            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 10px;">
              <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem; font-weight: 500;">Monthly Income</p>
              <h2 style="color: #2ecc71; font-size: 1.6rem; margin: 0; margin-top: 0.6rem; font-variant-numeric: tabular-nums;">+$<span id="mock-income">0.00</span></h2>
            </div>
            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 10px;">
              <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem; font-weight: 500;">Monthly Expenses</p>
              <h2 style="color: #e74c3c; font-size: 1.6rem; margin: 0; margin-top: 0.6rem; font-variant-numeric: tabular-nums;">-$<span id="mock-expense">0.00</span></h2>
            </div>
          </div>

          <h4 style="color: var(--text-primary); margin-bottom: 1rem; font-size: 1.1rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;">Recent Transactions</h4>
          <div id="mock-tx-list" style="display: flex; flex-direction: column; gap: 0.8rem;">
            </div>
        </div>
      </div>
    `;
    runFinanceDashboardPlayback();
  } else {
    modalContent.innerHTML = `
      <h3 style="color: var(--accent-color); margin-bottom: 1rem;">Executing ${projectTitle}...</h3>
      <p style="color: var(--text-secondary);">Booting container environment. Stand by.</p>
    `;
  }

  modal.classList.add('modal-open');
  document.body.style.overflow = 'hidden';
  if (lenis) lenis.stop(); 
};

(window as any).closeModal = () => {
  const modalContent = document.getElementById('modal-content')!;
  const modal = document.getElementById('os-modal')!;
  
  modalContent.innerHTML = ''; 

  modal.classList.remove('modal-open');
  document.body.style.overflow = 'auto';
  if (lenis) lenis.start(); 
};

window.addEventListener('message', (event) => {
  if (event.data === 'closeModal') {
    (window as any).closeModal();
  }
});

function runCompilerPlayback() {
  const editor = document.getElementById('mock-editor')!;
  const output = document.getElementById('mock-output')!;
  const status = document.getElementById('compiler-status')!;
  const tabs = document.querySelectorAll('.comp-tab');

  editor.innerHTML = '';
  output.innerHTML = '';
  gsap.set(output, { opacity: 0, y: 20 });
  gsap.to(status, { opacity: 1, duration: 0.5 });

  const codeChars = compilerData.code.split('');
  let i = 0;
  
  const typeInterval = setInterval(() => {
    if (i < codeChars.length) {
      editor.innerHTML += codeChars[i];
      i++;
    } else {
      clearInterval(typeInterval);
      triggerCompilation();
    }
  }, 15);

  function triggerCompilation() {
    status.innerText = "Status: Compiling...";
    status.style.color = "#e74c3c";

    gsap.to(output.parentElement!, {
      backgroundColor: "rgba(231, 76, 60, 0.1)",
      duration: 0.2,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        status.innerText = "Status: Compilation Successful (0ms)";
        status.style.color = "#2ecc71";
        
        output.innerHTML = compilerData.ast;
        gsap.to(output, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
      }
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      
      tabs.forEach(t => {
        (t as HTMLElement).style.color = '#888';
        (t as HTMLElement).style.borderBottom = 'none';
      });
      
      target.style.color = 'var(--accent-color)';
      target.style.borderBottom = '2px solid var(--accent-color)';

      gsap.to(output, {
        opacity: 0,
        duration: 0.15,
        onComplete: () => {
          const type = target.getAttribute('data-target');
          if (type === 'ast') output.innerHTML = compilerData.ast;
          if (type === 'asm') output.innerHTML = compilerData.assembly;
          if (type === 'hex') output.innerHTML = compilerData.hex;
          
          gsap.to(output, { opacity: 1, duration: 0.2 });
        }
      });
    });
  });
}

function runFinanceDashboardPlayback() {
  const balanceEl = document.getElementById('mock-balance');
  const incomeEl = document.getElementById('mock-income');
  const expenseEl = document.getElementById('mock-expense');
  const txList = document.getElementById('mock-tx-list')!;
  const addBtn = document.getElementById('mock-add-btn')!;

  const txs = [
    { name: "Apple Store", category: "Electronics", amount: "-$1,199.00", date: "Today", color: "#e74c3c" },
    { name: "Salary Deposit", category: "Income", amount: "+$3,200.00", date: "Yesterday", color: "#2ecc71" },
    { name: "Whole Foods Market", category: "Groceries", amount: "-$145.20", date: "Oct 12", color: "#e74c3c" },
    { name: "Spotify Premium", category: "Subscriptions", amount: "-$10.99", date: "Oct 10", color: "#e74c3c" }
  ];

  txList.innerHTML = txs.map(tx => `
    <div class="mock-tx-row" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; opacity: 0; transform: translateY(15px);">
      <div>
        <p style="color: var(--text-primary); font-weight: 500; margin: 0 0 0.3rem 0; font-size: 1rem;">${tx.name}</p>
        <p style="color: var(--text-secondary); font-size: 0.85rem; margin: 0;">${tx.category} • ${tx.date}</p>
      </div>
      <div style="color: ${tx.color}; font-weight: 600; font-variant-numeric: tabular-nums; font-size: 1.1rem;">${tx.amount}</div>
    </div>
  `).join('');

  const formatNumber = (num: number) => num.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});

  gsap.to(balanceEl, { innerHTML: 14250.81, duration: 2, ease: "power3.out", snap: { innerHTML: 0.01 }, onUpdate: function() { balanceEl!.innerHTML = formatNumber(Number(this.targets()[0].innerHTML)); } });
  gsap.to(incomeEl, { innerHTML: 3200.00, duration: 1.5, ease: "power3.out", snap: { innerHTML: 0.01 }, onUpdate: function() { incomeEl!.innerHTML = formatNumber(Number(this.targets()[0].innerHTML)); } });
  gsap.to(expenseEl, { innerHTML: 1355.19, duration: 1.5, ease: "power3.out", snap: { innerHTML: 0.01 }, onUpdate: function() { expenseEl!.innerHTML = formatNumber(Number(this.targets()[0].innerHTML)); } });

  gsap.to('.mock-tx-row', { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "back.out(1.2)", delay: 0.3 });

  addBtn.addEventListener('click', () => {
    gsap.to(addBtn, { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 });

    const newTx = document.createElement('div');
    newTx.className = 'mock-tx-row';
    newTx.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; background: rgba(46, 204, 113, 0.08); border: 1px solid rgba(46, 204, 113, 0.3); border-radius: 8px; opacity: 0; transform: translateY(-20px);';
    newTx.innerHTML = `
      <div>
        <p style="color: var(--text-primary); font-weight: 500; margin: 0 0 0.3rem 0; font-size: 1rem;">Manual Entry</p>
        <p style="color: var(--text-secondary); font-size: 0.85rem; margin: 0;">Deposit • Just now</p>
      </div>
      <div style="color: #2ecc71; font-weight: 600; font-variant-numeric: tabular-nums; font-size: 1.1rem;">+$500.00</div>
    `;
    txList.prepend(newTx);
    
    const currentBalance = parseFloat(balanceEl!.innerText.replace(/,/g, ''));
    gsap.to(balanceEl, { innerHTML: currentBalance + 500, duration: 1, ease: "power2.out", snap: { innerHTML: 0.01 }, onUpdate: function() { balanceEl!.innerHTML = formatNumber(Number(this.targets()[0].innerHTML)); } });
    
    gsap.to(newTx, { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.5)" });
  });
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

function initializeHighEndUI() {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
  });
  
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000)
  });
  
  gsap.fromTo('#hero-container > *',
    { y: 50, opacity: 0, filter: 'blur(10px)' },
    { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.2, stagger: 0.15, ease: 'power3.out', delay: 0.2 }
  );

  gsap.utils.toArray('.project-card').forEach((card: any, i) => {
    gsap.fromTo(card,
      {
        y: 80,
        opacity: 0,
        scale: 0.95,
        rotateX: 5
      },
      {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        },
        y: 0,
        opacity: 1,
        scale: 1,
        rotationX: 0,
        duration: 1,
        ease: 'expo.out',
        delay: i % 2 === 0 ? 0 : 0.1
      }
    );
  });
}