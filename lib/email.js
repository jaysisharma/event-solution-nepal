import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // e.g. 'eventsolution@gmail.com'
        pass: process.env.EMAIL_PASS, // App Password
    },
});

export async function sendTicketEmail(to, ticketBuffer, eventDetails, userDetails) {
    try {
        const mailOptions = {
            from: `"Event Solution Nepal" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: `Your Ticket: ${eventDetails.title}`,
            html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #2563eb;">Here is your ticket!</h2>
          <p>Hi <strong>${userDetails.name}</strong>,</p>
          <p>Your request for <strong>${eventDetails.title}</strong> has been approved.</p>
          <p>Please find attached your official ticket.</p>
          <br/>
          <p><strong>Event Details:</strong></p>
          <ul>
            <li><strong>Date:</strong> ${eventDetails.date} ${eventDetails.month}, ${eventDetails.year || '2025'}</li>
            <li><strong>Time:</strong> ${eventDetails.time}</li>
            <li><strong>Location:</strong> ${eventDetails.location}</li>
          </ul>
          <br/>
          <p>We look forward to seeing you!</p>
          <p>Best regards,<br/>Event Solution Nepal Team</p>
        </div>
      `,
            attachments: [
                {
                    filename: `ticket-${userDetails.name.replace(/\s+/g, '-').toLowerCase()}.png`,
                    content: ticketBuffer,
                    contentType: 'image/png'
                }
            ]
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: %s", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending email:", error);
        return { success: false, error: error.message };
    }
}
