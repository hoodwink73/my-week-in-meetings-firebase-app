const sendEmail = require("./sendEmail");
const sendWelcomeEmail = require("./sendWelcomeEmail");
const sendDailyEmail = require("./sendDailyEmail");
const scheduleDailyMail = require("./scheduleDailyMail");

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendDailyEmail,
  scheduleDailyMail
};
