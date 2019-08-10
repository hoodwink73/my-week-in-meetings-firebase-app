const moment = require("moment-timezone");

// Is it a particular time in a particular timezone yet?
// Is it 9 in Calcutta yet?
module.exports = function checkTime({
  time: { hours, minutes = 0 },
  timezone,
  comparator = ">"
}) {
  var timeCheckOperator;
  switch (comparator) {
    case "=":
      timeCheckOperator = "isSame";
      break;
    case "<":
      timeCheckOperator = "isBefore";
      break;
    case ">":
    default:
      timeCheckOperator = "isAfter";
  }

  const now = moment.tz(timezone);

  const timeToCheckAgainst = moment
    .tz(timezone)
    .hours(hours - 1)
    .minutes(minutes)
    .seconds(0);

  return now[timeCheckOperator](timeToCheckAgainst, "hours");
};
