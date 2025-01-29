/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
admin.initializeApp();

// Listen for new participant data
exports.aggregateData = functions.firestore
  .document('participants/{participantId}')
  .onCreate(async (snapshot, context) => {
    const data = snapshot.data();

    // Calculate averages (example)
    const participants = await admin.firestore().collection('participants').get();
    let totalHappiness = 0;
    let totalSadness = 0;
    let totalCalmness = 0;
    let totalFrustration = 0;
    participants.forEach(doc => {
      totalHappiness += doc.data().happiness;
      totalSadness += doc.data().sadness;
      totalCalmness += doc.data().calmness;
      totalFrustration += doc.data().frustration;
    });

    const avgHappiness = totalHappiness / participants.size;
    const avgSadness = totalSadness / participants.size;
    const avgCalmness = totalCalmness / participants.size;
    const avgFrustration = totalFrustration / participants.size;

    // Save averages to Firestore
    await admin.firestore().collection('averages').doc('current').set({
      avgHappiness,
      avgSadness,
      avgCalmness,
      avgFrustration,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
  });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

 exports.helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
   response.send("Hello from Firebase!");
 });
