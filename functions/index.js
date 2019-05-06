const ASQ = require("asynquence-contrib");
const admin = require("firebase-admin");
const functions = require("firebase-functions");

const { getAndStoreOfflineAccessToken } = require("./authentcation");
const { getAndStoreEvents } = require("./events");
const {
  getUserGoogleID,
  getStartOfWeek,
  getEndOfThisWeek
} = require("./utils");

const { NUMBER_OF_LAST_WEEKS_TO_FETCH_FOR_NEW_USER } = require("./constants");

admin.initializeApp();
var db = admin.firestore();
global.firestoreInstance = db;

exports.getAndStoreOfflineAccessToken = functions.https.onCall(
  getAndStoreOfflineAccessToken
);

exports.performTasksForNewUser = functions.auth.user().onCreate(user => {
  const userGoogleID = getUserGoogleID(user);
  console.log("A new user has been created", userGoogleID);

  return ASQ()
    .seq(
      getAndStoreEvents({
        timeMin: getStartOfWeek(NUMBER_OF_LAST_WEEKS_TO_FETCH_FOR_NEW_USER),
        timeMax: getEndOfThisWeek(),
        userID: userGoogleID
      })
    )
    .toPromise();
});
