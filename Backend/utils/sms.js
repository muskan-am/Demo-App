// ============================================================
// sms.js — SMS Dispatch Utility for OTP Password Reset
// ============================================================
// Sends SMS messages with OTP codes to registered phone numbers.
// Includes terminal console logging for instant local dev testing.
// ============================================================

const sendSMS = async (options) => {
    const { phone, otp, message } = options;

    const smsText = message || `Your MERN Auth password reset verification code is: ${otp}. Valid for 10 minutes. Do not share with anyone.`;

    // Console Logging for Development Mode
    console.log('\n============================================================');
    console.log(`[SMS DISPATCH] Phone Number: ${phone}`);
    console.log(`[OTP CODE]: ${otp}`);
    console.log(`[MESSAGE CONTENT]: ${smsText}`);
    console.log('============================================================\n');

    // If an external SMS gateway (e.g., Twilio / Fast2SMS) is configured in .env, trigger it here.
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
        try {
            const twilio = require('twilio');
            const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
            await client.messages.create({
                body: smsText,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: phone
            });
            console.log(`[SMS SUCCESS] Message sent successfully via Twilio to ${phone}`);
        } catch (twilioErr) {
            console.error('[SMS ERROR - TWILIO]', twilioErr.message);
        }
    } else {
        console.log('[DEV NOTE] SMS Gateway not configured in .env. OTP printed to console above for development testing.');
    }

    return true;
};

module.exports = sendSMS;
