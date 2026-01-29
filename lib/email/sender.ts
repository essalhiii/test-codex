import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import { buildHtml, buildSubject, buildText, EmailPayload } from "@/lib/email/templates";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const MAX_RETRIES = 3;

export async function sendWorkflowEmail(
  to: string,
  cc: string | undefined,
  payload: EmailPayload
) {
  let attempt = 0;
  let lastError: unknown = null;
  while (attempt < MAX_RETRIES) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        cc,
        subject: buildSubject(payload.reference),
        html: buildHtml(payload),
        text: buildText(payload)
      });
      await prisma.emailLog.create({
        data: {
          recipient: to,
          subject: buildSubject(payload.reference),
          status: "SENT",
          payloadJson: JSON.stringify(payload)
        }
      });
      return;
    } catch (error) {
      lastError = error;
      attempt += 1;
      await prisma.emailLog.create({
        data: {
          recipient: to,
          subject: buildSubject(payload.reference),
          status: "FAILED",
          payloadJson: JSON.stringify({ ...payload, error: String(error) })
        }
      });
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
  throw lastError;
}
