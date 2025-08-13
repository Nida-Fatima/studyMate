import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StudyMate from "./components/StudyMate";
import StudyPlanner from './pages/StudyPlanner';
import "./index.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StudyMate />} />
        <Route path="/study-planner" element={<StudyPlanner />} />
      </Routes>
    </Router>
  );
}

export default App;
