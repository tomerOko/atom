import styled, { css } from 'styled-components';
import { theme } from '../../styles/theme';

interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'gray';
  size?: 'small' | 'medium' | 'large';
  rounded?: boolean;
}

const badgeVariants = {
  primary: css`
    background-color: ${theme.colors.primary};
    color: ${theme.colors.white};
  `,
  secondary: css`
    background-color: ${theme.colors.secondary};
    color: ${theme.colors.white};
  `,
  success: css`
    background-color: ${theme.colors.success};
    color: ${theme.colors.white};
  `,
  error: css`
    background-color: ${theme.colors.error};
    color: ${theme.colors.white};
  `,
  warning: css`
    background-color: ${theme.colors.warning};
    color: ${theme.colors.dark};
  `,
  info: css`
    background-color: ${theme.colors.info};
    color: ${theme.colors.white};
  `,
  gray: css`
    background-color: ${theme.colors.lightGray};
    color: ${theme.colors.dark};
  `,
};

const badgeSizes = {
  small: css`
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    font-size: ${theme.fontSizes.xs};
  `,
  medium: css`
    padding: ${theme.spacing.xs} ${theme.spacing.md};
    font-size: ${theme.fontSizes.sm};
  `,
  large: css`
    padding: ${theme.spacing.sm} ${theme.spacing.lg};
    font-size: ${theme.fontSizes.base};
  `,
};

export const Badge = styled.span<BadgeProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: ${theme.fontWeights.medium};
  line-height: 1;
  white-space: nowrap;
  border-radius: ${props => (props.rounded ? theme.borderRadius.full : theme.borderRadius.base)};
  transition: all ${theme.transitions.fast};

  ${props => badgeVariants[props.variant || 'primary']}
  ${props => badgeSizes[props.size || 'medium']}
`;

export const BadgeGroup = styled.div<{ gap?: keyof typeof theme.spacing }>`
  display: inline-flex;
  flex-wrap: wrap;
  gap: ${props => (props.gap ? theme.spacing[props.gap] : theme.spacing.sm)};
`;
