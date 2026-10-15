import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import App from './App.jsx'
import './index.css'

// In production (Vercel), route relative /api calls to the Render backend
const apiUrl = import.meta.env.VITE_API_URL;
if (apiUrl && apiUrl.startsWith('http')) {
  axios.defaults.baseURL = apiUrl.replace(/\/api\/?$/, '');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

