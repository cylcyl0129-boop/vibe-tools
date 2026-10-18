// 題庫資料池
const questPool = [
    { id: 'p1', title: '喝一杯溫開水並深呼吸三次', category: '健康' },
    { id: 'p2', title: '進行 5 分鐘簡單的伸展運動', category: '健康' },
    { id: 'p3', title: '早晨曬 5 分鐘太陽', category: '健康' },
    { id: 'p4', title: '閉眼靜坐 3 分鐘，聆聽周遭聲音', category: '心靈' },
    { id: 'p5', title: '寫下一件今天值得感恩的小事', category: '心靈' },
    { id: 'p6', title: '對鏡子裡的自己微笑並給予肯定', category: '心靈' },
    { id: 'p7', title: '走一條平常沒走過的巷子回家', category: '探索' },
    { id: 'p8', title: '觀察路邊的一朵花或一棵樹 1 分鐘', category: '探索' },
    { id: 'p9', title: '跟久違的朋友傳訊息問候', category: '探索' },
    { id: 'p10', title: '閱讀一本書籍的其中一個章節', category: '成長' },
    { id: 'p11', title: '學習一個全新的英文單字或冷知識', category: '成長' },
    { id: 'p12', title: '整理桌面 5 分鐘，保持清爽', category: '成長' }
];

// 預設 State
let appState = {
    user_streak: 0,
    last_drawn_date: "",
    reroll_used: false,
    today_tasks: [],
    completed_journals: [],
    unlocked_milestones: []
};

let soundEnabled = true;
let activeTaskIdToComplete = null;

// 取得今日日期字串 YYYY-MM-DD
function getTodayStr() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Web Audio API 音效生成
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(type) {
    if (!soundEnabled) return;
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    if (type === 'flip') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
    } else if (type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554.37, now + 0.1);
        osc.frequency.setValueAtTime(659.25, now + 0.2);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
    }
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    const btn = document.getElementById('sound-toggle');
    btn.textContent = soundEnabled ? '🔊' : '🔇';
    btn.title = soundEnabled ? '音效已開啟' : '音效已關閉';
}

// 初始化資料與檢核跨日
function initApp() {
    const saved = localStorage.getItem('daily_quest_state');
    const today = getTodayStr();

    if (saved) {
        appState = JSON.parse(saved);
        if (appState.last_drawn_date !== today) {
            const lastDate = new Date(appState.last_drawn_date);
            const currDate = new Date(today);
            const diffTime = Math.abs(currDate - lastDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 1) {
                appState.user_streak = 0; // 斷開連續
            }

            appState.last_drawn_date = "";
            appState.reroll_used = false;
            appState.today_tasks = [];
        }
    } else {
        appState = {
            user_streak: 0,
            last_drawn_date: "",
            reroll_used: false,
            today_tasks: [],
            completed_journals: [],
            unlocked_milestones: []
        };
    }
    saveState();
    renderAll();
}

function saveState() {
    localStorage.setItem('daily_quest_state', JSON.stringify(appState));
}

// 隨機抽 3 張卡
function drawCards() {
    const today = getTodayStr();
    const shuffled = [...questPool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3).map((item, idx) => ({
        id: `q_${Date.now()}_${idx}`,
        title: item.title,
        category: item.category,
        completed: false,
        completed_at: null,
        note: ""
    }));

    appState.today_tasks = selected;
    appState.last_drawn_date = today;
    appState.reroll_used = false;
    appState.user_streak += 1;

    saveState();
    renderAll();
    playSound('flip');
}

// 類別對應顏色設定
const categoryColors = {
    '健康': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', badge: 'bg-emerald-500' },
    '心靈': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', badge: 'bg-purple-500' },
    '探索': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', badge: 'bg-amber-500' },
    '成長': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', badge: 'bg-blue-500' }
};

