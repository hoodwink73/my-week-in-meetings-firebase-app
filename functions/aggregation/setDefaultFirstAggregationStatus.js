const ASQ = require("asynquence-contrib");

module.exports = function markFirstAggregationCompleteForUser({ userID }) {
  const db = global.firestoreInstance;

  const userDocRef = db.collection("users").doc(userID);

  return ASQ().promise(
    userDocRef.set(
      {
        firstAggregationComplete: false
      },
      { merge: true }
    )
  );
};
