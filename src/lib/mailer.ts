import nodemailer from "nodemailer";

const port = Number(process.env.SMTP_PORT ?? 465);

export const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port,
  secure: port === 465, // true для 465 (SSL), false для 587 (STARTTLS)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendMail(opts: { to: string; subject: string; html: string; text?: string }) {
  try {
    await mailer.sendMail({
      from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
      ...opts,
    });
    return { success: true as const };
  } catch (error) {
    // почта не должна ронять заявку — только логируем
    console.error("sendMail error:", error);
    return { success: false as const };
  }
}