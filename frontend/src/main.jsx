import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AuthProvider from './contexto/AuthProvider.jsx'
import ActividadProvider from './contexto/ActividadProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ActividadProvider>
        <App />
      </ActividadProvider>
    </AuthProvider>
  </StrictMode>,
)