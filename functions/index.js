const ASQ = require("asynquence-contrib");
const admin = require("firebase-admin");
const functions = require("firebase-functions");

const {
  getAndStoreOfflineAccessToken,
  getUserDetails,
  doesUserExistInFirebase,
  setDefaultUserConfig
} = require("./authentication");
const { getAndStoreEvents, declineEvent } = require("./events");
const { aggregateEventsForWeek } = require("./aggregation");
const {
  pushNotificationHandlerExpressApp,
  subscribeUserToCalendarEvents,
  unsubscribeUserToCalendarEvents,
  resubscribeToCalendarEvents
} = require("./calendarWebHooks");

const { onDeleteUserRequest, deleteUserData } = require("./cleanup");
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

exports.doesUserExistInFirebase = functions.https.onCall(({ userGoogleID }) =>
  doesUserExistInFirebase(userGoogleID).toPromise()
);

// get all events for last few weeks and this week from calendar
// aggregate those events for each week
exports.performTasksForNewUser = functions.auth.user().onCreate(user => {
  const userGoogleID = getUserGoogleID(user);
  console.log("A new user has been created", userGoogleID);

  return ASQ()
    .seq(() => setDefaultUserConfig({ userGoogleID }))
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
      },
      () => subscribeUserToCalendarEvents({ userID: userGoogleID })
    )
    .toPromise();
});

exports.onDeleteUserRequest = functions.https.onCall((data, context) => {
  return onDeleteUserRequest(context.auth.uid);
});

exports.performTasksForDeletedUser = functions
  .runWith({
    timeoutSeconds: 540,
    memory: "2GB"
  })
  .auth.user()
  .onDelete(user => {
    const userGoogleID = getUserGoogleID(user);
    console.log(
      `Initiating cleanup process as user ${userGoogleID} has been deleted`
    );

    return ASQ()
      .seq(() => unsubscribeUserToCalendarEvents({ userID: userGoogleID }))
      .seq(() => deleteUserData({ userID: userGoogleID }))
      .toPromise();
  });

// an express app to handle push notfications for events in a calendar
exports.calendarNotificationWebhook = functions.https.onRequest(
  pushNotificationHandlerExpressApp
);

exports.declineEvent = functions.https.onCall(
  ({ userID, eventID, comment = "" }) =>
    declineEvent({ userID, eventID, comment }).toPromise()
);

exports.webhookExpirationCheck = functions.pubsub
  .schedule("every day 00:00")
  .onRun(context => resubscribeToCalendarEvents());
