import styled from 'styled-components';
import { theme } from '../../styles/theme';

interface InputProps {
  hasError?: boolean;
  fullWidth?: boolean;
}

export const Input = styled.input<InputProps>`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  font-size: ${theme.fontSizes.base};
  font-family: ${theme.fonts.primary};
  color: ${theme.colors.dark};
  background-color: ${theme.colors.white};
  border: 2px solid ${props => (props.hasError ? theme.colors.error : theme.colors.lightGray)};
  border-radius: ${theme.borderRadius.md};
  transition: all ${theme.transitions.fast};
  outline: none;
  width: ${props => (props.fullWidth ? '100%' : 'auto')};

  &:focus {
    border-color: ${props => (props.hasError ? theme.colors.error : theme.colors.primary)};
    box-shadow: 0 0 0 3px ${props => (props.hasError ? theme.colors.error : theme.colors.primary)}22;
  }

  &:disabled {
    background-color: ${theme.colors.veryLightGray};
    cursor: not-allowed;
    opacity: 0.6;
  }

  &::placeholder {
    color: ${theme.colors.gray};
  }
`;

export const Textarea = styled.textarea<InputProps>`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  font-size: ${theme.fontSizes.base};
  font-family: ${theme.fonts.primary};
  color: ${theme.colors.dark};
  background-color: ${theme.colors.white};
  border: 2px solid ${props => (props.hasError ? theme.colors.error : theme.colors.lightGray)};
  border-radius: ${theme.borderRadius.md};
  transition: all ${theme.transitions.fast};
  outline: none;
  width: ${props => (props.fullWidth ? '100%' : 'auto')};
  min-height: 120px;
  resize: vertical;

  &:focus {
    border-color: ${props => (props.hasError ? theme.colors.error : theme.colors.primary)};
    box-shadow: 0 0 0 3px ${props => (props.hasError ? theme.colors.error : theme.colors.primary)}22;
  }

  &:disabled {
    background-color: ${theme.colors.veryLightGray};
    cursor: not-allowed;
    opacity: 0.6;
  }

  &::placeholder {
    color: ${theme.colors.gray};
  }
`;

export const Label = styled.label`
  display: block;
  font-size: ${theme.fontSizes.sm};
  font-weight: ${theme.fontWeights.medium};
  color: ${theme.colors.dark};
  margin-bottom: ${theme.spacing.xs};
`;

export const FormGroup = styled.div`
  margin-bottom: ${theme.spacing.lg};
`;

export const ErrorMessage = styled.span`
  display: block;
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.error};
  margin-top: ${theme.spacing.xs};
`;

export const HelperText = styled.span`
  display: block;
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.gray};
  margin-top: ${theme.spacing.xs};
`;

export const Select = styled.select<InputProps>`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  font-size: ${theme.fontSizes.base};
  font-family: ${theme.fonts.primary};
  color: ${theme.colors.dark};
  background-color: ${theme.colors.white};
  border: 2px solid ${props => (props.hasError ? theme.colors.error : theme.colors.lightGray)};
  border-radius: ${theme.borderRadius.md};
  transition: all ${theme.transitions.fast};
  outline: none;
  width: ${props => (props.fullWidth ? '100%' : 'auto')};
  cursor: pointer;

  &:focus {
    border-color: ${props => (props.hasError ? theme.colors.error : theme.colors.primary)};
    box-shadow: 0 0 0 3px ${props => (props.hasError ? theme.colors.error : theme.colors.primary)}22;
  }

  &:disabled {
    background-color: ${theme.colors.veryLightGray};
    cursor: not-allowed;
    opacity: 0.6;
  }
`;
