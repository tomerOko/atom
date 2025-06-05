import React from 'react';
import styled from 'styled-components';
import type { ImageRecord } from '../types/helmet-detection';

interface ImageGalleryProps {
  images: ImageRecord[];
  onImageClick: (image: ImageRecord) => void;
}

const Gallery = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
`;

const ImageCard = styled.div`
  background: #f7fafc;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

const ImageInfo = styled.div`
  font-size: 0.875rem;
  color: #4a5568;
`;

const Status = styled.span<{ status: string }>`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  background: ${props => {
    switch (props.status) {
      case 'completed':
        return '#c6f6d5';
      case 'processing':
        return '#fef5e7';
      case 'pending':
        return '#e6fffa';
      case 'failed':
        return '#fed7d7';
      default:
        return '#e2e8f0';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'completed':
        return '#22543d';
      case 'processing':
        return '#c05621';
      case 'pending':
        return '#234e52';
      case 'failed':
        return '#c53030';
      default:
        return '#4a5568';
    }
  }};
`;

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, onImageClick }) => {
  if (images.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>
        No images uploaded yet. Upload your first image to get started!
      </div>
    );
  }

  return (
    <Gallery>
      {images.map(image => (
        <ImageCard key={image._id} onClick={() => onImageClick(image)}>
          <ImageInfo>
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{image.originalName}</div>
            <div style={{ marginBottom: '0.5rem' }}>
              <Status status={image.processingStatus}>{image.processingStatus}</Status>
            </div>
            {image.totalPeople !== undefined && (
              <div>
                People: {image.totalPeople} | Helmets: {image.peopleWithHelmets || 0}
              </div>
            )}
          </ImageInfo>
        </ImageCard>
      ))}
    </Gallery>
  );
};
