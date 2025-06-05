import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { Container } from './Container';
import { Flex } from './Grid';
import { Text } from './Typography';

const FooterWrapper = styled.footer`
  background-color: ${theme.colors.darkGray};
  color: ${theme.colors.white};
  padding: ${theme.spacing.xl} 0;
  margin-top: auto;
`;

const FooterContent = styled.div`
  padding: ${theme.spacing.lg} 0;
  border-top: 1px solid ${theme.colors.gray}44;
`;

const Logo = styled.img`
  height: 40px;
  width: auto;
  margin-bottom: ${theme.spacing.md};
`;

const FooterLink = styled.a`
  color: ${theme.colors.white};
  text-decoration: none;
  font-size: ${theme.fontSizes.sm};
  transition: color ${theme.transitions.fast};

  &:hover {
    color: ${theme.colors.secondary};
  }
`;

const Divider = styled.span`
  margin: 0 ${theme.spacing.md};
  opacity: 0.3;
`;

const Copyright = styled(Text)`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.lightGray};
  margin: 0;
`;

interface FooterProps {
  logo?: string;
  links?: Array<{ label: string; href: string }>;
  email?: string;
}

export const Footer: React.FC<FooterProps> = ({ logo, links = [], email = 'info@adhdeal.com' }) => {
  const currentYear = new Date().getFullYear();

  return (
    <FooterWrapper>
      <Container>
        {logo && <Logo src={logo} alt="Logo" />}

        <FooterContent>
          <Flex direction="column" gap="md" align="center">
            <Flex wrap justify="center" gap="xs">
              {links.map((link, index) => (
                <React.Fragment key={index}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                  {index < links.length - 1 && <Divider>|</Divider>}
                </React.Fragment>
              ))}
            </Flex>

            <FooterLink href={`mailto:${email}`}>{email}</FooterLink>

            <Copyright>{currentYear} All rights reserved</Copyright>
          </Flex>
        </FooterContent>
      </Container>
    </FooterWrapper>
  );
};
