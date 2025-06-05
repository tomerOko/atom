import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { Button } from '../generic/Button';
import { Text } from '../generic';
import type { SidebarProps } from './types';

const SidebarContainer = styled.div<{ isOpen: boolean }>`
  width: 280px;
  min-height: 100vh;
  background-color: ${theme.colors.white};
  border-left: 1px solid ${theme.colors.lightGray};
  padding: ${theme.spacing.lg};
  position: fixed;
  right: ${props => (props.isOpen ? '0' : '-280px')};
  top: 0;
  z-index: 100;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  transition: right ${theme.transitions.base};
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: ${theme.spacing.xl};
  padding-bottom: ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.lightGray};
`;

const LogoText = styled(Text)`
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
`;

const NavigationSection = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const SectionTitle = styled(Text)`
  font-size: ${theme.fontSizes.sm};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.gray};
  text-transform: uppercase;
  margin-bottom: ${theme.spacing.md};
`;

const NavigationItem = styled.div<{ active: boolean }>`
  display: flex;
  align-items: center;
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.xs};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  transition: all ${theme.transitions.base};

  ${props =>
    props.active &&
    `
    background-color: ${theme.colors.primary}11;
    border-right: 3px solid ${theme.colors.primary};
  `}

  ${props =>
    !props.active &&
    `
    &:hover {
      background-color: ${theme.colors.veryLightGray};
    }
  `}
`;

const NavIcon = styled.span`
  font-size: 1.2rem;
  margin-left: ${theme.spacing.md};
  width: 24px;
  text-align: center;
`;

const NavText = styled(Text)<{ active: boolean }>`
  font-weight: ${props => (props.active ? theme.fontWeights.bold : theme.fontWeights.medium)};
  color: ${props => (props.active ? theme.colors.primary : theme.colors.dark)};
`;

const CloseButton = styled.button`
  position: absolute;
  top: ${theme.spacing.md};
  left: ${theme.spacing.md};
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${theme.colors.gray};

  &:hover {
    color: ${theme.colors.dark};
  }
`;

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    {
      key: 'home',
      label: 'בית',
      icon: '🏠',
      path: '/',
    },
    {
      key: 'about',
      label: 'אודות',
      icon: '📖',
      path: '/about',
    },
    {
      key: 'contact',
      label: 'צור קשר',
      icon: '📞',
      path: '/contact',
    },
  ];

  const handleNavigate = (item: (typeof navigationItems)[0]) => {
    navigate(item.path);
    onToggle();
  };

  const isActivePage = (path: string) => {
    return location.pathname === path;
  };

  return (
    <SidebarContainer isOpen={isOpen}>
      <CloseButton onClick={onToggle}>×</CloseButton>

      <Logo>
        <LogoText>התבנית שלי</LogoText>
      </Logo>

      <NavigationSection>
        <SectionTitle>ניווט</SectionTitle>
        {navigationItems.map(item => (
          <NavigationItem
            key={item.key}
            active={isActivePage(item.path)}
            onClick={() => handleNavigate(item)}
          >
            <NavIcon>{item.icon}</NavIcon>
            <NavText active={isActivePage(item.path)}>{item.label}</NavText>
          </NavigationItem>
        ))}
      </NavigationSection>

      <div
        style={{
          marginTop: 'auto',
          paddingTop: theme.spacing.xl,
          borderTop: `1px solid ${theme.colors.lightGray}`,
        }}
      >
        <Button variant="outline" style={{ width: '100%' }}>
          <span>📧</span>
          צור קשר
        </Button>
      </div>
    </SidebarContainer>
  );
};
