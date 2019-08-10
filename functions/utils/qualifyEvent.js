const { EVENT_STATUSES } = require("../constants");

// we want to ignore events based on two criterias
// -  the user has declined the event explicitly
// -  there are no other attendees in the event (expcept the user)
module.exports = function qualifyEvent(event) {
  let attendeeMe, areThereOtherAttendees;

  if (event.attendees) {
    [attendeeMe] = event.attendees.filter(attendee => attendee.self);

    areThereOtherAttendees = Boolean(
      event.attendees.filter(attendee => !attendee.self).length
    );

    // sometimes you can organise an event
    // (hence the event will be in your calendar)
    // but choose to opt-out of the attendee list
    // so we need to check whether the attendee list includes you
    // before we can check your response status to the event
    if (
      attendeeMe &&
      attendeeMe.responseStatus !== EVENT_STATUSES.get("Declined")
    ) {
      if (areThereOtherAttendees) {
        return true;
      }
    }
  }
};
