const aggregateEventsForWeek = require("./aggregateEventsForWeek");
const markFirstAggregationCompleteForUser = require("./markFirstAggregationCompleteForUser");
const setDefaultFirstAggregationStatus = require("./setDefaultFirstAggregationStatus");

module.exports = {
  aggregateEventsForWeek,
  markFirstAggregationCompleteForUser,
  setDefaultFirstAggregationStatus
};
