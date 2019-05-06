const {
  getStartOfWeek,
  getStartOfLastWeek,
  getStartOfThisWeek,
  getEndOfThisWeek
} = require("./dateTimeUtilities");

const getOAuthClientForUser = require("./getOAuthClientForUser");
const getUserGoogleID = require("./getUserGoogleID");

module.exports = {
  getStartOfWeek,
  getStartOfLastWeek,
  getStartOfThisWeek,
  getEndOfThisWeek,
  getOAuthClientForUser,
  getUserGoogleID
};
