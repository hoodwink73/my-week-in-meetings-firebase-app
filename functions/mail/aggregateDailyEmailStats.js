const { aggregateTotalMeetingTime } = require("../aggregation/aggregators");
const moment = require("moment");

const expressDurationInHoursAndMinutes = duration => {
  const momentDuration = moment.duration(duration);
  const hours = parseInt(momentDuration.asHours(), 10);
  const minutes = parseInt(momentDuration.minutes(), 10);

  return `${hours > 0 ? `${hours} hours` : ""} ${
    hours > 0 && minutes > 0 ? "and" : ""
  } ${minutes > 0 ? `${minutes} ninutes and` : ""} `;
};

module.exports = function aggregateDailyEmailStats(events) {
  return {
    numberOfEvents: events.length,
    eventSummaries: events.map(event => event.summary),
    totalTimeSpentInMeetings: expressDurationInHoursAndMinutes(
      aggregateTotalMeetingTime(events)
    )
  };
};
