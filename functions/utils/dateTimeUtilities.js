const moment = require("moment-timezone");

exports.getStartOfLastWeek = function(timeZone = "UTC") {
  return moment
    .tz(new Date(), timeZone)
    .subtract(1, "week")
    .startOf("isoWeek");
};

exports.getStartOfWeek = function(numberOfWeeksEarlier = 4, timeZone = "UTC") {
  return moment
    .tz(new Date(), timeZone)
    .subtract(numberOfWeeksEarlier, "week")
    .startOf("isoWeek");
};

exports.getStartOfThisWeek = function(timeZone = "UTC") {
  return moment.tz(new Date(), timeZone).startOf("isoWeek");
};

exports.getEndOfThisWeek = function(timeZone = "UTC") {
  return moment.tz(new Date(), timeZone).endOf("isoWeek");
};