// 渲染主視覺抽卡區
function renderHero() {
    const container = document.getElementById('card-container');
    const titleElem = document.getElementById('draw-title');
    const descElem = document.getElementById('draw-desc');
    const today = getTodayStr();
    const isDrawn = appState.last_drawn_date === today && appState.today_tasks.length > 0;

    if (isDrawn) {
        titleElem.textContent = "今日冒險卡牌已解鎖";
        descElem.textContent = "您已完成今日抽卡，請在下方查看任務清單或執行微冒險。";
        
        container.innerHTML = appState.today_tasks.map((task) => {
            const style = categoryColors[task.category] || categoryColors['健康'];
            return `
                <div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center space-y-3 shadow-lg">
                    <span class="inline-block px-3 py-1 rounded-full text-xs font-bold text-white ${style.badge}">
                        ${task.category}
                    </span>
                    <h4 class="font-bold text-base text-white line-clamp-2">${task.title}</h4>
                    <div class="text-xs text-indigo-200 pt-2">
                        ${task.completed ? '✨ 已完成回憶收錄' : '📌 狀態：進行中'}
                    </div>
                </div>
            `;
        }).join('');
    } else {
        titleElem.textContent = "開啟今日的冒險卡牌包";
        descElem.textContent = "畫面上有三張背面向上的卡牌，點擊任一卡牌即可一次揭曉今日 3 項微任務！";

        let cardsHtml = '';
        for (let i = 1; i <= 3; i++) {
            cardsHtml += `
                <div onclick="drawCards()" class="group cursor-pointer bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl p-8 text-center h-56 flex flex-col items-center justify-center space-y-4 shadow-xl border border-indigo-400/30 hover:scale-105 transition-all duration-300 animate-float">
                    <div class="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-xl font-bold shadow-inner group-hover:bg-white/30 transition-colors">
                        🎴
                    </div>
                    <div>
                        <h4 class="font-bold text-lg text-white">點擊翻開卡牌 #${i}</h4>
                        <p class="text-xs text-indigo-200 mt-1">解鎖今日微冒險</p>
                    </div>
                </div>
            `;
        }
        container.innerHTML = cardsHtml;
    }
}

