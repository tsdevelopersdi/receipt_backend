import nodemailer from "nodemailer";
import dotenv from "dotenv";
import Users from "../models/UserModel.js";

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

/**
 * Send an email notification to Manager when Admin forwards an invoice
 * @param {string} managerEmail - Manager's email
 * @param {string} uploaderName - Original uploader name
 * @param {string} invoiceId - Invoice ID
 * @param {number} total - Grand total
 */
export const sendManagerNotification = async (managerEmail, uploaderName, invoiceId, total) => {
    try {
        console.log("[📧] Sending Manager verification notice to:", managerEmail);
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: managerEmail,
            subject: "Invoice Verification Required - Manager Review",
            text: `Manager Notification:\n\nAn invoice from ${uploaderName} has been verified by Admin and requires your approval.\n\nDetails:\n- Invoice ID: ${invoiceId}\n- Total amount: Rp ${total.toLocaleString()}\n\nPlease log in to the finance dashboard to approve or reject this submission.`,
            html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #007bff;">Invoice Approval Required</h2>
          <p>An invoice has been verified by the Admin and is now awaiting your final approval.</p>
          
          <div style="background: #f4f4f4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
            <h3 style="margin-top: 0;">Invoiced Details:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 5px 0; font-weight: bold; width: 40%;">Uploader Name:</td>
                <td>${uploaderName}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; font-weight: bold;">Invoice ID:</td>
                <td>#${invoiceId}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; font-weight: bold;">Grand Total:</td>
                <td style="color: #007bff; font-weight: bold;">Rp ${total.toLocaleString()}</td>
              </tr>
            </table>
          </div>
          
          <p>Please log in to <strong>Cakra Finance Dashboard</strong> to approve or reject this submission.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 0.8em; color: #777;">This is an automated system notification for the Management.</p>
        </div>
      `,
        });
        console.log("[✅][📧] Manager Notification sent successfully!");
        return info;
    } catch (error) {
        console.error("[❌][📧] FAILED to send Manager notification:", error.message);
        return null;
    }
};

/**
 * Send an email notification back to Admin when Manager approves or rejects
 * @param {string} uploaderName - Original uploader name
 * @param {string} invoiceId - Invoice ID
 * @param {string} status - New status (accepted/rejected)
 */
export const sendAdminStatusNotification = async (uploaderName, invoiceId, status) => {
    try {
        const adminEmail = process.env.EMAIL_TO_ADMIN;
        const color = status === "accepted" ? "#28a745" : "#dc3545";
        const statusLabel = status.toUpperCase();

        console.log("[📧] Sending Admin status notice to:", adminEmail);
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: adminEmail,
            subject: `Invoice #${invoiceId} ${statusLabel} by Manager`,
            text: `Admin Notification:\n\nManager has ${status} the invoice #${invoiceId} from ${uploaderName}.\n\nStatus: ${statusLabel}\n\nYou can now proceed with the next steps in the dashboard.`,
            html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: ${color};">Invoice ${statusLabel}</h2>
          <p>The manager has reviewed and ${status} an invoice.</p>
          
          <div style="background: #f4f4f4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${color};">
            <h3 style="margin-top: 0;">Details:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 5px 0; font-weight: bold; width: 40%;">Uploader Name:</td>
                <td>${uploaderName}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; font-weight: bold;">Invoice ID:</td>
                <td>#${invoiceId}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; font-weight: bold;">Final Status:</td>
                <td style="color: ${color}; font-weight: bold;">${statusLabel}</td>
              </tr>
            </table>
          </div>
          
          <p>Log in to the <strong>Cakra Finance Dashboard</strong> to see more details.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 0.8em; color: #777;">This is an automated system notification.</p>
        </div>
      `,
        });
        console.log("[✅][📧] Admin Status Notification sent successfully!");
        return info;
    } catch (error) {
        console.error("[❌][📧] FAILED to send Admin status notification:", error.message);
        return null;
    }
};

/**
 * Send an email notification to the next person in the approval sequence
 * @param {string} toRole - The role of the next approver
 * @param {string} dept - The department (for Supervisor role)
 * @param {string} uploaderName - Original uploader name
 * @param {string} invoiceId - Invoice ID
 * @param {number} total - Grand total
 */
export const sendNextApproverNotification = async (toRole, dept, uploaderName, invoiceId, total) => {
    try {
        // Find recipient email based on role and dept
        let recipientEmail = "";
        
        if (toRole === "manager") {
            recipientEmail = process.env.EMAIL_TO_MANAGER;
        } else if (toRole === "admin") {
            recipientEmail = process.env.EMAIL_TO_ADMIN;
        }
        
        // If not special env var, look up in DB
        if (!recipientEmail) {
            const query = { role: toRole };
            if (toRole === "supervisor" && dept) {
                query.department = dept;
            }
            const user = await Users.findOne({ where: query });
            if (user) {
                recipientEmail = user.email;
            }
        }

        if (!recipientEmail) {
            console.log(`[📧] No recipient found for role: ${toRole}${dept ? ' in dept: ' + dept : ''}`);
            return null;
        }

        console.log(`[📧] Sending notification to ${toRole} at:`, recipientEmail);
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: recipientEmail,
            subject: `Invoice #${invoiceId} Approval Required`,
            text: `Notification:\n\nAn invoice from ${uploaderName} requires your review and approval.\n\nDetails:\n- Role: ${toRole}\n- Invoice ID: ${invoiceId}\n- Total amount: Rp ${total.toLocaleString()}\n\nPlease log in to the finance dashboard to review this submission.`,
            html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #007bff;">Approval Required</h2>
          <p>An invoice is awaiting your review as <strong>${toRole.toUpperCase()}</strong>.</p>
          
          <div style="background: #f4f4f4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
            <h3 style="margin-top: 0;">Invoice Details:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 5px 0; font-weight: bold; width: 40%;">Uploader Name:</td>
                <td>${uploaderName}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; font-weight: bold;">Invoice ID:</td>
                <td>#${invoiceId}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; font-weight: bold;">Grand Total:</td>
                <td style="color: #007bff; font-weight: bold;">Rp ${total.toLocaleString()}</td>
              </tr>
            </table>
          </div>
          
          <p>Please log in to <strong>Cakra Finance Dashboard</strong> to approve or reject this submission.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 0.8em; color: #777;">This is an automated system notification.</p>
        </div>
      `,
        });
        console.log(`[✅][📧] Notification to ${toRole} sent successfully!`);
        return info;
    } catch (error) {
        console.error(`[❌][📧] FAILED to send notification to ${toRole}:`, error.message);
        return null;
    }
};
