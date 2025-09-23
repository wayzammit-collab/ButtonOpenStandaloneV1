import React, { Suspense, lazy } from "react";
import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import ThreeBetTrainer from "./trainers/threebet/ThreeBetTrainer.jsx";
const ScenarioTrainer = lazy(() => import("./trainers/scenario/ScenarioTrainer.jsx"));
// Restore Open Trainer (adjust the path if different)
const OpenTrainer = lazy(() => import("./trainers/open/OpenTrainer.jsx"));

function NavItem({ to, label, end=false }) {
  return (
    <NavLink
      to={to}
      end={end}
      style={({ isActive }) => ({
        color: isActive ? "#ffffff" : "#a8b2c7",
        textDecoration: "none",
        padding: "6px 10px",
        borderRadius: 8,
        background: isActive ? "#2a3245" : "transparent"
      })}
    >
      {label}
    </NavLink>
  );
}

export default function App() {
  return (
    <div>
      <nav className="nav" style={{ display:"flex", gap:12, padding:10, alignItems:"center" }}>
        <NavItem to="/" label="3‑Bet Trainer" end />
        <NavItem to="/open" label="Open Trainer" />
        <NavItem to="/scenario" label="Scenario Trainer" />
        <div style={{ marginLeft:"auto", color:"#a8b2c7", fontSize:12 }}>NLHE tools</div>
      </nav>

      <div style={{ padding: 10 }}>
        <Suspense fallback={<div style={{ color:"#e6ecff" }}>Loading…</div>}>
          <Routes>
            {/* Default landing */}
            <Route index element={<ThreeBetTrainer />} />
            <Route path="/threebet" element={<ThreeBetTrainer />} />
            {/* Restored Open Trainer */}
            <Route path="/open" element={<OpenTrainer />} />
            {/* Scenario Trainer */}
            <Route path="/scenario" element={<ScenarioTrainer />} />
            {/* Redirect unknown paths to home */}
            <Route path="/*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
}
