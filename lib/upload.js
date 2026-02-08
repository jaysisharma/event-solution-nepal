import { v2 as cloudinary } from 'cloudinary';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


export async function saveFile(file, folder) {
    if (!file || typeof file === 'string' || file.size === 0) return null;

    // Validate if it's a File object (has arrayBuffer)
    if (!file.arrayBuffer) return null;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Try Cloudinary if configured
    if ((process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY) && process.env.CLOUDINARY_API_SECRET) {
        try {
            return await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        folder: `event-solution-nepal/${folder}`,
                        resource_type: 'auto',
                    },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result.secure_url);
                    }
                ).end(buffer);
            });
        } catch (error) {
            console.warn("Cloudinary Upload Failed, falling back to local:", error);
        }
    }

    // Fallback: Local Storage (public/uploads/[folder])
    if (process.env.NODE_ENV === 'production') {
        console.error("Upload failed: Cloudinary upload failed and local storage is disabled in production.");
        return null;
    }

    try {
        const filename = `${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;

        // Use the 'folder' param if provided, otherwise default to root uploads
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder || '');

        // Ensure directory exists
        const { mkdir } = require('fs/promises');
        await mkdir(uploadDir, { recursive: true });

        const filepath = path.join(uploadDir, filename);

        await writeFile(filepath, buffer);

        // Return relative path for public access
        return `/uploads/${folder ? folder + '/' : ''}${filename}`;
    } catch (e) {
        console.error("Local Save Error:", e);
        return null;
    }
}

export async function deleteFile(fileUrl) {
    if (!fileUrl) return;

    try {
        // Check if it's a Cloudinary URL
        if (fileUrl.includes('cloudinary.com')) {
            // Extract Public ID
            // URL format: https://res.cloudinary.com/[cloud_name]/image/upload/v[version]/[folder]/[id].[ext]
            // We need [folder]/[id] (without extension)

            const urlParts = fileUrl.split('/');
            const versionIndex = urlParts.findIndex(part => part.startsWith('v') && !isNaN(part.substring(1))); // find 'v123456'

            if (versionIndex !== -1) {
                const publicIdWithExt = urlParts.slice(versionIndex + 1).join('/');
                const publicId = publicIdWithExt.split('.')[0]; // Remove extension

                // Cloudinary config is already set at the top
                await cloudinary.uploader.destroy(publicId);
                console.log(`Deleted from Cloudinary: ${publicId}`);
            }
        } else {
            // Local file
            // URL format: /uploads/[folder]/[filename]
            // File path: public/uploads/[folder]/[filename]
            const filePath = path.join(process.cwd(), 'public', fileUrl); // fileUrl starts with /
            await unlink(filePath);
            console.log(`Deleted local file: ${filePath}`);
        }
    } catch (error) {
        console.warn(`Failed to delete file ${fileUrl}:`, error.message);
        // We don't throw here to avoid blocking the main deletion flow
    }
}
