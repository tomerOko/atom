import { z } from 'zod';

// HTTP Request/Response Schemas
export const uploadImageResponseSchema = z.object({
  imageId: z.string(),
  message: z.string(),
});
export type UploadImageResponse = z.infer<typeof uploadImageResponseSchema>;

export const getImagesRequestSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(50),
  offset: z.number().min(0).optional().default(0),
});
export type GetImagesRequest = z.infer<typeof getImagesRequestSchema>;

export const getImageByIdRequestSchema = z.object({
  id: z.string().length(24), // MongoDB ObjectId length
});
export type GetImageByIdRequest = z.infer<typeof getImageByIdRequestSchema>;

export const getImagesResponseSchema = z.object({
  images: z.array(
    z.object({
      _id: z.string().optional(),
      filename: z.string(),
      originalName: z.string(),
      mimeType: z.string(),
      size: z.number(),
      uploadedAt: z.date(),
      processingStatus: z.enum(['pending', 'processing', 'completed', 'failed']),
      annotatedFilename: z.string().optional(),
      totalPeople: z.number().optional(),
      peopleWithHelmets: z.number().optional(),
      complianceRate: z.number().optional(),
      detections: z
        .array(
          z.object({
            bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]),
            confidence: z.number(),
            hasHelmet: z.boolean(),
            helmetConfidence: z.number(),
            status: z.enum(['wearing_helmet', 'no_helmet']),
          })
        )
        .optional(),
      error: z.string().optional(),
      processedAt: z.date().optional(),
    })
  ),
  total: z.number(),
});
export type GetImagesResponse = z.infer<typeof getImagesResponseSchema>;

export const getImageByIdResponseSchema = z.object({
  image: z.object({
    _id: z.string().optional(),
    filename: z.string(),
    originalName: z.string(),
    mimeType: z.string(),
    size: z.number(),
    uploadedAt: z.date(),
    processingStatus: z.enum(['pending', 'processing', 'completed', 'failed']),
    annotatedFilename: z.string().optional(),
    totalPeople: z.number().optional(),
    peopleWithHelmets: z.number().optional(),
    complianceRate: z.number().optional(),
    detections: z
      .array(
        z.object({
          bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]),
          confidence: z.number(),
          hasHelmet: z.boolean(),
          helmetConfidence: z.number(),
          status: z.enum(['wearing_helmet', 'no_helmet']),
        })
      )
      .optional(),
    error: z.string().optional(),
    processedAt: z.date().optional(),
  }),
  originalImageUrl: z.string().optional(),
  annotatedImageUrl: z.string().optional(),
});
export type GetImageByIdResponse = z.infer<typeof getImageByIdResponseSchema>;

export const imageStatsResponseSchema = z.object({
  total: z.number(),
  pending: z.number(),
  processing: z.number(),
  completed: z.number(),
  failed: z.number(),
  totalPeople: z.number(),
  totalCompliant: z.number(),
  complianceRate: z.number(),
});
export type ImageStatsResponse = z.infer<typeof imageStatsResponseSchema>;

// Database Schemas
export const imageRecordSchema = z.object({
  _id: z.string().optional(),
  filename: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number(),
  uploadedAt: z.date(),
  processingStatus: z.enum(['pending', 'processing', 'completed', 'failed']),
  annotatedFilename: z.string().optional(),
  totalPeople: z.number().optional(),
  peopleWithHelmets: z.number().optional(),
  complianceRate: z.number().optional(),
  detections: z
    .array(
      z.object({
        bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]),
        confidence: z.number(),
        hasHelmet: z.boolean(),
        helmetConfidence: z.number(),
        status: z.enum(['wearing_helmet', 'no_helmet']),
      })
    )
    .optional(),
  error: z.string().optional(),
  processedAt: z.date().optional(),
});
export type ImageRecord = z.infer<typeof imageRecordSchema>;

// Event Schemas - Published by Helmet Detection Flow
export const processingRequestEventSchema = z.object({
  image_id: z.string(),
  image_filename: z.string(),
  timestamp: z.string(),
});
export type ProcessingRequestEvent = z.infer<typeof processingRequestEventSchema>;

// Event Schemas - Consumed by Helmet Detection Flow
export const processingResultEventSchema = z.object({
  image_id: z.string(),
  image_filename: z.string(),
  annotated_filename: z.string().optional(),
  processing_status: z.enum(['completed', 'failed']),
  total_people: z.number(),
  people_with_helmets: z.number(),
  compliance_rate: z.number(),
  detections: z.array(
    z.object({
      bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]),
      confidence: z.number(),
      has_helmet: z.boolean(),
      helmet_confidence: z.number(),
      status: z.string(),
    })
  ),
  error: z.string().optional(),
  timestamp: z.string(),
});
export type ProcessingResultEvent = z.infer<typeof processingResultEventSchema>;
