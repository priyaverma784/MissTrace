import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import axios from 'axios'
import App from './App'
import './index.css'

// Backend address (set in the .env file). Every axios call in the app uses it.
axios.defaults.baseURL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://127.0.0.1:5000'

// Face matching can take a few seconds, so allow a long wait.
axios.defaults.timeout = 60000

// If the user is logged in, send their token with every request.
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('misstrace_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
