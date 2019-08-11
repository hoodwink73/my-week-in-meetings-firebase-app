const moment = require("moment");
const delve = require("dlv");

module.exports = function sortEvents(
  events,
  { ascending = true, key = "start.dateTime", secondaryKey = "" } = {}
) {
  const _events = events.slice();
  return _events.sort((eventA, eventB) => {
    const diff =
      moment(delve(eventA, key)).valueOf() -
      moment(delve(eventB, key)).valueOf();

    if (diff === 0 && secondaryKey) {
      return (
        moment(delve(eventA, secondaryKey)).valueOf() -
        moment(delve(eventB, secondaryKey)).valueOf()
      );
    }

    return ascending ? diff : -diff;
  });
};
