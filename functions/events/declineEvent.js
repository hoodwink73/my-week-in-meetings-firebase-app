const ASQ = require("asynquence-contrib");
const { google } = require("googleapis");

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

module.exports = function declineEvent({ userID, eventID, comment }) {
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
    });
};
