const MAX_IMAGE_SIZE_MB = 0.2;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const validateBase64Image = (base64String) => {
  if (!base64String || typeof base64String !== 'string') {
    return { valid: false, error: 'No se proporcionó una imagen' };
  }

  const matches = base64String.match(/^data:image\/(jpeg|png|webp);base64,(.+)$/);
  
  if (!matches) {
    try {
      const buffer = Buffer.from(base64String, 'base64');
      if (buffer.length > MAX_IMAGE_SIZE_BYTES) {
        return { 
          valid: false, 
          error: `La imagen excede el tamaño máximo de ${MAX_IMAGE_SIZE_MB} MB` 
        };
      }
      return {
        valid: true,
        mimeType: 'image/jpeg',
        cleanBase64: base64String,
        sizeBytes: buffer.length
      };
    } catch (e) {
      return { valid: false, error: 'Formato de imagen no válido' };
    }
  }

  const mimeType = matches[1];
  const cleanBase64 = matches[2];

  if (!ALLOWED_MIME_TYPES.includes(`image/${mimeType}`)) {
    return { 
      valid: false, 
      error: `Tipo de imagen no permitido. Permitidos: ${ALLOWED_MIME_TYPES.join(', ')}` 
    };
  }

  const approximateSizeBytes = Buffer.byteLength(cleanBase64, 'base64');
  
  if (approximateSizeBytes > MAX_IMAGE_SIZE_BYTES) {
    return { 
      valid: false, 
      error: `La imagen excede el tamaño máximo de ${MAX_IMAGE_SIZE_MB} MB` 
    };
  }

  return {
    valid: true,
    mimeType: `image/${mimeType}`,
    cleanBase64: cleanBase64,
    sizeBytes: approximateSizeBytes
  };
};

const validateImageVariables = (data) => {
  const errors = [];
  
  for (const [key, value] of Object.entries(data)) {
    const keyLower = key.toLowerCase();
    if (keyLower.includes('img') || keyLower.includes('foto') || keyLower.includes('logo') || keyLower.includes('avatar')) {
      if (value && typeof value === 'string' && value.length > 100) {
        const validation = validateBase64Image(value);
        if (!validation.valid) {
          errors.push({ variable: key, error: validation.error });
        }
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateBase64Image,
  validateImageVariables,
  MAX_IMAGE_SIZE_MB,
  ALLOWED_MIME_TYPES
};