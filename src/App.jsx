// Ready to paste minimal app so the page shows content after deploy
import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'

function Home() {
  return (
    <div style={{ padding: 24, color: '#e6ecff', background: '#0f172a', minHeight: '100vh' }}>
      <h1 style={{ marginTop: 0 }}>Button Open — Standalone V1</h1>
      <p>This build is running from GitHub Pages subpath <code>/ButtonOpenStandaloneV1</code>.</p>
      <ul>
        <li><Link to="/trainer">Open Trainer</Link></li>
      </ul>
    </div>
  )
}

function Trainer() {
  return (
    <div style={{ padding: 24, color: '#e6ecff', background: '#0b1220', minHeight: '100vh' }}>
      <h2>Trainer placeholder</h2>
      <p>If this renders, routing and base path are configured correctly.</p>
      <p><Link to="/">Back</Link></p>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/trainer" element={<Trainer />} />
    </Routes>
  )
}
