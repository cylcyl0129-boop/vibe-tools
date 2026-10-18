// 模擬卡牌資料庫與狀態管理
const CARDS_POOL = [
  { id: 1, category: 'health', name: '10分鐘晨間伸展', desc: '喚醒身體肌肉，感受呼吸與流動。', color: 'emerald' },
  { id: 2, category: 'mind', name: '5分鐘無聲冥想', desc: '放下手機，閉上眼睛專注於每一次吸氣與吐氣。', color: 'blue' },
  { id: 3, category: 'explore', name: '探索一條未走過的小巷', desc: '在社區散步時轉個彎，發現不一樣的街景。', color: 'amber' },
  { id: 4, category: 'growth', name: '閱讀一頁好書並寫下心得', desc: '為心靈注入新的靈感與智慧養分。', color: 'purple' }
];

let userState = {
  drawn: false,
  cards: [],
  streak: 5,
  collectedCount: 12
};

document.addEventListener('DOMContentLoaded', () => {
  renderInitialDeck();
});

function renderInitialDeck() {
  const container = document.getElementById('card-container');
  container.innerHTML = '';

  for (let i = 0; i < 3; i++) {
    const cardEl = document.createElement('div');
    cardEl.className = 'perspective-1000 h-80 cursor-pointer';
    cardEl.innerHTML = `
      <div class="relative w-full h-full duration-700 transform-style-3d card-inner rounded-2xl shadow-md bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex flex-col items-center justify-center p-6 text-center">
        <div class="text-4xl mb-3">✨</div>
        <h3 class="text-lg font-bold">第 ${i + 1} 張神秘冒險卡</h3>
        <p class="text-xs text-indigo-100 mt-2">點擊翻開今日微任務</p>
      </div>
    `;
    
    cardEl.addEventListener('click', () => triggerFlipCard(cardEl, i));
    container.appendChild(cardEl);
  }
}

function triggerFlipCard(cardElement, index) {
  if (userState.drawn) return;
  userState.drawn = true;
  
  // 簡單模擬隨機抽卡
  const randomCard = CARDS_POOL[index % CARDS_POOL.length];
  
  cardElement.querySelector('.card-inner').innerHTML = `
    <div class="bg-white text-slate-800 w-full h-full rounded-2xl p-6 flex flex-col justify-between border border-slate-100 shadow-lg text-left">
      <div>
        <span class="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-medium">健康</span>
        <h4 class="font-bold text-lg mt-3">${randomCard.name}</h4>
        <p class="text-xs text-slate-500 mt-1">${randomCard.desc}</p>
      </div>
      <button onclick="completeTask(${index})" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-sm font-medium transition">
        完成冒險勾選 ✅
      </button>
    </div>
  `;

  document.getElementById('task-action-panel').classList.remove('hidden');
  document.getElementById('deck-subtitle').innerText = '今日冒險已領取，請完成下方微任務！';
}

window.completeTask = function(index) {
  // 觸發彩色粒子噴發動畫 (Canvas Confetti)
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });

  userState.collectedCount += 1;
  document.getElementById('journal-count').innerText = userState.collectedCount;
  alert('🎉 恭喜完成今日冒險！紀念卡已成功存入日誌。');
};