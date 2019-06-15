const ASQ = require("asynquence-contrib");
const firebaseTools = require("firebase-tools");
const functions = require("firebase-functions");

module.exports = ({ userID }) => {
  const db = global.firestoreInstance;
  return ASQ()
    .promise(() => {
      console.log(
        `Inititating config, events and aggregates deletion for user with googleID ${userID}`
      );

      // Run a recursive delete on the given document or collection path.
      // The 'token' must be set in the functions config, and can be generated
      // at the command line by running 'firebase login:ci'.
      return firebaseTools.firestore.delete(`users/${userID}`, {
        project: process.env.GCLOUD_PROJECT,
        recursive: true,
        yes: true,
        token: functions.config().fb.token
      });
    })
    .val(() => {
      console.log("We have deleted user config, events and aggregates");
    })
    .promise(() => {
      const userCredsRef = db
        .collection("users_google_credentials")
        .doc(userID);

      return userCredsRef.delete();
    })
    .val(() => {
      console.log(
        `Google credentials with priviledged access token for user -> ${userID} has been deleted`
      );
    })
    .or(err => console.error(err));
};
