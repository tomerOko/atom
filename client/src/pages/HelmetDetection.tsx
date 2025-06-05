import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { ImageUpload } from '../shared/components/ImageUpload';
import { ImageGallery } from '../shared/components/ImageGallery';
import { StatsPanel } from '../shared/components/StatsPanel';
import { ImageDetailModal } from '../shared/components/ImageDetailModal';
import { useHelmetDetection } from '../shared/hooks/useHelmetDetection';
import { ImageRecord } from '../shared/types/helmet-detection';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  color: white;
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.2rem;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const SidePanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Section = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: #2d3748;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FilterControls = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ active: boolean }>`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background: ${props => (props.active ? '#4299e1' : '#e2e8f0')};
  color: ${props => (props.active ? 'white' : '#4a5568')};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => (props.active ? '#3182ce' : '#cbd5e0')};
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: #718096;
  font-size: 1.1rem;
  padding: 2rem;
`;

const ErrorMessage = styled.div`
  background: #fed7d7;
  color: #c53030;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

export const HelmetDetection: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<ImageRecord | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'pending' | 'processing' | 'completed' | 'failed'
  >('all');

  const { images, stats, loading, error, uploadImage, loadImages, loadStats, uploading } =
    useHelmetDetection();

  useEffect(() => {
    loadImages();
    loadStats();

    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      loadImages();
      loadStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadImages, loadStats]);

  const handleImageUpload = useCallback(
    async (file: File) => {
      try {
        await uploadImage(file);
        // Refresh data after upload
        setTimeout(() => {
          loadImages();
          loadStats();
        }, 1000);
      } catch (error) {
        console.error('Upload failed:', error);
      }
    },
    [uploadImage, loadImages, loadStats]
  );

  const handleImageClick = useCallback((image: ImageRecord) => {
    setSelectedImage(image);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedImage(null);
  }, []);

  const filteredImages = images.filter(image => {
    if (statusFilter === 'all') return true;
    return image.processingStatus === statusFilter;
  });

  return (
    <Container>
      <Header>
        <Title>🦺 Helmet Detection System</Title>
        <Subtitle>
          Upload construction site photos to automatically detect workers and verify helmet
          compliance. Our AI-powered system analyzes images in real-time and provides detailed
          safety reports.
        </Subtitle>
      </Header>

      <ContentGrid>
        <MainContent>
          <Section>
            <SectionTitle>📤 Upload Image</SectionTitle>
            <ImageUpload onUpload={handleImageUpload} uploading={uploading} />
          </Section>

          <Section>
            <SectionTitle>📸 Image Gallery</SectionTitle>

            <FilterControls>
              <FilterButton active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>
                All ({images.length})
              </FilterButton>
              <FilterButton
                active={statusFilter === 'pending'}
                onClick={() => setStatusFilter('pending')}
              >
                Pending ({images.filter(img => img.processingStatus === 'pending').length})
              </FilterButton>
              <FilterButton
                active={statusFilter === 'processing'}
                onClick={() => setStatusFilter('processing')}
              >
                Processing ({images.filter(img => img.processingStatus === 'processing').length})
              </FilterButton>
              <FilterButton
                active={statusFilter === 'completed'}
                onClick={() => setStatusFilter('completed')}
              >
                Completed ({images.filter(img => img.processingStatus === 'completed').length})
              </FilterButton>
              <FilterButton
                active={statusFilter === 'failed'}
                onClick={() => setStatusFilter('failed')}
              >
                Failed ({images.filter(img => img.processingStatus === 'failed').length})
              </FilterButton>
            </FilterControls>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            {loading ? (
              <LoadingMessage>Loading images...</LoadingMessage>
            ) : (
              <ImageGallery images={filteredImages} onImageClick={handleImageClick} />
            )}
          </Section>
        </MainContent>

        <SidePanel>
          <StatsPanel stats={stats} loading={loading} />
        </SidePanel>
      </ContentGrid>

      {selectedImage && <ImageDetailModal image={selectedImage} onClose={handleCloseModal} />}
    </Container>
  );
};
