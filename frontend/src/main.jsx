import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './App.css'
import './index.css'

const rootElement = document.getElementById('root');

// Create the root
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      {/* BrowserRouter must wrap the App component to enable routing */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  );
}