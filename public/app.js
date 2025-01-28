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