import React from 'react';
import styled from 'styled-components';
import type { ImageRecord } from '../types/helmet-detection';

interface ImageDetailModalProps {
  image: ImageRecord;
  onClose: () => void;
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: white;
  border-radius: 12px;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 2rem;
  margin: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const Title = styled.h2`
  color: #2d3748;
  font-size: 1.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #718096;

  &:hover {
    color: #2d3748;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const InfoItem = styled.div`
  background: #f7fafc;
  padding: 1rem;
  border-radius: 8px;
`;

const InfoLabel = styled.div`
  font-size: 0.875rem;
  color: #718096;
  margin-bottom: 0.25rem;
`;

const InfoValue = styled.div`
  font-weight: 600;
  color: #2d3748;
`;

export const ImageDetailModal: React.FC<ImageDetailModalProps> = ({ image, onClose }) => {
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <Modal>
        <Header>
          <Title>Image Details</Title>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </Header>

        <InfoGrid>
          <InfoItem>
            <InfoLabel>Original Name</InfoLabel>
            <InfoValue>{image.originalName}</InfoValue>
          </InfoItem>

          <InfoItem>
            <InfoLabel>Status</InfoLabel>
            <InfoValue>{image.processingStatus}</InfoValue>
          </InfoItem>

          <InfoItem>
            <InfoLabel>File Size</InfoLabel>
            <InfoValue>{Math.round(image.size / 1024)} KB</InfoValue>
          </InfoItem>

          <InfoItem>
            <InfoLabel>Upload Date</InfoLabel>
            <InfoValue>{new Date(image.uploadedAt).toLocaleDateString()}</InfoValue>
          </InfoItem>

          {image.totalPeople !== undefined && (
            <>
              <InfoItem>
                <InfoLabel>Total People</InfoLabel>
                <InfoValue>{image.totalPeople}</InfoValue>
              </InfoItem>

              <InfoItem>
                <InfoLabel>People with Helmets</InfoLabel>
                <InfoValue>{image.peopleWithHelmets || 0}</InfoValue>
              </InfoItem>

              <InfoItem>
                <InfoLabel>Compliance Rate</InfoLabel>
                <InfoValue>{Math.round((image.complianceRate || 0) * 100)}%</InfoValue>
              </InfoItem>
            </>
          )}
        </InfoGrid>

        {image.error && (
          <div
            style={{
              background: '#fed7d7',
              color: '#c53030',
              padding: '1rem',
              borderRadius: '8px',
              marginTop: '1rem',
            }}
          >
            <strong>Error:</strong> {image.error}
          </div>
        )}

        {image.detections && image.detections.length > 0 && (
          <div style={{ marginTop: '1.5rem' }}>
            <h3 style={{ color: '#2d3748', marginBottom: '1rem' }}>Detections</h3>
            {image.detections.map((detection, index) => (
              <div
                key={index}
                style={{
                  background: '#f7fafc',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '0.5rem',
                }}
              >
                <div>Status: {detection.hasHelmet ? '✅ Wearing Helmet' : '❌ No Helmet'}</div>
                <div>Confidence: {Math.round(detection.confidence * 100)}%</div>
                {detection.hasHelmet && (
                  <div>Helmet Confidence: {Math.round(detection.helmetConfidence * 100)}%</div>
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>
    </Overlay>
  );
};
