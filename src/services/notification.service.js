/**
 * Dispatches an automated background alert for new contact form submissions.
 * Guaranteed not to throw or block the main thread.
 */
export const dispatch_contact_notification = async (message_data) => {
  const webhook_url = process.env.NOTIFICATION_WEBHOOK_URL;

  // 1. Structured Console Alert (Always active)
  console.log("\n==============================================");
  console.log("       📬 NEW CONTACT MESSAGE RECEIVED         ");
  console.log("==============================================");
  console.log(`From    : ${message_data.name} <${message_data.email}>`);
  console.log(`Subject : ${message_data.subject}`);
  console.log(`Message : ${message_data.message.substring(0, 100)}...`);
  console.log(`Time    : ${message_data.created_at}`);
  console.log("==============================================\n");

  // 2. Dispatch to External Webhook if configured (Discord/Slack/Telegram/Custom)
  if (webhook_url) {
    try {
      const payload = {
        content: `📬 **New Portfolio Message Received**\n**From:** ${message_data.name} (${message_data.email})\n**Subject:** ${message_data.subject}\n**Message:**\n${message_data.message}`,
      };

      await fetch(webhook_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("[Notification Dispatch Error]: Failed to send external webhook alert:", error.message);
    }
  }
};