// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAI9N_v-KSD0dBf9OJAV2Qdu15A43jYAGo",
  authDomain: "salmast-9bec7.firebaseapp.com",
  projectId: "salmast-9bec7",
  storageBucket: "salmast-9bec7.appspot.com",
  messagingSenderId: "357764348023",
  appId: "1:357764348023:web:8fff4ddb44135a30fe6e72",
  measurementId: "G-RJ41Y1PW9X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, set };