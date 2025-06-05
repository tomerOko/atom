import React, { useState } from 'react';
import { Sidebar } from '../sidebar/sidebar';
import type { LayoutProps } from './types';
import styles from './layout.module.css';

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={styles['layout']}>
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />

      <div className={styles['main-content']}>
        {/* Mobile menu button */}
        <button className={styles['menu-button']} onClick={toggleSidebar}>
          <span className={styles['hamburger']}>☰</span>
          <span className={styles['menu-text']}>תפריט</span>
        </button>

        <div className={styles['content']}>{children}</div>
      </div>
    </div>
  );
};
