import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { MinioUtils } from '../../packages/minio';
import { appLogger, LogAllMethods } from '../../packages/logger';
import { helmetDetectionMongoDAL, helmetDetectionRabbitMQDAL } from './dal';
import {
  ImageRecord,
  ProcessingRequestEvent,
  ProcessingResultEvent,
  GetImagesResponse,
  GetImageByIdResponse,
  ImageStatsResponse,
  UploadImageResponse,
} from './validations';

@LogAllMethods()
class HelmetDetectionService {
  public async uploadImage(file: Express.Multer.File): Promise<UploadImageResponse> {
    try {
      // Generate unique filename
      const fileExtension = path.extname(file.originalname);
      const filename = `${uuidv4()}${fileExtension}`;

      // Upload to MinIO
      await MinioUtils.uploadObject('helmet-detection', filename, file.buffer);
      appLogger.info(`Uploaded image to MinIO: ${filename}`);

      // Create database record
      const imageRecord: Omit<ImageRecord, '_id'> = {
        filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        uploadedAt: new Date(),
        processingStatus: 'pending',
        error: null,
      };

      const imageId = await helmetDetectionMongoDAL.createImageRecord(imageRecord);

      // Publish processing request
      const processingMessage: ProcessingRequestEvent = {
        image_id: imageId,
        image_filename: filename,
        timestamp: new Date().toISOString(),
      };

      await helmetDetectionRabbitMQDAL.publishProcessingRequest(processingMessage);

      // Update status to processing
      await helmetDetectionMongoDAL.updateProcessingStatus(imageId, 'processing');

      appLogger.info(`Image upload and processing request completed for: ${filename}`);

      return {
        imageId,
        message: 'Image uploaded successfully and processing started',
      };
    } catch (error) {
      appLogger.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  }

  public async getAllImages(limit: number = 50, offset: number = 0): Promise<GetImagesResponse> {
    try {
      const result = await helmetDetectionMongoDAL.getAllImageRecords(limit, offset);

      // Generate simple public URLs for each image instead of signed URLs
      const imagesWithThumbnails = result.images.map(image => {
        const thumbnailUrl = `http://localhost:9000/helmet-detection/${image.filename}`;
        return {
          ...image,
          thumbnailUrl,
        };
      });

      return {
        images: imagesWithThumbnails,
        total: result.total,
      };
    } catch (error) {
      appLogger.error('Error getting all images:', error);
      throw new Error('Failed to retrieve images');
    }
  }

  public async getImageById(id: string): Promise<GetImageByIdResponse> {
    try {
      const image = await helmetDetectionMongoDAL.getImageRecord(id);

      if (!image) {
        throw new Error('Image not found');
      }

      // Generate simple public URLs instead of signed URLs
      const originalImageUrl = `http://localhost:9000/helmet-detection/${image.filename}`;
      let annotatedImageUrl: string | undefined;

      if (image.annotatedFilename) {
        annotatedImageUrl = `http://localhost:9000/helmet-detection/${image.annotatedFilename}`;
      }

      return {
        image,
        originalImageUrl,
        annotatedImageUrl,
      };
    } catch (error) {
      appLogger.error('Error getting image by ID:', error);
      throw error;
    }
  }

  public async handleProcessingResult(result: ProcessingResultEvent): Promise<void> {
    try {
      await helmetDetectionMongoDAL.updateImageProcessingResult(result.image_id, result);
      appLogger.info(`Processed result for image: ${result.image_filename}`);
    } catch (error) {
      appLogger.error('Error handling processing result:', error);
      throw error;
    }
  }

  public async getImageStats(): Promise<ImageStatsResponse> {
    try {
      // Get all images to calculate stats
      // In a real production system, you'd want to use aggregation queries for better performance
      const allImages = await helmetDetectionMongoDAL.getAllImageRecords(1000, 0);

      const stats = {
        total: allImages.total,
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        totalPeople: 0,
        totalCompliant: 0,
        complianceRate: 0,
      };

      allImages.images.forEach(image => {
        switch (image.processingStatus) {
          case 'pending':
            stats.pending++;
            break;
          case 'processing':
            stats.processing++;
            break;
          case 'completed':
            stats.completed++;
            if (image.totalPeople) {
              stats.totalPeople += image.totalPeople;
            }
            if (image.peopleWithHelmets) {
              stats.totalCompliant += image.peopleWithHelmets;
            }
            break;
          case 'failed':
            stats.failed++;
            break;
        }
      });

      if (stats.totalPeople > 0) {
        stats.complianceRate = stats.totalCompliant / stats.totalPeople;
      }

      return stats;
    } catch (error) {
      appLogger.error('Error getting image stats:', error);
      throw new Error('Failed to retrieve image statistics');
    }
  }

  public validateImageFile(file: Express.Multer.File): { isValid: boolean; error?: string } {
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { isValid: false, error: 'File size must be less than 10MB' };
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return { isValid: false, error: 'File must be a JPEG, PNG, or WebP image' };
    }

    return { isValid: true };
  }
}

export const helmetDetectionService = new HelmetDetectionService();
