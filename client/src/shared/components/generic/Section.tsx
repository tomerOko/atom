import styled, { css } from 'styled-components';
import { theme } from '../../styles/theme';

interface SectionProps {
  background?: 'white' | 'light' | 'dark' | 'primary' | 'secondary';
  padding?: 'none' | 'small' | 'medium' | 'large' | 'xlarge';
  fullHeight?: boolean;
  centered?: boolean;
}

const backgroundVariants = {
  white: css`
    background-color: ${theme.colors.white};
    color: ${theme.colors.dark};
  `,
  light: css`
    background-color: ${theme.colors.veryLightGray};
    color: ${theme.colors.dark};
  `,
  dark: css`
    background-color: ${theme.colors.darkGray};
    color: ${theme.colors.white};
  `,
  primary: css`
    background-color: ${theme.colors.primary};
    color: ${theme.colors.white};
  `,
  secondary: css`
    background-color: ${theme.colors.secondary};
    color: ${theme.colors.white};
  `,
};

const paddingVariants = {
  none: '0',
  small: css`
    padding: ${theme.spacing.xl} 0;
  `,
  medium: css`
    padding: ${theme.spacing['2xl']} 0;
  `,
  large: css`
    padding: ${theme.spacing['3xl']} 0;
  `,
  xlarge: css`
    padding: ${theme.spacing['4xl']} 0;
  `,
};

export const Section = styled.section<SectionProps>`
  position: relative;
  width: 100%;

  ${props => backgroundVariants[props.background || 'white']}
  ${props => paddingVariants[props.padding || 'medium']}
  
  ${props =>
    props.fullHeight &&
    css`
      min-height: 100vh;
      display: flex;
      align-items: center;
    `}
  
  ${props =>
    props.centered &&
    css`
      text-align: center;
    `}
`;
