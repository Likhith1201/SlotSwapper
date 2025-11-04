// src/components/Layout.tsx
import React, { ReactNode } from 'react';
import Header from './Header';
import styled from 'styled-components';

// This creates a main container for the app
const AppContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  font-family: Arial, sans-serif;
`;

const MainContent = styled.main`
  padding: 20px 0;
`;

const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <AppContainer>
      <Header />
      <MainContent>{children}</MainContent>
    </AppContainer>
  );
};
export default Layout;