// Import the functions you need from the SDKs you need
// import { initializeApp } from 'firebase/app';
// import { getAnalytics } from "firebase/analytics";
// import { getFirestore, collection, addDoc, serverTimestamp, doc, updateDoc, getDoc } from "firebase/firestore";
// import { getDatabase, set, get, update, ref } from "firebase/database";
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
firebase.initializeApp(firebaseConfig);
const analytics = firebase.analytics();
const db = firebase.firestore();
// const sbmtdb = firebase.firestore.submitData();

// const submitBtn = document.getElementById('submitBtn');
// submitBtn.addEventListener('submit', (event) => {
//   event.preventDefault(); // Prevent default form submission
//   // Get data from input fields
//   const happiness = document.getElementById('happinessValue').value;
//   // Call your Firebase function to update/register data
//   updateFirestore(happiness);
//    // Get data from input fields
//    const calmness = document.getElementById('calmnessValue').value;
//    // Call your Firebase function to update/register data
//    updateFirestore(calmness);
// });

// async function updateFirestore(happiness) {
//     try {
//       // Get a reference to the document you want to update/register
//       const docRef = doc(fbdb, 'averages', 'current'); // Replace 'users' and 'user1' with your collection and document ID
  
//       // Update the document
//       await updateDoc(docRef, {
//         avgHappiness:happiness
//       });
  
//       console.log('Document updated successfully!');
//     } catch (error) {
//       console.error('Error updating document: ', error);
//     }
//   }
  
// Send participant data to Firestore
async function submitData() {
    const happiness = Number(document.getElementById('happiness').value) || 0;
    const sadness = 100 - happiness;
    const calmness = Number(document.getElementById('calmness').value) || 0;
    const frustration = 100 - calmness;

    try {
        await db.collection("averages").doc("current").set({
            totalHappiness: happiness,
            totalSadness: sadness,
            totalCalmness: calmness,
            totalFrustration: frustration,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });  // 🔥 Merge prevents overwriting existing data!
      alert('Data submitted!');
  } catch (error) {
      console.error('Error submitting data:', error);
  }
}

// Make submitData available globally
//window.submitData = submitData;
// Attach submitData function to button click
 document.getElementById('submitBtn').addEventListener('click', submitData);