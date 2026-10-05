import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getCompanyLogos } from '@/app/admin/exhibitors/actions';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const files = formData.getAll('logoFiles');

        if (!files || files.length === 0) {
            return NextResponse.json({ success: false, error: 'No files provided for upload.' }, { status: 400 });
        }

        const companyDir = path.join(process.cwd(), 'public', 'company');
        await fs.mkdir(companyDir, { recursive: true });

        const uploadedUrls = [];
        const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.svg'];

        for (const file of files) {
            if (!file || typeof file !== 'object' || file.size === 0) continue;

            const originalName = file.name || 'logo.png';
            const ext = path.extname(originalName).toLowerCase();
            if (!allowedExtensions.includes(ext)) continue;

            const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
            const uniqueFilename = `${baseName || 'logo'}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}${ext}`;
            const targetPath = path.join(companyDir, uniqueFilename);

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            await fs.writeFile(targetPath, buffer);

            uploadedUrls.push(`/company/${encodeURIComponent(uniqueFilename)}`);
        }

        if (uploadedUrls.length === 0) {
            return NextResponse.json({ success: false, error: 'No valid image files were processed.' }, { status: 400 });
        }

        const { logos: allLogos } = await getCompanyLogos();

        return NextResponse.json({
            success: true,
            uploadedUrls,
            allLogos,
            count: uploadedUrls.length
        });
    } catch (error) {
        console.error("API upload-logos error:", error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Internal server error during logo upload'
        }, { status: 500 });
    }
}
