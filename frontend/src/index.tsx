// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter as Router } from 'react-router-dom';
import axios from 'axios'; // <-- NEW IMPORT

// --- THIS IS THE NEW LINE ---
// In production, use the ENV variable from Vercel. 
// In development, use "/" to hit the local proxy.
axios.defaults.baseURL = process.env.REACT_APP_API_URL || '/';
// ----------------------------

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <Router>
        <App />
      </Router>
    </AuthProvider>
  </React.StrictMode>
);