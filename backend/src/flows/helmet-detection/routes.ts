import { Router, NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { helmetDetectionController } from './controller';

export const helmetDetectionRouter = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
    }
  },
});

// Routes
helmetDetectionRouter.post(
  '/upload',
  upload.single('image'),
  helmetDetectionController.uploadImage
);
helmetDetectionRouter.get('/images', helmetDetectionController.getAllImages);
helmetDetectionRouter.get('/images/:id', helmetDetectionController.getImageById);
helmetDetectionRouter.get('/stats', helmetDetectionController.getImageStats);

// Handle multer errors
helmetDetectionRouter.use((error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        error: 'File size too large. Maximum size is 10MB.',
      });
      return;
    }
  }

  if (error.message && error.message.includes('Invalid file type')) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
    return;
  }

  next(error);
});
