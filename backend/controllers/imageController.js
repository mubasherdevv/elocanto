import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const CACHE_DIR = path.join(process.cwd(), 'uploads', '.cache');

const ensureCacheDir = () => {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
};

const getCachePath = (filename, width) => {
  const ext = '.webp';
  const w = width || 'original';
  return path.join(CACHE_DIR, `${filename}-${w}${ext}`);
};

const isCached = (cachePath) => fs.existsSync(cachePath);

export const getResizedImage = async (req, res) => {
  try {
    const { filename } = req.params;
    const { w } = req.query;
    const width = parseInt(w) || null;

    const uploadsDir = path.join(process.cwd(), 'uploads');
    const filePath = path.join(uploadsDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Image not found' });
    }

    ensureCacheDir();
    const cachePath = getCachePath(filename, width);

    if (isCached(cachePath)) {
      res.set('Content-Type', 'image/webp');
      res.set('Cache-Control', 'public, max-age=2592000, immutable');
      return res.sendFile(cachePath);
    }

    let transform = sharp(filePath);

    if (width) {
      transform = transform.resize({ width, withoutEnlargement: true });
    }

    transform = transform.webp({ quality: 75 });

    const buffer = await transform.toBuffer();

    fs.writeFileSync(cachePath, buffer);

    res.set('Content-Type', 'image/webp');
    res.set('Cache-Control', 'public, max-age=2592000, immutable');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
