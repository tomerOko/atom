import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../../styles/theme';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideUp = keyframes`
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const Overlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${props => (props.isOpen ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: ${theme.zIndex.modal};
  animation: ${fadeIn} ${theme.transitions.fast};
  padding: ${theme.spacing.md};
`;

const ModalContent = styled.div<{ size?: 'small' | 'medium' | 'large' }>`
  background-color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.xl};
  box-shadow: ${theme.shadows['2xl']};
  animation: ${slideUp} ${theme.transitions.base};
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
  width: 100%;
  max-width: ${props => {
    const sizes = {
      small: '400px',
      medium: '600px',
      large: '800px',
    };
    return sizes[props.size || 'medium'];
  }};
`;

const ModalHeader = styled.div`
  padding: ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.lightGray};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ModalTitle = styled.h3`
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.dark};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: ${theme.spacing.xs};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${theme.borderRadius.base};
  transition: all ${theme.transitions.fast};
  position: relative;
  width: 32px;
  height: 32px;

  &:hover {
    background-color: ${theme.colors.lightGray};
  }

  &:before,
  &:after {
    content: '';
    position: absolute;
    width: 20px;
    height: 2px;
    background-color: ${theme.colors.gray};
  }

  &:before {
    transform: rotate(45deg);
  }

  &:after {
    transform: rotate(-45deg);
  }
`;

const ModalBody = styled.div`
  padding: ${theme.spacing.lg};
`;

const ModalFooter = styled.div`
  padding: ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.lightGray};
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${theme.spacing.md};
`;

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  closeOnOverlayClick?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'medium',
  closeOnOverlayClick = true,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Overlay isOpen={isOpen} onClick={handleOverlayClick}>
      <ModalContent size={size}>
        <ModalHeader>
          {title && <ModalTitle>{title}</ModalTitle>}
          <CloseButton onClick={onClose} aria-label="Close modal" />
        </ModalHeader>

        <ModalBody>{children}</ModalBody>

        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContent>
    </Overlay>
  );
};
