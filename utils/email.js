import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  // 1) Create a transporter
  // Looking to send emails in production? Check out our Email API/SMTP product!
  // console.log(process.env.EMAIL_PORT);
  // const transport = nodemailer.createTransport({
  //   host: process.env.EMAIL_HOST,
  //   port: process.env.EMAIL_PORT,
  //   auth: {
  //     user: process.env.EMAIL_USER,
  //     pass: process.env.EMAIL_PASSWORD,
  //   },
  // });
  // Looking to send emails in production? Check out our Email API/SMTP product!
  const transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: "2525",
    auth: {
      user: "f2e844d789168c",
      pass: "1ea1001c3e31dc",
    },
  });

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
