const ASQ = require("asynquence-contrib");

module.exports = function markFirstAggregationCompleteForUser({ userID }) {
  const db = global.firestoreInstance;

  const userDocRef = db.collection("users").doc(userID);

  console.log(userDocRef);
  return ASQ().promise(
    userDocRef.set(
      {
        firstAggregationComplete: true
      },
      { merge: true }
    )
  );
};
