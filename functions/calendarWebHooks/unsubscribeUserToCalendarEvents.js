const { google } = require("googleapis");
const ASQ = require("asynquence-contrib");

const FieldValue = require("firebase-admin").firestore.FieldValue;
const { getOAuthClientForUser } = require("../utils");

module.exports = function unsubscribeToCalendarEvents({ userID }) {
  const db = global.firestoreInstance;
  const userRef = db.collection("users").doc(userID);

  const calendarAPI = ASQ()
    .val({ userID })
    .seq(getOAuthClientForUser)
    .val(oAuthClient => google.calendar({ version: "v3", auth: oAuthClient }));

  // this method is run when a user is deleted
  // and we might receive the event twice
  // so we do not want to unsubscribe webhooks for an already
  // deleted user
  const validateUserCredsAvailability = ASQ()
    .promise(() => {
      return db
        .collection("users_google_credentials")
        .doc(userID)
        .get();
    })
    .val(userCredsSnapshot => {
      if (userCredsSnapshot.exists) {
        return true;
      } else {
        return true;
      }
    });

  return ASQ()
    .seq(validateUserCredsAvailability)
    .then((done, userCredsAvailable) => {
      if (userCredsAvailable) {
        done();
      } else {
        done.fail({
          internal_error_message:
            "The user you are trying to unsubscribe has already been deleted"
        });
      }
    })
    .promise(userRef.get())
    .then((done, doc) => {
      const user = doc.data();
      if (
        user &&
        user.webhookDetails &&
        user.webhookDetails.resourceID &&
        user.webhookDetails.channelID
      ) {
        done(user.webhookDetails.channelID, user.webhookDetails.resourceID);
      } else {
        done.fail({
          internal_error_message:
            "Could not find resourceID in firestore to unsubscribe from webhook"
        });
      }
    })
    .seq((channelID, resourceID) => {
      return ASQ()
        .seq(calendarAPI)
        .promise(calendarAPI =>
          calendarAPI.channels.stop({
            requestBody: {
              id: channelID,
              resourceId: resourceID
            }
          })
        );
    })
    .val(() => {
      console.log(
        `We have unsubscribed for the user with googleID -> ${userID}`
      );
    })
    .or(err => {
      if (err.internal_error_message) {
        console.error(err.internal_error_message);
      } else if (err.data && err.data.error) {
        console.error(
          "Calendar API could not unsubscribe from the webhook",
          err.data.error
        );
      } else {
        console.error(err);
      }
    })
    .promise(
      userRef.update({
        webhookDetails: FieldValue.delete()
      })
    )
    .or(err => console.error(err));
};
