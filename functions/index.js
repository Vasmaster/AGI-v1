/* eslint-disable require-jsdoc */

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

// Helper function to aggregate all data
async function aggregateAllData() {
  const participantsSnapshot = await admin.firestore().collection("participants").get();
  const totalParticipants = participantsSnapshot.size;

  let totalHappiness = 0;
  let totalSadness = 0;
  let totalCalmness = 0;
  let totalNervous = 0;
  let totalExcited = 0;
  let totalBoredom = 0;

  // New rating fields
  let totalDeliveryRating = 0;
  let totalUncannyRating = 0;
  let totalIntonationRating = 0;

  let participantsWithRatings = 0; // Count participants who provided ratings

  // Loop through all participants and sum their values
  participantsSnapshot.forEach((doc) => {
    const data = doc.data();
    totalHappiness += data.happiness || 0;
    totalSadness += data.sadness || 0;
    totalCalmness += data.calmness || 0;
    totalNervous += data.nervous || 0; // Fixed field name
    totalExcited += data.excited || 0; // Fixed field name
    totalBoredom += data.boredom || 0;

    // Add the new rating fields
    if (data.deliveryRating) {
      totalDeliveryRating += data.deliveryRating || 0;
      participantsWithRatings++;
    }
    if (data.uncannyRating) {
      totalUncannyRating += data.uncannyRating || 0;
    }
    if (data.intonationRating) {
      totalIntonationRating += data.intonationRating || 0;
    }
  });

  // Compute the correct averages for emotion fields
  const avgHappiness = totalHappiness / totalParticipants || 0;
  const avgSadness = totalSadness / totalParticipants || 0;
  const avgCalmness = totalCalmness / totalParticipants || 0;
  const avgNervous = totalNervous / totalParticipants || 0;
  const avgExcited = totalExcited / totalParticipants || 0;
  const avgBoredom = totalBoredom / totalParticipants || 0;

  // Compute averages for rating fields (only for participants who provided them)
  const avgDeliveryRating = participantsWithRatings > 0 ? totalDeliveryRating / participantsWithRatings : 0;
  const avgUncannyRating = participantsWithRatings > 0 ? totalUncannyRating / participantsWithRatings : 0;
  const avgIntonationRating = participantsWithRatings > 0 ? totalIntonationRating / participantsWithRatings : 0;

  // Save averages to Firestore
  await admin.firestore().collection("averages").doc("current").set({
    // Emotion averages
    avgHappiness: Math.round(avgHappiness),
    avgSadness: Math.round(avgSadness),
    avgCalmness: Math.round(avgCalmness),
    avgNervous: Math.round(avgNervous),
    avgExcited: Math.round(avgExcited),
    avgBoredom: Math.round(avgBoredom),

    // New rating averages
    avgDeliveryRating: Math.round(avgDeliveryRating * 10) / 10, // Keep 1 decimal place
    avgUncannyRating: Math.round(avgUncannyRating * 10) / 10,
    avgIntonationRating: Math.round(avgIntonationRating * 10) / 10,

    // Metadata
    totalParticipants: totalParticipants,
    participantsWithRatings: participantsWithRatings,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });
}

// Listen for new participant data (created)
exports.aggregateDataOnCreate = onDocumentCreated("participants/{participantId}", async (event) => {
  try {
    await aggregateAllData();
    console.log("Data aggregated after new participant creation");
  } catch (error) {
    console.error("Error aggregating data after creation:", error);
  }
});

// Listen for updated participant data
exports.aggregateDataOnUpdate = onDocumentUpdated("participants/{participantId}", async (event) => {
  try {
    await aggregateAllData();
    console.log("Data aggregated after participant update");
  } catch (error) {
    console.error("Error aggregating data after update:", error);
  }
});

// Optional: Add a scheduled function to recalculate averages periodically
// This ensures data consistency even if triggers miss some events
exports.scheduledAggregate = require("firebase-functions/v2/scheduler").onSchedule("every 60 minutes", async (event) => {
  try {
    await aggregateAllData();
    console.log("Scheduled data aggregation completed");
  } catch (error) {
    console.error("Error in scheduled aggregation:", error);
  }
});
