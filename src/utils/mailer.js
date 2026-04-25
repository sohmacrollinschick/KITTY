const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendOTPEmail(email, otp) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('EMAIL_USER and EMAIL_PASS must be configured');
  }

  await transporter.sendMail({
    from: `"Velvet Paws Cattery" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Verification Code',
    html: `
      <div style="font-family:Segoe UI,Arial,sans-serif;background:#fffaf4;padding:20px;border-radius:12px;border:1px solid #ecdcc6;max-width:480px;margin:auto;">
        <h2 style="margin-top:0;color:#3a2d1f;">Email Verification</h2>
        <p style="color:#5f4f3d;">Your OTP is:</p>
        <p style="font-size:30px;font-weight:700;letter-spacing:4px;color:#a2753e;margin:8px 0;">${otp}</p>
        <p style="color:#6f5e4a;">This code expires in 5 minutes.</p>
      </div>
    `
  });
}

module.exports = { transporter, sendOTPEmail };
