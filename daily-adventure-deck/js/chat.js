import { auth, db, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "./firebase-config.js";

document.addEventListener('DOMContentLoaded', () => {
  // 建立聊天室抽屜介面容器
  createChatDrawerUI();
  
  const chatToggleBtn = document.getElementById('chat-toggle-btn');
  const chatDrawer = document.getElementById('chat-drawer');
  const chatCloseBtn = document.getElementById('chat-close-btn');
  const chatSendBtn = document.getElementById('chat-send-btn');
  const chatInput = document.getElementById('chat-input');

  chatToggleBtn.addEventListener('click', () => {
    chatDrawer.classList.toggle('translate-x-full');
  });

  chatCloseBtn.addEventListener('click', () => {
    chatDrawer.classList.add('translate-x-full');
  });

  chatSendBtn.addEventListener('click', sendMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  // 載入即時聊天訊息
  loadMessages();
});

function createChatDrawerUI() {
  const drawerHTML = `
    <div id="chat-drawer" class="fixed inset-y-0 right-0 z-50 w-80 bg-white shadow-2xl border-l border-slate-100 transform translate-x-full transition-transform duration-300 flex flex-col">
      <div class="p-4 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
        <h3 class="font-bold text-slate-800 text-sm flex items-center gap-2">💬 好友私訊聊天室</h3>
        <button id="chat-close-btn" class="text-slate-400 hover:text-slate-600 text-sm">✕</button>
      </div>
      <div id="chat-messages" class="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30 text-xs">
        <!-- 訊息列表動態渲染 -->
      </div>
      <div class="p-3 border-t border-slate-100 flex gap-2 bg-white">
        <input type="text" id="chat-input" placeholder="傳送鼓勵文字或卡牌分享..." class="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500">
        <button id="chat-send-btn" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-medium transition">發送</button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', drawerHTML);
}

async function sendMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;

  const currentUser = auth.currentUser;
  try {
    await addDoc(collection(db, 'chats'), {
      uid: currentUser ? currentUser.uid : 'anonymous',
      userName: currentUser ? currentUser.displayName : '冒險旅人',
      avatar: currentUser ? currentUser.photoURL : 'https://via.placeholder.com/24',
      text: text,
      createdAt: serverTimestamp()
    });
    input.value = '';
  } catch (error) {
    console.error("發送訊息失敗：", error);
  }
}

function loadMessages() {
  const msgContainer = document.getElementById('chat-messages');
  
  // 模擬本地預設對話（當尚未連線 Firestore 時展示）
  msgContainer.innerHTML = `
    <div class="flex items-start gap-2">
      <div class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">友</div>
      <div class="bg-white p-2.5 rounded-2xl shadow-sm border border-slate-100 max-w-[80%]">
        <p class="font-bold text-[10px] text-slate-600">冒險小幫手</p>
        <p class="text-slate-700 mt-0.5">嗨！今天有完成你的三張微冒險卡牌嗎？加油！✨</p>
      </div>
    </div>
  `;
}