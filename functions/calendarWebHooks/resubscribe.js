const ASQ = require("asynquence-contrib");
const uuidv4 = require("uuid/v4");
const { google } = require("googleapis");
const moment = require("moment");

const {
  CALENDAR_EVENTS_WEBHOOK_SECRET,
  USER_EVENTS_WEBHOOK_URL
} = require("../constants");

const subscribeUserToCalendarEvents = require("./subscribeUserToCalendarEvents");
const unsubscribeUserToCalendarEvents = require("./unsubscribeUserToCalendarEvents");

const { getOAuthClientForUser } = require("../utils");

const doesUserNeedWebhookResubscription = userDoc => {
  const userID = userDoc.id;
  const user = userDoc.data();
  let webhookExipration = user.webhookDetails && user.webhookDetails.expiresOn;

  if (!user.webhookDetails) {
    console.error(
      `User with google id ${userID} do not have their webhook details`
    );
    return false;
  }

  if (webhookExipration) {
    webhookExipration = moment(webhookExipration, "x");
  }

  if (webhookExipration.diff(moment(), "hours") < 24) {
    return true;
  } else {
    return false;
  }
};

const getUsersWithExpiredWebhooks = async () => {
  const db = global.firestoreInstance;
  const usersRef = await db.collection("users");

  const allUsersSnapshot = await usersRef.get();

  //  only users whose webhook needs to be resubscribed
  let webhookDataForUsers = [];

  allUsersSnapshot.forEach(userDoc => {
    const userID = userDoc.id;
    const user = userDoc.data();

    if (doesUserNeedWebhookResubscription(userDoc)) {
      webhookDataForUsers.push(userID);
    }
  });

  return webhookDataForUsers;
};

// the calendar webhooks comes with an expiration time
// there is no way to renew the subscription but the resubscribe again
// with a new channel ID
// https://developers.google.com/calendar/v3/push#renewing-notification-channels
// this is a function which runs periodically (planning everyday)
// checks for user is whose webhook is about to expire
// creates new subscriptoion for those user
module.exports = async function resubscribeToCalendarEvents() {
  console.log(
    "Running scheduled function to check all user's webhook expiration health"
  );

  const usersWithExpiredWebhooks = await getUsersWithExpiredWebhooks();

  const userWebhookResubscriptionTaskQueue = usersWithExpiredWebhooks.map(
    userID =>
      ASQ().seq(
        unsubscribeUserToCalendarEvents({ userID }),
        subscribeUserToCalendarEvents({ userID })
      )
  );

  console.log(
    `We found ${
      usersWithExpiredWebhooks.length
    } who needs webhook resubscription`
  );

  return ASQ()
    .any(...userWebhookResubscriptionTaskQueue)
    .toPromise();
};
