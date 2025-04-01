import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import '../css/styles.css';

// Mount the React app when the DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('root');
  
  const root = createRoot(container);
  root.render(<App />);
});
