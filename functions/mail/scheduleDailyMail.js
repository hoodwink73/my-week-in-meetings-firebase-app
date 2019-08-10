const admin = require("firebase-admin");
const { checkTime } = require("../utils");
const { DAILY_EMAIL_SEND_TIME } = require("../constants");
const moment = require("moment-timezone");

async function getUserTimezones() {
  const db = global.firestoreInstance;
  var usersAndTheirTimezones = [];
  const usersCollectionRef = db.collection("users");

  var usersCollectionSnapshot = await usersCollectionRef.get();

  usersCollectionSnapshot.forEach(queryDocumentSnapshot => {
    const user = queryDocumentSnapshot.data();
    usersAndTheirTimezones.push({
      userID: queryDocumentSnapshot.id,
      timezone: user.calendar.timeZone
    });
  });

  return usersAndTheirTimezones;
}

async function getLastSentEmailTimeForUsers() {
  const db = global.firestoreInstance;

  const lastSentEmailCollectionRef = db.collection("sent_emails");

  var lastSentEmailsQuerySnapshot = await lastSentEmailCollectionRef.get();

  var lastSentEmails = {};
  if (lastSentEmailsQuerySnapshot.empty) {
    return lastSentEmails;
  } else {
    lastSentEmailsQuerySnapshot.forEach(documentSnapshot => {
      lastSentEmails[documentSnapshot.id] = documentSnapshot.data().lastSentAt;
    });
  }

  return lastSentEmails;
}

module.exports = async function scheduleDailyMail() {
  const userTimezones = await getUserTimezones();
  const lastSentEmailTimes = await getLastSentEmailTimeForUsers();

  const qualifiedUsersForSendingEmail = userTimezones.filter(
    ({ userID, timezone }) => {
      var isItTheRightTime = checkTime({
        time: DAILY_EMAIL_SEND_TIME,
        timezone
      });

      var lastMailSentAt = lastSentEmailTimes[userID];

      var hasEmailAlreadyBeenSentToday = lastMailSentAt
        ? moment(lastMailSentAt.toMillis())
            .tz(timezone)
            .isSame(moment.tz(timezone), "day")
        : false;

      return isItTheRightTime && !hasEmailAlreadyBeenSentToday;
    }
  );

  await Promise.all(
    qualifiedUsersForSendingEmail.map(async ({ userID }) => {
      const db = global.firestoreInstance;

      await db
        .doc(`scheduled_emails/${userID}`)
        .set({ lastScheduledAt: admin.firestore.Timestamp.now() });

      console.log(`Daily emails were scheduled for user ${userID}`);
    })
  );
};
