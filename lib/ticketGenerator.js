import { createCanvas, loadImage, registerFont } from 'canvas';
import path from 'path';

// If you have a custom font, register it here
// registerFont(path.join(process.cwd(), 'public/fonts/Inter-Bold.ttf'), { family: 'Inter Bold' });

export async function generateTicketImage(templateUrl, userDetails, eventDetails) {
    try {
        // 1. Load the template image
        // Note: If templateUrl is a remote URL, loadImage supports it.
        const image = await loadImage(templateUrl);

        // 2. Create canvas matching the image dimensions
        const canvas = createCanvas(image.width, image.height);
        const ctx = canvas.getContext('2d');

        // 3. Draw the template
        ctx.drawImage(image, 0, 0, image.width, image.height);

        // 4. Configure Text Styles from Ticket Config
        let config = [];
        try {
            if (eventDetails.ticketConfig && eventDetails.ticketConfig !== 'null') {
                const parsed = JSON.parse(eventDetails.ticketConfig);
                if (Array.isArray(parsed)) {
                    config = parsed;
                }
            }
        } catch (e) {
            console.error("Failed to parse ticketConfig", e);
        }

        const QRCode = require('qrcode');

        // Draw Configured Fields
        for (const field of config) {
            if (field.show) {
                if (field.id === 'qr') {
                    // --- QR CODE GENERATION ---
                    try {
                        const vCard = `BEGIN:VCARD
VERSION:3.0
FN:${userDetails.name}
TEL:${userDetails.number || ''}
EMAIL:${userDetails.email || ''}
ADR:;;${userDetails.address || ''};;;
TITLE:${userDetails.title || ''}
ORG:${userDetails.organization || ''}
URL:${userDetails.website || ''}
END:VCARD`;

                        // Generate QR Buffer
                        const qrBuffer = await QRCode.toBuffer(vCard, {
                            width: field.fontSize, // Use 'fontSize' as width/height
                            margin: 1
                        });

                        const qrImage = await loadImage(qrBuffer);

                        // Draw centered at x,y
                        // field.x, field.y is center point
                        const size = field.fontSize;
                        ctx.drawImage(qrImage, field.x - size / 2, field.y - size / 2, size, size);

                    } catch (err) {
                        console.error("Error generating QR:", err);
                    }
                    continue; // Skip text rendering for QR
                }

                // --- TEXT RENDERING ---
                ctx.font = `bold ${field.fontSize}px Arial`;
                ctx.fillStyle = field.color;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                let text = '';
                if (field.id === 'name') text = userDetails.name;
                if (field.id === 'number') text = userDetails.number || '';
                if (field.id === 'address') text = userDetails.address || '';
                if (field.id === 'title') text = userDetails.title || '';
                if (field.id === 'organization') text = userDetails.organization || '';
                if (field.id === 'website') text = userDetails.website || '';
                if (field.id === 'email') text = userDetails.email || '';
                if (field.id === 'ticketId') text = `T-${userDetails.id || Math.floor(Math.random() * 1000)}`;
                if (field.id === 'ticketDetails') text = userDetails.ticketDetails || '';

                ctx.fillText(text, field.x, field.y);
            }
        }

        // Fallback for Name if no config exists (legacy support)
        if (config.length === 0) {
            ctx.font = 'bold 48px Arial';
            ctx.fillStyle = '#000000';
            ctx.textAlign = 'center';
            ctx.fillText(userDetails.name, image.width / 2, image.height * 0.45);

            const ticketId = `T-${userDetails.id || Math.floor(Math.random() * 10000)}`;
            ctx.font = '24px Arial';
            ctx.fillStyle = '#555555';
            ctx.fillText(`Ticket #: ${ticketId}`, image.width / 2, image.height * 0.52);

            if (userDetails.ticketDetails) {
                ctx.font = '20px Arial';
                ctx.fillText(userDetails.ticketDetails, image.width / 2, image.height * 0.60);
            }
        }

        // 5. Return Buffer
        return canvas.toBuffer('image/png');

    } catch (error) {
        console.error("Error generating ticket image:", error);
        throw error;
    }
}
