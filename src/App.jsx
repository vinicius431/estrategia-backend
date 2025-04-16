import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Agendador from "./pages/Agendador";
import Ia from "./pages/Ia";
import Analise from "./pages/Analise";
import Tutor from "./pages/Tutor";
import Planos from "./pages/Planos"; // 🚨 Importação nova

import DashboardLayout from "./components/DashboardLayout";

function App() {
  return (
    <Router>
      <Routes>
        {/* Página de login */}
        <Route path="/" element={<Login />} />

        {/* Área logada */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Home />} />
          <Route path="agendador" element={<Agendador />} />
          <Route path="ia" element={<Ia />} />
          <Route path="analise" element={<Analise />} />
          <Route path="tutor" element={<Tutor />} />
          <Route path="planos" element={<Planos />} /> {/* ✅ Rota nova */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
