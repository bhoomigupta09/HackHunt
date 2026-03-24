const nodemailer = require("nodemailer");

const getMailConfig = () => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpSecure = String(process.env.SMTP_SECURE || "").toLowerCase() === "true";
  const smtpUser =
    process.env.SMTP_USER || process.env.EMAIL_USER || process.env.EMAIL;
  const smtpPass =
    process.env.SMTP_PASS || process.env.EMAIL_PASS || process.env.APP_PASSWORD || process.env.PASSWORD;
  const mailFrom =
    process.env.MAIL_FROM || process.env.EMAIL_FROM || smtpUser;

  if (!smtpUser || !smtpPass) {
    return null;
  }

  if (smtpHost) {
    return {
      transport: {
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      },
      from: mailFrom
    };
  }

  return {
    transport: {
      service: "Gmail",
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    },
    from: mailFrom
  };
};

const sendEmail = async (options) => {
  try {
    const mailConfig = getMailConfig();

    if (!mailConfig) {
      console.warn("Email credentials are not configured. Skipping email send.");
      console.warn(
        "Set SMTP_USER/SMTP_PASS (or EMAIL/APP_PASSWORD) in server/.env to enable OTP emails."
      );
      console.warn(`OTP fallback for ${options.email}: ${options.message}`);
      return {
        skipped: true,
        reason: "missing_email_credentials"
      };
    }

    const transporter = nodemailer.createTransport(mailConfig.transport);

    const mailOptions = {
      from: `"HackHunt Support" <${mailConfig.from}>`,
      to: options.email,
      subject: options.subject,
      text: options.message
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent successfully to ${options.email}`);

    return {
      skipped: false
    };
  } catch (error) {
    console.error("Nodemailer error:", error.message);
    throw error;
  }
};

module.exports = sendEmail;
