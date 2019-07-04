const ASQ = require("asynquence-contrib");
const uuidv4 = require("uuid/v4");
const { google } = require("googleapis");

const {
  CALENDAR_EVENTS_WEBHOOK_SECRET,
  USER_EVENTS_WEBHOOK_URL
} = require("../constants");

const { getOAuthClientForUser } = require("../utils");

// subscribe to calendar events for a user
// we will request subscription whenever a user signs up
module.exports = function subscribeUserToCalendarEvents({ userID }) {
  // we are using an unique id here instead of username because
  // a user will need to subscribe to the webhook more than once
  // because they will expire
  // and each subscription needs a new channel hence a new ID
  const channelID = uuidv4();
  const db = global.firestoreInstance;
  const userRef = db.collection("users").doc(userID);
  return ASQ()
    .val({ userID })
    .seq(getOAuthClientForUser)
    .seq(oAuthClient => {
      const calendarAPI = google.calendar({ version: "v3", auth: oAuthClient });
      return ASQ()
        .then(done => {
          userRef.get().then(doc => {
            const user = doc.data();
            if (user && user.webhookDetails && user.webhookDetails.channelID) {
              done.fail({
                internal_error_message: `User with id: ${userID} is already subscribed to calendar events webhook.
               Aborting redundant webhook subscription.
              `
              });
            } else {
              done();
            }
          });
        })
        .promise(
          calendarAPI.events.watch({
            calendarId: "primary",
            requestBody: {
              id: channelID,
              address: USER_EVENTS_WEBHOOK_URL,
              type: "web_hook",
              token: `t=${CALENDAR_EVENTS_WEBHOOK_SECRET}&userID=${userID}`
            }
          })
        );
    })
    .or(error => {
      if (error.internal_error_message) {
        console.error(error.internal_error_message);
      } else if (error.data && error.data.error) {
        console.error(
          "Failed to subscribe to calendar event webhook",
          error.data.error
        );
      } else {
        console.error(error);
      }
    })
    .then((done, webhookSubscriptionResponse) => {
      // google webhook subscription sends relevant details in its headers
      // https://developers.google.com/calendar/v3/push
      const subscriptionInfo = webhookSubscriptionResponse.data;

      userRef
        .set(
          {
            webhookDetails: {
              channelID: subscriptionInfo.id,
              resourceID: subscriptionInfo.resourceId,
              expiresOn: subscriptionInfo.expiration
            }
          },
          { merge: true }
        )
        .catch(err => {
          console.error(
            "Subscription successful but failed to write subscription info firestore"
          );

          done.fail(err);
        });

      done(subscriptionInfo);
    });
};
