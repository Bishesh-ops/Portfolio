import type Lenis from 'lenis';
import { getCompilerHTML, runCompilerPlayback } from './modals/compiler';
import { getFinanceHTML, runFinanceDashboardPlayback } from './modals/finance';
import { getNbodyHTML, runNbodyPlayback } from './modals/nbody';

let _lenis: Lenis | null = null;

export function setLenis(instance: Lenis) {
  _lenis = instance;
}

export function openModal(projectTitle: string) {
  const modal = document.getElementById('os-modal')!;
  const modalTitle = document.getElementById('modal-title')!;
  const modalContent = document.getElementById('modal-content')!;

  modalTitle.innerText = `~/projects/${projectTitle.toLowerCase().replace(/\s+/g, '_')}.exe`;

  if (projectTitle === '2D Falling Sand Engine') {
    modalContent.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
        <h3 style="color: var(--text-primary); margin-bottom: 0.5rem;">Thermodynamic Simulation [WASM]</h3>
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">Compiled from Go/Ebitengine.</p>
        <div style="width: 100%; max-width: 640px; aspect-ratio: 4/3; background: #000; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <iframe src="/sim.html" style="width: 100%; height: 100%; border: none; outline: none;"></iframe>
        </div>
      </div>
    `;
  } else if (projectTitle === 'C-Compiler Visualization') {
    modalContent.innerHTML = getCompilerHTML();
    runCompilerPlayback();
  } else if (projectTitle === 'Personal Finance Tracker') {
    modalContent.innerHTML = getFinanceHTML();
    runFinanceDashboardPlayback();
  } else if (projectTitle === 'N-Body Gravity Simulation') {
    modalContent.innerHTML = getNbodyHTML();
    runNbodyPlayback();
  } else {
    modalContent.innerHTML = `
      <h3 style="color: var(--accent-color); margin-bottom: 1rem;">Executing ${projectTitle}...</h3>
      <p style="color: var(--text-secondary);">Booting container environment. Stand by.</p>
    `;
  }

  modal.classList.add('modal-open');
  document.body.style.overflow = 'hidden';
  if (_lenis) _lenis.stop();
}

export function closeModal() {
  const modalContent = document.getElementById('modal-content')!;
  const modal = document.getElementById('os-modal')!;

  modalContent.innerHTML = '';
  modal.classList.remove('modal-open');
  document.body.style.overflow = 'auto';
  if (_lenis) _lenis.start();
}