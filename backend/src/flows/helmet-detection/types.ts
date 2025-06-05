export interface UploadImageRequest {
  file: Express.Multer.File;
}

export interface ImageRecord {
  _id?: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  annotatedFilename?: string;
  totalPeople?: number;
  peopleWithHelmets?: number;
  complianceRate?: number;
  detections?: Detection[];
  error?: string;
  processedAt?: Date;
}

export interface Detection {
  bbox: [number, number, number, number]; // [x1, y1, x2, y2]
  confidence: number;
  hasHelmet: boolean;
  helmetConfidence: number;
  status: 'wearing_helmet' | 'no_helmet';
}

export interface ProcessingMessage {
  image_id: string;
  image_filename: string;
  timestamp: string;
}

export interface ProcessingResult {
  image_id: string;
  image_filename: string;
  annotated_filename?: string;
  processing_status: 'completed' | 'failed';
  total_people: number;
  people_with_helmets: number;
  compliance_rate: number;
  detections: Array<{
    bbox: [number, number, number, number];
    confidence: number;
    has_helmet: boolean;
    helmet_confidence: number;
    status: string;
  }>;
  error?: string;
  timestamp: string;
}

export interface GetImagesResponse {
  images: ImageRecord[];
  total: number;
}

export interface GetImageResponse {
  image: ImageRecord;
  originalImageUrl?: string;
  annotatedImageUrl?: string;
}
