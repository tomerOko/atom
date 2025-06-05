import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { GlobalStyles } from './shared/styles/GlobalStyles';
import { AppRoutes } from './routes';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <GlobalStyles />
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
};
