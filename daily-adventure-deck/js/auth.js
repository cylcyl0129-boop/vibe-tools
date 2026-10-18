import { auth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, doc, setDoc, getDoc } from "./firebase-config.js";

const provider = new GoogleAuthProvider();

document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('login-btn');
  
  // 監聽登入狀態變化
  onAuthStateChanged(auth, async (user) => {
    const profileSection = document.getElementById('user-profile-section');
    if (user) {
      // 已登入：顯示頭貼與登出按鈕
      profileSection.innerHTML = `
        <div class="flex items-center gap-2">
          <img src="${user.photoURL || 'https://via.placeholder.com/32'}" alt="頭貼" class="w-8 h-8 rounded-full border border-slate-200">
          <span class="text-xs text-slate-700 font-medium hidden sm:inline">${user.displayName}</span>
          <button id="logout-btn" class="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-full transition">登出</button>
        </div>
      `;
      document.getElementById('logout-btn').addEventListener('click', handleLogout);
      
      // 同步使用者資料至 Firestore
      await syncUserProfile(user);
    } else {
      // 未登入：顯示登入按鈕
      profileSection.innerHTML = `
        <button id="google-login-btn" class="bg-indigo-600 text-white px-4 py-1.5 rounded-full hover:bg-indigo-700 transition shadow-sm text-xs font-medium">Google 登入</button>
      `;
      document.getElementById('google-login-btn').addEventListener('click', handleGoogleLogin);
    }
  });
});

async function handleGoogleLogin() {
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("登入失敗：", error);
    alert("登入發生錯誤，請稍後再試。");
  }
}

async function handleLogout() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("登出失敗：", error);
  }
}

async function syncUserProfile(user) {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      streak: 5,
      collectedCount: 12,
      createdAt: new Date()
    });
  }
}