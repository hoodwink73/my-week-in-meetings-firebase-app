const ASQ = require("asynquence-contrib");
const express = require("express");
const qs = require("querystring");
const app = express();

const { getAndStoreEvents } = require("../events");
const { aggregateEventsForWeek } = require("../aggregation");
const { getUserDetails } = require("../authentication");
const { getStartOfThisWeek } = require("../utils");

app.get("/", (req, res) => {
  res.send(`
    <!doctype html>
    <head>
      <title>Time</title>
      <link rel="stylesheet" href="/style.css">
      <script src="/script.js"></script>
        <meta name="google-site-verification" content="DNeZi4SircAcVGw55U_Mn6C79flMT-_AsIDR83lJuQA" />
    </head>
    <body>
      <p>Hello</p>
    </body>
  </html>`);
});

app.post("/", (req, res) => {
  const { userID } = qs.parse(req.get("X-Goog-Channel-Token"));
  const expirationTime = req.get("X-Goog-Channel-Expiration");

  console.log(
    `Received a notification for user ${userID}. Webhook will expire on ${expirationTime}`
  );

  ASQ()
    .val(userID)
    .seq(getUserDetails)
    .val(userDetails => ({ userID, timeZone: userDetails.calendar.timeZone }))
    .seq(({ userID, timeZone }) => {
      return ASQ().seq(
        () =>
          getAndStoreEvents({
            userID,
            timeMin: getStartOfThisWeek(timeZone)
          }),
        () =>
          aggregateEventsForWeek({
            userID,
            week: getStartOfThisWeek(timeZone)
          })
      );
    })
    .val(() => res.status(200).send("OK"))
    .or(err => {
      console.error(
        "Received a webhook event but failed to fetch new events or aggregate data for this week",
        err
      );
      res.status(500).send("Error");
    });
});

module.exports = app;
