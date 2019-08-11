const moment = require("moment");

const groupEventsByTime = require("./groupEventsByTime");
const sortEvents = require("./sortEvents");
const timeInOverlappedMeetingsInMs = require("./timeInOverlappedMeetingsInMs");
const {
  INCLUDE_COOL_OFF_TIME,
  COOL_OFF_TIME_IN_MINUTES
} = require("../constants");

module.exports = function timeLeftForWorkTodayInMs(
  events,
  { workStartTime, workEndTime, fromTime, timezone }
) {
  moment.tz.setDefault(timezone);

  let now = moment();
  // if the cool off time setting is enabled
  // we will stretch every event time by the set cool-off time
  // we do not want to mutate the original events
  // so clone, stretch and store them here
  let extendedEvents = [];

  if (moment.isMoment(fromTime)) {
    now = fromTime;
  }

  // if the workday hasn't begun, we should only start counting from beginning
  // of the work day
  if (now.isBefore(workStartTime, "minutes")) {
    now = workStartTime;
  }

  if (INCLUDE_COOL_OFF_TIME) {
    extendedEvents = events.map(event => ({
      ...event,
      start: {
        ...event.start,
        dateTime: moment(event.start.dateTime).subtract(
          COOL_OFF_TIME_IN_MINUTES,
          "minutes"
        )
      },
      end: {
        ...event.end,
        dateTime: moment(event.end.dateTime).add(
          COOL_OFF_TIME_IN_MINUTES,
          "minutes"
        )
      }
    }));
  }

  let { happening, willHappen } = groupEventsByTime(
    INCLUDE_COOL_OFF_TIME ? extendedEvents : events,
    now
  );

  // if the current instant is beyond worday end
  // no time left for work today
  if (
    now.isAfter(workEndTime, "minutes") ||
    now.isSame(workEndTime, "minutes")
  ) {
    return 0;
  }

  let futureEventsDuration = [];

  // filter events happening after workday end
  willHappen = willHappen.filter(event => {
    if (
      moment(event.start.dateTime).isAfter(workEndTime, "minute") ||
      moment(event.start.dateTime).isSame(workEndTime, "minute")
    ) {
      return false;
    } else {
      return true;
    }
  });

  futureEventsDuration = futureEventsDuration.concat(
    willHappen.map(event => {
      // what if a meeting starts before the work end time
      // but ends after the work end time
      // we count the duration of the meeting to be
      // from the meeting start timeout
      // until the work end time
      if (
        workEndTime.isBetween(
          moment(event.start.dateTime),
          moment(event.end.dateTime),
          "minute"
        )
      ) {
        return workEndTime.diff(event.start.dateTime, "milliseconds");
      } else {
        return event.end.dateTime.diff(event.start.dateTime, "milliseconds");
      }
    })
  );

  // there can be meetings that are overlapping
  // and these time of overlaps should not be deducted from the available
  // time of work
  const effectiveTimeInOverlappedEventsInMs =
    willHappen.length > 0 ? timeInOverlappedMeetingsInMs(willHappen) : 0;

  // if a meeting is happening now, no *work* can be done until it gets over
  // so we can safely say that the work time start at this instant but only after
  // the meeting
  // if multiple events are happening at the same we would want the event whose
  // end time is the latest
  if (happening.length > 0) {
    const eventWhichIsTheLastToEnd = sortEvents(happening, {
      ascending: false,
      key: "end.dateTime"
    })[0];

    // if a current meeting (which is occuring now) lasts beyond the workday end
    // then no time is left for work today
    if (moment(eventWhichIsTheLastToEnd.end.dateTime).isAfter(workEndTime)) {
      return 0;
    } else {
      now = moment(eventWhichIsTheLastToEnd.end.dateTime);
    }
  }

  const totaltimeLeftForWorkInMs = workEndTime.diff(now, "milliseconds");
  const timeThatWillBeSpentInMeetingsTodayInMs = futureEventsDuration.reduce(
    (sum, current) => sum + current,
    0
  );

  const totalWorkTimeLeftToday =
    totaltimeLeftForWorkInMs -
    timeThatWillBeSpentInMeetingsTodayInMs +
    effectiveTimeInOverlappedEventsInMs;

  // reset the timezone back to server
  moment.tz.setDefault();

  return totalWorkTimeLeftToday;
};
