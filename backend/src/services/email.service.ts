import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS = 'Homestay Dorm <noreply@homestaydorm.asia>';

const BRAND       = '#264893';
const BG          = '#f0f4ff';
const CARD_BG     = '#ffffff';
const MUTED       = '#8a9bbf';
const LOGO_URL    = 'https://res.cloudinary.com/dqfkmrw8l/image/upload/v1778615827/homestay-dorm/email-logo.png';
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:4200';

// ---------------------------------------------------------------------------
// Shared layout — Big Shoulders Text titles, Afacad body, brand blue palette
// ---------------------------------------------------------------------------
function htmlLayout(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Homestay Dorm</title>
  <link href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Text:wght@700;900&family=Afacad:wght@400;600;700&display=swap" rel="stylesheet"/>
</head>
<body style="margin:0;padding:0;background:${BG};font-family:'Afacad',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:48px 0;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0"
               style="background:${CARD_BG};border-radius:25px;overflow:hidden;
                      box-shadow:0 8px 32px rgba(38,72,147,0.13);">

          <!-- ── Header ── -->
          <tr>
            <td style="background:${BRAND};padding:36px 48px;text-align:center;">
              <img src="${LOGO_URL}" alt="Homestay Dorm Logo"
                   width="72" height="72"
                   style="display:block;margin:0 auto 16px;border-radius:16px;"/>
              <div style="font-family:'Big Shoulders Text',Impact,sans-serif;
                          font-size:30px;font-weight:900;color:#ffffff;
                          letter-spacing:3px;text-transform:uppercase;">
                Homestay Dorm
              </div>
              <div style="color:rgba(255,255,255,0.65);font-family:'Afacad',Arial,sans-serif;
                          font-size:14px;margin-top:4px;letter-spacing:1px;">
                Your Home Away From Home
              </div>
            </td>
          </tr>

          <!-- ── Body ── -->
          <tr>
            <td style="padding:40px 48px;">
              ${body}
            </td>
          </tr>

          <!-- ── Footer ── -->
          <tr>
            <td style="background:#f6f6f6;padding:24px 48px;text-align:center;
                       border-top:1px solid #e5eaf5;">
              <p style="margin:0;color:${MUTED};font-family:'Afacad',Arial,sans-serif;font-size:13px;">
                &copy; ${new Date().getFullYear()} Homestay Dorm &nbsp;&bull;&nbsp;
                This is an automated notification — please do not reply.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Shared detail-row helper
// ---------------------------------------------------------------------------
function detailRow(label: string, value: string, color = BRAND): string {
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #e5eaf5;width:38%;
                 font-family:'Afacad',Arial,sans-serif;font-size:13px;
                 font-weight:700;color:${MUTED};text-transform:uppercase;
                 letter-spacing:0.8px;vertical-align:top;">
        ${label}
      </td>
      <td style="padding:10px 0 10px 16px;border-bottom:1px solid #e5eaf5;
                 font-family:'Afacad',Arial,sans-serif;font-size:16px;
                 font-weight:700;color:${color};vertical-align:top;">
        ${value}
      </td>
    </tr>`;
}

// ---------------------------------------------------------------------------
// CTA Button
// ---------------------------------------------------------------------------
function ctaButton(label: string, href: string): string {
  return `
    <div style="text-align:center;margin-top:36px;">
      <a href="${href}"
         style="display:inline-block;background:${BRAND};color:#ffffff;
                padding:14px 40px;border-radius:25px;
                font-family:'Big Shoulders Text',Impact,sans-serif;
                font-size:20px;font-weight:700;text-decoration:none;
                letter-spacing:1px;">
        ${label}
      </a>
    </div>`;
}

// ---------------------------------------------------------------------------
// Email: Viewing Approved
// ---------------------------------------------------------------------------
export async function sendViewingApprovedEmail(opts: {
  toEmail: string;
  customerName: string;
  scheduledAt: string;
  roomLabel: string;
  branchName: string;
  branchAddress: string;
  resultNote?: string;
}) {
  const dateStr = new Date(opts.scheduledAt).toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long',
    day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const rows =
    detailRow('Date & Time', dateStr) +
    detailRow('Room',        opts.roomLabel) +
    detailRow('Branch',      opts.branchName) +
    detailRow('Address',     opts.branchAddress) +
    (opts.resultNote ? detailRow('Note', opts.resultNote, '#444') : '');

  const body = `
    <h2 style="font-family:'Big Shoulders Text',Impact,sans-serif;
               font-size:30px;font-weight:900;color:${BRAND};
               margin:0 0 6px;letter-spacing:1px;">
      Viewing Confirmed
    </h2>
    <div style="width:48px;height:4px;background:${BRAND};border-radius:4px;margin-bottom:24px;"></div>

    <p style="font-family:'Afacad',Arial,sans-serif;color:#444;
              font-size:17px;line-height:1.65;margin:0 0 28px;">
      Hi <strong>${opts.customerName}</strong>,<br/>
      Your viewing appointment has been <strong style="color:#16a34a;">approved</strong>.
      Here are your appointment details:
    </p>

    <table width="100%" cellpadding="0" cellspacing="0"
           style="border-radius:16px;border:1.5px solid #e5eaf5;overflow:hidden;">
      <tr><td style="padding:0 20px;">${rows}</td></tr>
    </table>

    <p style="font-family:'Afacad',Arial,sans-serif;color:#666;
              font-size:15px;line-height:1.65;margin:28px 0 0;">
      Please arrive on time. Our sales team will be there to show you around.
      If you need to reschedule, please contact us as soon as possible.
    </p>

    ${ctaButton('View My Bookings', `${FRONTEND_URL}/bookings`)}
  `;

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: opts.toEmail,
    subject: `Viewing Approved — ${opts.roomLabel} on ${new Date(opts.scheduledAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`,
    html: htmlLayout(body),
  });
}

// ---------------------------------------------------------------------------
// Email: Viewing Declined / Cancelled
// ---------------------------------------------------------------------------
export async function sendViewingDeclinedEmail(opts: {
  toEmail: string;
  customerName: string;
  scheduledAt: string;
  roomLabel: string;
  branchName: string;
  resultNote?: string;
}) {
  const dateStr = new Date(opts.scheduledAt).toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long',
    day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const rows =
    detailRow('Date & Time', dateStr, '#7f1d1d') +
    detailRow('Room',        opts.roomLabel, '#7f1d1d') +
    detailRow('Branch',      opts.branchName, '#7f1d1d') +
    (opts.resultNote ? detailRow('Reason', opts.resultNote, '#7f1d1d') : '');

  const body = `
    <h2 style="font-family:'Big Shoulders Text',Impact,sans-serif;
               font-size:30px;font-weight:900;color:#b91c1c;
               margin:0 0 6px;letter-spacing:1px;">
      Viewing Cancelled
    </h2>
    <div style="width:48px;height:4px;background:#b91c1c;border-radius:4px;margin-bottom:24px;"></div>

    <p style="font-family:'Afacad',Arial,sans-serif;color:#444;
              font-size:17px;line-height:1.65;margin:0 0 28px;">
      Hi <strong>${opts.customerName}</strong>,<br/>
      We're sorry to inform you that your viewing appointment has been
      <strong style="color:#b91c1c;">cancelled</strong>.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0"
           style="border-radius:16px;border:1.5px solid #fca5a5;
                  background:#fff8f8;overflow:hidden;">
      <tr><td style="padding:0 20px;">${rows}</td></tr>
    </table>

    <p style="font-family:'Afacad',Arial,sans-serif;color:#666;
              font-size:15px;line-height:1.65;margin:28px 0 0;">
      You can browse our available rooms and submit a new request at any time.
      We apologize for any inconvenience caused.
    </p>

    ${ctaButton('Browse Rooms', `${FRONTEND_URL}/rooms`)}
  `;

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: opts.toEmail,
    subject: `Viewing Cancelled — ${opts.roomLabel}`,
    html: htmlLayout(body),
  });
}

// ---------------------------------------------------------------------------
// Email: Deposit Rejected / Room Unavailable
// ---------------------------------------------------------------------------
export async function sendDepositRejectedEmail(opts: {
  toEmail: string;
  customerName: string;
  roomLabel: string;
  branchName: string;
  resultNote?: string;
}) {
  const rows =
    detailRow('Room',        opts.roomLabel, '#7f1d1d') +
    detailRow('Branch',      opts.branchName, '#7f1d1d') +
    (opts.resultNote ? detailRow('Reason', opts.resultNote, '#7f1d1d') : '');

  const body = `
    <h2 style="font-family:'Big Shoulders Text',Impact,sans-serif;
               font-size:30px;font-weight:900;color:#b91c1c;
               margin:0 0 6px;letter-spacing:1px;">
      Deposit Request Cancelled
    </h2>
    <div style="width:48px;height:4px;background:#b91c1c;border-radius:4px;margin-bottom:24px;"></div>

    <p style="font-family:'Afacad',Arial,sans-serif;color:#444;
              font-size:17px;line-height:1.65;margin:0 0 28px;">
      Hi <strong>${opts.customerName}</strong>,<br/>
      We're sorry to inform you that the room/bed you selected is no longer available. 
      Another customer has placed a deposit or it is currently occupied.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0"
           style="border-radius:16px;border:1.5px solid #fca5a5;
                  background:#fff8f8;overflow:hidden;">
      <tr><td style="padding:0 20px;">${rows}</td></tr>
    </table>

    <p style="font-family:'Afacad',Arial,sans-serif;color:#666;
              font-size:15px;line-height:1.65;margin:28px 0 0;">
      Your booking request has been cancelled. You can browse our available rooms and submit a new request.
    </p>

    ${ctaButton('Browse Rooms', `${FRONTEND_URL}/rooms`)}
  `;

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: opts.toEmail,
    subject: `Deposit Cancelled — ${opts.roomLabel} Unavailable`,
    html: htmlLayout(body),
  });
}

// ---------------------------------------------------------------------------
// Email: Deposit Instruction (Send to ask for deposit)
// ---------------------------------------------------------------------------
export async function sendDepositInstructionEmail(opts: {
  toEmail: string;
  customerName: string;
  bookingId: string;
  depositAmount: number;
  dueAt: string;
}) {
  const amountStr = opts.depositAmount.toLocaleString('vi-VN') + ' VND';
  const dateStr = new Date(opts.dueAt).toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long',
    day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const rows =
    detailRow('Amount Due', amountStr, '#264893') +
    detailRow('Deadline', dateStr, '#b91c1c');

  const body = `
    <h2 style="font-family:'Big Shoulders Text',Impact,sans-serif;
               font-size:30px;font-weight:900;color:#264893;
               margin:0 0 6px;letter-spacing:1px;">
      Action Required: Deposit Payment
    </h2>
    <div style="width:48px;height:4px;background:#264893;border-radius:4px;margin-bottom:24px;"></div>

    <p style="font-family:'Afacad',Arial,sans-serif;color:#444;
              font-size:17px;line-height:1.65;margin:0 0 28px;">
      Hi <strong>${opts.customerName}</strong>,<br/>
      Great news! The room you requested is available and your details have been verified. 
      Please complete your deposit payment to secure your booking. You have 24 hours to pay the deposit and submit proof.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0"
           style="border-radius:16px;border:1.5px solid #e0e7ff;
                  background:#f8fafc;overflow:hidden;">
      <tr><td style="padding:0 20px;">${rows}</td></tr>
    </table>

    <p style="font-family:'Afacad',Arial,sans-serif;color:#666;
              font-size:15px;line-height:1.65;margin:28px 0 0;">
      Click the button below to review the Dormitory Terms & Conditions, and view payment instructions.
    </p>

    ${ctaButton('Review Terms & Deposit', `${FRONTEND_URL}/bookings`)}
  `;

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: opts.toEmail,
    subject: `Action Required: Deposit Payment for Booking`,
    html: htmlLayout(body),
  });
}

// ---------------------------------------------------------------------------
// Email: Deposit Terms & Payment Instructions (Sent when user agrees to terms)
// ---------------------------------------------------------------------------
export async function sendDepositTermsAndPaymentEmail(opts: {
  toEmail: string;
  customerName: string;
  depositAmount: number;
}) {
  const amountStr = opts.depositAmount.toLocaleString('vi-VN') + ' VND';

  const body = `
    <h2 style="font-family:'Big Shoulders Text',Impact,sans-serif;
               font-size:30px;font-weight:900;color:#264893;
               margin:0 0 6px;letter-spacing:1px;">
      Payment Instructions & Terms
    </h2>
    <div style="width:48px;height:4px;background:#264893;border-radius:4px;margin-bottom:24px;"></div>

    <p style="font-family:'Afacad',Arial,sans-serif;color:#444;
              font-size:17px;line-height:1.65;margin:0 0 28px;">
      Hi <strong>${opts.customerName}</strong>,<br/>
      Thank you for agreeing to our Dormitory Terms and Conditions. To complete your deposit, please transfer the required amount to our bank account below.
    </p>

    <div style="background:#f8fafc; border:2px solid #e0e7ff; border-radius:16px; padding:24px; margin-bottom:24px;">
      <h3 style="margin:0 0 16px; color:#264893; font-family:'Big Shoulders Text',sans-serif; font-size:22px;">
        Bank Transfer Details
      </h3>
      <div style="font-family:'Afacad',sans-serif; font-size:16px; color:#595959; line-height:1.6;">
        <strong>Amount:</strong> <span style="color:#b91c1c; font-weight:bold; font-size:18px;">${amountStr}</span><br/>
        <strong>Bank:</strong> Vietcombank<br/>
        <strong>Account Name:</strong> HOMESTAY DORM<br/>
        <strong>Account Number:</strong> 1234567890<br/>
        <strong>Description:</strong> <em>[Your Booking ID]</em>
      </div>
    </div>

    <p style="font-family:'Afacad',Arial,sans-serif;color:#666;
              font-size:15px;line-height:1.65;margin:28px 0 0;">
      After completing the transfer, please return to your booking dashboard to upload the screenshot/receipt of the transaction.
      You can also review the full terms and guidelines on our website.
    </p>

    <div style="display: flex; gap: 12px; margin-top: 24px;">
      ${ctaButton('View Guidelines', `${FRONTEND_URL}/guidelines`)}
      ${ctaButton('Upload Proof', `${FRONTEND_URL}/bookings`)}
    </div>
  `;

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: opts.toEmail,
    subject: `Your Payment Instructions & Terms`,
    html: htmlLayout(body),
  });
}

// ---------------------------------------------------------------------------
// Email: Deposit Confirmed
// ---------------------------------------------------------------------------
export async function sendDepositConfirmedEmail(opts: {
  toEmail: string;
  customerName: string;
  roomLabel: string;
  branchName: string;
}) {
  const rows =
    detailRow('Room',        opts.roomLabel, '#16a34a') +
    detailRow('Branch',      opts.branchName, '#16a34a');

  const body = `
    <h2 style="font-family:'Big Shoulders Text',Impact,sans-serif;
               font-size:30px;font-weight:900;color:#16a34a;
               margin:0 0 6px;letter-spacing:1px;">
      Deposit Confirmed
    </h2>
    <div style="width:48px;height:4px;background:#16a34a;border-radius:4px;margin-bottom:24px;"></div>

    <p style="font-family:'Afacad',Arial,sans-serif;color:#444;
              font-size:17px;line-height:1.65;margin:0 0 28px;">
      Hi <strong>${opts.customerName}</strong>,<br/>
      Your deposit payment has been successfully verified! 
      The room/bed is now officially reserved for you.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0"
           style="border-radius:16px;border:1.5px solid #bbf7d0;
                  background:#f0fdf4;overflow:hidden;">
      <tr><td style="padding:0 20px;">${rows}</td></tr>
    </table>

    <p style="font-family:'Afacad',Arial,sans-serif;color:#666;
              font-size:15px;line-height:1.65;margin:28px 0 0;">
      Our team will contact you shortly with further instructions regarding your move-in process and signing the contract.
    </p>

    ${ctaButton('View Booking', `${FRONTEND_URL}/bookings`)}
  `;

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: opts.toEmail,
    subject: `Deposit Confirmed — ${opts.roomLabel} Reserved`,
    html: htmlLayout(body),
  });
}

// ---------------------------------------------------------------------------
// Email: Deposit Failed / Invalid Proof
// ---------------------------------------------------------------------------
export async function sendDepositFailedEmail(opts: {
  toEmail: string;
  customerName: string;
  reason?: string;
}) {
  const body = `
    <h2 style="font-family:'Big Shoulders Text',Impact,sans-serif;
               font-size:30px;font-weight:900;color:#b91c1c;
               margin:0 0 6px;letter-spacing:1px;">
      Deposit Verification Failed
    </h2>
    <div style="width:48px;height:4px;background:#b91c1c;border-radius:4px;margin-bottom:24px;"></div>

    <p style="font-family:'Afacad',Arial,sans-serif;color:#444;
              font-size:17px;line-height:1.65;margin:0 0 28px;">
      Hi <strong>${opts.customerName}</strong>,<br/>
      We could not verify your deposit payment proof. ${opts.reason ? 'Reason: ' + opts.reason : 'Please check your transaction details or contact our support team.'}
    </p>

    <p style="font-family:'Afacad',Arial,sans-serif;color:#666;
              font-size:15px;line-height:1.65;margin:28px 0 0;">
      Your booking has not been secured. You may need to submit a valid payment proof before the deadline, or submit a new booking if the room is taken.
    </p>

    ${ctaButton('View Booking', `${FRONTEND_URL}/bookings`)}
  `;

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: opts.toEmail,
    subject: `Action Required: Deposit Verification Failed`,
    html: htmlLayout(body),
  });
}

// ---------------------------------------------------------------------------
// Email: Deposit Proof Submitted (To Admin)
// ---------------------------------------------------------------------------
export async function sendDepositSubmittedEmail(opts: {
  customerName: string;
  roomLabel: string;
  depositAmount: number;
  depositId: string;
}) {
  const amountStr = opts.depositAmount.toLocaleString('vi-VN') + ' VND';
  const body = `
    <h2 style="font-family:'Big Shoulders Text',Impact,sans-serif;
               font-size:30px;font-weight:900;color:#264893;
               margin:0 0 6px;letter-spacing:1px;">
      New Deposit Proof Submitted
    </h2>
    <div style="width:48px;height:4px;background:#264893;border-radius:4px;margin-bottom:24px;"></div>

    <p style="font-family:'Afacad',Arial,sans-serif;color:#444;
              font-size:17px;line-height:1.65;margin:0 0 28px;">
      Customer <strong>${opts.customerName}</strong> has submitted payment proof for their deposit.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0"
           style="border-radius:16px;border:1.5px solid #e0e7ff;
                  background:#f8fafc;overflow:hidden;">
      <tr>
        <td style="padding:0 20px;">
          ${detailRow('Room', opts.roomLabel, '#264893')}
          ${detailRow('Amount', amountStr, '#264893')}
        </td>
      </tr>
    </table>

    <p style="font-family:'Afacad',Arial,sans-serif;color:#666;
              font-size:15px;line-height:1.65;margin:28px 0 0;">
      Please review the proof of payment and confirm or reject the deposit in the admin dashboard.
    </p>

    ${ctaButton('View in Dashboard', `${FRONTEND_URL}/admin/deposits`)}
  `;

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: 'noreply@homestaydorm.asia', // Sending to admin email
    subject: `Admin Alert: New Deposit Proof from ${opts.customerName}`,
    html: htmlLayout(body),
  });
}
