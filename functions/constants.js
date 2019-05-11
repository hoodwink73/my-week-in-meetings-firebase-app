const functions = require("firebase-functions");

exports.NUMBER_OF_LAST_WEEKS_TO_FETCH_FOR_NEW_USER = 4;

// we send this while subscribing to google events webhook token
// on a webhho push notification we validate for the presence of this
// this ensures any other evil folks cannot chhose to muddle up our data
exports.CALENDAR_EVENTS_WEBHOOK_SECRET = "554faf2d-dc6d-465c-a0b0-14d7bb514bf3";

// Google calendar will post notification on this url
// this url needs to be registered inside the google project
exports.USER_EVENTS_WEBHOOK_URL = `https://us-central1-${
  functions.config().project.id
}.cloudfunctions.net/calendarNotificationWebhook/`;

exports.EVENT_STATUSES = new Map([
  ["Accepted", "accepted"],
  ["Maybe", "tentative"],
  ["Declined", "declined"],
  ["Not Responded", "needsAction"]
]);