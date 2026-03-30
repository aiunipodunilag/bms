import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "AI-UNIPOD BMS <onboarding@resend.dev>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://bms-lake-one.vercel.app";

// ─────────────────────────────────────────────────────────────────────────────
// Shared layout wrapper
// ─────────────────────────────────────────────────────────────────────────────
function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">

        <!-- Header -->
        <tr><td style="background:#7c3aed;border-radius:12px 12px 0 0;padding:28px 36px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <div style="display:inline-flex;align-items:center;gap:10px;">
                  <div style="width:36px;height:36px;background:rgba(255,255,255,0.2);border-radius:8px;display:flex;align-items:center;justify-content:center;">
                    <span style="color:#fff;font-weight:900;font-size:16px;line-height:36px;text-align:center;display:block;width:36px;">U</span>
                  </div>
                  <span style="color:#fff;font-weight:700;font-size:18px;letter-spacing:-0.3px;">AI-UNIPOD BMS</span>
                </div>
                <p style="color:rgba(255,255,255,0.7);font-size:12px;margin:6px 0 0;">UNILAG AI Innovation Hub · Booking Management System</p>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#ffffff;padding:36px;border-radius:0 0 12px 12px;">
          ${body}

          <!-- Footer -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:36px;padding-top:24px;border-top:1px solid #f1f5f9;">
            <tr><td>
              <p style="color:#94a3b8;font-size:12px;margin:0 0 4px;">
                This email was sent by AI-UNIPOD BMS, UNILAG.
              </p>
              <p style="color:#94a3b8;font-size:12px;margin:0;">
                <a href="${APP_URL}" style="color:#7c3aed;text-decoration:none;">Visit the portal</a>
                &nbsp;·&nbsp;
                <a href="${APP_URL}/auth/login" style="color:#7c3aed;text-decoration:none;">Sign in</a>
              </p>
            </td></tr>
          </table>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function btn(href: string, label: string, color = "#7c3aed"): string {
  return `<a href="${href}" style="display:inline-block;background:${color};color:#fff;font-weight:600;font-size:14px;text-decoration:none;padding:12px 28px;border-radius:8px;margin-top:20px;">${label}</a>`;
}

function codeBox(code: string, label = "Your Booking Code"): string {
  return `
  <div style="background:#f5f3ff;border:2px dashed #c4b5fd;border-radius:12px;padding:24px;text-align:center;margin:24px 0;">
    <p style="color:#7c3aed;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 10px;">${label}</p>
    <p style="color:#4c1d95;font-size:32px;font-weight:900;letter-spacing:6px;font-family:monospace;margin:0;">${code}</p>
    <p style="color:#8b5cf6;font-size:12px;margin:10px 0 0;">Show this to the receptionist at check-in</p>
  </div>`;
}

function alertBox(message: string, color = "#fef3c7", border = "#fbbf24", text = "#92400e"): string {
  return `<div style="background:${color};border-left:4px solid ${border};border-radius:6px;padding:14px 18px;margin:20px 0;">
    <p style="color:${text};font-size:13px;margin:0;">${message}</p>
  </div>`;
}

function detailRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 0;color:#64748b;font-size:13px;width:140px;vertical-align:top;">${label}</td>
    <td style="padding:8px 0;color:#0f172a;font-size:13px;font-weight:500;">${value}</td>
  </tr>`;
}

function greeting(name: string): string {
  return `<h2 style="color:#0f172a;font-size:22px;font-weight:700;margin:0 0 6px;">Hi ${name} 👋</h2>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Booking Confirmation (created, pending or confirmed)
