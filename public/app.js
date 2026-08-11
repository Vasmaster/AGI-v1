// The Firebase project config is served by Firebase Hosting at
// /__/firebase/init.js (loaded in index.html), which calls initializeApp for us.
// Nothing here is hardcoded, so the config never lives in this repository.
const analytics = firebase.analytics();
const db = firebase.firestore();

// Firestore rules require an authenticated caller for every write, so no part of
// the form talks to the database until this sign-in resolves.
const authReady = firebase.auth().signInAnonymously()
  .catch(error => {
    console.error('Anonymous sign-in failed:', error);
    throw error;
  });

// Send participant data to Firestore
async function submitData() {
  const happiness = Number(document.getElementById('happiness').value) || 0;
  const sadness = 100 - happiness;
  const calmness = Number(document.getElementById('calmness').value) || 0;
  const nervous = 100 - calmness; // Fixed: was nausea, now nervous
  const excited = Number(document.getElementById('excited').value) || 0;
  const boredom = 100 - excited;
  const feedback = document.getElementById('feedback').value.trim() || '';

  // Get the delivery rating
  const deliveryRating = document.querySelector('input[name="delivery"]:checked') ? 
  Number(document.querySelector('input[name="delivery"]:checked').value) : 0;
  
  // Get the uncanny rating
  const uncannyRating = document.querySelector('input[name="uncanny"]:checked') ? 
  Number(document.querySelector('input[name="uncanny"]:checked').value) : 0;
  
  // Get the intonation rating
  const intonationRating = document.querySelector('input[name="intonation"]:checked') ? 
  Number(document.querySelector('input[name="intonation"]:checked').value) : 0;

  try {
    await authReady;

    // Get participant ID (e.g., from URL or local storage)
    const participantId = await getParticipantId();

    // Create a new document in the "participants" collection with corrected field names
    await db.collection("participants").doc(participantId).set({
      happiness,
      sadness,
      calmness,
      nervous, // Fixed: was nausea
      excited, // Fixed: was excitment
      boredom,
      feedback,
      deliveryRating,
      uncannyRating,
      intonationRating,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    console.log('Participant data submitted!');
    
    // Clear form after successful submission
    document.getElementById('feedback').value = '';
    
    // Clear rating selections
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
      radio.checked = false;
    });
    
    // Reset rating highlights
    document.querySelectorAll('.rating-options label').forEach(label => {
      label.classList.remove('active');
    });
    
    // Reset sliders to default values
    document.getElementById('happiness').value = 50;
    document.getElementById('calmness').value = 50;
    document.getElementById('excited').value = 50;
    updateSlider('happiness');
    updateSlider('calmness');
    updateSlider('excited');
    
    alert('Data submitted! Thank you for your feedback!');
  } catch (error) {  
    console.error('Error submitting data:', error);
    alert('Error submitting data. Please try again.');
  }    
}  

// Add this function to handle the rating highlighting for multiple groups
function setupRatingHighlight() {
  // Define all rating groups
  const ratingGroups = ['delivery', 'uncanny', 'intonation'];
  
  ratingGroups.forEach(groupName => {
    const ratingInputs = document.querySelectorAll(`input[name="${groupName}"]`);
    const ratingLabels = document.querySelectorAll(`label[for^="${groupName}"]`);
    
    ratingInputs.forEach(input => {
      input.addEventListener('change', function() {
        const selectedValue = parseInt(this.value);
        
        // Remove active class from all labels in this group
        ratingLabels.forEach(label => {
          if (label.htmlFor.startsWith(groupName)) {
            label.classList.remove('active');
          }
        });
        
        // Add active class to all labels up to and including the selected one
        ratingLabels.forEach(label => {
          if (label.htmlFor.startsWith(groupName)) {
            const labelValue = parseInt(label.htmlFor.replace(groupName, ''));
            if (labelValue <= selectedValue) {
              label.classList.add('active');
            }
          }
        });
      });
    });
    
    // Add hover effect for desktop only
    if (!('ontouchstart' in window)) {
      ratingLabels.forEach(label => {
        if (label.htmlFor.startsWith(groupName)) {
          label.addEventListener('mouseenter', function() {
            const hoverValue = parseInt(this.htmlFor.replace(groupName, ''));
            ratingLabels.forEach(l => {
              if (l.htmlFor.startsWith(groupName)) {
                const labelValue = parseInt(l.htmlFor.replace(groupName, ''));
                if (labelValue <= hoverValue) {
                  l.style.backgroundColor = '#ffe0b2';
                }
              }
            });
          });
          
          label.addEventListener('mouseleave', function() {
            ratingLabels.forEach(l => {
              if (l.htmlFor.startsWith(groupName)) {
                // Restore based on current selection
                const currentSelected = document.querySelector(`input[name="${groupName}"]:checked`);
                if (currentSelected) {
                  const selectedValue = parseInt(currentSelected.value);
                  const labelValue = parseInt(l.htmlFor.replace(groupName, ''));
                  l.style.backgroundColor = labelValue <= selectedValue ? '#ffa100' : 'white';
                } else {
                  l.style.backgroundColor = 'white';
                }
              }
            });
          });
        }
      });
    }
    
    // Add touch event for mobile to clear hover states
    ratingLabels.forEach(label => {
      if (label.htmlFor.startsWith(groupName)) {
        label.addEventListener('touchstart', function() {
          // Remove any lingering hover styles on touch
          ratingLabels.forEach(l => {
            if (l.htmlFor.startsWith(groupName)) {
              l.style.backgroundColor = '';
            }
          });
          
          // Force the change event to fire immediately on touch devices
          const radio = document.querySelector(`#${this.htmlFor}`);
          if (radio && radio.type === 'radio') {
            radio.checked = true;
            radio.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
      }
    });
  });
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

      // The name doubles as the Firestore document ID, so reject anything
      // Firestore cannot use as a key.
      if (enteredName.includes("/") || enteredName === "." || enteredName === ".." ||
          /^__.*__$/.test(enteredName) || enteredName.length > 100) {
          alert("Please use a simpler name (no slashes, under 100 characters).");
          return;
      }

      try {
          await authReady;

          // Check if the name already exists in Firebase.
          // This reads the single document by ID rather than querying the
          // collection, so the rules can permit `get` while denying `list` —
          // that keeps the participant list from being enumerable.
          const db = firebase.firestore();
          const usersRef = db.collection("users");

          const existing = await usersRef.doc(enteredName).get();

          if (existing.exists) {
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
  
  // Initialize rating highlighting
  setupRatingHighlight();
});

// Function to get participant ID
async function getParticipantId() {
  let participantId = localStorage.getItem("user");
  if (!participantId) {
      participantId = Date.now().toString();
      localStorage.setItem("user", participantId);
  }
  return participantId;
}

// Attach submitData function to button click
document.getElementById('submitBtn').addEventListener('click', submitData);

// Update slider values display
function updateSlider(id) {
  document.getElementById(id + 'Value').textContent = document.getElementById(id).value;
}