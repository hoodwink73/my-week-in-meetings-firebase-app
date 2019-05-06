const concatMap = require("concat-map");
const { fromPairs, toPairs, groupBy } = require("lodash");

const moment = require("moment-timezone");

const aggregateTotalMeetingTime = (events = [], priorAccumulatedValue = 0) => {
  const durationOfMeetings = events.map(
    event => event.enrichedData.durationInMs
  );

  const totalDuration = durationOfMeetings.reduce(
    (priorAccumulatedValue, current) => priorAccumulatedValue + current,
    priorAccumulatedValue
  );

  return totalDuration;
};

const aggregateAverageMeetingTime = (
  events = [],
  priorAccumulatedValue = 0
) => {
  const eventsNum = events.length;

  let avergaeMeetingTime = aggregateTotalMeetingTime(events) / eventsNum;

  if (priorAccumulatedValue) {
    avergaeMeetingTime = (avergaeMeetingTime + priorAccumulatedValue) / 2;
  }

  return avergaeMeetingTime;
};

// rank collaborators by the number of meetings you have attended with them
const rankCollaborators = (events = [], priorAccumulatedValue = {}) => {
  const attendeesForAllEvents = concatMap(events, event => {
    return event.attendees && event.attendees.length ? event.attendees : [];
  });

  let result = attendeesForAllEvents.reduce(
    (attendeeMeetingsMap, attendeeInAMeeting) => {
      const email = attendeeInAMeeting.email;
      let numberOfMeetingsAtteneded;

      if (email in attendeeMeetingsMap) {
        numberOfMeetingsAtteneded = attendeeMeetingsMap[email] + 1;
      } else {
        numberOfMeetingsAtteneded = 1;
      }

      return Object.assign({}, attendeeMeetingsMap, {
        [email]: numberOfMeetingsAtteneded
      });
    },
    priorAccumulatedValue
  );

  // sort the results in descending order
  // more number of meetings comes first
  result = toPairs(result).sort(([_, eventsNum1], [__, eventsNum2]) => {
    return eventsNum1 < eventsNum2 ? 1 : -1;
  });

  return fromPairs(result);
};

const gapBetweenMeetings = (events, priorAccumulatedValue = []) => {
  const _events = events.concat([]);

  // sort events according to their starting time
  _events.sort((e1, e2) => {
    const startTimeForEvent1 = new Date(e1.start.dateTime).getTime();
    const startTimeForEvent2 = new Date(e2.start.dateTime).getTime();

    startTimeForEvent1 < startTimeForEvent2 ? -1 : 1;
  });

  let consecutiveEventPairs = [];
  _events.forEach((event, index, events) => {
    const nextEvent = events[index + 1];
    if (nextEvent) {
      consecutiveEventPairs.push([event, nextEvent]);
    }
  });

  const result = consecutiveEventPairs.map(([event, nextEvent]) => {
    const endTimeThisEvent = moment.parseZone(event.end.dateTime);
    const startTimeNextEvent = moment.parseZone(event.start.dateTime);

    const timeGapBetweenEventsInMs = endTimeThisEvent.diff(
      startTimeNextEvent,
      "minutes"
    );

    return {
      event: event.summary,
      nextEvent: nextEvent.summary,
      timeGapBetweenEventsInMs
    };
  });

  return [...result, ...priorAccumulatedValue];
};

const eventsFrequencyByDayOfWeek = (
  events = [],
  priorAccumulatedValue = {}
) => {
  let eventsGroupedToDays = groupBy(events, event => {
    return moment.parseZone(event.start.dateTime).day();
  });

  eventsGroupedToDays = toPairs(eventsGroupedToDays);

  let result = eventsGroupedToDays.map(val => {
    const [dayOfWeek, events] = val;
    const totalDurationForDayOfAWeekInMs = events.reduce((acc, event) => {
      return acc + event.enrichedData.durationInMs;
    }, 0);

    return [dayOfWeek, totalDurationForDayOfAWeekInMs];
  });

  // combine with the prior accumulated values
  toPairs(priorAccumulatedValue).forEach(([day, frequency]) => {
    if (result[day]) {
      result[day] = result[day] + frequency;
    } else {
      result[day] = frequency;
    }
  });

  return fromPairs(result);
};

const selfOrganisedVsInvited = (
  events = [],
  priorAccumulatedValue = { self: 0, invited: 0 }
) => {
  return events.reduce((result, event) => {
    if (event.enrichedData.selfOrganized) {
      result.self += 1;
    } else {
      result.invited += 1;
    }

    return result;
  }, priorAccumulatedValue);
};

const eventCreatorByDomainsFrequency = (
  events = [],
  priorAccumulatedValue = {}
) => {
  return events.reduce((result, event) => {
    const organizerDomain = event.organizer.email.split("@")[1];
    if (organizerDomain in result) {
      result[organizerDomain] += 1;
    } else {
      result[organizerDomain] = 1;
    }

    return result;
  }, priorAccumulatedValue);
};

module.exports = {
  aggregateTotalMeetingTime: aggregateTotalMeetingTime,
  aggregateAverageMeetingTime: aggregateAverageMeetingTime,
  rankCollaborators: rankCollaborators,
  gapBetweenMeetings: gapBetweenMeetings,
  eventsFrequencyByDayOfWeek: eventsFrequencyByDayOfWeek,
  selfOrganisedVsInvited: selfOrganisedVsInvited,
  eventCreatorByDomainsFrequency: eventCreatorByDomainsFrequency
};
