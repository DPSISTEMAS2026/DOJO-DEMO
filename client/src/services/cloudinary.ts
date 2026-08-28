/**
 * Service to upload images directly to Cloudinary or via backend endpoint
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

export async function uploadImageToCloudinary(fileOrBase64: File | string, folder: string = 'dojo_app'): Promise<string> {
  // If Cloudinary client env vars are present, upload directly to Cloudinary REST API
  if (CLOUD_NAME && UPLOAD_PRESET) {
    try {
      const formData = new FormData();
      formData.append('file', fileOrBase64);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('folder', folder);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || 'Error uploading to Cloudinary');
      }

      const data = await res.json();
      if (data.secure_url) {
        return data.secure_url;
      }
    } catch (err: any) {
      console.warn('[Cloudinary Direct Upload Failed, falling back to backend]:', err.message);
    }
  }

  // Fallback to Backend Upload endpoint
  try {
    const res = await fetch(`${API_URL}/api/upload-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: fileOrBase64, folder })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.url) return data.url;
    }
  } catch (backendErr: any) {
    console.error('[Backend Upload Failed]:', backendErr.message);
  }

  // If base64 string and all uploads fail, return original base64 to avoid breaking
  if (typeof fileOrBase64 === 'string') {
    return fileOrBase64;
  }
  throw new Error('No se pudo subir la imagen a Cloudinary ni al servidor.');
}
