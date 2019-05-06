const ASQ = require("asynquence-contrib");

module.exports = function getUserDetails(userID) {
  const db = global.firestoreInstance;
  const userDocRef = db.collection("users").doc(userID);
  return ASQ().promise(
    userDocRef.get().then(docSnapshot => {
      if (docSnapshot.exists) {
        return docSnapshot.data();
      } else {
        return null;
      }
    })
  );
};
