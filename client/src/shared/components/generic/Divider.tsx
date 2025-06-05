import styled, { css } from 'styled-components';
import { theme } from '../../styles/theme';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  spacing?: keyof typeof theme.spacing;
  color?: string;
  thickness?: string;
  dashed?: boolean;
}

export const Divider = styled.div<DividerProps>`
  ${props =>
    props.orientation === 'vertical'
      ? css`
          width: ${props.thickness || '1px'};
          height: 100%;
          margin: 0 ${props.spacing ? theme.spacing[props.spacing] : theme.spacing.md};
        `
      : css`
          width: 100%;
          height: ${props.thickness || '1px'};
          margin: ${props.spacing ? theme.spacing[props.spacing] : theme.spacing.md} 0;
        `}

  background-color: ${props => props.color || theme.colors.lightGray};
  border: none;

  ${props =>
    props.dashed &&
    css`
    background: none;
    border-${props.orientation === 'vertical' ? 'right' : 'top'}: 1px dashed ${props.color || theme.colors.lightGray};
  `}
`;
