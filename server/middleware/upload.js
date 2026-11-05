import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
const uploadDir = path.join(__dirname, '..', 'uploads');
const thumbDir = path.join(uploadDir, 'thumbnails');
const blurDir = path.join(uploadDir, 'blurred');

[uploadDir, thumbDir, blurDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure Multer storage in memory for sharp pipeline
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/quicktime',
    'video/webm',
    'application/pdf'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: Images, MP4/WebM videos, and PDF scripts.`), false);
  }
};

// 15MB hard constraint to ensure zero lag and fast response
export const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15 Megabytes
  },
  fileFilter
});

/**
 * Image Optimization & Privacy Blurring Pipeline
 * Automatically optimizes file sizes and produces blurred versions for data masking
 */
export const optimizeMedia = async (file, isAvatar = false) => {
  if (!file) return null;

  const timestamp = Date.now();
  const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
  const baseFilename = `${timestamp}-${path.parse(safeName).name}`;

  // If it's an image, run through sharp for compression & responsive thumbs
  if (file.mimetype.startsWith('image/')) {
    const optimizedFilename = `${baseFilename}-opt.webp`;
    const optimizedPath = path.join(uploadDir, optimizedFilename);
    const thumbnailFilename = `${baseFilename}-thumb.webp`;
    const thumbnailPath = path.join(thumbDir, thumbnailFilename);
    const blurredFilename = `${baseFilename}-blur.webp`;
    const blurredPath = path.join(blurDir, blurredFilename);

    // 1. Optimized Main (Max 1280px width, WebP 82% quality for lightweight high-clarity)
    await sharp(file.buffer)
      .resize({ width: 1280, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(optimizedPath);

    // 2. Fast Dashboard Thumbnail (Max 360px width, WebP 75% quality for instantaneous rendering)
    await sharp(file.buffer)
      .resize({ width: 360, withoutEnlargement: true })
      .webp({ quality: 75 })
      .toFile(thumbnailPath);

    // 3. Privacy Mask: Blurred version for masked display (blur 25px)
    await sharp(file.buffer)
      .resize({ width: 360, withoutEnlargement: true })
      .blur(25)
      .webp({ quality: 60 })
      .toFile(blurredPath);

    return {
      url: `/uploads/${optimizedFilename}`,
      thumbnail: `/uploads/thumbnails/${thumbnailFilename}`,
      blurred: `/uploads/blurred/${blurredFilename}`,
      mimetype: 'image/webp'
    };
  }

  // For non-images (videos, PDFs), write to disk with safe size
  const filename = `${baseFilename}${path.extname(file.originalname)}`;
  const diskPath = path.join(uploadDir, filename);
  await fs.promises.writeFile(diskPath, file.buffer);

  return {
    url: `/uploads/${filename}`,
    thumbnail: file.mimetype.startsWith('video/')
      ? 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=360&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=360&auto=format&fit=crop&q=80',
    blurred: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=360&auto=format&fit=crop&q=20&blur=20',
    mimetype: file.mimetype
  };
};

