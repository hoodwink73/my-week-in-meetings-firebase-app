const ASQ = require("asynquence-contrib");
const { google } = require("googleapis");
const admin = require("firebase-admin");
const moment = require("moment");

const { getOAuthClientForUser } = require("../utils");
const getEventById = require("./getEventById");
const { EVENT_STATUSES } = require("../constants");

const findMyselfInAttendeeList = ({ event }) => {
  const attendees = event.attendees;

  if (attendees && event.attendees.length > 0) {
    const me = attendees.filter(attendee => attendee.self);

    return me.length > 0 ? me[0] : null;
  } else {
    return null;
  }
};

module.exports = function declineEvent({
  userID,
  eventID,
  comment,
  step,
  isDirty
}) {
  const calendarAPI = ASQ()
    .val({ userID })
    .seq(getOAuthClientForUser)
    .val(auth => google.calendar({ version: "v3", auth }));

  return ASQ()
    .gate(calendarAPI, getEventById({ userID, eventID }))
    .then((done, calendarAPI, eventData) => {
      const me = findMyselfInAttendeeList({ event: eventData });

      if (!me) {
        console.error(
          `The event (id - ${
            eventData.id
          }) requested to be declined either do not have attendess or the user (id - ${userID}) is not an attendee`
        );
        done();
      } else {
        const attendeesWithoutMe = eventData.attendees.filter(
          attendee => !attendee.self
        );

        let modifiedAttendeeList = [
          ...attendeesWithoutMe,
          { ...me, responseStatus: EVENT_STATUSES.get("Declined"), comment }
        ];

        calendarAPI.events.patch(
          {
            calendarId: "primary",
            eventId: eventID,
            sendUpdates: "all",
            requestBody: {
              attendees: modifiedAttendeeList
            }
          },
          done.errfcb
        );
      }
    })
    .seq(() => {
      const db = global.firestoreInstance;
      const declineEventAnalyticsForUserRef = db
        .collection(`analytics/${userID}/declines`)
        .doc(eventID);

      return ASQ().promise(
        declineEventAnalyticsForUserRef.set({
          step,
          isDirty,
          comment: isDirty ? comment : "",
          timestamp: new admin.firestore.Timestamp(moment().unix(), 0)
        })
      );
    });
};
