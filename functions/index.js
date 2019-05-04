const admin = require("firebase-admin");
const functions = require("firebase-functions");

const { getAndStoreOfflineAccessToken } = require("./authentcation");

admin.initializeApp();
var db = admin.firestore();
global.firestoreInstance = db;

exports.getAndStoreOfflineAccessToken = functions.https.onCall(
  getAndStoreOfflineAccessToken
);
