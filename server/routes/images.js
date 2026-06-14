const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth, adminAuth } = require('../middleware/auth');
const router = express.Router();

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// Upload single image
router.post('/upload', auth, adminAuth, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image uploaded' });
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  res.status(201).json({
    message: 'Image uploaded',
    filename: req.file.filename,
    url: imageUrl,
    size: req.file.size,
    mimetype: req.file.mimetype
  });
});

// Bulk upload images
router.post('/upload/bulk', auth, adminAuth, upload.array('images', 20), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No images uploaded' });
  }

  const images = req.files.map(file => ({
    filename: file.filename,
    url: `/uploads/${file.filename}`,
    size: file.size,
    originalName: file.originalname
  }));

  res.status(201).json({
    message: `${images.length} images uploaded`,
    images
  });
});

// List all uploaded images
router.get('/', auth, adminAuth, (req, res) => {
  const uploadDir = path.join(__dirname, '..', 'uploads');
  
  if (!fs.existsSync(uploadDir)) {
    return res.json({ images: [] });
  }

  const files = fs.readdirSync(uploadDir)
    .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
    .map(f => {
      const stats = fs.statSync(path.join(uploadDir, f));
      return {
        filename: f,
        url: `/uploads/${f}`,
        size: stats.size,
        uploadedAt: stats.mtime
      };
    })
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

  res.json({ images: files, total: files.length });
});

// Delete image
router.delete('/:filename', auth, adminAuth, (req, res) => {
  const filepath = path.join(__dirname, '..', 'uploads', req.params.filename);
  
  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ message: 'Image not found' });
  }

  fs.unlinkSync(filepath);
  res.json({ message: 'Image deleted' });
});

// Error handler for multer
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum 5MB.' });
    }
    return res.status(400).json({ message: err.message });
  }
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
});

module.exports = router;
