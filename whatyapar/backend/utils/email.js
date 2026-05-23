const nodemailer = require('nodemailer');
const dns = require('dns');
// Force Node.js to use IPv4 instead of IPv6. This is the ultimate fix for ENETUNREACH on Google's SMTP.
dns.setDefaultResultOrder('ipv4first');

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
    // Fix for ENETUNREACH IPv6 issues on certain networks
    tls: {
      rejectUnauthorized: false
    },
    // Force Node to resolve to IPv4 instead of IPv6
    // (Resolves "connect ENETUNREACH 2607:..." error)
    family: 4 
  });

  const mailOptions = {
    from: `"Whatyapar Support" <${process.env.EMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email successfully sent to ${options.to} [MessageID: ${info.messageId}]`);
  } catch (error) {
    console.error('\n❌ NODEMAILER SMTP ERROR:');
    console.error('If you are seeing an authentication error, ensure your Gmail App Password has NO SPACES.');
    console.error(`Attempted to use user: ${process.env.EMAIL_USER}`);
    console.error(error.message);
    console.error('------------------------------------------------------\n');
    throw error; // Re-throw so the auth route catches it and alerts the user
  }
};

module.exports = sendEmail;
