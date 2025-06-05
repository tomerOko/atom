import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { theme } from '../../styles/theme';
import { Button } from './Button';
import { Container } from './Container';

const HeaderWrapper = styled.header<{ isScrolled?: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: ${theme.colors.white};
  z-index: ${theme.zIndex.dropdown};
  transition: all ${theme.transitions.base};

  ${props =>
    props.isScrolled &&
    css`
      box-shadow: ${theme.shadows.md};
    `}
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.md} 0;
  min-height: 70px;
`;

const Logo = styled.img`
  height: 40px;
  width: auto;
  cursor: pointer;
`;

const Nav = styled.nav<{ isOpen?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xl};

  @media (max-width: ${theme.breakpoints.md}) {
    position: fixed;
    top: 70px;
    right: ${props => (props.isOpen ? '0' : '-100%')};
    width: 100%;
    height: calc(100vh - 70px);
    background-color: ${theme.colors.white};
    flex-direction: column;
    padding: ${theme.spacing.xl};
    box-shadow: ${theme.shadows.xl};
    transition: right ${theme.transitions.base};
    justify-content: flex-start;
    align-items: flex-start;
  }
`;

const NavLink = styled.a`
  color: ${theme.colors.dark};
  font-weight: ${theme.fontWeights.medium};
  transition: color ${theme.transitions.fast};

  &:hover {
    color: ${theme.colors.primary};
  }
`;

const NavButtons = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};

  @media (max-width: ${theme.breakpoints.md}) {
    width: 100%;
    flex-direction: column;
    margin-top: ${theme.spacing.xl};
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  flex-direction: column;
  gap: 4px;
  padding: ${theme.spacing.sm};

  @media (max-width: ${theme.breakpoints.md}) {
    display: flex;
  }

  span {
    width: 24px;
    height: 2px;
    background-color: ${theme.colors.dark};
    transition: all ${theme.transitions.fast};
  }
`;

interface HeaderProps {
  logo?: string;
  navItems?: Array<{ label: string; href: string }>;
  onLogoClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ logo, navItems = [], onLogoClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <HeaderWrapper isScrolled={isScrolled}>
      <Container>
        <HeaderContent>
          {logo && <Logo src={logo} alt="Logo" onClick={onLogoClick} />}

          <Nav isOpen={isMenuOpen}>
            {navItems.map((item, index) => (
              <NavLink key={index} href={item.href}>
                {item.label}
              </NavLink>
            ))}

            <NavButtons>
              <Button variant="outline" size="small" onClick={() => navigate('/dashboard')}>
                איזור אישי
              </Button>
              <Button variant="secondary" size="small" onClick={() => navigate('/eligibility')}>
                בדיקת זכאות
              </Button>
            </NavButtons>
          </Nav>

          <MobileMenuButton onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <span />
            <span />
            <span />
          </MobileMenuButton>
        </HeaderContent>
      </Container>
    </HeaderWrapper>
  );
};
