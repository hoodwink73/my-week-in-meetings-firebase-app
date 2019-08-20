const { google } = require("googleapis");
const ASQ = require("asynquence-contrib");

function _listEvents(auth, { timeMin, timeMax, nextPageToken = null }) {
  const calendar = google.calendar({ version: "v3", auth });

  return ASQ().promise(
    calendar.events.list({
      calendarId: "primary",
      timeMin: new Date(timeMin).toISOString(),
      timeMax: new Date(timeMax).toISOString(),
      maxResults: 50,
      singleEvents: true,
      orderBy: "startTime",
      pageToken: nextPageToken
    })
  );
}

module.exports = function listEvents(
  { oAuthClient, timeMin, timeMax, nextPageToken = null },
  priorData = []
) {
  return ASQ().then(done => {
    _listEvents(oAuthClient, {
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      nextPageToken
    })
      .then((_, res) => {
        if (res.data.nextPageToken) {
          listEvents(
            {
              oAuthClient,
              timeMin,
              timeMax,
              nextPageToken: res.data.nextPageToken
            },
            [...priorData, res.data]
          ).pipe(done);
        } else {
          done([...priorData, res.data], {
            nextSyncToken: res.data.nextSyncToken
          });
        }
      })
      .or(err => {
        done.fail(err);
      });
  });
};
