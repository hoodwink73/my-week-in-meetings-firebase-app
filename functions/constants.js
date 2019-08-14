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

exports.DEFAULT_WORKING_TIME = {
  workStartTime: { hours: 9, minutes: 0 },
  workEndTime: { hours: 17, minutes: 0 },
  workingDays: [1, 2, 3, 4, 5]
};

exports.DAILY_EMAIL_SEND_TIME = {
  hours: 9,
  minutes: 0
};

exports.INCLUDE_COOL_OFF_TIME = true;
exports.COOL_OFF_TIME_IN_MINUTES = 10;

// events exceeding these duration shall be filtered
exports.MAXIMUM_EVENT_TIME_IN_MS = 8 * 60 * 60 * 1000;
