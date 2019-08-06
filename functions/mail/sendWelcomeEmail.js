const ASQ = require("asynquence-contrib");
const { getUsername, getUserEmail } = require("../utils");
const sendEmail = require("./sendEmail");

const WELCOME_EMAIL_TEMPLATE_ID = "d-374eb05461db444ab835c4736a0e563a";

const SUBJECT = "Welcome to Deepwork Today";

module.exports = function sendWelcomeEmail(user) {
  const userName = getUsername(user);
  const userEmail = getUserEmail(user);

  const dataForEmail = {
    name: userName
  };

  return ASQ()
    .promise(
      sendEmail({
        to: userEmail,
        subject: SUBJECT,
        templateId: WELCOME_EMAIL_TEMPLATE_ID,
        dynamic_template_data: dataForEmail
      })
    )
    .val(() => console.log(`Sent welcome email to ${userEmail}`));
};
