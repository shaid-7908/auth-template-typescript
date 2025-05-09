import nodemailer from "nodemailer";
import envConfig from "../config/env.config";

export async function sendVerificationEmail(
  to: string,
  link: string
): Promise<void> {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: envConfig.EMAIL_USER,
      pass: envConfig.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `<${envConfig.EMAIL_USER}>`,
    to,
    subject: "Verify Your Email",
    html: `<p>Click the link to verify your email:</p><a href="${link}">${link}</a>`,
  });
}
