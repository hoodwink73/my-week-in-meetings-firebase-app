const admin = require("firebase-admin");
const ASQ = require("asynquence-contrib");
const moment = require("moment-timezone");

const getUserDetails = require("../authentication/getUserDetails");
const { getEventsForUserForWeek } = require("../events");
const {
  doesEventHappensThisDay,
  qualifyEvent,
  getStartOfWeek
} = require("../utils");
const aggregateDailyEmailStats = require("./aggregateDailyEmailStats");
const sendEmail = require("./sendEmail");

const DAILY_EMAIL_TEMPLATE = "d-2af8136407fc41cbbf6fd04bd8bc6204";
const SUBJECT = "Here's how your day looks like today";

const updateFirestoreAboutSentEmail = async ({ userID }) => {
  const db = global.firestoreInstance;

  await db
    .doc(`sent_emails/${userID}`)
    .set({ lastSentAt: admin.firestore.Timestamp.now() });
};

module.exports = function sendDailyEmail({ userID }) {
  return ASQ()
    .seq(() => getUserDetails(userID))
    .seq(userDetails => {
      const userTimezone = userDetails.calendar.timeZone;
      const userEmail = userDetails.calendar.summary;
      const userFirstName = userDetails.userDetails.firstName;

      if (!userEmail) {
        console.error(
          `Email could not be found in  calendar details for user ${userEmail}`
        );

        return;
      }
      return ASQ()
        .seq(() =>
          getEventsForUserForWeek({
            userID,
            week: getStartOfWeek(0, userTimezone)
          })
        )
        .val(eventsForThisWeek => {
          const eventsForToday = eventsForThisWeek.filter(
            event =>
              doesEventHappensThisDay({
                event,
                date: moment.tz(userTimezone),
                timezone: userTimezone
              }) && qualifyEvent(event)
          );

          // if somebody is working on Sunday, we will not
          // be able to get the events on Monday becuase of the
          // way, how we assign an event to a week
          const eventsForYesterday = eventsForThisWeek.filter(
            event =>
              doesEventHappensThisDay({
                event,
                date: moment.tz(userTimezone).subtract(1, "day"),
                timezone: userTimezone
              }) && qualifyEvent(event)
          );
          return [eventsForYesterday, eventsForToday];
        })
        .val(eventsForTodayAndYesterday =>
          eventsForTodayAndYesterday.map(aggregateDailyEmailStats)
        )
        .seq(([dailyEmailDataYesterday, dailyEmailDataToday]) => {
          return ASQ()
            .val(() => ({ userID }))
            .promise(() =>
              sendEmail({
                to: userEmail,
                subject: SUBJECT,
                templateId: DAILY_EMAIL_TEMPLATE,
                dynamic_template_data: {
                  name: userFirstName,
                  today: dailyEmailDataToday,
                  yesterday: dailyEmailDataYesterday
                }
              })
            )
            .val(() => ({ userID }))
            .promise(updateFirestoreAboutSentEmail)
            .val(() => {
              console.log(`Daily email was sent to ${userID}`);
            });
        });
    });
};
