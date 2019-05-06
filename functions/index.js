const ASQ = require("asynquence-contrib");
const admin = require("firebase-admin");
const functions = require("firebase-functions");

const {
  getAndStoreOfflineAccessToken,
  getUserDetails
} = require("./authentication");
const { getAndStoreEvents } = require("./events");
const { aggregateEventsForWeek } = require("./aggregation");
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

// get all events for last few weeks and this week from calendar
// aggregate those events for each week
exports.performTasksForNewUser = functions.auth.user().onCreate(user => {
  const userGoogleID = getUserGoogleID(user);
  console.log("A new user has been created", userGoogleID);

  return ASQ()
    .seq(
      getAndStoreEvents({
        timeMin: getStartOfWeek(NUMBER_OF_LAST_WEEKS_TO_FETCH_FOR_NEW_USER),
        timeMax: getEndOfThisWeek(),
        userID: userGoogleID
      }),
      () => {
        return ASQ()
          .val(userGoogleID)
          .seq(getUserDetails)
          .seq(userDetails => {
            const timeZone = userDetails.calendar.timeZone;
            // timestamp representing last four weeks
            // the timestamp is the datetime which represents
            // the beginning of a week
            const lastFourAndThisWeek = [
              ...Array(NUMBER_OF_LAST_WEEKS_TO_FETCH_FOR_NEW_USER + 1).keys()
            ].map(weekIndex => getStartOfWeek(weekIndex, timeZone));

            return ASQ().gate(
              ...lastFourAndThisWeek.map(week =>
                aggregateEventsForWeek({ userID: userGoogleID, week })
              )
            );
          });
      }
    )
    .toPromise();
});
