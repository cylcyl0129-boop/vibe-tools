import { auth, db, collection, getDocs, query, where, orderBy } from "./firebase-config.js";

// 模擬初始解鎖徽章與日誌資料
const MOCK_BADGES = [
  { id: 1, name: '初次踏出舒適圈', icon: '🌱', unlocked: true },
  { id: 2, name: '活力滿載 (連續5天)', icon: '🔥', unlocked: true },
  { id: 3, name: '生活冒險家', icon: '🧭', unlocked: false },
  { id: 4, name: '巷弄探險家', icon: '🚲', unlocked: false }
];

const MOCK_JOURNAL = [
  { id: 1, name: '10分鐘晨間伸展', category: '健康', date: '2026-06-01', note: '今天伸展時感覺筋骨放鬆了許多，心情非常平靜。', color: 'emerald' },
  { id: 2, name: '5分鐘無聲冥想', category: '心靈', date: '2026-05-31', note: '腦中雜念漸漸變少，專注呼吸的力量很神奇。', color: 'blue' }
];

document.addEventListener('DOMContentLoaded', () => {
  renderBadges();
  renderJournalGrid();
});

function renderBadges() {
  const container = document.getElementById('badges-container');
  container.innerHTML = MOCK_BADGES.map(b => `
    <div class="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border ${b.unlocked ? 'bg-amber-50/50 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'}">
      <span class="text-xl">${b.icon}</span>
      <div class="text-left">
        <p class="text-xs font-bold">${b.name}</p>
        <p class="text-[10px]">${b.unlocked ? '已解鎖' : '未解鎖'}</p>
      </div>
    </div>
  `).join('');
}

function renderJournalGrid() {
  const grid = document.getElementById('journal-grid');
  grid.innerHTML = MOCK_JOURNAL.map(j => `
    <div class="border border-slate-100 rounded-2xl p-4 bg-white shadow-sm flex flex-col justify-between space-y-3 hover:shadow-md transition">
      <div>
        <div class="flex justify-between items-center mb-2">
          <span class="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">${j.category}</span>
          <span class="text-[10px] text-slate-400">${j.date}</span>
        </div>
        <h4 class="font-bold text-slate-800 text-sm">${j.name}</h4>
        <p class="text-xs text-slate-500 mt-1 italic">「${j.note}」</p>
      </div>
      <div class="pt-2 border-t border-slate-50 text-[10px] text-indigo-600 font-medium text-right">
        查看明信片回憶 →
      </div>
    </div>
  `).join('');
}