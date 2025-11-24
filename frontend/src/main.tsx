import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';
import './utils/registerSW'; // Register service worker for PWA
import './utils/errorHandler'; // Initialize global error handlers

// Prevent unhandled errors from crashing the app
window.addEventListener('error', (event) => {
  console.error('[Global Error Handler]', event.error);
  // Error handler will process this
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Global Unhandled Rejection]', event.reason);
  // Error handler will process this
  event.preventDefault();
});

// Render app with error boundary
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
