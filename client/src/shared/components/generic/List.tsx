import styled, { css } from 'styled-components';
import { theme } from '../../styles/theme';

interface ListProps {
  variant?: 'none' | 'disc' | 'decimal' | 'check';
  spacing?: keyof typeof theme.spacing;
}

export const List = styled.ul<ListProps>`
  list-style: ${props => (props.variant === 'none' ? 'none' : props.variant || 'disc')};
  margin: 0;
  padding: 0;
  padding-right: ${props => (props.variant === 'none' ? '0' : theme.spacing.lg)};

  ${props =>
    props.variant === 'check' &&
    css`
      list-style: none;
      padding-right: 0;
    `}
`;

export const ListItem = styled.li<{ spacing?: keyof typeof theme.spacing; isCheck?: boolean }>`
  margin-bottom: ${props => (props.spacing ? theme.spacing[props.spacing] : theme.spacing.sm)};
  line-height: 1.6;

  &:last-child {
    margin-bottom: 0;
  }

  ${props =>
    props.isCheck &&
    css`
      position: relative;
      padding-right: ${theme.spacing.lg};

      &::before {
        content: '✓';
        position: absolute;
        right: 0;
        color: ${theme.colors.primary};
        font-weight: ${theme.fontWeights.bold};
      }
    `}
`;

export const OrderedList = styled.ol<ListProps>`
  list-style: decimal;
  margin: 0;
  padding: 0;
  padding-right: ${theme.spacing.lg};
`;

export const DescriptionList = styled.dl`
  margin: 0;
`;

export const DescriptionTerm = styled.dt`
  font-weight: ${theme.fontWeights.semibold};
  color: ${theme.colors.dark};
  margin-bottom: ${theme.spacing.xs};
`;

export const DescriptionDetails = styled.dd`
  color: ${theme.colors.gray};
  margin: 0 0 ${theme.spacing.md} ${theme.spacing.lg};

  &:last-child {
    margin-bottom: 0;
  }
`;
