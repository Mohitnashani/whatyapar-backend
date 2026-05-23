const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // If no email configuration is provided, mock the email (fallback behavior for local testing)
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('\n⚠️  WARNING: No EMAIL_USER or EMAIL_PASS environment variables found.');
    console.warn('⚠️  Email will not actually be sent. Mocking email delivery to console instead:\n');
    console.log(`======================================================`);
    console.log(`✉️  MOCK EMAIL TO: ${options.to}`);
    console.log(`📝 SUBJECT: ${options.subject}`);
    console.log(`------------------------------------------------------`);
    console.log(`${options.text || 'Check HTML content.'}`);
    console.log(`======================================================\n`);
    return;
  }

  // Create transporter using environment variables. 
  // By default, this connects well with Gmail if you use an App Password.
  // It can also work with SendGrid, Resend, etc.
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Whatyapar Support" <${process.env.EMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
