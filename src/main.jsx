// Ready to paste: Router basename must match Vite base (without the trailing slash)
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename="/ButtonOpenStandaloneV1">
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
