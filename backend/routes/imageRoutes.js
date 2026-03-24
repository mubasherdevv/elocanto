import express from 'express';
import { getResizedImage, getProxyImage } from '../controllers/imageController.js';

const router = express.Router();

router.get('/proxy', getProxyImage);
router.get('/:filename', getResizedImage);

export default router;

