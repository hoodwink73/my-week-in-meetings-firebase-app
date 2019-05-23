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

  return ASQ()
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
    .or(err =>
      console.error(
        "Cancelled webhook subscription but failed to write it to firestore",
        err
      )
    );
};
