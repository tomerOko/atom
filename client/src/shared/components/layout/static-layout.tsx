import React from 'react';
import { Header } from '../generic/Header';
import { Footer } from '../generic/Footer';
import logo from '../../assets/logo.svg';

const navItems = [
  { label: 'מחירים', href: '/pricing' },
  { label: 'קצת עלינו', href: '/about' },
  { label: 'איך מתחילים', href: '/how-it-works' },
  { label: 'שאלות ותשובות', href: '/faq' },
];

const footerLinks = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Accessibility', href: '/accessibility' },
  { label: 'Terms of use', href: '/terms' },
];

interface StaticLayoutProps {
  children: React.ReactNode;
}

export const StaticLayout: React.FC<StaticLayoutProps> = ({ children }) => {
  return (
    <>
      <Header logo={logo} navItems={navItems} onLogoClick={() => (window.location.href = '/')} />

      <main style={{ flex: 1, paddingTop: '70px' }}>{children}</main>

      <Footer logo={logo} links={footerLinks} email="info@adhdeal.com" />
    </>
  );
};
