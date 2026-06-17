const express = require('express');
const multer = require('multer');
const { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');
const { auth, adminAuth } = require('../middleware/auth');
const router = express.Router();

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'eu-west-2',
  credentials: process.env.AWS_ACCESS_KEY_ID ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  } : undefined // Uses instance role if no keys
});

const BUCKET = process.env.S3_BUCKET || 'creamychills-assets';
const CDN_URL = process.env.CDN_URL || `https://${BUCKET}.s3.eu-west-2.amazonaws.com`;

// Multer memory storage (file stays in memory, goes straight to S3)
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Upload single image to S3
router.post('/upload', auth, adminAuth, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No image uploaded' });

  try {
    const ext = path.extname(req.file.originalname);
    const key = `products/${Date.now()}-${Math.round(Math.random() * 1E6)}${ext}`;

    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    }));

    const url = `${CDN_URL}/${key}`;
    res.status(201).json({ message: 'Image uploaded', url, key, size: req.file.size });
  } catch (error) {
    console.error('S3 upload error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// Bulk upload
router.post('/upload/bulk', auth, adminAuth, upload.array('images', 20), async (req, res) => {
  if (!req.files?.length) return res.status(400).json({ message: 'No images uploaded' });

  try {
    const images = [];
    for (const file of req.files) {
      const ext = path.extname(file.originalname);
      const key = `products/${Date.now()}-${Math.round(Math.random() * 1E6)}${ext}`;

      await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype
      }));

      images.push({ url: `${CDN_URL}/${key}`, key, originalName: file.originalname, size: file.size });
    }

    res.status(201).json({ message: `${images.length} images uploaded`, images });
  } catch (error) {
    console.error('S3 bulk upload error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// List images from S3
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const response = await s3.send(new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: 'products/',
      MaxKeys: 200
    }));

    const images = (response.Contents || [])
      .filter(obj => /\.(jpg|jpeg|png|webp)$/i.test(obj.Key))
      .map(obj => ({
        key: obj.Key,
        url: `${CDN_URL}/${obj.Key}`,
        filename: obj.Key.split('/').pop(),
        size: obj.Size,
        uploadedAt: obj.LastModified
      }))
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    res.json({ images, total: images.length });
  } catch (error) {
    console.error('S3 list error:', error);
    res.json({ images: [], total: 0 });
  }
});

// Delete image from S3
router.delete('/:key(*)', auth, adminAuth, async (req, res) => {
  try {
    await s3.send(new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: req.params.key
    }));
    res.json({ message: 'Image deleted' });
  } catch (error) {
    console.error('S3 delete error:', error);
    res.status(500).json({ message: 'Delete failed' });
  }
});

module.exports = router;