// 渲染任務清單
function renderTasks() {
    const board = document.getElementById('task-board');
    const rerollCountElem = document.getElementById('reroll-count');
    const today = getTodayStr();
    const isDrawn = appState.last_drawn_date === today && appState.today_tasks.length > 0;

    rerollCountElem.textContent = appState.reroll_used ? 0 : 1;

    if (!isDrawn) {
        board.innerHTML = `
            <div class="col-span-3 text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                <p class="text-slate-400 text-sm">請先至上方點擊卡牌包完成今日抽卡！</p>
            </div>
        `;
        return;
    }

    board.innerHTML = appState.today_tasks.map(task => {
        const style = categoryColors[task.category] || categoryColors['健康'];
        return `
            <div class="bg-white rounded-2xl p-5 border ${task.completed ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200'} shadow-sm flex flex-col justify-between space-y-4 transition-all hover:shadow-md">
                <div class="space-y-2">
                    <div class="flex items-center justify-between">
                        <span class="px-2.5 py-1 rounded-full text-xs font-bold ${style.bg} ${style.text} ${style.border} border">
                            ${task.category}
                        </span>
                        ${task.completed ? '<span class="text-xs font-bold text-emerald-600 flex items-center gap-1">✅ 已完成</span>' : ''}
                    </div>
                    <h4 class="font-bold text-slate-800 text-base leading-snug">${task.title}</h4>
                    ${task.note ? `<p class="text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">“ ${task.note} ”</p>` : ''}
                </div>
                <div>
                    ${task.completed ? `
                        <button disabled class="w-full py-2.5 bg-slate-100 text-slate-400 font-bold text-xs rounded-xl cursor-not-allowed">
                            已收錄至冒險日誌
                        </button>
                    ` : `
                        <button onclick="openCompleteModal('${task.id}')" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5">
                            <span>✨</span> 標記完成並記錄心得
                        </button>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

// 更換卡牌 (Reroll)
function rerollTask() {
    if (appState.reroll_used) {
        alert('今日更換次數已用完！');
        return;
    }
    if (appState.today_tasks.length === 0) {
        alert('請先抽卡後再更換任務！');
        return;
    }

    const uncompletedIdxs = appState.today_tasks
        .map((t, idx) => (!t.completed ? idx : -1))
        .filter(idx => idx !== -1);

    if (uncompletedIdxs.length === 0) {
        alert('今日所有任務皆已完成，無需更換！');
        return;
    }

    const targetIdx = uncompletedIdxs[Math.floor(Math.random() * uncompletedIdxs.length)];
    const existingTitles = appState.today_tasks.map(t => t.title);
    const availableNew = questPool.filter(q => !existingTitles.includes(q.title));

    if (availableNew.length > 0) {
        const newQ = availableNew[Math.floor(Math.random() * availableNew.length)];
        appState.today_tasks[targetIdx] = {
            id: `q_${Date.now()}_reroll`,
            title: newQ.title,
            category: newQ.category,
            completed: false,
            completed_at: null,
            note: ""
        };
        appState.reroll_used = true;
        saveState();
        renderAll();
        playSound('flip');
    }
}

// Modal 操作
function openCompleteModal(taskId) {
    activeTaskIdToComplete = taskId;
    const task = appState.today_tasks.find(t => t.id === taskId);
    document.getElementById('modal-task-title').textContent = task ? task.title : '';
    document.getElementById('modal-note-input').value = '';
    document.getElementById('complete-modal').classList.remove('hidden');
}

function closeCompleteModal() {
    activeTaskIdToComplete = null;
    document.getElementById('complete-modal').classList.add('hidden');
}

function confirmCompleteTask() {
    if (!activeTaskIdToComplete) return;
    const note = document.getElementById('modal-note-input').value.trim();
    const today = getTodayStr();

    const task = appState.today_tasks.find(t => t.id === activeTaskIdToComplete);
    if (task) {
        task.completed = true;
        task.completed_at = today;
        task.note = note;

        appState.completed_journals.unshift({
            ...task,
            journal_id: `j_${Date.now()}`
        });

        checkMilestones();
        saveState();
        renderAll();
        closeCompleteModal();

        playSound('success');
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }
}

// 自訂任務 Modal
function openCustomTaskModal() {
    document.getElementById('custom-title-input').value = '';
    document.getElementById('custom-task-modal').classList.remove('hidden');
}

function closeCustomTaskModal() {
    document.getElementById('custom-task-modal').classList.add('hidden');
}

function saveCustomTask() {
    const title = document.getElementById('custom-title-input').value.trim();
    const category = document.getElementById('custom-category-select').value;
    const today = getTodayStr();

    if (!title) {
        alert('請輸入任務內容！');
        return;
    }

    const newCustomTask = {
        id: `custom_${Date.now()}`,
        title: title,
        category: category,
        completed: false,
        completed_at: null,
        note: ""
    };

    if (appState.last_drawn_date !== today) {
        appState.last_drawn_date = today;
        appState.today_tasks = [newCustomTask];
        appState.user_streak += 1;
    } else {
        appState.today_tasks.push(newCustomTask);
    }

    saveState();
    renderAll();
    closeCustomTaskModal();
    playSound('flip');
}

// 檢查解鎖里程碑
function checkMilestones() {
    const completedCount = appState.completed_journals.length;
    const healthCount = appState.completed_journals.filter(j => j.category === '健康').length;
    const exploreCount = appState.completed_journals.filter(j => j.category === '探索').length;
    const streak = appState.user_streak;

    const milestonesDef = [
        { id: 'first_quest', unlocked: completedCount >= 1 },
        { id: 'health_3', unlocked: healthCount >= 3 },
        { id: 'explore_3', unlocked: exploreCount >= 3 },
        { id: 'streak_3', unlocked: streak >= 3 }
    ];

    appState.unlocked_milestones = milestonesDef.filter(m => m.unlocked).map(m => m.id);
}

// 渲染冒險日誌與里程碑
function renderJournalAndMilestones() {
    document.getElementById('header-streak').textContent = `連續冒險：${appState.user_streak} 天`;
    document.getElementById('header-journals').textContent = `已收錄回憶：${appState.completed_journals.length} 張`;
    document.getElementById('journal-count-tab').textContent = appState.completed_journals.length;
    document.getElementById('milestone-count-tab').textContent = appState.unlocked_milestones.length;

    const journalGrid = document.getElementById('journal-grid');
    if (appState.completed_journals.length === 0) {
        journalGrid.innerHTML = `
            <div class="col-span-2 text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p class="text-slate-400 text-sm">尚無冒險回憶，快去完成今日任務來解鎖第一張紀念卡吧！</p>
            </div>
        `;
    } else {
        journalGrid.innerHTML = appState.completed_journals.map(item => {
            const style = categoryColors[item.category] || categoryColors['健康'];
            return `
                <div class="bg-gradient-to-br from-white to-slate-50 border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
                    <div class="flex items-center justify-between">
                        <span class="px-2.5 py-1 rounded-full text-xs font-bold ${style.bg} ${style.text} ${style.border} border">
                            ${item.category}
                        </span>
                        <span class="text-xs text-slate-400 font-medium">${item.completed_at}</span>
                    </div>
                    <h4 class="font-bold text-slate-800 text-base">${item.title}</h4>
                    ${item.note ? `<p class="text-xs text-slate-600 bg-indigo-50/50 border border-indigo-100/50 p-2.5 rounded-xl italic">“ ${item.note} ”</p>` : '<p class="text-xs text-slate-400 italic">（未留下心得筆記）</p>'}
                </div>
            `;
        }).join('');
    }

    const milestonesGrid = document.getElementById('milestones-grid');
    const milestonesData = [
        { id: 'first_quest', name: '初次踏出舒適圈', desc: '完成第一個微冒險任務', icon: '🟢' },
        { id: 'health_3', name: '活力滿載', desc: '累積完成 3 個健康類任務', icon: '💪' },
        { id: 'explore_3', name: '巷弄探險家', desc: '累積完成 3 個探索類任務', icon: '🧭' },
        { id: 'streak_3', name: '生活冒險家', desc: '連續冒險天數達到 3 天', icon: '🔥' }
    ];

    milestonesGrid.innerHTML = milestonesData.map(m => {
        const isUnlocked = appState.unlocked_milestones.includes(m.id);
        return `
            <div class="flex items-center space-x-4 p-4 rounded-2xl border ${isUnlocked ? 'bg-indigo-50/40 border-indigo-200 shadow-xs' : 'bg-slate-50 border-slate-200 opacity-60 grayscale'}">
                <div class="w-12 h-12 rounded-2xl ${isUnlocked ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-slate-200 text-slate-400'} flex items-center justify-center text-xl shrink-0">
                    ${m.icon}
                </div>
                <div class="space-y-0.5">
                    <div class="flex items-center gap-2">
                        <h4 class="font-bold text-sm sm:text-base text-slate-800">${m.name}</h4>
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${isUnlocked ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}">
                            ${isUnlocked ? '已解鎖' : '未解鎖'}
                        </span>
                    </div>
                    <p class="text-xs text-slate-500">${m.desc}</p>
                </div>
            </div>
        `;
    }).join('');
}

// Tab 切換
function switchTab(tabName) {
    const btnJournal = document.getElementById('tab-journal-btn');
    const btnMilestones = document.getElementById('tab-milestones-btn');
    const contentJournal = document.getElementById('tab-journal-content');
    const contentMilestones = document.getElementById('tab-milestones-content');

    if (tabName === 'journal') {
        btnJournal.className = "pb-3 px-4 font-bold text-sm sm:text-base border-b-2 border-indigo-600 text-indigo-600 transition-colors cursor-pointer flex items-center gap-2";
        btnMilestones.className = "pb-3 px-4 font-bold text-sm sm:text-base border-b-2 border-transparent text-slate-400 hover:text-slate-600 transition-colors cursor-pointer flex items-center gap-2";
        contentJournal.classList.remove('hidden');
        contentMilestones.classList.add('hidden');
    } else {
        btnMilestones.className = "pb-3 px-4 font-bold text-sm sm:text-base border-b-2 border-indigo-600 text-indigo-600 transition-colors cursor-pointer flex items-center gap-2";
        btnJournal.className = "pb-3 px-4 font-bold text-sm sm:text-base border-b-2 border-transparent text-slate-400 hover:text-slate-600 transition-colors cursor-pointer flex items-center gap-2";
        contentMilestones.classList.remove('hidden');
        contentJournal.classList.add('hidden');
    }
}

// 渲染整體畫面
function renderAll() {
    renderHero();
    renderTasks();
    renderJournalAndMilestones();
}

// 頁面載入完成後初始化
window.addEventListener('DOMContentLoaded', () => {
    initApp();
});