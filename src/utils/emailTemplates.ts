/**
 * Email template for password reset
 */
export const passwordResetTemplate = (resetUrl: string, userName: string = 'there'): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        .footer { margin-top: 30px; font-size: 12px; color: #777; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Password Reset</h1>
        <p>Hello ${userName},</p>
        <p>You requested a password reset. Click the button below to reset your password:</p>
        <p><a href="${resetUrl}" class="button">Reset Password</a></p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>This link will expire in 15 minutes.</p>
        <div class="footer">
          <p>This is an automated email, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Email template for welcome emails
 */
export const welcomeTemplate = (userName: string = 'there'): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { color: #4CAF50; }
        .footer { margin-top: 30px; font-size: 12px; color: #777; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1 class="header">Welcome to Our App!</h1>
        <p>Hello ${userName},</p>
        <p>Thank you for joining our platform. We're excited to have you on board!</p>
        <p>If you have any questions, feel free to contact our support team.</p>
        <div class="footer">
          <p>This is an automated email, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};