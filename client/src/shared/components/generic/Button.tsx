import React from 'react';
import styled, { css } from 'styled-components';
import { theme } from '../../styles/theme';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  as?: React.ElementType;
  href?: string;
}

const buttonVariants = {
  primary: css`
    background-color: ${theme.colors.primary};
    color: ${theme.colors.white};

    &:hover:not(:disabled) {
      background-color: #247860;
      transform: translateY(-2px);
      box-shadow: ${theme.shadows.lg};
    }
  `,
  secondary: css`
    background-color: ${theme.colors.secondary};
    color: ${theme.colors.white};

    &:hover:not(:disabled) {
      background-color: #e85a2b;
      transform: translateY(-2px);
      box-shadow: ${theme.shadows.lg};
    }
  `,
  outline: css`
    background-color: transparent;
    color: ${theme.colors.primary};
    border: 2px solid ${theme.colors.primary};

    &:hover:not(:disabled) {
      background-color: ${theme.colors.primary};
      color: ${theme.colors.white};
    }
  `,
  ghost: css`
    background-color: transparent;
    color: ${theme.colors.dark};

    &:hover:not(:disabled) {
      background-color: ${theme.colors.lightGray};
    }
  `,
  danger: css`
    background-color: ${theme.colors.error};
    color: ${theme.colors.white};

    &:hover:not(:disabled) {
      background-color: #d32f2f;
      transform: translateY(-2px);
      box-shadow: ${theme.shadows.lg};
    }
  `,
};

const buttonSizes = {
  small: css`
    padding: ${theme.spacing.xs} ${theme.spacing.md};
    font-size: ${theme.fontSizes.sm};
  `,
  medium: css`
    padding: ${theme.spacing.sm} ${theme.spacing.lg};
    font-size: ${theme.fontSizes.base};
  `,
  large: css`
    padding: ${theme.spacing.md} ${theme.spacing.xl};
    font-size: ${theme.fontSizes.lg};
  `,
};

export const Button = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  font-family: ${theme.fonts.primary};
  font-weight: ${theme.fontWeights.medium};
  border-radius: ${theme.borderRadius.full};
  border: none;
  cursor: pointer;
  transition: all ${theme.transitions.base};
  text-decoration: none;
  white-space: nowrap;
  position: relative;
  overflow: hidden;

  ${props => buttonVariants[props.variant || 'primary']}
  ${props => buttonSizes[props.size || 'medium']}
  
  ${props =>
    props.fullWidth &&
    css`
      width: 100%;
    `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:focus {
    outline: 3px solid ${theme.colors.primary}33;
    outline-offset: 2px;
  }
`;
