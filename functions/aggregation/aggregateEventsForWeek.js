const ASQ = require("asynquence-contrib");
const { values } = require("lodash");
const moment = require("moment-timezone");

const { getUserDetails } = require("../authentication");
const { getEventsForUserForWeek } = require("../events");
const aggregators = require("./aggregators");

const AGGREGATE_OPERATIONS_TO_BE_PERFORMED = values(aggregators);

/**
 * crunches aggregation metrics for all events
 * for a user for the given week
 */
module.exports = ({ userID, week }) => {
  const db = global.firestoreInstance;
  return ASQ()
    .val(userID)
    .seq(getUserDetails)
    .waterfall(
      (done, userDetails) => {
        const timeZone = userDetails.calendar.timeZone;

        if (typeof week === "string") {
          week = moment.tz(week, timeZone);
        }

        done({
          userDetails,
          week
        });
      },
      (done, { week }) => getEventsForUserForWeek({ userID, week }).pipe(done)
    )
    .then((done, { week }, events) => {
      const docRef = db
        .collection(`users/${userID}/aggregates`)
        .doc(`${week.toISOString()}`);

      var result = {};

      AGGREGATE_OPERATIONS_TO_BE_PERFORMED.forEach(aggregateFn => {
        result[aggregateFn.name] = aggregateFn(events);
      });

      ASQ()
        .promise(docRef.set(result))
        .pipe(done);
    })
    .val(() =>
      console.log("aggregation for week done and persisted in firestore")
    );
};
