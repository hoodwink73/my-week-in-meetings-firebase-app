const moment = require("moment");

module.exports = function expressDurationInHoursAndMinutes(duration) {
  const momentDuration = moment.duration(duration);
  const hours = parseInt(momentDuration.asHours(), 10);
  const minutes = parseInt(momentDuration.minutes(), 10);

  return `${hours > 0 ? `${hours} hours` : ""} ${
    hours > 0 && minutes > 0 ? "and" : ""
  } ${minutes > 0 ? `${minutes} minutes` : ""} `;
};
