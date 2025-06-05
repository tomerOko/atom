import { Request, Response } from 'express';
import { appLogger, LogAllMethods } from '../../packages/logger';
import { validateSchema } from '../../utils/validate-schema';
import { helmetDetectionService } from './service';
import {
  uploadImageResponseSchema,
  getImagesRequestSchema,
  getImagesResponseSchema,
  getImageByIdRequestSchema,
  getImageByIdResponseSchema,
  imageStatsResponseSchema,
} from './validations';

@LogAllMethods()
class HelmetDetectionController {
  public uploadImage = async (req: Request, res: Response): Promise<void> => {
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

      const responseData = await helmetDetectionService.uploadImage(req.file);
      const response = validateSchema(uploadImageResponseSchema, responseData);

      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      appLogger.error('Error in upload image', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to upload image',
      });
    }
  };

  public getAllImages = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const requestPayload = validateSchema(getImagesRequestSchema, { limit, offset });

      // Validate pagination parameters
      if (requestPayload.limit < 1 || requestPayload.limit > 100) {
        res.status(400).json({
          success: false,
          error: 'Limit must be between 1 and 100',
        });
        return;
      }

      if (requestPayload.offset < 0) {
        res.status(400).json({
          success: false,
          error: 'Offset must be non-negative',
        });
        return;
      }

      const responseData = await helmetDetectionService.getAllImages(
        requestPayload.limit,
        requestPayload.offset
      );
      const response = validateSchema(getImagesResponseSchema, responseData);

      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      appLogger.error('Error in get all images', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve images',
      });
    }
  };

  public getImageById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const requestPayload = validateSchema(getImageByIdRequestSchema, { id });

      const responseData = await helmetDetectionService.getImageById(requestPayload.id);
      const response = validateSchema(getImageByIdResponseSchema, responseData);

      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Image not found') {
        res.status(404).json({
          success: false,
          error: 'Image not found',
        });
        return;
      }

      appLogger.error('Error in get image by id', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve image details',
      });
    }
  };

  public getImageStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const responseData = await helmetDetectionService.getImageStats();
      const response = validateSchema(imageStatsResponseSchema, responseData);

      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      appLogger.error('Error in get image stats', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve statistics',
      });
    }
  };
}

export const helmetDetectionController = new HelmetDetectionController();
