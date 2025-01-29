// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBtE21oUfOcIBhTV22f74A03dTSW6KiSdY",
  authDomain: "chromatherapy-agi.firebaseapp.com",
  projectId: "chromatherapy-agi",
  storageBucket: "chromatherapy-agi.firebasestorage.app",
  messagingSenderId: "916355869435",
  appId: "1:916355869435:web:d510504bcf1cc313e9de5e",
  measurementId: "G-DYV9430MED"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Send participant data to Firestore
async function submitData() {
    const happiness = document.getElementById('happiness').value;
    const sadness = document.getElementById('sadness').value;
    const calmness = document.getElementById('calmness').value;
    const frustration = document.getElementById('frustration').value;
   
    try {
      await addDoc(collection(db, "participants"), {
          happiness: parseInt(happiness),
          sadness: parseInt(sadness),
          calmness: parseInt(calmness),
          frustration: parseInt(frustration),
          timestamp: serverTimestamp()
      });
      alert('Data submitted!');
  } catch (error) {
      console.error('Error submitting data:', error);
  }
}

// Make submitData available globally
window.submitData = submitData;
// Attach submitData function to button click
// document.getElementById('submitBtn').addEventListener('click', submitData);