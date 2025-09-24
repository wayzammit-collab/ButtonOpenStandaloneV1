// Multi‑trainer router with top nav.
// Assumes these files exist:
//   ./trainers/scenario/ScenarioTrainer.jsx
//   ./trainers/open/OpenTrainer.jsx
//   ./trainers/threebet/ThreeBetTrainer.jsx
import React from 'react'
import { Routes, Route, NavLink, Navigate } from 'react-router-dom'
import ScenarioTrainer from './trainers/scenario/ScenarioTrainer.jsx'
import OpenTrainer from './trainers/open/OpenTrainer.jsx'
import ThreeBetTrainer from './trainers/threebet/ThreeBetTrainer.jsx'
import './styles.css'

function TopNav() {
  return (
    <div className="topbar">
      <div className="brand">NLHE tools</div>
      <div className="spacer" />
      <div className="links">
        <NavLink to="/open" className={({isActive})=>`link ${isActive?'active':''}`}>Open Trainer</NavLink>
        <NavLink to="/threebet" className={({isActive})=>`link ${isActive?'active':''}`}>3‑Bet Trainer</NavLink>
        <NavLink to="/scenario" className={({isActive})=>`link ${isActive?'active':''}`}>Scenario Trainer</NavLink>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <div className="app-shell">
      <TopNav />
      <div className="content">
        <Routes>
          {/* Default route -> Open Trainer (change if desired) */}
          <Route path="/" element={<Navigate to="/open" replace />} />
          <Route path="/open" element={<OpenTrainer />} />
          <Route path="/threebet" element={<ThreeBetTrainer />} />
          <Route path="/scenario" element={<ScenarioTrainer />} />
          {/* Handle accidental gh‑pages prefixed paths while local */}
          <Route path="/ButtonOpenStandaloneV1/*" element={<Navigate to="/open" replace />} />
          <Route path="*" element={<Navigate to="/open" replace />} />
        </Routes>
      </div>
    </div>
  )
}
