export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => {
      reject(new Error('Failed to load image. Please ensure the file is a valid image format.'));
    });
    // Safari / WebKit bug fix: Setting crossOrigin on blob: or data: URLs causes a CORS failure.
    // Only set crossOrigin for remote http(s) URLs.
    if (typeof url === 'string' && !url.startsWith('blob:') && !url.startsWith('data:')) {
      image.setAttribute('crossOrigin', 'anonymous');
    }
    image.src = url;
  });

export function getRadianAngle(degreeValue) {
  return (degreeValue * Math.PI) / 180;
}

/**
 * Compresses an image client-side before uploading.
 * Ensures the image is under 5MB (usually 300KB-1.5MB), fits all screen resolutions,
 * and converts cleanly across all platforms (MacBook, Windows, phones).
 */
export async function compressImage(file, maxWidth = 1600, maxHeight = 1600, quality = 0.85) {
  if (!file || !file.type.startsWith('image/')) {
    throw new Error('Please select a valid image file');
  }

  const url = URL.createObjectURL(file);
  try {
    const img = await createImage(url);
    let { width, height } = img;

    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return file; // Fallback to original file
    }

    ctx.drawImage(img, 0, 0, width, height);

    return await new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const baseName = file.name ? file.name.replace(/\.[^/.]+$/, "") : "uploaded_photo";
          const compressedFile = new File([blob], `${baseName}.jpg`, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        },
        'image/jpeg',
        quality
      );
    });
  } catch (err) {
    console.warn('Image compression fallback to original:', err);
    return file;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default async function getCroppedImg(
  imageSrc,
  pixelCrop,
  rotation = 0,
  flip = { horizontal: false, vertical: false }
) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas context could not be created');
  }

  const rotRad = getRadianAngle(rotation);

  const bBoxWidth =
    Math.abs(Math.cos(rotRad) * image.width) + Math.abs(Math.sin(rotRad) * image.height);
  const bBoxHeight =
    Math.abs(Math.sin(rotRad) * image.width) + Math.abs(Math.cos(rotRad) * image.height);

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  // Safe fallback if pixelCrop is missing or null
  const cropX = pixelCrop?.x ?? 0;
  const cropY = pixelCrop?.y ?? 0;
  const cropWidth = pixelCrop?.width || canvas.width;
  const cropHeight = pixelCrop?.height || canvas.height;

  // Cap maximum dimensions (max 1600px) to maintain fast upload & prevent out-of-memory errors
  const maxDimension = 1600;
  let targetWidth = cropWidth;
  let targetHeight = cropHeight;

  if (targetWidth > maxDimension || targetHeight > maxDimension) {
    const ratio = Math.min(maxDimension / targetWidth, maxDimension / targetHeight);
    targetWidth = Math.round(targetWidth * ratio);
    targetHeight = Math.round(targetHeight * ratio);
  }

  const croppedCanvas = document.createElement('canvas');
  const croppedCtx = croppedCanvas.getContext('2d');

  if (!croppedCtx) {
    throw new Error('Cropped canvas context could not be created');
  }

  croppedCanvas.width = targetWidth;
  croppedCanvas.height = targetHeight;

  croppedCtx.drawImage(
    canvas,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    targetWidth,
    targetHeight
  );

  return new Promise((resolve, reject) => {
    croppedCanvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], 'cropped_image.jpg', {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(file);
        } else {
          reject(new Error('Canvas export failed'));
        }
      },
      'image/jpeg',
      0.85
    );
  });
}

