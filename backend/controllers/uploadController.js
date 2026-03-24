import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const uploadsDir = path.join(process.cwd(), 'uploads');
const cacheDir = path.join(uploadsDir, '.cache');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename(req, file, cb) {
    cb(null, `img_${Date.now()}_${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mime = allowedTypes.test(file.mimetype);
  if (ext && mime) return cb(null, true);
  cb(new Error('Only images (jpeg, jpg, png, webp) are allowed'));
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_FILE_SIZE } });

const THUMBNAIL_SIZES = [200, 400, 600, 800];

const generateThumbnail = async (filePath, filename) => {
  for (const width of THUMBNAIL_SIZES) {
    const cachePath = path.join(cacheDir, `${filename}-${width}.webp`);
    if (!fs.existsSync(cachePath)) {
      await sharp(filePath)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 75 })
        .toFile(cachePath);
    }
  }
};

export const uploadImages = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }
  
  for (const file of req.files) {
    generateThumbnail(file.path, file.filename).catch(console.error);
  }
  
  const urls = req.files.map(f => `/uploads/${f.filename}`);
  res.json({ urls });
};
