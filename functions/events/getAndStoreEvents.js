const ASQ = require("asynquence-contrib");
const { omit } = require("lodash");
const concatMap = require("concat-map");

const listEvents = require("./listEvents");
const enrichEventData = require("./enrichEventData");

const {
  getStartOfLastWeek,
  getEndOfThisWeek,
  getOAuthClientForUser
} = require("../utils");

module.exports = ({
  timeMin = getStartOfLastWeek(),
  timeMax = getEndOfThisWeek(),
  userID
}) => {
  const db = global.firestoreInstance;
  return ASQ()
    .val({ userID })
    .seq(getOAuthClientForUser)
    .seq(oAuthClient => {
      return listEvents({ oAuthClient, timeMin, timeMax });
    })
    .then((done, listEventsResponse) => {
      let calendarDataToStore = null;
      const eventsDataToStore = concatMap(
        listEventsResponse,
        data => data.items
      );

      if (listEventsResponse.length > 0) {
        calendarDataToStore = omit(listEventsResponse[0], ["items"]);
      }

      // will be used to determine what week
      // is this event part of
      const calendarTimeZone = calendarDataToStore.timeZone;

      console.log(
        `${
          eventsDataToStore.length
        } events has been fetched for user - ${userID}`
      );

      const userDocRef = db.collection("users").doc(userID);
      const eventsCollectionRef = db.collection(`users/${userID}/events`);

      const batch = db.batch();

      if (calendarDataToStore) {
        batch.set(userDocRef, { calendar: calendarDataToStore });
      }

      console.log("calendarTimezone", calendarTimeZone);

      eventsDataToStore.forEach(event => {
        var eventDocRef = eventsCollectionRef.doc(event.id);
        batch.set(eventDocRef, enrichEventData(event, calendarTimeZone));
      });

      ASQ()
        .promise(batch.commit())
        .pipe(done);
    })
    .or(err => console.error(err));
};
