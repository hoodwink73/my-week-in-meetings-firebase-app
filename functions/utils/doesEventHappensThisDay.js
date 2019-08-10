const moment = require("moment-timezone");

module.exports = function doesEventHappensThisDay({ event, date, timezone }) {
  if (!moment.isMoment(date)) {
    console.error("The `date` argument should be a moment object");
  }

  const startOfDay = date
    .clone()
    .tz(timezone)
    .startOf("day");

  const eventStartTime = moment(event.start.dateTime).tz(timezone);

  return eventStartTime.isSame(startOfDay, "day");
};
