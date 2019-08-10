const {
  getStartOfWeek,
  getStartOfLastWeek,
  getStartOfThisWeek,
  getEndOfThisWeek
} = require("./dateTimeUtilities");

const getOAuthClientForUser = require("./getOAuthClientForUser");
const getUserGoogleID = require("./getUserGoogleID");
const getUsername = require("./getUsername");
const getUserEmail = require("./getUserEmail");
const doesEventHappensThisDay = require("./doesEventHappensThisDay");
const qualifyEvent = require("./qualifyEvent");
const checkTime = require("./checkTime");

module.exports = {
  getStartOfWeek,
  getStartOfLastWeek,
  getStartOfThisWeek,
  getEndOfThisWeek,
  getOAuthClientForUser,
  getUserGoogleID,
  getUsername,
  getUserEmail,
  doesEventHappensThisDay,
  qualifyEvent,
  checkTime
};
