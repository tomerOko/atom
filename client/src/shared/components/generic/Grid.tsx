import styled, { css } from 'styled-components';
import { theme } from '../../styles/theme';

interface GridProps {
  columns?: number | string;
  gap?: keyof typeof theme.spacing;
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  justifyItems?: 'start' | 'center' | 'end' | 'stretch';
  responsive?: boolean;
}

export const Grid = styled.div<GridProps>`
  display: grid;
  grid-template-columns: ${props => {
    if (typeof props.columns === 'string') return props.columns;
    if (typeof props.columns === 'number') return `repeat(${props.columns}, 1fr)`;
    return '1fr';
  }};
  gap: ${props => (props.gap ? theme.spacing[props.gap] : theme.spacing.md)};
  align-items: ${props => props.alignItems || 'stretch'};
  justify-items: ${props => props.justifyItems || 'stretch'};

  ${props =>
    props.responsive &&
    css`
      @media (max-width: ${theme.breakpoints.md}) {
        grid-template-columns: 1fr;
      }
    `}
`;

interface FlexProps {
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  gap?: keyof typeof theme.spacing;
  wrap?: boolean;
  flex?: string | number;
}

export const Flex = styled.div<FlexProps>`
  display: flex;
  flex-direction: ${props => props.direction || 'row'};
  align-items: ${props => {
    const alignMap = {
      start: 'flex-start',
      center: 'center',
      end: 'flex-end',
      stretch: 'stretch',
      baseline: 'baseline',
    };
    return alignMap[props.align || 'stretch'];
  }};
  justify-content: ${props => {
    const justifyMap = {
      start: 'flex-start',
      center: 'center',
      end: 'flex-end',
      between: 'space-between',
      around: 'space-around',
      evenly: 'space-evenly',
    };
    return justifyMap[props.justify || 'start'];
  }};
  gap: ${props => (props.gap ? theme.spacing[props.gap] : '0')};
  flex-wrap: ${props => (props.wrap ? 'wrap' : 'nowrap')};
  ${props =>
    props.flex &&
    css`
      flex: ${props.flex};
    `}
`;

export const GridItem = styled.div<{
  span?: number;
  start?: number;
  end?: number;
}>`
  ${props =>
    props.span &&
    css`
      grid-column: span ${props.span};
    `}
  ${props =>
    props.start &&
    css`
      grid-column-start: ${props.start};
    `}
  ${props =>
    props.end &&
    css`
      grid-column-end: ${props.end};
    `}
`;
