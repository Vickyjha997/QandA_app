const { Resend } = require('resend');
const dotenv = require('dotenv');

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html}) => {
  try {
    const response = await resend.emails.send({
      from: 'Student-Tutor Platform <no-reply@oyo.plus>', // ✅ Use verified domain
      to,
      subject,
      html,
    });

    console.log('✅ Email sent successfully:', response);
    return { success: true, messageId: response.id };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail };
