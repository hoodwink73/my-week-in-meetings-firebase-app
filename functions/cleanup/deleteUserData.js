const ASQ = require("asynquence-contrib");

module.exports = ({ userID }) => {
  const db = global.firestoreInstance;
  return ASQ()
    .then(done => {
      const userDocRef = db.collection("users").doc(userID);
      userDocRef.delete().then(done);

      console.log(
        `Events and aggregates for user with google ID -> ${userID} deleted`
      );
    })
    .then(done => {
      const userDocRef = db.collection("users_google_credentials").doc(userID);
      userDocRef.delete().then(done);

      console.log(
        `User credentials, webhook subscription and configuration for user with google ID -> ${userID} has been deleted`
      );
    })
    .or(err => console.error(err));
};
