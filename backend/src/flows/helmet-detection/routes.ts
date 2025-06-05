import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { helmetDetectionService } from './service';
import { appLogger } from '../../packages/logger';

const router = Router();

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

// POST /api/helmet-detection/upload - Upload image for helmet detection
router.post('/upload', upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'No image file provided',
      });
      return;
    }

    // Validate file
    const validation = helmetDetectionService.validateImageFile(req.file);
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        error: validation.error,
      });
      return;
    }

    const result = await helmetDetectionService.uploadImage(req.file);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    appLogger.error('Error in upload endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload image',
    });
  }
});

// GET /api/helmet-detection/images - List all images with pagination
router.get('/images', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    // Validate pagination parameters
    if (limit < 1 || limit > 100) {
      res.status(400).json({
        success: false,
        error: 'Limit must be between 1 and 100',
      });
      return;
    }

    if (offset < 0) {
      res.status(400).json({
        success: false,
        error: 'Offset must be non-negative',
      });
      return;
    }

    const result = await helmetDetectionService.getAllImages(limit, offset);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    appLogger.error('Error in list images endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve images',
    });
  }
});

// GET /api/helmet-detection/images/:id - Get specific image details with URLs
router.get('/images/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || id.length !== 24) {
      res.status(400).json({
        success: false,
        error: 'Invalid image ID format',
      });
      return;
    }

    const result = await helmetDetectionService.getImageById(id);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Image not found') {
      res.status(404).json({
        success: false,
        error: 'Image not found',
      });
      return;
    }

    appLogger.error('Error in get image endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve image details',
    });
  }
});

// GET /api/helmet-detection/stats - Get processing statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await helmetDetectionService.getImageStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    appLogger.error('Error in stats endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve statistics',
    });
  }
});

// Handle multer errors
router.use((error: any, req: Request, res: Response, next: NextFunction) => {
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

export { router as helmetDetectionRouter };
