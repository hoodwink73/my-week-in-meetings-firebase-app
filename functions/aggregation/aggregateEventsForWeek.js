const ASQ = require("asynquence-contrib");
const { values } = require("lodash");
const moment = require("moment-timezone");

const { getUserDetails } = require("../authentication");
const { getEventsForUserForWeek } = require("../events");
const aggregators = require("./aggregators");
const { EVENT_STATUSES } = require("../constants");

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
    .then((done, { userDetails, week }, events) => {
      // we want to ignore events based on two criterias
      // -  the user has declined the event explicitly
      // -  there are no other attendees in the event (expcept the user)

      const filteredEvents = events.filter(event => {
        let attendeeMe, areThereOtherAttendees;

        if (event.attendees) {
          [attendeeMe] = event.attendees.filter(attendee => attendee.self);

          areThereOtherAttendees = Boolean(
            event.attendees.filter(attendee => !attendee.self).length
          );

          if (attendeeMe.responseStatus !== EVENT_STATUSES.get("Declined")) {
            if (areThereOtherAttendees) {
              return true;
            }
          }
        }
      });

      done({ userDetails, week }, filteredEvents);
    })
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
