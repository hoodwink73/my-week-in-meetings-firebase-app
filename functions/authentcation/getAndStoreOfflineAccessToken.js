const functions = require("firebase-functions");
const { google } = require("googleapis");

module.exports = ({ code, googleID }) => {
  const db = global.firestoreInstance;
  console.log(code, googleID);

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

  return oAuth2Client
    .getToken(code)
    .then(({ tokens }) => {
      var docRef = db.collection("users_google_credentials").doc(googleID);
      return docRef.set(tokens).then(() => tokens.id_token);
    })
    .catch(err => {
      throw err;
    });
};
