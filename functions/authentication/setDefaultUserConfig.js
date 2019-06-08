const ASQ = require("asynquence-contrib");
const { DEFAULT_WORKING_TIME } = require("../constants");

module.exports = function setDefaultUserConfig({ userGoogleID }) {
  const db = global.firestoreInstance;
  const userDocRef = db.doc(`users/${userGoogleID}`);

  return ASQ().promise(
    userDocRef.set(
      {
        userConfig: { workingTime: DEFAULT_WORKING_TIME }
      },
      { merge: true }
    )
  );
};
