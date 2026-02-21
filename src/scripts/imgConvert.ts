/**
 * Converts an image File to WebP using the browser's Canvas API.
 * - Free, zero dependencies, runs entirely client-side before upload.
 * - Resizes to maxWidth if the image is wider (preserves aspect ratio).
 * - SVG and already-WebP files are returned unchanged.
 * - Falls back to original file if conversion fails (e.g., unsupported format).
 */
export async function toWebP(file: File, maxWidth = 1920, quality = 0.85): Promise<File> {
  if (file.type === 'image/svg+xml' || file.type === 'image/webp') return file;

  try {
    return await new Promise<File>((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        let w = img.naturalWidth;
        let h = img.naturalHeight;

        if (w > maxWidth) {
          h = Math.round((h * maxWidth) / w);
          w = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            if (!blob) { reject(new Error('toBlob failed')); return; }
            const name = file.name.replace(/\.[^.]+$/, '') + '.webp';
            resolve(new File([blob], name, { type: 'image/webp' }));
          },
          'image/webp',
          quality,
        );
      };

      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('load failed')); };
      img.src = url;
    });
  } catch {
    return file; // fallback to original on any error
  }
}
