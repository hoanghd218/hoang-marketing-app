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

/**
 * Applies a watermark to an image using Canvas (no AI).
 */
export interface WatermarkOptions {
  text: string;
  position: 'auto' | 'bottom_right' | 'bottom_left' | 'top_right' | 'top_left' | 'center' | 'edge' | 'tile_grid' | 'tile_brick';
  opacity: number; // 0-1
  fontSize: number; // in pixels
  color: 'white' | 'black' | 'adaptive';
  type: 'subtle_text' | 'signature' | 'pattern';
  rotation?: number;
}

export const applyWatermarkCanvas = (
  base64Str: string,
  options: WatermarkOptions
): Promise<string> => {
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

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // --- SIZE & BOUNDARY LOGIC ---
      let fontSize = options.fontSize; // In pixels

      // Determine text color
      let textColor = 'rgba(255, 255, 255, ' + options.opacity + ')';
      if (options.color === 'black') {
        textColor = 'rgba(0, 0, 0, ' + options.opacity + ')';
      } else if (options.color === 'adaptive') {
        // Sample center pixel to determine if light or dark
        const sampleData = ctx.getImageData(img.width / 2, img.height / 2, 1, 1).data;
        const brightness = (sampleData[0] + sampleData[1] + sampleData[2]) / 3;
        textColor = brightness > 128
          ? 'rgba(0, 0, 0, ' + options.opacity + ')'
          : 'rgba(255, 255, 255, ' + options.opacity + ')';
      }

      // Set font style based on type
      const fontFamily = options.type === 'signature'
        ? '"Brush Script MT", cursive, sans-serif'
        : '"Inter", "Segoe UI", Arial, sans-serif';

      ctx.font = `${fontSize}px ${fontFamily}`;

      let textMetrics = ctx.measureText(options.text);
      let textWidth = textMetrics.width;
      let textHeight = fontSize;
      const padding = img.width * 0.03; // 3% padding from edges

      // Boundary check: Ensure text is not wider than image (minus padding)
      const maxTextWidth = img.width - (padding * 2);
      if (textWidth > maxTextWidth) {
        // Scale down font to fit
        const scaleFactor = maxTextWidth / textWidth;
        fontSize = Math.floor(fontSize * scaleFactor);
        // Update metrics
        ctx.font = `${fontSize}px ${fontFamily}`;
        textMetrics = ctx.measureText(options.text);
        textWidth = textMetrics.width;
        textHeight = fontSize;
      }


      ctx.fillStyle = textColor;
      ctx.textBaseline = 'middle';

      // Add subtle shadow for visibility
      ctx.shadowColor = options.color === 'white' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)';
      ctx.shadowBlur = 2;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      // Check if it's any pattern type
      const isPattern = options.type === 'pattern' ||
        options.position === 'tile_grid' ||
        options.position === 'tile_brick';

      if (isPattern) {
        ctx.save();
        ctx.globalAlpha = options.opacity;
        const rotation = (options.rotation || 0) * Math.PI / 180;

        // Define spacing
        // For tile_grid and tile_brick, we use user rotation.
        // For legacy 'pattern' type (which is diagonal), we force -15 deg if not set.
        let appliedRotation = rotation;
        if (options.type === 'pattern' && options.rotation === 0) {
          appliedRotation = -15 * Math.PI / 180;
        }

        const spacingX = textWidth * 1.5; // Horizontal gap
        const spacingY = textHeight * 3.5; // Vertical gap

        // Render loop
        for (let y = -img.height; y < img.height * 2; y += spacingY) {
          let row = 0;
          for (let x = -img.width; x < img.width * 2; x += spacingX) {
            ctx.save();

            // Calculate base position
            let drawX = x;
            let drawY = y;

            // Apply Brick Offset (Sole)
            if (options.position === 'tile_brick' && (row % 2 !== 0)) {
              drawX += spacingX / 2;
            }

            // Move to position, rotate, draw, restore
            ctx.translate(drawX, drawY);
            ctx.rotate(appliedRotation);
            ctx.fillText(options.text, 0, 0);

            ctx.restore();
            row++;
          }
        }
        ctx.restore();
      } else {
        // Single watermark based on position
        let x: number, y: number;

        // Apply rotation for single watermark if specified
        ctx.save();
        if (options.rotation) {
          // Center rotation point logic would be needed for perfect rotation, 
          // but for single corner watermarks, we usually rotate around the anchor point.
          // For simplicity in this implementation, we'll keep single watermarks unrotated 
          // unless explicitly requested, or rotate around the text center.
        }

        switch (options.position) {
          case 'top_left':
            x = padding;
            y = padding + textHeight / 2;
            ctx.textAlign = 'left';
            break;
          case 'top_right':
            x = img.width - padding;
            y = padding + textHeight / 2;
            ctx.textAlign = 'right';
            break;
          case 'bottom_left':
            x = padding;
            y = img.height - padding - textHeight / 2;
            ctx.textAlign = 'left';
            break;
          case 'center':
            x = img.width / 2;
            y = img.height / 2;
            ctx.textAlign = 'center';
            break;
          case 'edge':
            // Center Bottom Edge
            x = img.width / 2;
            y = img.height - padding - textHeight / 2;
            ctx.textAlign = 'center';
            break;
          case 'bottom_right':
          case 'auto':
          default:
            x = img.width - padding;
            y = img.height - padding - textHeight / 2;
            ctx.textAlign = 'right';
            break;
        }

        if (options.rotation) {
          const rotationRad = options.rotation * Math.PI / 180;
          ctx.translate(x, y);
          ctx.rotate(rotationRad);
          ctx.fillText(options.text, 0, 0);
        } else {
          ctx.fillText(options.text, x, y);
        }
        ctx.restore();
      }

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = (e) => reject(e);
  });
};