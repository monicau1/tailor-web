// utils/emailConfig.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendResetPasswordEmail = async (email, resetLink) => {
  try {
    const info = await transporter.sendMail({
      from: `"Ahmad Tailor" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Password - Ahmad Tailor",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Password</h2>
          <p>Anda menerima email ini karena Anda (atau seseorang) telah meminta reset password untuk akun Anda.</p>
          <p>Silakan klik tombol atau link di bawah ini untuk melanjutkan reset password:</p>
          
          <p style="margin: 25px 0;">
            <a href="${resetLink}" 
               style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </p>

          <p>Jika tombol di atas tidak berfungsi, silakan salin dan tempel link berikut ke browser Anda:</p>
          <p style="margin: 15px 0;">
            <a href="${resetLink}" style="color: #4CAF50; word-break: break-all;">
              ${resetLink}
            </a>
          </p>

          <p style="margin-top: 25px;">Link ini hanya berlaku selama 1 jam.</p>
          <p>Jika Anda tidak meminta reset password, abaikan email ini dan password Anda akan tetap sama.</p>
          <br>
          <p>Terima kasih,</p>
          <p>Tim Ahmad Tailor</p>
        </div>
      `,
    });

    console.log("Email reset password terkirim:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error mengirim email reset password:", error);
    return false;
  }
};

module.exports = { sendResetPasswordEmail };
