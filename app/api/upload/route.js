import { NextResponse } from 'next/server';
import { saveFile } from '@/lib/upload';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Use 'gallery' folder by default or allow it to be passed
        const folder = formData.get('folder') || 'gallery';

        // Save the file using the existing lib/upload utility
        const imageUrl = await saveFile(file, folder);

        if (!imageUrl) {
            return NextResponse.json(
                { error: 'Failed to save file' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { url: imageUrl },
            { status: 200 }
        );
    } catch (error) {
        console.error('Upload API Error:', error);
        return NextResponse.json(
            { error: 'Internal server error during upload' },
            { status: 500 }
        );
    }
}
