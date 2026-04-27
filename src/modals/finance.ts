import gsap from 'gsap';

export function getFinanceHTML(): string {
  return `
    <div style="display: flex; flex-direction: column; height: 100%; width: 100%; max-width: 900px; margin: 0 auto; background: rgba(10,10,12,0.9); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; overflow: hidden; box-shadow: 0 25px 50px rgba(0,0,0,0.5);">
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
        <div id="mock-tx-list" style="display: flex; flex-direction: column; gap: 0.8rem;"></div>
      </div>
    </div>
  `;
}

const formatNumber = (num: number) =>
  num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function animateCount(el: HTMLElement, target: number, duration: number) {
  const obj = { val: 0 };
  gsap.to(obj, {
    val: target,
    duration,
    ease: 'power3.out',
    onUpdate: () => { el.textContent = formatNumber(obj.val); }
  });
}

export function runFinanceDashboardPlayback() {
  const balanceEl = document.getElementById('mock-balance') as HTMLElement;
  const incomeEl = document.getElementById('mock-income') as HTMLElement;
  const expenseEl = document.getElementById('mock-expense') as HTMLElement;
  const txList = document.getElementById('mock-tx-list')!;
  const addBtn = document.getElementById('mock-add-btn')!;

  const txs = [
    { name: 'Apple Store',       category: 'Electronics',   amount: '-$1,199.00', date: 'Today',     color: '#e74c3c' },
    { name: 'Salary Deposit',    category: 'Income',        amount: '+$3,200.00', date: 'Yesterday', color: '#2ecc71' },
    { name: 'Whole Foods Market',category: 'Groceries',     amount: '-$145.20',   date: 'Oct 12',    color: '#e74c3c' },
    { name: 'Spotify Premium',   category: 'Subscriptions', amount: '-$10.99',    date: 'Oct 10',    color: '#e74c3c' },
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

  let currentBalance = 14250.81;

  animateCount(balanceEl, currentBalance, 2);
  animateCount(incomeEl, 3200.00, 1.5);
  animateCount(expenseEl, 1355.19, 1.5);

  gsap.to('.mock-tx-row', { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'back.out(1.2)', delay: 0.3 });

  addBtn.addEventListener('click', () => {
    gsap.to(addBtn, { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 });

    const newTx = document.createElement('div');
    newTx.className = 'mock-tx-row';
    newTx.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; background: rgba(46,204,113,0.08); border: 1px solid rgba(46,204,113,0.3); border-radius: 8px; opacity: 0; transform: translateY(-20px);';
    newTx.innerHTML = `
      <div>
        <p style="color: var(--text-primary); font-weight: 500; margin: 0 0 0.3rem 0; font-size: 1rem;">Manual Entry</p>
        <p style="color: var(--text-secondary); font-size: 0.85rem; margin: 0;">Deposit • Just now</p>
      </div>
      <div style="color: #2ecc71; font-weight: 600; font-variant-numeric: tabular-nums; font-size: 1.1rem;">+$500.00</div>
    `;
    txList.prepend(newTx);

    const prev = currentBalance;
    currentBalance += 500;
    const obj = { val: prev };
    gsap.to(obj, {
      val: currentBalance,
      duration: 1,
      ease: 'power2.out',
      onUpdate: () => { balanceEl.textContent = formatNumber(obj.val); }
    });

    gsap.to(newTx, { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.5)' });
  });
}