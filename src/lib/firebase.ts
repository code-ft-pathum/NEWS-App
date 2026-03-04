import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBv8UxS6GxKcoWV0PCX3vJUfH3NrUMFTsk",
    authDomain: "todaynews-bd81f.firebaseapp.com",
    projectId: "todaynews-bd81f",
    storageBucket: "todaynews-bd81f.firebasestorage.app",
    messagingSenderId: "427717306853",
    appId: "1:427717306853:web:b62624634a3aa7e118270c",
    measurementId: "G-DYFRY43PVY"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
