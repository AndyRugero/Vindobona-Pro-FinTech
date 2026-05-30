/**
 * Generates the HTML string for the verification email.
 * @param {string} username - The user's registered username
 * @param {string} verificationCode - The 6-digit OTP code
 * @returns {string} HTML markup string with styled CSS
 */
const getVerificationEmailHelper = (username, verificationCode) => {
    return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 550px; 
        margin: 0 auto; 
        padding: 30px;
         border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
           background-color: #0b1329; 
           color: #f8fafc; text-align: left;">
            <div style="text-
            align: center; margin-bottom: 20px;">
                <h1 style="color: #fbbf24; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 0.5px;">🏦 Vindobona Pro</h1>
                <p style="color: #94a3b8; font-size: 14px; margin: 5px 0 0 0;">Secure Financial Dashboard</p>
            </div>
            <hr style="border: 0; border-top: 1px solid rgba(255, 255, 255, 0.08); margin: 20px 0;" />
            <p style="font-size: 16px; line-height: 1.6; color: #e2e8f0;">Hello <strong>${username}</strong>,</p>
            <p style="font-size: 16px; line-height: 1.6; color: #e2e8f0;">Thank you for registering at Vindobona Pro! To activate your account and complete your setup, please use the 6-digit verification code below:</p>
            
            <div style="text-align: center; margin: 35px 0;">
                <span style="font-size: 36px; font-weight: 800; letter-spacing: 6px; padding: 12px 28px; background-color: rgba(251, 191, 36, 0.1); border: 1px dashed #fbbf24; border-radius: 8px; color: #fbbf24; display: inline-block;">${verificationCode}</span>
            </div>
            
            <p style="font-size: 14px; line-height: 1.5; color: #94a3b8;">This code is valid for temporary use. If you did not create this account, you can safely ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid rgba(255, 255, 255, 0.08); margin: 30px 0;" />
            <p style="font-size: 11px; color: #64748b; text-align: center; margin: 0;">Vindobona Pro &bull; Automated Identity Verification System</p>
        </div>
    `;
};
/**
 * Generates the HTML string for the password reset email.
 * @param {string} username - The user's registered username
 * @param {string} resetLink - The password reset URL (containing the token)
 * @returns {string} HTML markup string with styled CSS
 */
const ResetPasswordEmail = (username, resetLink) => {
    return `
        <!-- Main container -->
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 550px; margin: 0 auto; padding: 30px; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; background-color: #0b1329; color: #f8fafc; text-align: left;">
            
            <!-- Header Section (logo & subtitle) -->
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #fbbf24; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 0.5px;">🏦 Vindobona Pro</h1>
                <p style="color: #94a3b8; font-size: 14px; margin: 5px 0 0 0;">Secure Password Reset</p>
            </div>
            
            <!-- Horizontal border -->
            <hr style="border: 0; border-top: 1px solid rgba(255, 255, 255, 0.08); margin: 20px 0;" />
            
            <!-- Email Body (greeting & message) -->
            <p style="font-size: 16px; line-height: 1.6; color: #e2e8f0;">Hello <strong>${username}</strong>,</p>
            <p style="font-size: 16px; line-height: 1.6; color: #e2e8f0;">We have received your password reset request. Please click the button below to set a new password:</p>
            
            <!-- Call to action (reset button container) -->
            <div style="text-align: center; margin: 35px 0;">
                <a href="${resetLink}" style="display: inline-block; padding: 12px 28px; background-color: #fbbf24; color: #0b1329; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; letter-spacing: 0.5px;">Reset your password</a>
            </div>
            
            <!-- SECURITY WARNING (Expiry Information) -->
            <p style="font-size: 14px; line-height: 1.5; color: #94a3b8;">This link is valid for <strong>15 minutes</strong>. If you did not make this request, you can safely ignore this email.</p>
            
            <!-- FOOTER DIVIDER LINE -->
            <hr style="border: 0; border-top: 1px solid rgba(255, 255, 255, 0.08); margin: 30px 0;" />
            
            <!-- FOOTER (System Note) -->
            <p style="font-size: 11px; color: #64748b; text-align: center; margin: 0;">Vindobona Pro &bull; Automated Security System</p>
            
        </div>
    `;
};

module.exports = {
    getVerificationEmailHelper,
    ResetPasswordEmail
};
