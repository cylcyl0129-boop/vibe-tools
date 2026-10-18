// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, getDoc, updateDoc, query, where, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 您的 Firebase 專案設定
const firebaseConfig = {
  apiKey: "AIzaSyCZEwkLd30ECLeWRnIJltnoItutcR2zfVc",
  authDomain: "vibe-tools-f7c02.firebaseapp.com",
  projectId: "vibe-tools-f7c02",
  storageBucket: "vibe-tools-f7c02.firebasestorage.app",
  messagingSenderId: "471050647011",
  appId: "1:471050647011:web:ba46dd62283b9d4464dcd6",
  measurementId: "G-Z0RP9M172K"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, collection, addDoc, getDocs, doc, setDoc, getDoc, updateDoc, query, where, orderBy, onSnapshot, serverTimestamp };