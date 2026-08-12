// ============================================================
// email.js — Nodemailer Utility for Password Reset & OTP Emails
// ============================================================
// Sends HTML/Text password reset emails & 6-digit OTP emails.
// If EMAIL_USER is not configured, it logs the OTP to console.
// ============================================================

const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const { email, subject, resetUrl, isGoogleUser, otp } = options;

    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const isConfigured = emailUser && emailPass && emailUser !== 'your-email@gmail.com';

    // Development Console Logging (always logs so developers can copy link/OTP immediately)
    console.log('\n============================================================');
    console.log(`[PASSWORD RESET EMAIL] Sent to: ${email}`);
    console.log(`[SUBJECT]: ${subject}`);
    if (otp) {
        console.log(`[6-DIGIT OTP CODE]: ${otp}`);
    }
    if (isGoogleUser) {
        console.log('[NOTE]: Account is registered via Google Sign-In.');
    } else if (resetUrl) {
        console.log(`[RESET LINK]: ${resetUrl}`);
    }
    console.log('============================================================\n');

    if (!isConfigured) {
        console.warn('[EMAIL WARNING] EMAIL_USER / EMAIL_PASS not configured in backend .env. Email/OTP logged to console above.');
        return true;
    }

    // Configure Nodemailer Transporter
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: emailUser,
            pass: emailPass
        }
    });

    let htmlContent = '';
    let textContent = '';

    if (otp) {
        textContent = `Hello,\n\nYour 6-digit OTP verification code for password reset is: ${otp}\n\nThis code will expire in 10 minutes. Do not share this code with anyone.\n\nThank you!`;
        htmlContent = `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
                <div style="text-align: center; margin-bottom: 24px;">
                    <h2 style="color: #4f46e5; margin: 0;">Password Reset Verification Code</h2>
                    <p style="color: #64748b; font-size: 14px; margin-top: 4px;">MERN Authentication App</p>
                </div>
                <p style="color: #334155; font-size: 16px;">Hello,</p>
                <p style="color: #334155; font-size: 16px;">Use the following 6-digit OTP verification code to reset your password:</p>
                <div style="text-align: center; margin: 28px 0;">
                    <span style="font-family: monospace, sans-serif; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #4f46e5; background: #eef2ff; padding: 12px 28px; border-radius: 12px; border: 2px dashed #c7d2fe; display: inline-block;">${otp}</span>
                </div>
                <p style="color: #64748b; font-size: 14px; text-align: center;">This code will expire in <strong>10 minutes</strong>. Do not share this OTP with anyone.</p>
            </div>
        `;
    } else if (isGoogleUser) {
        textContent = `Hello,\n\nWe received a request to reset your password. However, your account was registered using Google Sign-In.\n\nPlease log in by clicking "Continue with Google" on the login page.\n\nThank you!`;
        htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc; border-radius: 10px;">
                <h2 style="color: #4f46e5; text-align: center;">Google Sign-In Account</h2>
                <p style="color: #334155; font-size: 16px;">Hello,</p>
                <p style="color: #334155; font-size: 16px;">We received a request to reset the password for this email address. However, your account is registered using <strong>Google Sign-In</strong>.</p>
                <p style="color: #334155; font-size: 16px;">You don't need a password! You can sign in directly using Google.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Go to Login Page</a>
                </div>
            </div>
        `;
    } else {
        textContent = `Hello,\n\nWe received a request to reset your password.\n\nPlease click the link below or copy it into your browser to reset your password:\n${resetUrl}\n\nThis link will expire in 15 minutes.\n\nIf you did not request a password reset, please ignore this email.`;
        htmlContent = `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
                <div style="text-align: center; margin-bottom: 24px;">
                    <h2 style="color: #4f46e5; margin: 0;">Password Reset Request</h2>
                    <p style="color: #64748b; font-size: 14px; margin-top: 4px;">MERN Authentication App</p>
                </div>
                <p style="color: #334155; font-size: 16px; line-height: 1.5;">Hello,</p>
                <p style="color: #334155; font-size: 16px; line-height: 1.5;">We received a request to reset your password. Click the button below to create a new password:</p>
                <div style="text-align: center; margin: 32px 0;">
                    <a href="${resetUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);">Reset Password</a>
                </div>
                <p style="color: #64748b; font-size: 14px; line-height: 1.5;">This link will expire in <strong>15 minutes</strong>.</p>
                <p style="color: #64748b; font-size: 14px; line-height: 1.5;">If you did not request this password reset, you can safely ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                <p style="color: #94a3b8; font-size: 12px; text-align: center;">If the button above doesn't work, copy and paste this link into your browser:<br/><a href="${resetUrl}" style="color: #4f46e5;">${resetUrl}</a></p>
            </div>
        `;
    }

    const mailOptions = {
        from: `"MERN Auth Support" <${emailUser}>`,
        to: email,
        subject: subject,
        text: textContent,
        html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    return true;
};

module.exports = sendEmail;
