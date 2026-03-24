import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

export const getResizedImage = async (req, res) => {
  try {
    const { filename } = req.params;
    const { w, format } = req.query; // width, format
    const width = parseInt(w) || null;

    const uploadsDir = path.join(process.cwd(), 'uploads');
    const filePath = path.join(uploadsDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Image not found' });
    }

    let transform = sharp(filePath);

    if (width) {
      transform = transform.resize({ width, withoutEnlargement: true });
    }

    if (format === 'avif') {
      transform = transform.avif({ quality: 65 });
      res.set('Content-Type', 'image/avif');
    } else {
      transform = transform.webp({ quality: 75 });
      res.set('Content-Type', 'image/webp');
    }
    res.set('Cache-Control', 'public, max-age=2592000, immutable'); // 30 days cache

    transform.pipe(res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
