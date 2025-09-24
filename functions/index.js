/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onDocumentCreated, onDocumentUpdated} = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
// const {onRequest} = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");
admin.initializeApp();

// Listen for new participant data
exports.aggregateData = onDocumentCreated("participants/{participantId}", async (event) =>{
  const participantsSnapshot = await admin.firestore().collection("participants").get();
  const totalParticipants = participantsSnapshot.size;

  let totalHappiness = 0;
  let totalSadness = 0;
  let totalCalmness = 0;
  let totalNausea = 0;
  let totalExcitment = 0;
  let totalBoredom = 0;

  // Loop through all participants and sum their values
  participantsSnapshot.forEach((doc) => {
    const data = doc.data();
    totalHappiness += data.happiness || 0;
    totalSadness += data.sadness || 0;
    totalCalmness += data.calmness || 0;
    totalNausea += data.Nausea || 0;
    totalExcitment += data.Excitment || 0;
    totalBoredom += data.boredom || 0;
  });

  // Compute the correct averages
  const avgHappiness = totalHappiness / totalParticipants || 0;
  const avgSadness = totalSadness / totalParticipants || 0;
  const avgCalmness = totalCalmness / totalParticipants || 0;
  const avgNausea = totalNausea / totalParticipants || 0;
  const avgExcitment = totalExcitment / totalParticipants || 0;
  const avgBoredom = totalBoredom / totalParticipants || 0;

  // Save averages to Firestore
  await admin.firestore().collection("averages").doc("current").set({
    avgHappiness: Math.round(avgHappiness),
    avgSadness: Math.round(avgSadness),
    avgCalmness: Math.round(avgCalmness),
    avgNausea: Math.round(avgNausea),
    avgExcitment: Math.round(avgExcitment),
    avgBoredom: Math.round(avgBoredom),
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });
});

exports.aggregateData = onDocumentUpdated("participants/{participantId}", async (event) =>{
  const participantsSnapshot = await admin.firestore().collection("participants").get();
  const totalParticipants = participantsSnapshot.size;

  let totalHappiness = 0;
  let totalSadness = 0;
  let totalCalmness = 0;
  let totalNausea = 0;
  let totalExcitment = 0;
  let totalBoredom = 0;

  // Loop through all participants and sum their values
  participantsSnapshot.forEach((doc) => {
    const data = doc.data();
    totalHappiness += data.happiness || 0;
    totalSadness += data.sadness || 0;
    totalCalmness += data.calmness || 0;
    totalNausea += data.Nausea || 0;
    totalExcitment += data.Excitment || 0;
    totalBoredom += data.boredom || 0;
  });

  // Compute the correct averages
  const avgHappiness = totalHappiness / totalParticipants || 0;
  const avgSadness = totalSadness / totalParticipants || 0;
  const avgCalmness = totalCalmness / totalParticipants || 0;
  const avgNausea = totalNausea / totalParticipants || 0;
  const avgExcitment = totalExcitment / totalParticipants || 0;
  const avgBoredom = totalBoredom / totalParticipants || 0;

  // Save averages to Firestore
  await admin.firestore().collection("averages").doc("current").set({
    avgHappiness: Math.round(avgHappiness),
    avgSadness: Math.round(avgSadness),
    avgCalmness: Math.round(avgCalmness),
    avgNausea: Math.round(avgNausea),
    avgExcitment: Math.round(avgExcitment),
    avgBoredom: Math.round(avgBoredom),
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });
});
// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started
