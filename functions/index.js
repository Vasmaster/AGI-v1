/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
import { firestore } from 'firebase-functions';
import { initializeApp, firestore as _firestore } from 'firebase-admin';
import { onRequest } from "firebase-functions/v2/https";
import logger from "firebase-functions/logger";
initializeApp();

export const aggregateData = firestore
  .document('participants/{participantId}')
  .onCreate(async (snapshot, context) => {
    const data = snapshot.data();

    // Calculate averages (example)
    const participants = await _firestore().collection('participants').get();
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
    await _firestore().collection('averages').doc('current').set({
      avgHappiness,
      avgSadness,
      avgCalmness,
      avgFrustration,
      timestamp: _firestore.FieldValue.serverTimestamp()
    });
  });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
