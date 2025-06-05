import styled, { css } from 'styled-components';
import { theme } from '../../styles/theme';

interface IconProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  clickable?: boolean;
}

const iconSizes = {
  xs: '16px',
  sm: '20px',
  md: '24px',
  lg: '32px',
  xl: '48px',
};

export const Icon = styled.span<IconProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${props => iconSizes[props.size || 'md']};
  height: ${props => iconSizes[props.size || 'md']};
  color: ${props => props.color || 'currentColor'};
  transition: all ${theme.transitions.fast};

  svg {
    width: 100%;
    height: 100%;
    fill: currentColor;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  ${props =>
    props.clickable &&
    css`
      cursor: pointer;

      &:hover {
        opacity: 0.8;
        transform: scale(1.1);
      }

      &:active {
        transform: scale(0.95);
      }
    `}
`;
