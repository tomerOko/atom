export interface Detection {
  bbox: [number, number, number, number]; // [x1, y1, x2, y2]
  confidence: number;
  hasHelmet: boolean;
  helmetConfidence: number;
  status: 'wearing_helmet' | 'no_helmet';
}

export interface ImageRecord {
  _id?: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  annotatedFilename?: string;
  totalPeople?: number;
  peopleWithHelmets?: number;
  complianceRate?: number;
  detections?: Detection[];
  error?: string;
  processedAt?: string;
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

export interface UploadResponse {
  imageId: string;
  message: string;
}

export interface Stats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  totalPeople: number;
  totalCompliant: number;
  complianceRate: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
