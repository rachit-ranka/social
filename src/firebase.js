// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDOiQuRdmrRmVtX4KYtNAemvLKpzLYNBEs",
  authDomain: "social-app-cloud.firebaseapp.com",
  projectId: "social-app-cloud",
  storageBucket: "social-app-cloud.firebasestorage.app",
  messagingSenderId: "884853524437",
  appId: "1:884853524437:web:a6aa7df9468f28554ddf5c",
  measurementId: "G-P679G3QL7T"
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app; 