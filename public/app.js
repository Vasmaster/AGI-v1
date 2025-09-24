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

// Send participant data to Firestore
async function submitData() {
  const happiness = Number(document.getElementById('happiness').value) || 0;
  const sadness = 100 - happiness;
  const calmness = Number(document.getElementById('calmness').value) || 0;
  const nervous = 100 - calmness;
  const excited = Number(document.getElementById('excited').value) || 0;
  const boredom = 100 - excited;
  const feedback = document.getElementById('feedback').value.trim() || ''; // Get feedback text

  try {
    await db.collection("averages").doc("current").set({
      totalHappiness: happiness,
      totalSadness: sadness,
      totalCalmness: calmness,
      totalNervous: nervous,
      totalExcited: excited,
      totalBoredom: boredom,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });  // 🔥 Merge prevents overwriting existing data!
    
   
    
    // Get participant ID (e.g., from URL or local storage)
    const participantId = await getParticipantId();
    
    // Create a new document in the "participants" collection
    await db.collection("participants").doc(participantId).set({
      happiness,
      sadness,
      calmness,
      nervous,
      excited,
      boredom,
      feedback,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    console.log('Participants data submitted!');
    
    alert('Data submitted!');
  } catch (error) {  
    console.error('Error submitting data:', error);
  }    
}  

document.addEventListener("DOMContentLoaded", async function () {
  const nameInputContainer = document.getElementById("nameInputContainer");
  const slidersContainer = document.getElementById("slidersContainer");
  const nameSubmitBtn = document.getElementById("nameSubmitBtn");
  const userNameInput = document.getElementById("userName");

  // Check if a participant ID is already stored
  let participantId = localStorage.getItem("user");

  if (participantId) {
      // If ID exists, show sliders immediately
      nameInputContainer.style.display = "none";
      slidersContainer.style.display = "block";
  } else {
    nameSubmitBtn.addEventListener("click", async function () {
      const enteredName = userNameInput.value.trim();
  
      if (!enteredName) {
          alert("Please enter your name before proceeding.");
          return;
      }
  
      try {
          // Check if the name already exists in Firebase
          const db = firebase.firestore();
          const usersRef = db.collection("users"); // Adjust collection name if needed
  
          const querySnapshot = await usersRef.where("participantId", "==", enteredName).get();
  
          if (!querySnapshot.empty) {
              alert("⚠️ Name already in use! Please choose a different name.");
          } else {
              // If name is unique, save it
              participantId = enteredName;
              localStorage.setItem("user", participantId);
  
              // Store it in Firebase too
              await usersRef.doc(participantId).set({ participantId });
  
              // Hide name input and show sliders
              nameInputContainer.style.display = "none";
              slidersContainer.style.display = "block";
          }
      } catch (error) {
          console.error("Error checking name:", error);
          alert("⚠️ Something went wrong. Please try again.");
      }
    });
    }
  });

// Function to get participant ID
async function getParticipantId() {
  let participantId = localStorage.getItem("user");
  if (!participantId) {
      participantId = Date.now().toString(); // Generate a new ID if none exists
      localStorage.setItem("user", participantId);
  }
  return participantId;
}

// Attach submitData function to button click
document.getElementById('submitBtn').addEventListener('click', submitData);