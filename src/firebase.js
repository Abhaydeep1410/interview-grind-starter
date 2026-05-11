
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDN68cwsyJROJ05jzfev0wNbnfWEfXh83o",
  authDomain: "interview-grind-ff923.firebaseapp.com",
  projectId: "interview-grind-ff923",
  storageBucket: "interview-grind-ff923.firebasestorage.app",
  messagingSenderId: "319808763046",
  appId: "1:319808763046:web:d47183bd7c525cf4c1f067"
};
    
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
