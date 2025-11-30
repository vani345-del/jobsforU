import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

const { SENDGRID_API_KEY, FROM_EMAIL } = process.env;

// Set the API Key.
if (!SENDGRID_API_KEY) {
    console.error("CRITICAL ERROR: SENDGRID_API_KEY is not defined in the environment.");
}
sgMail.setApiKey(SENDGRID_API_KEY || ''); 

/**
 * Sends an email using the SendGrid API.
 * @param {string} to - Recipient email address.
 * @param {string} subject - Subject of the email.
 * @param {string} text - Plain text body of the email.
 * @param {string} html - HTML body of the email.
 */
const sendEmail = async ({ to, subject, text, html }) => {
  if (!FROM_EMAIL) {
    console.error("CRITICAL ERROR: FROM_EMAIL is not defined. Email sending aborted.");
    throw new Error('Email configuration error (Missing FROM_EMAIL).');
  }

  try {
    const msg = {
      to,
      from: FROM_EMAIL, // Must be your verified SendGrid sender
      subject,
      text,
      html,
    };
    await sgMail.send(msg);
    console.log(`Email successfully sent to ${to}`);
  } catch (error) {
    // This is the error handler catching any failures, including 403 Forbidden
    console.error(`SendGrid Email Error: ${error.message}`);
    throw new Error('Failed to send email due to SendGrid authentication failure (Check API Key and FROM_EMAIL verification).');
  }
};

export default sendEmail;