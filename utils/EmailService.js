import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10),
    secure: parseInt(process.env.EMAIL_PORT, 10) === 465, // true for 465 (SSL), false for other ports (TLS/STARTTLS)
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Send an email notification for successful upload
 * @param {string} to - Recipient email
 * @param {string} name - User name
 * @param {string} invoiceId - Created invoice ID
 * @param {number} total - Grand total
 * @param {number} transactionCount - Number of transactions
 */
export const sendUploadNotification = async (to, name, invoiceId, total, transactionCount) => {
    try {
        const adminEmail = process.env.EMAIL_TO_ADMIN;
        console.log("[📧] Attempting to send verification notice to:", adminEmail || to);
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: adminEmail || to, // Use admin email as primary recipient
            subject: "New Transaction Uploaded - Verification Required",
            text: `Admin Notification:\n\nA new transaction has been uploaded by ${name} (${to}).\n\nDetails:\n- Invoice ID: ${invoiceId}\n- Total amount: Rp ${total.toLocaleString()}\n- Number of transactions: ${transactionCount}\n\nPlease log in to the finance dashboard to verify this submission.`,
            html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #ff003c;">New Transaction Verification Required</h2>
          <p>A new transaction has been submitted and is awaiting review.</p>
          
          <div style="background: #f4f4f4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff003c;">
            <h3 style="margin-top: 0;">Submission Details:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 5px 0; font-weight: bold; width: 40%;">Uploader Name:</td>
                <td>${name}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; font-weight: bold;">Uploader Email:</td>
                <td>${to}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; font-weight: bold;">Invoice ID:</td>
                <td>#${invoiceId}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; font-weight: bold;">Grand Total:</td>
                <td style="color: #ff003c; font-weight: bold;">Rp ${total.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; font-weight: bold;">Transactions:</td>
                <td>${transactionCount} items</td>
              </tr>
            </table>
          </div>
          
          <p>Please log in to <strong>Cakra Finance Dashboard</strong> to approve or reject this submission.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 0.8em; color: #777;">This is an automated system notification for the Finance Department.</p>
        </div>
      `,
        });

        console.log("[✅][📧] Email sent successfully! MessageID:", info.messageId);
        return info;
    } catch (error) {
        console.error("[❌][📧] FAILED to send email notification.");
        console.error("Error Detail:", error.message);
        if (error.code === 'EAUTH') {
            console.error("Suggestion: Check your EMAIL_USER and EMAIL_PASS. If using Gmail, you likely need an App Password or 2-Step Verification.");
        }
        // We don't throw the error here to avoid breaking the upload process if email fails
        return null;
    }
};
