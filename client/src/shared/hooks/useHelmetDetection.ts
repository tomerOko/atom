import { useState, useCallback } from 'react';
import type {
  ImageRecord,
  Stats,
  GetImagesResponse,
  UploadResponse,
  ApiResponse,
} from '../types/helmet-detection';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const useHelmetDetection = () => {
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    totalPeople: 0,
    totalCompliant: 0,
    complianceRate: 0,
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadImages = useCallback(async (limit = 50, offset = 0) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/helmet-detection/images?limit=${limit}&offset=${offset}`
      );

      const result: ApiResponse<GetImagesResponse> = await response.json();

      if (result.success && result.data) {
        setImages(result.data.images);
      } else {
        setError(result.error || 'Failed to load images');
      }
    } catch (err) {
      setError('Network error while loading images');
      console.error('Error loading images:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/helmet-detection/stats`);
      const result: ApiResponse<Stats> = await response.json();

      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  }, []);

  const uploadImage = useCallback(async (file: File): Promise<void> => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE_URL}/helmet-detection/upload`, {
        method: 'POST',
        body: formData,
      });

      const result: ApiResponse<UploadResponse> = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      // Optionally refresh images after upload
      // loadImages();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      throw err;
    } finally {
      setUploading(false);
    }
  }, []);

  const getImageDetails = useCallback(async (imageId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/helmet-detection/images/${imageId}`);
      const result = await response.json();

      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to get image details');
      }
    } catch (err) {
      console.error('Error getting image details:', err);
      throw err;
    }
  }, []);

  return {
    images,
    stats,
    loading,
    uploading,
    error,
    loadImages,
    loadStats,
    uploadImage,
    getImageDetails,
  };
};
