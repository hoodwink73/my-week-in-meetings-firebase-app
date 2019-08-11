const { aggregateTotalMeetingTime } = require("../aggregation/aggregators");
const { expressDurationInHoursAndMinutes } = require("../utils");

module.exports = function aggregateDailyEmailStats(events) {
  return {
    numberOfEvents: events.length,
    eventSummaries: events.map(event => event.summary),
    totalTimeSpentInMeetings: expressDurationInHoursAndMinutes(
      aggregateTotalMeetingTime(events)
    )
  };
};
