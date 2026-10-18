const capsules = [
  { id: 1, title: '給30天後的自己', unlockDate: '2026-05-19', status: 'locked' },
  { id: 2, title: '初心與勇氣的約定', unlockDate: '2026-01-01', status: 'unlocked' }
];

document.addEventListener('DOMContentLoaded', () => {
  renderCapsules();
});

function renderCapsules() {
  const grid = document.getElementById('capsules-grid');
  grid.innerHTML = capsules.map(c => `
    <div class="border border-slate-100 bg-slate-50/50 p-4 rounded-xl flex flex-col justify-between shadow-sm">
      <div>
        <div class="flex justify-between items-center mb-2">
          <span class="text-xs font-bold px-2.5 py-0.5 rounded-full ${c.status === 'unlocked' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
            ${c.status === 'unlocked' ? '🔓 可解鎖' : '🔒 封存中'}
          </span>
          <span class="text-xs text-slate-400">${c.unlockDate}</span>
        </div>
        <h4 class="font-bold text-slate-700">${c.title}</h4>
      </div>
      <button class="mt-4 w-full py-1.5 rounded-lg text-xs font-medium ${c.status === 'unlocked' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-200 text-slate-500 cursor-not-allowed'}" ${c.status === 'locked' ? 'disabled' : ''}>
        ${c.status === 'unlocked' ? '開啟時光膠囊' : '等待倒數解鎖'}
      </button>
    </div>
  `).join('');
}