import nodemailer from 'nodemailer';
import { config } from '../configs/config.ts';

/**
 * Interface for email options
 */
export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  text?: string;
  attachments?: {
    filename?: string;
    content?: string | Buffer;
    path?: string;
    contentType?: string;
    cid?: string;
  }[];
}

/**
 * Error class for email sending failures
 */
export class EmailError extends Error {
  constructor(message: string, public readonly originalError?: Error) {
    super(message);
    this.name = 'EmailError';
  }
}

/**
 * Create a reusable transporter object using Brevo SMTP
 */
const createTransporter = () => {
  const { user, smtpKey } = config.email;
  
  if (!user || !smtpKey) {
    throw new EmailError('Email configuration is missing. Check BREVO_USER and BREVO_SMTP_KEY environment variables.');
  }
  
  return nodemailer.createTransport({
    host: 'smtp-relay.sendinblue.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user,
      pass: smtpKey,
    },
  });
};

/**
 * Send an email using Brevo SMTP
 * @param {string} to - Recipient email address(es)
 * @param {string} subject - Email subject
 * @param {string} html - HTML content of the email
 * @param {string} [from] - Sender email address (defaults to config)
 * @param {string} [text] - Plain text version of the email
 * @param {nodemailer.Attachment[]} [attachments] - Email attachments
 * @returns {Promise<void>}
 */
export const sendEmail = async ({
  to,
  subject,
  html,
  from = config.email.defaultFrom,
  text,
  attachments,
}: EmailOptions): Promise<void> => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: from || `"${config.app.name}" <${config.email.defaultFrom}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML tags for text version if not provided
      html,
      attachments,
    };
    
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new EmailError(
      'Failed to send email. Please try again later.',
      error instanceof Error ? error : new Error(String(error))
    );
  }
};

/**
 * Simplified email sending function with basic parameters
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML content of the email
 * @returns {Promise<void>}
 */
export const sendSimpleEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<void> => {
  return sendEmail({ to, subject, html });
};