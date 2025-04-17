import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Agendador from "./pages/Agendador";
import Tutor from "./pages/Tutor";
import IA from "./pages/IA";
import Analise from "./pages/Analise";
import Planos from "./pages/Planos";
import Biblioteca from "./pages/Biblioteca";
import Hashtags from "./pages/Hashtags";
import CentralIdeias from "./pages/CentralIdeias";
import MeusConteudos from "./pages/MeusConteudos";

import DashboardLayout from "./components/DashboardLayout";

function App() {
  return (
    <Router>
      <Routes>
        {/* Página inicial (login) */}
        <Route path="/" element={<Login />} />

        {/* Área logada com layout do dashboard */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Home />} />
          <Route path="agendador" element={<Agendador />} />
          <Route path="ia" element={<IA />} />
          <Route path="analise" element={<Analise />} />
          <Route path="tutor" element={<Tutor />} />
          <Route path="planos" element={<Planos />} />
          <Route path="biblioteca" element={<Biblioteca />} />
          <Route path="hashtags" element={<Hashtags />} />
          <Route path="meus-conteudos" element={<MeusConteudos />} />
          <Route path="central" element={<CentralIdeias />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
