const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Helper to wrap HTML in a nice template
const template = (title, body) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: Arial, sans-serif; background: #0d0d0d; color: #f1f1f1; margin: 0; padding: 0; }
  .container { max-width: 560px; margin: 40px auto; background: #1a1a1a; border-radius: 12px; overflow: hidden; border: 1px solid #2a2a2a; }
  .header { background: linear-gradient(135deg, #8b0000, #c0392b); padding: 28px 32px; text-align: center; }
  .header h1 { margin: 0; color: #fff; font-size: 22px; }
  .header p  { margin: 6px 0 0; color: rgba(255,255,255,0.75); font-size: 13px; }
  .body { padding: 32px; }
  .body p { line-height: 1.7; color: #ccc; margin: 0 0 14px; }
  .info-box { background: #111; border: 1px solid #333; border-radius: 8px; padding: 16px 20px; margin: 18px 0; }
  .info-box .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #222; font-size: 14px; }
  .info-box .row:last-child { border-bottom: none; }
  .info-box .label { color: #888; }
  .info-box .value { color: #f1f1f1; font-weight: bold; }
  .btn { display: inline-block; background: #c0392b; color: #fff !important; text-decoration: none; padding: 13px 28px; border-radius: 8px; font-size: 15px; font-weight: bold; margin: 8px 0; }
  .emergency { background: rgba(192,57,43,0.15); border: 1px solid #c0392b; border-radius: 8px; padding: 10px 16px; margin-bottom: 16px; color: #e74c3c; font-weight: bold; }
  .footer { text-align: center; padding: 20px 32px; font-size: 12px; color: #555; border-top: 1px solid #222; }
</style></head>
<body>
  <div class="container">
    <div class="header">
      <h1>🩸 Blood Connect</h1>
      <p>Smart Blood Donation & Request Management</p>
    </div>
    <div class="body">
      <h2 style="color:#f1f1f1;margin:0 0 16px">${title}</h2>
      ${body}
    </div>
    <div class="footer">Blood Connect &copy; 2024 &mdash; Saving lives together 🩸</div>
  </div>
</body>
</html>`;

// Send email when donor accepts a blood request
const sendRequestAcceptedEmail = async (recipient, donor, request) => {
    if (!recipient?.email) return;
    const html = template('A Donor Has Accepted Your Request! 🎉', `
    <p>Great news, <strong>${recipient.name}</strong>! A blood donor has accepted your blood request.</p>
    ${request.emergency ? '<div class="emergency">🚨 Emergency Request</div>' : ''}
    <div class="info-box">
      <div class="row"><span class="label">Blood Group</span><span class="value">${request.bloodGroup}</span></div>
      <div class="row"><span class="label">Hospital</span><span class="value">${request.hospital}</span></div>
      <div class="row"><span class="label">City</span><span class="value">${request.city}</span></div>
      <div class="row"><span class="label">Units Required</span><span class="value">${request.units}</span></div>
    </div>
    <p><strong>Donor Contact Details:</strong></p>
    <div class="info-box">
      <div class="row"><span class="label">Name</span><span class="value">${donor.name}</span></div>
      <div class="row"><span class="label">Email</span><span class="value">${donor.email}</span></div>
      ${donor.contactNumber ? `<div class="row"><span class="label">Phone</span><span class="value">${donor.contactNumber}</span></div>` : ''}
      <div class="row"><span class="label">Blood Group</span><span class="value">${donor.bloodGroup}</span></div>
    </div>
    <p>Please coordinate with the donor to arrange the donation. Thank you for using Blood Connect!</p>
  `);

    await transporter.sendMail({
        from: `"Blood Connect 🩸" <${process.env.EMAIL_USER}>`,
        to: recipient.email,
        subject: '✅ Your Blood Request Has Been Accepted!',
        html,
    });
};

// Send email to donor when donation is marked complete
const sendDonationCompleteEmail = async (donor, request) => {
    if (!donor?.email) return;
    const html = template('Donation Completed — Thank You! 🏆', `
    <p>Dear <strong>${donor.name}</strong>, your donation has been marked as completed by the recipient.</p>
    <div class="info-box">
      <div class="row"><span class="label">Blood Group</span><span class="value">${request.bloodGroup}</span></div>
      <div class="row"><span class="label">Hospital</span><span class="value">${request.hospital}</span></div>
      <div class="row"><span class="label">City</span><span class="value">${request.city}</span></div>
      <div class="row"><span class="label">Units Donated</span><span class="value">${request.units}</span></div>
    </div>
    <p>Your selfless act has potentially saved a life. You are a hero! 💪 Your donation has been added to your history.</p>
  `);

    await transporter.sendMail({
        from: `"Blood Connect 🩸" <${process.env.EMAIL_USER}>`,
        to: donor.email,
        subject: '🏆 Donation Completed — You\'re a Hero!',
        html,
    });
};

// Send password reset email
const sendPasswordResetEmail = async (user, resetToken) => {
    if (!user?.email) return;
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    const html = template('Reset Your Password 🔐', `
    <p>Hi <strong>${user.name}</strong>, you requested a password reset for your Blood Connect account.</p>
    <p>Click the button below to reset your password. This link expires in <strong>15 minutes</strong>.</p>
    <p style="text-align:center;margin:28px 0">
      <a href="${resetUrl}" class="btn">Reset My Password</a>
    </p>
    <div class="info-box">
      <div class="row"><span class="label">Link expires</span><span class="value">15 minutes</span></div>
      <div class="row"><span class="label">Account</span><span class="value">${user.email}</span></div>
    </div>
    <p style="color:#888;font-size:13px">If you didn't request this, you can safely ignore this email. Your password will not be changed.</p>
  `);

    await transporter.sendMail({
        from: `"Blood Connect 🩸" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: '🔐 Reset Your Blood Connect Password',
        html,
    });
};

module.exports = { sendRequestAcceptedEmail, sendDonationCompleteEmail, sendPasswordResetEmail };
