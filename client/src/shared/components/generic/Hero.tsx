import styled, { css } from 'styled-components';
import { theme } from '../../styles/theme';

interface HeroProps {
  fullHeight?: boolean;
  centered?: boolean;
  background?: 'primary' | 'secondary' | 'gradient' | 'dark' | 'light';
  overlay?: boolean;
  backgroundImage?: string;
}

const backgroundVariants = {
  primary: css`
    background-color: ${theme.colors.primary};
    color: ${theme.colors.white};
  `,
  secondary: css`
    background-color: ${theme.colors.secondary};
    color: ${theme.colors.white};
  `,
  gradient: css`
    background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%);
    color: ${theme.colors.white};
  `,
  dark: css`
    background-color: ${theme.colors.darkGray};
    color: ${theme.colors.white};
  `,
  light: css`
    background-color: ${theme.colors.veryLightGray};
    color: ${theme.colors.dark};
  `,
};

export const Hero = styled.section<HeroProps>`
  position: relative;
  width: 100%;
  padding: ${theme.spacing['4xl']} 0;
  overflow: hidden;

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
  
  ${props => props.background && backgroundVariants[props.background]}
  
  ${props =>
    props.backgroundImage &&
    css`
      background-image: url(${props.backgroundImage});
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    `}
  
  ${props =>
    props.overlay &&
    css`
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 1;
      }

      & > * {
        position: relative;
        z-index: 2;
      }
    `}
`;

export const HeroContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

export const HeroTitle = styled.h1`
  font-size: ${theme.fontSizes['6xl']};
  font-weight: ${theme.fontWeights.bold};
  line-height: 1.1;
  margin-bottom: ${theme.spacing.lg};

  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.fontSizes['4xl']};
  }
`;

export const HeroSubtitle = styled.p`
  font-size: ${theme.fontSizes.xl};
  line-height: 1.6;
  margin-bottom: ${theme.spacing.xl};
  opacity: 0.9;

  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.fontSizes.lg};
  }
`;

export const HeroActions = styled.div<{ centered?: boolean }>`
  display: flex;
  gap: ${theme.spacing.md};
  flex-wrap: wrap;

  ${props =>
    props.centered &&
    css`
      justify-content: center;
    `}
`;
