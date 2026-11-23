import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@jyothiswarup/pdf-template-builder/styles';
import './App.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
