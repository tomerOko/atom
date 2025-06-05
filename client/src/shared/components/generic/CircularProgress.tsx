import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const CircularProgressWrapper = styled.div<{ size: number }>`
  position: relative;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const CircularProgressSVG = styled.svg`
  transform: rotate(-90deg);
`;

const CircularProgressTrack = styled.circle`
  fill: none;
  stroke: ${theme.colors.lightGray};
`;

const CircularProgressFill = styled.circle<{ progress: number }>`
  fill: none;
  stroke: ${theme.colors.primary};
  stroke-linecap: round;
  transition: stroke-dashoffset ${theme.transitions.base} ease-in-out;
`;

const CircularProgressText = styled.div`
  position: absolute;
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.dark};
`;

interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  showText?: boolean;
  textFormat?: (progress: number) => string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  color = theme.colors.primary,
  showText = true,
  textFormat = p => `${p}%`,
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (clampedProgress / 100) * circumference;

  return (
    <CircularProgressWrapper size={size}>
      <CircularProgressSVG width={size} height={size}>
        <CircularProgressTrack cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} />
        <CircularProgressFill
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          progress={clampedProgress}
          style={{ stroke: color }}
        />
      </CircularProgressSVG>
      {showText && <CircularProgressText>{textFormat(clampedProgress)}</CircularProgressText>}
    </CircularProgressWrapper>
  );
};
