// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
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
function submitData() {
    const happiness = document.getElementById('happiness').value;
    const sadness = document.getElementById('sadness').value;
    const calmness = document.getElementById('calmness').value;
    const frustration = document.getElementById('frustration').value;
  
    // Add data to Firestore
    firebase.firestore().collection('participants').add({
      happiness: parseInt(happiness),
      sadness: parseInt(sadness),
      calmness: parseInt(calmness),
      frustration: parseInt(frustration),
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
      alert('Data submitted!');
    }).catch((error) => {
      console.error('Error submitting data: ', error);
    });
  }