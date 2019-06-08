const ASQ = require("asynquence-contrib");

module.exports = function doesUserExistInFirebase(userGoogleID) {
  const db = global.firestoreInstance;
  const userDocRef = db
    .collection("users_google_credentials")
    .doc(userGoogleID);
  return ASQ().promise(
    userDocRef.get().then(docSnapshot => {
      if (docSnapshot.exists) {
        return true;
      } else {
        return false;
      }
    })
  );
};
