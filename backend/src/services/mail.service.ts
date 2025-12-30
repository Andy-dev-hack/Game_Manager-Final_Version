/**
 * @file mail.service.ts
 * @description Service for handling email notifications using Nodemailer.
 * Supports sending purchase confirmations with professional HTML templates.
 */
import nodemailer from "nodemailer";
import logger from "../utils/logger";

// Environment variables should be loaded
const SMTP_HOST = process.env.SMTP_HOST || "smtp.ethereal.email";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM =
  process.env.EMAIL_FROM || '"GameManager" <noreply@gamemanager.dev>';

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, // true for 465, false for other ports
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

interface PurchasedItem {
  title: string;
  price: number;
  licenseKey: string;
  image?: string;
}

/**
 * Sends a purchase confirmation email to the user.
 * @param email User's email address
 * @param username User's username
 * @param orderId Unique order ID
 * @param items List of purchased games with keys
 * @param total Total amount paid
 */
export const sendPurchaseConfirmation = async (
  email: string,
  username: string,
  orderId: string,
  items: PurchasedItem[],
  total: number
) => {
  try {
    // Generate HTML content
    const htmlContent = generatePurchaseEmailHtml(
      username,
      orderId,
      items,
      total
    );

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: EMAIL_FROM,
      to: email,
      subject: `Order Confirmation - #${orderId.slice(-6).toUpperCase()}`, // Short ID for subject
      text: `Thank you for your purchase, ${username}! Your order #${orderId} has been confirmed.`, // Fallback
      html: htmlContent,
    });

    logger.info(`Message sent: ${info.messageId}`);
    // Preview only available when sending through an Ethereal account
    // logger.debug("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    return info;
  } catch (error) {
    logger.error(`Error sending email: ${error}`);
    // Don't block the flow if email fails, just log it.
    // In a real app we might want to retry or queue it.
    logger.warn("Could not send email. Verify SMTP configuration.");
  }
};

/**
 * Generates the HTML template for the purchase confirmation email.
 * Uses inline styles for maximum compatibility.
 */
const generatePurchaseEmailHtml = (
  username: string,
  orderId: string,
  items: PurchasedItem[],
  total: number
) => {
  const itemsRows = items
    .map(
      (item) => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 12px;">
        <div style="font-weight: bold; color: #333;">${item.title}</div>
      </td>
      <td style="padding: 12px; font-family: monospace; color: #666; letter-spacing: 1px;">
        ${item.licenseKey}
      </td>
      <td style="padding: 12px; text-align: right; color: #333;">
        $${item.price.toFixed(2)}
      </td>
    </tr>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 24px; text-align: center; }
        .content { padding: 24px; background: #fff; }
        .order-info { background: #f8f9fa; padding: 12px; border-radius: 4px; margin-bottom: 24px; font-size: 0.9em; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        .total { text-align: right; font-size: 1.2em; font-weight: bold; margin-top: 12px; padding-top: 12px; border-top: 2px solid #eee; }
        .footer { background: #f1f1f1; padding: 12px; text-align: center; font-size: 0.8em; color: #666; }
        .btn { display: inline-block; padding: 10px 20px; background-color: #e94560; color: white; text-decoration: none; border-radius: 4px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin:0;">GameManager</h1>
          <p style="margin:5px 0 0; opacity: 0.8;">Order Confirmed</p>
        </div>
        
        <div class="content">
          <p>Hello <strong>${username}</strong>,</p>
          <p>Thank you for your purchase! Your order has been processed successfully. Below you will find your game activation keys.</p>
          
          <div class="order-info">
            <strong>Order ID:</strong> ${orderId}<br>
            <strong>Date:</strong> ${new Date().toLocaleDateString()}
          </div>
          
          <table class="table" width="100%">
            <thead>
              <tr style="background-color: #f8f9fa; text-align: left;">
                <th style="padding: 12px;">Game</th>
                <th style="padding: 12px;">Activation Key</th>
                <th style="padding: 12px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>
          
          <div class="total">
            Total Paid: $${total.toFixed(2)}
          </div>

          <div style="text-align: center;">
            <a href="http://localhost:5173/library" class="btn" style="color: white !important;">Go to My Library</a>
          </div>
        </div>
        
        <div class="footer">
          &copy; ${new Date().getFullYear()} GameManager. All rights reserved.<br>
          If you have any questions, please contact support.
        </div>
      </div>
    </body>
    </html>
  `;
};
