const ASQ = require("asynquence-contrib");

module.exports = function getEventById({ userID, eventID }) {
  const db = global.firestoreInstance;
  const eventsRef = db.collection(`users/${userID}/events`);

  return ASQ().promise(() => {
    return eventsRef
      .where("id", "==", eventID)
      .get()
      .then(querySnapshot => {
        let result;
        querySnapshot.forEach(docSnapshot => (result = docSnapshot.data()));
        return result;
      });
  });
};
