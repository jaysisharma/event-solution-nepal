import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

// Image metadata
export const size = {
    width: 32,
    height: 32,
};
export const contentType = 'image/png';

// Generate the icon
export default function Icon() {
    // Read the favicon image from the public directory
    const imagePath = join(process.cwd(), 'public/logo/favicon.png');
    const imageBuffer = readFileSync(imagePath);

    // Convert buffer to base64 for embedding
    const imageSrc = `data:image/png;base64,${imageBuffer.toString('base64')}`;

    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    fontSize: 24,
                    background: 'transparent', // Transparent background as user likely wants the shape
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <img
                    src={imageSrc}
                    style={{
                        width: '100%',
                        height: '100%',
                        transform: 'scale(4)', // The requested "Zoom"
                        objectFit: 'contain'
                    }}
                />
            </div>
        ),
        // ImageResponse options
        {
            ...size,
        }
    );
}
