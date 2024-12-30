import nodemailer from "nodemailer";
import { MailtrapClient, MailtrapTransport } from "mailtrap";

const sendEmail = async (options) => {
  // 1) Create a transporter
  // // Looking to send emails in production? Check out our Email API/SMTP product!
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // const transport = nodemailer.createTransport(
  //   MailtrapTransport({ token: process.env.SMTP_TOKEN })
  // );

  // 2) Define the email options
  const mailOptions = {
    from: "Ibrahim Maazou <hello@ibrahim.tw>",
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  // 3) Actually send the email
  await transport.sendMail(mailOptions);
};

export default sendEmail;
