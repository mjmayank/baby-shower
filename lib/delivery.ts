// Email delivery of the generated caricature: one email to the guest and a
// separate copy to the organizer, labeled with the guest's name.

import nodemailer from "nodemailer";

function smtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function transporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
  });
}

const EMAIL_BODY = (guestName: string) =>
  `Ahoy ${guestName}! 🌊\n\n` +
  `Here's your baby caricature from Mayank & Cayley's Baby Shower. ` +
  `Thanks for celebrating with us!\n\n🐳🐙🐠`;

async function sendEmail(to: string, guestName: string, image: Buffer, subject: string) {
  await transporter().sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text: EMAIL_BODY(guestName),
    attachments: [
      {
        filename: `${guestName.replace(/[^a-z0-9 _-]/gi, "").trim().replace(/\s+/g, "-").toLowerCase()}-baby-caricature.png`,
        content: image,
        contentType: "image/png",
      },
    ],
  });
}

/**
 * Email the image to the guest and always send the organizer a copy with the
 * guest's name in the subject. Returns human-readable problems (empty = success).
 */
export async function deliver(opts: {
  guestName: string;
  email: string;
  image: Buffer;
}): Promise<string[]> {
  const problems: string[] = [];
  const subject = `🐳 ${opts.guestName}'s baby caricature — Mayank & Cayley's Baby Shower`;

  if (!smtpConfigured()) {
    return ["SMTP is not configured (set SMTP_HOST/SMTP_USER/SMTP_PASS) — no emails sent"];
  }

  try {
    await sendEmail(opts.email, opts.guestName, opts.image, subject);
  } catch (err) {
    problems.push(`Email to ${opts.email} failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  const organizer = process.env.ORGANIZER_EMAIL;
  if (!organizer) {
    problems.push("ORGANIZER_EMAIL not set — no organizer copy sent");
  } else if (organizer.toLowerCase() !== opts.email.toLowerCase()) {
    try {
      await sendEmail(organizer, opts.guestName, opts.image, subject);
    } catch (err) {
      problems.push(`Organizer copy to ${organizer} failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return problems;
}
