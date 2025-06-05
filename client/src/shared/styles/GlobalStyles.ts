import { createGlobalStyle } from 'styled-components';
import { theme } from './theme';

export const GlobalStyles = createGlobalStyle`
  /* Import Hebrew fonts */
  @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    direction: rtl;
    scroll-behavior: smooth;
  }

  body {
    font-family: ${theme.fonts.primary};
    font-size: ${theme.fontSizes.base};
    line-height: 1.6;
    color: ${theme.colors.dark};
    background-color: ${theme.colors.white};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    direction: rtl;
    overflow-x: hidden;
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: ${theme.fontWeights.bold};
    line-height: 1.3;
    margin-bottom: ${theme.spacing.md};
    color: ${theme.colors.dark};
  }

  h1 {
    font-size: clamp(2rem, 5vw, ${theme.fontSizes['5xl']});
  }

  h2 {
    font-size: clamp(1.5rem, 4vw, ${theme.fontSizes['4xl']});
  }

  h3 {
    font-size: clamp(1.25rem, 3vw, ${theme.fontSizes['3xl']});
  }

  h4 {
    font-size: ${theme.fontSizes['2xl']};
  }

  h5 {
    font-size: ${theme.fontSizes.xl};
  }

  h6 {
    font-size: ${theme.fontSizes.lg};
  }

  p {
    margin-bottom: ${theme.spacing.md};
    line-height: 1.7;
  }

  a {
    color: ${theme.colors.primary};
    text-decoration: none;
    transition: all ${theme.transitions.fast};

    &:hover {
      color: ${theme.colors.secondary};
    }
  }

  button {
    cursor: pointer;
    font-family: inherit;
    font-size: inherit;
    border: none;
    outline: none;
    background: none;
    transition: all ${theme.transitions.fast};
  }

  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
    direction: rtl;
  }

  img {
    max-width: 100%;
    height: auto;
    display: block;
  }

  ::selection {
    background-color: ${theme.colors.primary};
    color: ${theme.colors.white};
  }

  /* Scrollbar styles */
  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  ::-webkit-scrollbar-track {
    background: ${theme.colors.veryLightGray};
  }

  ::-webkit-scrollbar-thumb {
    background: ${theme.colors.lightGray};
    border-radius: ${theme.borderRadius.full};
    
    &:hover {
      background: ${theme.colors.gray};
    }
  }

  /* Remove focus outline and add custom focus styles */
  *:focus {
    outline: none;
  }

  *:focus-visible {
    outline: 2px solid ${theme.colors.primary};
    outline-offset: 2px;
  }

  /* Utility classes */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
`;
