import imageCompression from 'browser-image-compression';

/**
 * Compresses an image file to be under 100KB.
 * @param {File} file - The image file to compress.
 * @returns {Promise<File>} - The compressed file.
 */
export async function compressImage(file) {
    if (!file) return file;
    // If already small, return original
    if (file.size / 1024 < 100) return file;

    const options = {
        maxSizeMB: 0.1, // 100KB
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/jpeg'
    };

    try {
        const compressedFile = await imageCompression(file, options);
        // Ensure the returned file has the correct name if needed, though browser-image-compression usually handles this.
        return compressedFile;
    } catch (error) {
        console.error("Compression failed:", error);
        // Fallback to original if compression fails, or re-throw
        return file;
    }
}