// ─────────────────────────────────────────────────────────────────────────────
export async function sendBookingConfirmation(opts: {
  to: string;
  name: string;
  bmsCode: string;
  spaceName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "confirmed" | "pending";
}) {
  const isPending = opts.status === "pending";
  const subject = isPending
    ? `Booking Request Received — ${opts.spaceName}`
    : `Booking Confirmed — ${opts.spaceName} · ${opts.bmsCode}`;

  const body = `
    ${greeting(opts.name)}
    <p style="color:#475569;font-size:15px;margin:0 0 24px;">
      ${isPending
        ? "We've received your booking request. An admin will review it shortly — you'll get an email when it's approved."
        : "Your booking is confirmed! Here's everything you need for check-in."}
    </p>

    ${isPending ? "" : codeBox(opts.bmsCode)}

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:10px;padding:20px;margin-bottom:20px;">
      <tbody>
        ${detailRow("Space", opts.spaceName)}
        ${detailRow("Date", opts.date)}
        ${detailRow("Time", `${opts.startTime} – ${opts.endTime}`)}
        ${detailRow("Status", isPending ? "⏳ Pending approval" : "✅ Confirmed")}
        ${!isPending ? detailRow("BMS Code", opts.bmsCode) : ""}
      </tbody>
    </table>

    ${isPending
      ? alertBox("We'll notify you by email once an admin approves your request.")
      : alertBox("Arrive within <strong>20 minutes</strong> of your start time. Late arrivals are marked as no-shows.", "#f0fdf4", "#4ade80", "#166534")}

    ${btn(`${APP_URL}/bookings`, "View My Bookings")}
  `;

  return resend.emails.send({ from: FROM, to: opts.to, subject, html: layout(subject, body) });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Booking Approved by admin
// ─────────────────────────────────────────────────────────────────────────────
export async function sendBookingApproved(opts: {
  to: string;
  name: string;
  bmsCode: string;
  spaceName: string;
  date: string;
  startTime: string;
  endTime: string;
}) {
  const subject = `Booking Approved — ${opts.spaceName} · ${opts.bmsCode}`;
  const body = `
    ${greeting(opts.name)}
    <p style="color:#475569;font-size:15px;margin:0 0 24px;">
      Great news! Your booking request has been <strong style="color:#16a34a;">approved</strong>. Here is your booking code for check-in.
    </p>

    ${codeBox(opts.bmsCode)}

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:10px;padding:20px;margin-bottom:20px;">
      <tbody>
        ${detailRow("Space", opts.spaceName)}
        ${detailRow("Date", opts.date)}
        ${detailRow("Time", `${opts.startTime} – ${opts.endTime}`)}
      </tbody>
    </table>

    ${alertBox("Remember: arrive within <strong>20 minutes</strong> of your start time to avoid a no-show mark.", "#f0fdf4", "#4ade80", "#166534")}
    ${btn(`${APP_URL}/bookings`, "View Booking Details")}
  `;
  return resend.emails.send({ from: FROM, to: opts.to, subject, html: layout(subject, body) });
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Booking Rejected by admin
// ─────────────────────────────────────────────────────────────────────────────
export async function sendBookingRejected(opts: {
  to: string;
  name: string;
  spaceName: string;
  date: string;
  adminNote?: string;
}) {
  const subject = `Booking Request Not Approved — ${opts.spaceName}`;
  const body = `
    ${greeting(opts.name)}
    <p style="color:#475569;font-size:15px;margin:0 0 24px;">
      Unfortunately your booking request for <strong>${opts.spaceName}</strong> on <strong>${opts.date}</strong> was not approved.
    </p>

    ${opts.adminNote
      ? `<div style="background:#fff7ed;border-left:4px solid #fb923c;border-radius:6px;padding:14px 18px;margin:20px 0;">
          <p style="color:#9a3412;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 6px;">Admin note</p>
          <p style="color:#7c2d12;font-size:13px;margin:0;">${opts.adminNote}</p>
         </div>`
      : alertBox("No specific reason was provided. Contact reception for more information.")}

    <p style="color:#475569;font-size:13px;">You can submit a new booking request for a different time slot.</p>
    ${btn(`${APP_URL}/spaces`, "Browse Available Spaces")}
  `;
  return resend.emails.send({ from: FROM, to: opts.to, subject, html: layout(subject, body) });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Check-in confirmed (receptionist checked in user)
// ─────────────────────────────────────────────────────────────────────────────
export async function sendCheckinConfirmed(opts: {
  to: string;
  name: string;
  bmsCode: string;
  spaceName: string;
  startTime: string;
  endTime: string;
}) {
  const subject = `Checked In — ${opts.spaceName}`;
  const body = `
    ${greeting(opts.name)}
    <p style="color:#475569;font-size:15px;margin:0 0 24px;">
      You've been successfully checked in. Enjoy your session!
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border-radius:10px;padding:20px;margin-bottom:20px;border:1px solid #bbf7d0;">
      <tbody>
        ${detailRow("Space", opts.spaceName)}
        ${detailRow("Session", `${opts.startTime} – ${opts.endTime}`)}
        ${detailRow("Code", opts.bmsCode)}
        ${detailRow("Status", "✅ Checked in")}
      </tbody>
    </table>

    ${alertBox("Please vacate the space on time so the next booking can begin.", "#eff6ff", "#93c5fd", "#1e40af")}
    ${btn(`${APP_URL}/bookings`, "View My Bookings")}
  `;
  return resend.emails.send({ from: FROM, to: opts.to, subject, html: layout(subject, body) });
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. User account verified
// ─────────────────────────────────────────────────────────────────────────────
export async function sendAccountVerified(opts: { to: string; name: string; tier: string }) {
  const subject = "Your AI-UNIPOD Account is Verified";
  const tierLabels: Record<string, string> = {
    regular_student: "Regular Student",
    lecturer_staff: "Lecturer / Staff",
    product_developer: "Product Developer",
    external_user: "External User",
  };
  const body = `
    ${greeting(opts.name)}
    <p style="color:#475569;font-size:15px;margin:0 0 24px;">
      Welcome to AI-UNIPOD BMS! Your account has been <strong style="color:#16a34a;">verified</strong> by our team. You can now book spaces at the UNILAG AI Innovation Hub.
    </p>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:20px;margin:20px 0;text-align:center;">
      <div style="width:48px;height:48px;background:#dcfce7;border-radius:50%;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:24px;">✅</span>
      </div>
      <p style="color:#166534;font-weight:700;font-size:16px;margin:0 0 4px;">Account Verified</p>
      <p style="color:#4ade80;font-size:13px;margin:0;">Tier: ${tierLabels[opts.tier] ?? opts.tier}</p>
    </div>

    <p style="color:#475569;font-size:13px;">Sign in and start booking your workspace today.</p>
    ${btn(`${APP_URL}/auth/login`, "Sign In & Book a Space")}
  `;
  return resend.emails.send({ from: FROM, to: opts.to, subject, html: layout(subject, body) });
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. User account rejected
// ─────────────────────────────────────────────────────────────────────────────
export async function sendAccountRejected(opts: { to: string; name: string; reason?: string }) {
  const subject = "AI-UNIPOD Account Verification — Action Required";
  const body = `
    ${greeting(opts.name)}
    <p style="color:#475569;font-size:15px;margin:0 0 24px;">
      We were unable to verify your AI-UNIPOD account at this time.
    </p>

    ${opts.reason
      ? `<div style="background:#fff7ed;border-left:4px solid #fb923c;border-radius:6px;padding:14px 18px;margin:20px 0;">
          <p style="color:#9a3412;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 6px;">Reason</p>
          <p style="color:#7c2d12;font-size:13px;margin:0;">${opts.reason}</p>
         </div>`
      : alertBox("Your submitted document could not be verified. Please ensure it clearly shows your name and ID number.")}

    <p style="color:#475569;font-size:13px;">If you believe this is an error or have a clearer document, please contact reception or re-register with the correct document.</p>
    ${btn(`${APP_URL}/auth/signup`, "Re-register")}
  `;
  return resend.emails.send({ from: FROM, to: opts.to, subject, html: layout(subject, body) });
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Resource request approved
// ─────────────────────────────────────────────────────────────────────────────
export async function sendResourceApproved(opts: {
  to: string;
  name: string;
  resourceType: string;
  preferredDate: string;
  adminNote?: string;
}) {
  const subject = `Resource Request Approved — ${opts.resourceType}`;
  const body = `
    ${greeting(opts.name)}
    <p style="color:#475569;font-size:15px;margin:0 0 24px;">
      Your request for <strong>${opts.resourceType}</strong> has been <strong style="color:#16a34a;">approved</strong>!
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:10px;padding:20px;margin-bottom:20px;">
      <tbody>
        ${detailRow("Resource", opts.resourceType)}
        ${detailRow("Preferred date", opts.preferredDate)}
        ${opts.adminNote ? detailRow("Note", opts.adminNote) : ""}
      </tbody>
    </table>

    ${alertBox("When you check in for your booking, the receptionist will generate a one-time <strong>Equipment Access Code</strong>. Present this to the Space Lead to access the equipment.", "#f0fdf4", "#4ade80", "#166534")}
    ${btn(`${APP_URL}/bookings`, "View My Bookings")}
  `;
  return resend.emails.send({ from: FROM, to: opts.to, subject, html: layout(subject, body) });
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Resource request rejected
// ─────────────────────────────────────────────────────────────────────────────
export async function sendResourceRejected(opts: {
  to: string;
  name: string;
  resourceType: string;
  preferredDate: string;
  adminNote?: string;
}) {
  const subject = `Resource Request Not Approved — ${opts.resourceType}`;
  const body = `
    ${greeting(opts.name)}
    <p style="color:#475569;font-size:15px;margin:0 0 24px;">
      Unfortunately your request for <strong>${opts.resourceType}</strong> on <strong>${opts.preferredDate}</strong> was not approved.
    </p>

    ${opts.adminNote
      ? `<div style="background:#fff7ed;border-left:4px solid #fb923c;border-radius:6px;padding:14px 18px;margin:20px 0;">
          <p style="color:#9a3412;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 6px;">Admin note</p>
          <p style="color:#7c2d12;font-size:13px;margin:0;">${opts.adminNote}</p>
         </div>`
      : alertBox("No specific reason was provided. Contact reception for more information.")}

    ${btn(`${APP_URL}/resource-request`, "Submit Another Request")}
  `;
  return resend.emails.send({ from: FROM, to: opts.to, subject, html: layout(subject, body) });
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. Admin account created (sent to new admin with credentials)
// ─────────────────────────────────────────────────────────────────────────────
export async function sendAdminAccountCreated(opts: {
  to: string;
  name: string;
  role: string;
  tempPassword: string;
  assignedSpace?: string;
}) {
  const roleLabels: Record<string, string> = {
    super_admin: "Super Admin",
    admin: "Admin",
    receptionist: "Receptionist",
    space_lead: "Space Lead",
  };
  const subject = "Your AI-UNIPOD Admin Account Has Been Created";
  const body = `
    ${greeting(opts.name)}
    <p style="color:#475569;font-size:15px;margin:0 0 24px;">
      A new admin account has been created for you on AI-UNIPOD BMS. Here are your login credentials — <strong>please change your password after your first login.</strong>
    </p>

    <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:10px;padding:24px;margin:20px 0;">
      <p style="color:#7c3aed;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px;">Your Credentials</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tbody>
          ${detailRow("Email", opts.to)}
          ${detailRow("Password", `<code style="background:#ede9fe;padding:2px 8px;border-radius:4px;font-size:13px;color:#4c1d95;">${opts.tempPassword}</code>`)}
          ${detailRow("Role", roleLabels[opts.role] ?? opts.role)}
          ${opts.assignedSpace ? detailRow("Space", opts.assignedSpace) : ""}
        </tbody>
      </table>
    </div>

    ${alertBox("⚠️ This is a temporary password. Please change it immediately after signing in.", "#fff7ed", "#fb923c", "#9a3412")}

    ${btn(`${APP_URL}/admin/login`, "Sign In to Admin Portal")}
  `;
  return resend.emails.send({ from: FROM, to: opts.to, subject, html: layout(subject, body) });
}
