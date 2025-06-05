import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { Home } from './pages/Home';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Home page */}
      <Route path="/" element={<Home />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
