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

module.exports = {
  getStartOfWeek,
  getStartOfLastWeek,
  getStartOfThisWeek,
  getEndOfThisWeek,
  getOAuthClientForUser,
  getUserGoogleID,
  getUsername,
  getUserEmail
};
