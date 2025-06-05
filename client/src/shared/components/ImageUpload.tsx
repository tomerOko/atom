import React, { useCallback, useState } from 'react';
import styled from 'styled-components';

interface ImageUploadProps {
  onUpload: (file: File) => Promise<void>;
  uploading: boolean;
}

const UploadArea = styled.div<{ isDragOver: boolean; uploading: boolean }>`
  border: 2px dashed ${props => (props.isDragOver ? '#4299e1' : '#cbd5e0')};
  border-radius: 12px;
  padding: 3rem 2rem;
  text-align: center;
  background: ${props => (props.isDragOver ? 'rgba(66, 153, 225, 0.1)' : 'transparent')};
  transition: all 0.3s ease;
  cursor: ${props => (props.uploading ? 'not-allowed' : 'pointer')};
  opacity: ${props => (props.uploading ? 0.6 : 1)};

  &:hover {
    border-color: ${props => !props.uploading && '#4299e1'};
    background: ${props => !props.uploading && 'rgba(66, 153, 225, 0.05)'};
  }
`;

const UploadIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #4a5568;
`;

const UploadText = styled.div`
  font-size: 1.1rem;
  color: #4a5568;
  margin-bottom: 0.5rem;
`;

const UploadSubtext = styled.div`
  font-size: 0.875rem;
  color: #718096;
  margin-bottom: 1.5rem;
`;

const HiddenInput = styled.input`
  display: none;
`;

const UploadButton = styled.button<{ uploading: boolean }>`
  background: #4299e1;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: ${props => (props.uploading ? 'not-allowed' : 'pointer')};
  transition: background 0.2s;
  opacity: ${props => (props.uploading ? 0.6 : 1)};

  &:hover {
    background: ${props => !props.uploading && '#3182ce'};
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ErrorMessage = styled.div`
  background: #fed7d7;
  color: #c53030;
  padding: 0.75rem;
  border-radius: 6px;
  margin-top: 1rem;
  font-size: 0.875rem;
`;

const SuccessMessage = styled.div`
  background: #c6f6d5;
  color: #22543d;
  padding: 0.75rem;
  border-radius: 6px;
  margin-top: 1rem;
  font-size: 0.875rem;
`;

export const ImageUpload: React.FC<ImageUploadProps> = ({ onUpload, uploading }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, or WebP)');
      return false;
    }

    if (file.size > maxSize) {
      setError('File size must be less than 10MB');
      return false;
    }

    return true;
  };

  const handleUpload = async (file: File) => {
    setError(null);
    setSuccess(null);

    if (!validateFile(file)) {
      return;
    }

    try {
      await onUpload(file);
      setSuccess(`Successfully uploaded ${file.name}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!uploading) {
        setIsDragOver(true);
      }
    },
    [uploading]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (uploading) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleUpload(files[0]);
      }
    },
    [uploading]
  );

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleUpload(files[0]);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, []);

  const handleClick = useCallback(() => {
    if (!uploading) {
      const input = document.getElementById('file-input') as HTMLInputElement;
      input?.click();
    }
  }, [uploading]);

  return (
    <div>
      <UploadArea
        isDragOver={isDragOver}
        uploading={uploading}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <UploadIcon>{uploading ? '⏳' : '📸'}</UploadIcon>

        <UploadText>
          {uploading ? 'Uploading...' : 'Drop your image here or click to browse'}
        </UploadText>

        <UploadSubtext>Supports JPEG, PNG, and WebP files up to 10MB</UploadSubtext>

        <UploadButton uploading={uploading} type="button">
          {uploading ? (
            <>
              <LoadingSpinner /> Processing...
            </>
          ) : (
            'Select Image'
          )}
        </UploadButton>

        <HiddenInput
          id="file-input"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          disabled={uploading}
        />
      </UploadArea>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}
    </div>
  );
};
