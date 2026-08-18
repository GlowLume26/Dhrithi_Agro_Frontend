// Compress any image to WebP (max 800px, quality 0.75) using Canvas
// Then upload to Cloudinary unsigned — no server storage needed
// Free tier: 25GB storage, 25GB bandwidth/month

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Compress a File to WebP using Canvas
 * @param {File} file
 * @param {number} maxPx  - max width/height in pixels (default 800)
 * @param {number} quality - 0 to 1 (default 0.75)
 * @returns {Promise<Blob>}
 */
export function compressToWebP(file, maxPx = 800, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxPx || height > maxPx) {
        if (width > height) { height = Math.round((height * maxPx) / width); width = maxPx; }
        else                { width  = Math.round((width  * maxPx) / height); height = maxPx; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Compression failed')), 'image/webp', quality);
    };
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = url;
  });
}

/**
 * Upload a file to Cloudinary (unsigned)
 * @param {File|Blob} file
 * @param {string} folder - e.g. 'products', 'categories'
 * @returns {Promise<string>} - secure_url
 */
export async function uploadToCloudinary(file, folder = 'products') {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Cloudinary not configured. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to .env');
  }
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', UPLOAD_PRESET);
  fd.append('folder', `drithi-agro/${folder}`);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: fd,
  });
  if (!res.ok) throw new Error('Cloudinary upload failed');
  const data = await res.json();
  return data.secure_url;
}

/**
 * Compress + upload in one call
 * @param {File} file
 * @param {string} folder
 * @returns {Promise<string>} - Cloudinary URL
 */
export async function compressAndUpload(file, folder = 'products') {
  const compressed = await compressToWebP(file);
  return uploadToCloudinary(compressed, folder);
}
