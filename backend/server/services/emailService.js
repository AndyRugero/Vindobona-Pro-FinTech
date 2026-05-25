const nodemailer = require('nodemailer');

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

let transporter = null;
let isMockMode = false;

// Check if credentials are missing or placeholders
if (!emailUser || !emailPass || emailUser.includes('example') || emailPass.includes('placeholder')) {
    console.log('⚠️ Email credentials not set or contain placeholders. Running Email Service in Mock Mode (logging to console).');
    isMockMode = true;
} else {
    try {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: emailUser,
                pass: emailPass
            }
        });
        console.log('📧 Nodemailer Transporter initialized successfully! 🚀');
    } catch (error) {
        console.error('❌ Failed to initialize Nodemailer transporter:', error.message);
        isMockMode = true;
    }
}

/**
 * Sends an email using Nodemailer or logs it in Mock Mode.
 * @param {string} to - Recipient email address
 * @param {string} subject - Subject line of the email
 * @param {string} html - HTML body content
 */
const sendEmail = async (to, subject, html) => {
    if (isMockMode) {
        console.log('================ [MOCK EMAIL SENT] ================');
        console.log(`To:      ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body:\n${html}`);
        console.log('====================================================');
        return { messageId: 'mock-id-' + Date.now() };
    }

    try {
        const info = await transporter.sendMail({
            from: `"Vindobona Pro" <${emailUser}>`,
            to,
            subject,
            html
        });
        console.log(`📧 Email sent successfully! Message ID: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error(`❌ Failed to send email to ${to}:`, error.message);
        // Fallback to mock logging so registration doesn't fail completely!
        console.log('================ [FALLBACK MOCK EMAIL] ================');
        console.log(`To:      ${to}`);
        console.log(`Subject: ${subject} (FAILED REAL SEND - FALLBACK)`);
        console.log(`Body:\n${html}`);
        console.log('========================================================');
        return { messageId: 'fallback-mock-id-' + Date.now() };
    }
};

module.exports = { sendEmail };
