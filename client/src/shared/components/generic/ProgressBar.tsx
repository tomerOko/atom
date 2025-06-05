import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const ProgressWrapper = styled.div`
  width: 100%;
  background-color: ${theme.colors.lightGray};
  border-radius: ${theme.borderRadius.full};
  overflow: hidden;
  height: 8px;
  position: relative;
`;

const ProgressFill = styled.div<{ progress: number; color?: string }>`
  height: 100%;
  background-color: ${props => props.color || theme.colors.primary};
  width: ${props => `${props.progress}%`};
  transition: width ${theme.transitions.base} ease-in-out;
  border-radius: ${theme.borderRadius.full};
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.3) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.sm};
`;

const ProgressText = styled.span`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.gray};
  font-weight: ${theme.fontWeights.medium};
`;

interface ProgressBarProps {
  progress: number;
  label?: string;
  showPercentage?: boolean;
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  showPercentage = true,
  color,
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div>
      {(label || showPercentage) && (
        <ProgressLabel>
          {label && <ProgressText>{label}</ProgressText>}
          {showPercentage && <ProgressText>{clampedProgress}%</ProgressText>}
        </ProgressLabel>
      )}
      <ProgressWrapper>
        <ProgressFill progress={clampedProgress} color={color} />
      </ProgressWrapper>
    </div>
  );
};
