const moment = require("moment");

module.exports = function enrichEventData(event) {
  // add data to event body which will help with querying
  if (!(event && event.id)) {
    return;
  }

  let { dateTime: startTime } = event.start;
  let { dateTime: endTime } = event.end;
  const enrichedData = {};

  // how long the meeting happened
  startTime = moment(startTime);
  endTime = moment(endTime);

  enrichedData.durationInMs = endTime.diff(startTime);

  enrichedData.selfOrganized = Boolean(event.organizer.self);

  enrichedData.attendeesCount = event.attendees ? event.attendees.length : 0;

  // the week in which the meeting happened
  // a week is represented by timestamp of Monday 12AM
  // this key will be used to get all the events
  // that happened in a particular week
  enrichedData.week = moment
    .parseZone(event.start.dateTime)
    .startOf("isoWeek")
    .toISOString();

  enrichedData.recurring = Boolean(event.recurringEventId);

  return Object.assign({}, event, { enrichedData });
};
