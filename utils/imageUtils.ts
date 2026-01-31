/**
 * Sanitizes a string to be safe for filenames.
 * Replaces non-alphanumeric characters with underscores, but keeps standard ASCII safe chars.
 */
export const sanitizeFilename = (text: string): string => {
  if (!text) return 'untitled';
  return text
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars except whitespace, underscore, hyphen
    .replace(/\s+/g, '_')     // Replace spaces with underscores
    .substring(0, 50);        // Limit length
};

/**
 * Compresses a Base64 image string to be under a specific size in MB.
 * Converts to JPEG to ensure efficient compression.
 */
export const compressImage = (base64Str: string, targetSizeMB: number = 2): Promise<{ data: string, extension: string }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context unavailable'));
        return;
      }
      // Draw white background for transparency (since we convert to JPEG)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      // Helper to calculate approximate size in MB
      const getSizeInMB = (url: string) => {
        const base64Length = url.length - (url.indexOf(',') + 1);
        const padding = (url.charAt(url.length - 1) === '=') ? 
          (url.charAt(url.length - 2) === '=' ? 2 : 1) : 0;
        return (base64Length * 0.75 - padding) / (1024 * 1024);
      };

      // Start with high quality JPEG
      let quality = 0.95;
      let dataUrl = canvas.toDataURL('image/jpeg', quality);
      
      // Reduce quality loop
      while (getSizeInMB(dataUrl) > targetSizeMB && quality > 0.1) {
        quality -= 0.1;
        dataUrl = canvas.toDataURL('image/jpeg', quality);
      }

      // If still too large after quality reduction, scale down (rare for 2MB limit but possible)
      if (getSizeInMB(dataUrl) > targetSizeMB) {
          const scale = 0.7;
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctxScaled = canvas.getContext('2d');
          if (ctxScaled) {
             ctxScaled.fillStyle = '#FFFFFF';
             ctxScaled.fillRect(0, 0, canvas.width, canvas.height);
             ctxScaled.drawImage(img, 0, 0, canvas.width, canvas.height);
             dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          }
      }

      resolve({ data: dataUrl, extension: 'jpg' });
    };
    img.onerror = (e) => reject(e);
  });
};