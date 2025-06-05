import { z } from 'zod';

// Base Schemas
const processingStatusSchema = z.enum(['pending', 'processing', 'completed', 'failed']);

const bboxSchema = z.tuple([z.number(), z.number(), z.number(), z.number()]);

const helmetStatusSchema = z.enum(['wearing_helmet', 'no_helmet', 'helmet_status_unknown']);

// Detection schemas (API format - camelCase)
const detectionSchema = z.object({
  bbox: bboxSchema,
  confidence: z.number(),
  hasHelmet: z.boolean(),
  helmetConfidence: z.number(),
  status: helmetStatusSchema,
});

// Detection schema for events (snake_case)
const eventDetectionSchema = z.object({
  bbox: bboxSchema,
  confidence: z.number(),
  has_helmet: z.boolean(),
  helmet_confidence: z.number(),
  status: z.string(),
});

// Base image schema with common fields
const baseImageSchema = z.object({
  _id: z.string().optional(),
  filename: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number(),
  uploadedAt: z.date(),
  processingStatus: processingStatusSchema,
  annotatedFilename: z.string().optional(),
  totalPeople: z.number().optional(),
  peopleWithHelmets: z.number().optional(),
  complianceRate: z.number().optional(),
  detections: z.array(detectionSchema).optional(),
  error: z.union([z.string(), z.null()]).optional(),
  processedAt: z.date().optional(),
});

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
  images: z.array(baseImageSchema),
  total: z.number(),
});
export type GetImagesResponse = z.infer<typeof getImagesResponseSchema>;

export const getImageByIdResponseSchema = z.object({
  image: baseImageSchema,
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
export const imageRecordSchema = baseImageSchema.extend({
  _id: z.string().optional(), // Override to make _id optional for database inserts
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
  detections: z.array(eventDetectionSchema),
  error: z.union([z.string(), z.null()]).optional(),
  timestamp: z.string(),
});
export type ProcessingResultEvent = z.infer<typeof processingResultEventSchema>;

// Additional Type Exports
export type HelmetStatus = z.infer<typeof helmetStatusSchema>;
export type Detection = z.infer<typeof detectionSchema>;
