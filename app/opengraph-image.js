import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Image metadata
export const alt = 'Event Solution Nepal';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

// Image generation component
export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: 'linear-gradient(to right, #1a1a1a, #2d2d2d)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '40px',
                    }}
                >
                    {/* Replaced static logo with styled text for reliability if logo file is missing or not processable in Edge */}
                    <div style={{ fontSize: 80, fontWeight: 'bold', color: '#fff', letterSpacing: '-0.05em' }}>
                        Event Solution
                    </div>
                </div>
                <div
                    style={{
                        fontSize: 40,
                        color: '#e5e5e5',
                        marginTop: '20px',
                        textAlign: 'center',
                        maxWidth: '80%',
                    }}
                >
                    Planning · Designing · Executing
                </div>
                <div
                    style={{
                        fontSize: 24,
                        color: '#a3a3a3',
                        marginTop: '40px',
                        letterSpacing: '0.2em',
                    }}
                >
                    {/* eslint-disable-next-line react/no-unescaped-entities */}
                    Nepal's Premier Event Management
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
