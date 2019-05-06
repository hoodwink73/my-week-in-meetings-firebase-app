const functions = require("firebase-functions");
const ASQ = require("asynquence-contrib");
const { google } = require("googleapis");

module.exports = function getOAuthClientForUser({ userID }) {
  const db = global.firestoreInstance;
  const userTokenRef = db.collection("users_google_credentials").doc(userID);

  const {
    client_id,
    client_secret,
    javascript_origins
  } = functions.config().google_sign_in;

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    javascript_origins
  );

  return ASQ()
    .promise(userTokenRef.get())
    .val(userTokenSnapshot => {
      if (!userTokenSnapshot.exists) {
        throw new Error(
          "Google credentials could not be found for the provided user id"
        );
      }

      const userToken = userTokenSnapshot.data();

      oAuth2Client.setCredentials(userToken);

      return oAuth2Client;
    });
};
