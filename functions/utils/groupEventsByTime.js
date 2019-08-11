const moment = require("moment");

module.exports = function(events, now = moment()) {
  return events.reduce(
    (timeBuckets, event) => {
      const eventStart = event.start.dateTime;
      const eventEnd = event.end.dateTime;

      if (moment(eventEnd).isBefore(now, "minute")) {
        timeBuckets.happened.push(event);
      } else if (moment(eventStart).isAfter(now, "minute")) {
        timeBuckets.willHappen.push(event);
      } else if (
        now.isBetween(moment(eventStart), moment(eventEnd), "minute", "[]")
      ) {
        timeBuckets.happening.push(event);
      }

      return timeBuckets;
    },
    {
      happened: [],
      happening: [],
      willHappen: []
    }
  );
};
