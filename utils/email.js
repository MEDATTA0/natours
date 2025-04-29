import nodemailer from "nodemailer";
import pug from "pug";
import { htmlToText } from "html-to-text";
// import { MailtrapClient, MailtrapTransport } from "mailtrap";

export class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = `Ibrahim Maâzou <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === "production") {
      // Mailjet
      return nodemailer.createTransport({
        host: process.env.MAILJET_HOST,
        port: process.env.MAILJET_PORT,
        auth: {
          user: process.env.MAILJET_API_KEY, // API Key is the username
          pass: process.env.MAILJET_SECRET_KEY, // Secret Key is the password
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  /**
   *
   * @param {String} template
   * @param {String} subject
   */
  async send(template, subject) {
    // Send the actual email
    const html = pug.renderFile(
      `${process.cwd()}/views/emails/${template}.pug`,
      { firstName: this.firstName, url: this.url, subject }
    );

    // 2) Define the email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send("welcome", "Welcome to the Natours Family!");
  }

  async sendPasswordReset() {
    await this.send(
      "passwordReset",
      "Your password reset token(valid for only 10 minutes)"
    );
  }
}
