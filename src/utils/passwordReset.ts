import crypto from 'crypto';

/**
 * Generate a secure random token for password reset
 * @returns {string} A random hex string
 */
export const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Hash a reset token for secure storage
 * @param {string} token - The token to hash
 * @returns {string} The hashed token
 */
export const hashResetToken = (token: string): string => {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
};

/**
 * Send a password reset email (simulation)
 * @param {string} to - Recipient email address
 * @param {string} resetLink - The password reset link
 */
export const sendResetEmail = async (to: string, resetLink: string): Promise<void> => {
  // In a real application, you would use a proper email service like Nodemailer, SendGrid, etc.
  console.log(`Sending password reset email to: ${to}`);
  console.log(`Reset link: ${resetLink}`);
  
  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Return success (in a real app, you'd return the result from your email provider)
  return Promise.resolve();
};