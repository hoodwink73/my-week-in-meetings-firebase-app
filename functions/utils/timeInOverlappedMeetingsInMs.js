const moment = require("moment");
const sortEvents = require("./sortEvents");

module.exports = function timeInOverlappedMeetingsInMs(events) {
  const timeOverlappedBy = [];
  const sortedEvents = sortEvents(events, {
    secondaryKey: "enrichedData.durationInMs"
  });

  sortedEvents.reduce((prevEvent, event) => {
    const prevEventEndTime = moment(prevEvent.end.dateTime);
    const thisEventStartTime = moment(event.start.dateTime);
    if (prevEventEndTime.isAfter(thisEventStartTime, "minute")) {
      timeOverlappedBy.push(
        prevEventEndTime.diff(thisEventStartTime, "milliseconds")
      );
    }
    return event;
  });

  return timeOverlappedBy.reduce((a, b) => a + b, 0);
};
