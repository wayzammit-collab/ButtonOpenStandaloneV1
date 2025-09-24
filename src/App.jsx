// Multi‑trainer router with top nav styled as pill buttons.
import React from "react";
import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import ScenarioTrainer from "./trainers/scenario/ScenarioTrainer.jsx";
import OpenTrainer from "./trainers/open/OpenTrainer.jsx";
import ThreeBetTrainer from "./trainers/threebet/ThreeBetTrainer.jsx";
import "./styles.css";

function TopNav(){
  return (
    <div className="topbar card">
      <div className="brand">NLHE tools</div>
      <div className="spacer" />
      <div className="links">
        <NavLink to="/open" className={({isActive})=> isActive ? "btn primary" : "btn tonal"}>Open Trainer</NavLink>
        <NavLink to="/threebet" className={({isActive})=> isActive ? "btn primary" : "btn tonal"}>3‑Bet Trainer</NavLink>
        <NavLink to="/scenario" className={({isActive})=> isActive ? "btn primary" : "btn tonal"}>Scenario Trainer</NavLink>
      </div>
    </div>
  );
}

export default function App(){
  return (
    <div className="app-shell">
      <TopNav />
      <div className="content">
        <Routes>
          <Route path="/" element={<Navigate to="/open" replace />} />
          <Route path="/open" element={<OpenTrainer />} />
          <Route path="/threebet" element={<ThreeBetTrainer />} />
          <Route path="/scenario" element={<ScenarioTrainer />} />
          {/* Redirect old gh-pages style nested paths to Open */}
          <Route path="/ButtonOpenStandaloneV1/*" element={<Navigate to="/open" replace />} />
          <Route path="*" element={<Navigate to="/open" replace />} />
        </Routes>
      </div>
    </div>
  );
}
