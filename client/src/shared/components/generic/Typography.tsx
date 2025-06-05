import React from 'react';
import styled, { css } from 'styled-components';
import { theme } from '../../styles/theme';

interface TextProps {
  color?: 'primary' | 'secondary' | 'dark' | 'gray' | 'white' | 'inherit';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right' | 'justify';
  size?: keyof typeof theme.fontSizes;
  as?: React.ElementType;
}

const textColors = {
  primary: theme.colors.primary,
  secondary: theme.colors.secondary,
  dark: theme.colors.dark,
  gray: theme.colors.gray,
  white: theme.colors.white,
  inherit: 'inherit',
};

const textWeights = {
  light: theme.fontWeights.light,
  normal: theme.fontWeights.normal,
  medium: theme.fontWeights.medium,
  semibold: theme.fontWeights.semibold,
  bold: theme.fontWeights.bold,
};

const BaseText = css<TextProps>`
  color: ${props => textColors[props.color || 'inherit']};
  font-weight: ${props => textWeights[props.weight || 'normal']};
  text-align: ${props => props.align || 'inherit'};
  font-size: ${props => (props.size ? theme.fontSizes[props.size] : 'inherit')};
  line-height: 1.6;
  margin: 0;
`;

export const Heading1 = styled.h1<TextProps>`
  ${BaseText}
  font-size: ${props => (props.size ? theme.fontSizes[props.size] : theme.fontSizes['5xl'])};
  font-weight: ${props => textWeights[props.weight || 'bold']};
  line-height: 1.2;
  margin-bottom: ${theme.spacing.lg};

  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.fontSizes['4xl']};
  }
`;

export const Heading2 = styled.h2<TextProps>`
  ${BaseText}
  font-size: ${props => (props.size ? theme.fontSizes[props.size] : theme.fontSizes['4xl'])};
  font-weight: ${props => textWeights[props.weight || 'bold']};
  line-height: 1.3;
  margin-bottom: ${theme.spacing.md};

  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.fontSizes['3xl']};
  }
`;

export const Heading3 = styled.h3<TextProps>`
  ${BaseText}
  font-size: ${props => (props.size ? theme.fontSizes[props.size] : theme.fontSizes['3xl'])};
  font-weight: ${props => textWeights[props.weight || 'semibold']};
  line-height: 1.4;
  margin-bottom: ${theme.spacing.md};
`;

export const Heading4 = styled.h4<TextProps>`
  ${BaseText}
  font-size: ${props => (props.size ? theme.fontSizes[props.size] : theme.fontSizes['2xl'])};
  font-weight: ${props => textWeights[props.weight || 'semibold']};
  line-height: 1.4;
  margin-bottom: ${theme.spacing.sm};
`;

export const Heading5 = styled.h5<TextProps>`
  ${BaseText}
  font-size: ${props => (props.size ? theme.fontSizes[props.size] : theme.fontSizes.xl)};
  font-weight: ${props => textWeights[props.weight || 'medium']};
  line-height: 1.5;
  margin-bottom: ${theme.spacing.sm};
`;

export const Heading6 = styled.h6<TextProps>`
  ${BaseText}
  font-size: ${props => (props.size ? theme.fontSizes[props.size] : theme.fontSizes.lg)};
  font-weight: ${props => textWeights[props.weight || 'medium']};
  line-height: 1.5;
  margin-bottom: ${theme.spacing.sm};
`;

export const Text = styled.p<TextProps>`
  ${BaseText}
  font-size: ${props => (props.size ? theme.fontSizes[props.size] : theme.fontSizes.base)};
  margin-bottom: ${theme.spacing.md};
`;

export const SmallText = styled.small<TextProps>`
  ${BaseText}
  font-size: ${props => (props.size ? theme.fontSizes[props.size] : theme.fontSizes.sm)};
`;

export const Strong = styled.strong<TextProps>`
  ${BaseText}
  font-weight: ${props => textWeights[props.weight || 'bold']};
`;

export const Emphasis = styled.em<TextProps>`
  ${BaseText}
  font-style: italic;
`;
