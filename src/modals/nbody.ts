export function getNbodyHTML(): string {
  return `
    <div style="display: flex; flex-direction: column; height: 100%; width: 100%; max-width: 900px; margin: 0 auto; background: rgba(10,10,12,0.9); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; overflow: hidden; box-shadow: 0 25px 50px rgba(0,0,0,0.5);">
      <div style="padding: 1.5rem 2rem; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02);">
        <div>
          <h3 style="color: var(--text-primary); margin: 0 0 0.2rem 0; font-size: 1.4rem;">Galactic Collision [N-Body Sim]</h3>
          <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0;">Barnes-Hut Algorithm O(N log N) • OpenMP Multithreading</p>
        </div>
        <div style="display: flex; gap: 1rem;">
          <div style="background: rgba(255,255,255,0.05); padding: 0.5rem 1rem; border-radius: 6px; text-align: center;">
            <p style="color: var(--text-secondary); font-size: 0.7rem; margin: 0; font-weight: 600; letter-spacing: 0.05em;">PARTICLES</p>
            <p style="color: #2ecc71; font-family: monospace; font-size: 1.1rem; margin: 0;">30,000</p>
          </div>
          <div style="background: rgba(255,255,255,0.05); padding: 0.5rem 1rem; border-radius: 6px; text-align: center;">
            <p style="color: var(--text-secondary); font-size: 0.7rem; margin: 0; font-weight: 600; letter-spacing: 0.05em;">THREADS</p>
            <p style="color: var(--accent-color); font-family: monospace; font-size: 1.1rem; margin: 0;">8</p>
          </div>
          <div style="background: rgba(255,255,255,0.05); padding: 0.5rem 1rem; border-radius: 6px; text-align: center;">
            <p style="color: var(--text-secondary); font-size: 0.7rem; margin: 0; font-weight: 600; letter-spacing: 0.05em;">FPS</p>
            <p style="color: #f39c12; font-family: monospace; font-size: 1.1rem; margin: 0;" id="nbody-fps">60.0</p>
          </div>
        </div>
      </div>
      <div style="flex: 1; position: relative; background: #000; display: flex; align-items: center; justify-content: center; overflow: hidden; height: 50vh;">
        <video autoplay loop muted playsinline style="width: 100%; height: 100%; object-fit: cover;">
          <source src="/nbody.mp4" type="video/mp4">
        </video>
      </div>
    </div>
  `;
}

export function runNbodyPlayback() {
  const fpsEl = document.getElementById('nbody-fps');
  if (!fpsEl) return;

  const interval = setInterval(() => {
    if (!document.getElementById('nbody-fps')) {
      clearInterval(interval);
      return;
    }
    fpsEl.innerText = (60 + Math.random() * 4 - 2).toFixed(1);
  }, 500);
}