import styled, { css } from 'styled-components';
import { theme } from '../../styles/theme';

interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'dark';
  padding?: 'none' | 'small' | 'medium' | 'large';
  clickable?: boolean;
}

const cardVariants = {
  default: css`
    background-color: ${theme.colors.white};
    box-shadow: ${theme.shadows.base};
  `,
  elevated: css`
    background-color: ${theme.colors.white};
    box-shadow: ${theme.shadows.lg};

    &:hover {
      box-shadow: ${theme.shadows.xl};
    }
  `,
  outlined: css`
    background-color: ${theme.colors.white};
    border: 1px solid ${theme.colors.lightGray};
    box-shadow: none;
  `,
  dark: css`
    background-color: ${theme.colors.darkGray};
    color: ${theme.colors.white};
    box-shadow: ${theme.shadows.lg};
  `,
};

const paddingSizes = {
  none: '0',
  small: theme.spacing.md,
  medium: theme.spacing.lg,
  large: theme.spacing.xl,
};

export const Card = styled.div<CardProps>`
  border-radius: ${theme.borderRadius.lg};
  transition: all ${theme.transitions.base};
  position: relative;
  overflow: hidden;

  ${props => cardVariants[props.variant || 'default']}

  padding: ${props => paddingSizes[props.padding || 'medium']};

  ${props =>
    props.clickable &&
    css`
      cursor: pointer;

      &:hover {
        transform: translateY(-4px);
      }

      &:active {
        transform: translateY(-2px);
      }
    `}
`;

export const CardHeader = styled.div`
  margin-bottom: ${theme.spacing.md};
  padding-bottom: ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.lightGray};
`;

export const CardTitle = styled.h3`
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  color: inherit;
  margin: 0;
`;

export const CardSubtitle = styled.p`
  font-size: ${theme.fontSizes.base};
  color: ${theme.colors.gray};
  margin-top: ${theme.spacing.xs};
  margin-bottom: 0;
`;

export const CardBody = styled.div`
  font-size: ${theme.fontSizes.base};
  line-height: 1.6;
`;

export const CardFooter = styled.div`
  margin-top: ${theme.spacing.md};
  padding-top: ${theme.spacing.md};
  border-top: 1px solid ${theme.colors.lightGray};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.md};
`;
