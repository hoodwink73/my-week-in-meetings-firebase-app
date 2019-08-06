const sgMail = require("@sendgrid/mail");
const functions = require("firebase-functions");

const SENDGRID_API_KEY = functions.config().sendgrid.apikey;
sgMail.setApiKey(SENDGRID_API_KEY);

const FROM_ADDRESS = "hello@deepwork.today";

module.exports = async function sendEmail({
  to,
  subject,
  message,
  templateId,
  dynamic_template_data
}) {
  try {
    const msg = {
      to,
      from: FROM_ADDRESS,
      subject: subject,
      ...(templateId
        ? {
            templateId,
            dynamic_template_data
          }
        : {
            message
          })
    };

    sgMail.send(msg);
  } catch (e) {
    console.error(`Failed to send mail to ${to}`);
  }
};
