import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Agendador from "./pages/Agendador";
import Tutor from "./pages/Tutor";
import Analise from "./pages/Analise";
import Planos from "./pages/Planos";
import Biblioteca from "./pages/Biblioteca";
import Hashtags from "./pages/Hashtags";
import CentralIdeias from "./pages/CentralIdeias";
import MeusConteudos from "./pages/MeusConteudos";
import Feed from "./pages/Feed";

import DashboardLayout from "./components/DashboardLayout";

function RotaProtegida({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <RotaProtegida>
              <DashboardLayout />
            </RotaProtegida>
          }
        >
          <Route index element={<Home />} />
          <Route path="agendador" element={<Agendador />} />
          <Route path="tutor" element={<Tutor />} />
          <Route path="analise" element={<Analise />} />
          <Route path="planos" element={<Planos />} />
          <Route path="biblioteca" element={<Biblioteca />} />
          <Route path="hashtags" element={<Hashtags />} />
          <Route path="meus-conteudos" element={<MeusConteudos />} />
          <Route path="central" element={<CentralIdeias />} />
          <Route path="feed" element={<Feed />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
