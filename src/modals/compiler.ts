import gsap from 'gsap';
import { compilerData } from '../compilerMock';

export function getCompilerHTML(): string {
  return `
    <div style="display: flex; flex-direction: column; height: 100%; width: 100%; max-width: 1000px; margin: 0 auto;">
      <div style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: flex-end; flex-shrink: 0;">
        <div>
          <h3 style="color: var(--text-primary); margin-bottom: 0.25rem;">C++17 Compiler Engine [Playback]</h3>
          <p style="color: var(--text-secondary); font-size: 0.9rem;">Lexical Analysis → Parsing → CodeGen</p>
        </div>
        <div id="compiler-status" style="color: #f39c12; font-family: monospace; font-size: 0.9rem; opacity: 0;">Status: Awaiting Input...</div>
      </div>
      <div style="display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 1rem; height: 60vh; min-height: 0;">
        <div style="background: rgba(10,10,12,0.8); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; display: flex; flex-direction: column; overflow: hidden;">
          <div style="padding: 0.5rem 1rem; background: rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.05); font-family: monospace; font-size: 0.8rem; color: #888; flex-shrink: 0;">input.c</div>
          <div style="flex: 1; overflow: auto; min-height: 0; padding: 1rem;">
            <pre style="margin: 0;"><code id="mock-editor" style="display: block; font-family: monospace; color: #d4d4d4; font-size: 0.85rem; white-space: pre;"></code></pre>
          </div>
        </div>
        <div style="background: rgba(10,10,12,0.8); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; display: flex; flex-direction: column; overflow: hidden;">
          <div style="display: flex; background: rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.05); flex-shrink: 0;">
            <button class="comp-tab" data-target="ast" style="padding: 0.5rem 1rem; background: transparent; border: none; color: var(--accent-color); font-family: monospace; cursor: pointer; border-bottom: 2px solid var(--accent-color);">AST JSON</button>
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
}

export function runCompilerPlayback() {
  const editor = document.getElementById('mock-editor')!;
  const output = document.getElementById('mock-output')!;
  const status = document.getElementById('compiler-status')!;
  const tabs = document.querySelectorAll<HTMLElement>('.comp-tab');

  editor.textContent = '';
  output.textContent = '';
  gsap.set(output, { opacity: 0, y: 20 });
  gsap.to(status, { opacity: 1, duration: 0.5 });

  const codeChars = compilerData.code.split('');
  let i = 0;
  let buffer = '';

  const typeInterval = setInterval(() => {
    if (i < codeChars.length) {
      buffer += codeChars[i];
      editor.textContent = buffer;
      i++;
    } else {
      clearInterval(typeInterval);
      triggerCompilation();
    }
  }, 15);

  function triggerCompilation() {
    status.innerText = 'Status: Compiling...';
    status.style.color = '#e74c3c';

    gsap.to(output.parentElement!, {
      backgroundColor: 'rgba(231, 76, 60, 0.1)',
      duration: 0.2,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        status.innerText = 'Status: Compilation Successful (0ms)';
        status.style.color = '#2ecc71';
        output.textContent = compilerData.ast;
        gsap.to(output, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
      }
    });
  }

  const dataMap: Record<string, string> = {
    ast: compilerData.ast,
    asm: compilerData.assembly,
    hex: compilerData.hex,
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLElement;

      tabs.forEach(t => {
        t.style.color = '#888';
        t.style.borderBottom = 'none';
      });

      target.style.color = 'var(--accent-color)';
      target.style.borderBottom = '2px solid var(--accent-color)';

      gsap.to(output, {
        opacity: 0,
        duration: 0.15,
        onComplete: () => {
          const type = target.getAttribute('data-target') ?? '';
          output.textContent = dataMap[type] ?? '';
          gsap.to(output, { opacity: 1, duration: 0.2 });
        }
      });
    });
  });
}