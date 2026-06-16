import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM = process.env.EMAIL_FROM ?? "Cult Machine <onboarding@resend.dev>";
const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

/**
 * If EMAIL_TEST_OVERRIDE is set in .env.local, ALL emails are sent to that
 * address instead of the real recipient. Use this while Resend domain is
 * not yet verified (resend.dev only allows sending to your own account email).
 */
function resolveRecipient(original: string): string {
  return process.env.EMAIL_TEST_OVERRIDE ?? original;
}

function testBanner(original: string): string {
  if (!process.env.EMAIL_TEST_OVERRIDE) return "";
  return `<div style="background:#F5E000;color:#000;padding:10px 16px;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin-bottom:24px;">
    🧪 TEST MODE — Intended for: ${original}
  </div>`;
}

// ─── Shared layout helpers ─────────────────────────────────────────────────────

function emailWrapper(content: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:monospace,sans-serif;color:#ffffff;">
  <div style="max-width:560px;margin:0 auto;padding:48px 32px;">
    <div style="border-bottom:4px solid #F5E000;padding-bottom:24px;margin-bottom:40px;">
      <span style="color:#F5E000;font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:-1px;">★ CULT MACHINE</span>
    </div>
    ${content}
    <div style="border-top:2px solid rgba(255,255,255,0.05);padding-top:32px;margin-top:48px;">
      <p style="color:rgba(255,255,255,0.15);font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin:0;">
        CULT MACHINE // DO NOT REPLY TO THIS EMAIL
      </p>
    </div>
  </div>
</body>
</html>`;
}

function heading(text: string) {
  return `<h1 style="color:#ffffff;font-size:36px;font-weight:900;text-transform:uppercase;letter-spacing:-1px;margin:0 0 8px 0;line-height:1.1;">${text}</h1>`;
}

function subheading(text: string) {
  return `<p style="color:rgba(255,255,255,0.4);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:3px;margin:0 0 32px 0;">${text}</p>`;
}

function paragraph(text: string) {
  return `<p style="color:rgba(255,255,255,0.7);font-size:14px;font-weight:600;margin:0 0 24px 0;line-height:1.6;">${text}</p>`;
}

function ctaButton(text: string, url: string, color = "#F5E000", textColor = "#000000") {
  return `<a href="${url}" style="display:inline-block;background:${color};color:${textColor};font-weight:900;font-size:12px;text-transform:uppercase;letter-spacing:3px;padding:16px 32px;text-decoration:none;margin:0 0 32px 0;">${text}</a>`;
}

function infoBox(label: string, value: string) {
  return `<div style="background:#111;border:4px solid #F5E000;padding:20px 28px;margin:0 0 24px 0;">
    <p style="color:rgba(255,255,255,0.4);font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:4px;margin:0 0 6px 0;">${label}</p>
    <p style="color:#F5E000;font-size:22px;font-weight:900;letter-spacing:2px;margin:0;">${value}</p>
  </div>`;
}

function warningBox(text: string) {
  return `<div style="background:rgba(255,0,0,0.08);border:2px solid rgba(255,0,0,0.3);padding:16px 20px;margin:0 0 24px 0;">
    <p style="color:rgba(255,80,80,0.9);font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin:0;">⚠ ${text}</p>
  </div>`;
}

// ─── 1. Email Verification ─────────────────────────────────────────────────────

export async function sendVerificationEmail(email: string, code: string) {
  const html = emailWrapper(`
    ${testBanner(email)}
    ${heading("Verify<br/>Your Email")}
    ${subheading("Account Verification — Enter This Code")}
    ${paragraph("Thanks for joining Cult Machine. Enter this 6-digit code to activate your account:")}
    <div style="background:#111;border:4px solid #F5E000;padding:32px;margin:0 0 32px 0;text-align:center;">
      <p style="color:rgba(255,255,255,0.3);font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:4px;margin:0 0 16px 0;">VERIFICATION CODE</p>
      <p style="color:#F5E000;font-size:52px;font-weight:900;letter-spacing:16px;margin:0;font-family:monospace;">${code}</p>
    </div>
    ${warningBox("This code expires in 24 hours. If you didn't create this account, ignore this email.")}
  `);

  try {
    const resend = getResend();
    await resend.emails.send({
      from: FROM,
      to: resolveRecipient(email),
      subject: `${code} — Your Cult Machine verification code`,
      html,
    });
  } catch (err) {
    console.error("[EMAIL] sendVerificationEmail failed:", err);
  }
}

// ─── 2. Industry Welcome ───────────────────────────────────────────────────────

export async function sendIndustryWelcomeEmail(email: string, name: string) {
  const html = emailWrapper(`
    ${testBanner(email)}
    ${heading("Welcome<br/>to Cult Machine")}
    ${subheading(`Industry Account — ${name}`)}
    ${paragraph("Your agency account has been created and is currently under review by our team. We'll notify you once your account is approved and you can start submitting tracks on behalf of your artists.")}
    ${infoBox("STATUS", "PENDING VERIFICATION")}
    ${paragraph("If you have any questions, reach out to us at <a href='mailto:support@cultmachine.com' style='color:#F5E000;'>support@cultmachine.com</a>")}
  `);

  try {
    const resend = getResend();
    await resend.emails.send({
      from: FROM,
      to: resolveRecipient(email),
      subject: "Your Cult Machine industry account is under review",
      html,
    });
  } catch (err) {
    console.error("[EMAIL] sendIndustryWelcomeEmail failed:", err);
  }
}

// ─── 3. Submission Confirmation ────────────────────────────────────────────────

export async function sendSubmissionConfirmationEmail(
  email: string,
  trackTitle: string,
  artistName: string
) {
  const html = emailWrapper(`
    ${testBanner(email)}
    ${heading("Submission<br/>Received.")}
    ${subheading("Editorial Queue — Track Received")}
    ${infoBox("TRACK", trackTitle)}
    ${infoBox("ARTIST", artistName)}
    ${paragraph("Your submission is now in our editorial queue. Our curators will review it carefully. The process usually takes between 3 to 7 days.")}
    ${paragraph("You'll receive a notification when there's an update on your track's status.")}
  `);

  try {
    const resend = getResend();
    await resend.emails.send({
      from: FROM,
      to: resolveRecipient(email),
      subject: `Submission received — ${trackTitle}`,
      html,
    });
  } catch (err) {
    console.error("[EMAIL] sendSubmissionConfirmationEmail failed:", err);
  }
}

// ─── 4. Submission Rejected ────────────────────────────────────────────────────

export async function sendSubmissionRejectedEmail(
  email: string,
  trackTitle: string,
  notes?: string | null
) {
  const html = emailWrapper(`
    ${testBanner(email)}
    ${heading("Editorial<br/>Decision.")}
    ${subheading("Track Not Selected")}
    ${infoBox("TRACK", trackTitle)}
    ${paragraph("Sorry! 🙁")}
    ${paragraph("After careful review, our editorial team has decided not to move forward with this track at this time. This doesn't mean the song isn't good! Editorial fit often comes down to timing and positioning.")}
    ${notes ? `<div style="background:#111;border-left:4px solid rgba(255,255,255,0.15);padding:20px 24px;margin:0 0 24px 0;"><p style="color:rgba(255,255,255,0.4);font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:3px;margin:0 0 8px 0;">CURATOR NOTES</p><p style="color:rgba(255,255,255,0.7);font-size:13px;font-weight:600;line-height:1.6;margin:0;font-style:italic;">"${notes}"</p></div>` : ""}
    ${paragraph("We'd still love to hear future releases, so please don't hesitate to submit more music for consideration 🙂 We appreciate you for being part of Cult Machine.")}
    ${ctaButton("SUBMIT ANOTHER TRACK →", `${BASE_URL}/en/portal/submit`)}
  `);

  try {
    const resend = getResend();
    await resend.emails.send({
      from: FROM,
      to: resolveRecipient(email),
      subject: `Editorial update — ${trackTitle}`,
      html,
    });
  } catch (err) {
    console.error("[EMAIL] sendSubmissionRejectedEmail failed:", err);
  }
}

// ─── 5. Submission Accepted ────────────────────────────────────────────────────

export async function sendSubmissionAcceptedEmail(
  email: string,
  trackTitle: string,
  placement?: string | null
) {
  const html = emailWrapper(`
    ${testBanner(email)}
    ${heading("Your Track<br/>Was Selected!")}
    ${subheading("✓ Accepted by Editorial")}
    ${infoBox("TRACK", trackTitle)}
    ${placement ? infoBox("PLACEMENT", placement) : ""}
    ${paragraph("Big news — your track has been selected by our editorial team for placement. We're now in the final stages of scheduling and publication.")}
    ${paragraph("You'll receive another notification with a direct link once it's live. Stay tuned.")}
  `);

  try {
    const resend = getResend();
    await resend.emails.send({
      from: FROM,
      to: resolveRecipient(email),
      subject: `🎉 Your track was selected — ${trackTitle}`,
      html,
    });
  } catch (err) {
    console.error("[EMAIL] sendSubmissionAcceptedEmail failed:", err);
  }
}

// ─── 6. Submission Published ───────────────────────────────────────────────────

export async function sendSubmissionPublishedEmail(
  email: string,
  trackTitle: string,
  publicationUrl: string
) {
  const html = emailWrapper(`
    ${testBanner(email)}
    ${heading("Your Track<br/>Is Live!")}
    ${subheading("★ Published on Cult Machine")}
    ${infoBox("TRACK", trackTitle)}
    ${paragraph("Your track is now officially published. Share it with your fans and let the world hear it. Click the button below to see your feature.")}
    ${ctaButton("VIEW YOUR FEATURE →", publicationUrl, "#00CC66", "#000000")}
    ${paragraph("Thank you for being part of the Cult Machine editorial family.")}
  `);

  try {
    const resend = getResend();
    await resend.emails.send({
      from: FROM,
      to: resolveRecipient(email),
      subject: `🎵 Your track is now live — ${trackTitle}`,
      html,
    });
  } catch (err) {
    console.error("[EMAIL] sendSubmissionPublishedEmail failed:", err);
  }
}

// ─── 7. Password Changed ───────────────────────────────────────────────────────

export async function sendPasswordChangedEmail(email: string, name: string) {
  const html = emailWrapper(`
    ${testBanner(email)}
    ${heading("Password<br/>Updated.")}
    ${subheading(`Security Alert — ${name}`)}
    ${paragraph("Your Cult Machine account password was recently changed. If this was you, no action is needed.")}
    ${warningBox("If you did NOT request this change, contact us immediately at support@cultmachine.com and change your password right away.")}
    ${ctaButton("GO TO LOGIN →", `${BASE_URL}/en/login`)}
  `);

  try {
    const resend = getResend();
    await resend.emails.send({
      from: FROM,
      to: resolveRecipient(email),
      subject: "Your Cult Machine password was changed",
      html,
    });
  } catch (err) {
    console.error("[EMAIL] sendPasswordChangedEmail failed:", err);
  }
}

// ─── 8. Credit Purchase Confirmation ──────────────────────────────────────────

export async function sendCreditPurchaseEmail(
  email: string,
  name: string,
  credits: number,
  amountCents: number
) {
  const amountUsd = (amountCents / 100).toFixed(2);

  const html = emailWrapper(`
    ${testBanner(email)}
    ${heading("Credits<br/>Purchased.")}
    ${subheading(`Receipt — ${name}`)}
    ${infoBox("CREDITS ADDED", `+${credits} CREDITS`)}
    ${infoBox("AMOUNT CHARGED", `$${amountUsd} USD`)}
    ${paragraph("Your credits have been added to your account and are ready to use for your next submission. Thank you for supporting Cult Machine.")}
    ${ctaButton("SUBMIT A TRACK →", `${BASE_URL}/en/portal/submit`)}
  `);

  try {
    const resend = getResend();
    await resend.emails.send({
      from: FROM,
      to: resolveRecipient(email),
      subject: `Receipt — ${credits} Cult Machine credits`,
      html,
    });
  } catch (err) {
    console.error("[EMAIL] sendCreditPurchaseEmail failed:", err);
  }
}
