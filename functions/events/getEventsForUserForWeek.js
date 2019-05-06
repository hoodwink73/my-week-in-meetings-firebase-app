const ASQ = require("asynquence-contrib");

/**
 * getAllEventsForUserForWeek -
 *
 * Get all events for a particular week from firestore
 * @param {Object} options
 * @param {string} optons.userID
 * @param {Moment.parseZone} options.week  a timezone preserved moment datetime
 *        which represents the start of the week
 * @return {ASQ} Firebase write records analytics
 */
module.exports = function getAllEventsForUserForWeek({ userID, week }) {
  const db = global.firestoreInstance;
  const eventsRef = db.collection(`users/${userID}/events`);

  console.log("Get all events for a week for aggregation", userID, week);
  return ASQ().promise(() => {
    return eventsRef
      .where("enrichedData.week", "==", week.toISOString())
      .get()
      .then(querySnapshot => {
        const result = [];

        querySnapshot.forEach(docSnapshot => result.push(docSnapshot.data()));
        console.log(
          `${
            result.length
          } events were found for week beginning at ${week.format()} for user - ${userID}`
        );
        return result;
      });
  });
};
