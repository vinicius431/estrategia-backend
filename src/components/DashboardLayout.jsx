import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Home,
  Calendar,
  Sparkles,
  LineChart,
  GraduationCap,
  BadgeDollarSign
} from "lucide-react";

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [planoAtivo, setPlanoAtivo] = useState("Free");

  useEffect(() => {
    const planoSalvo = localStorage.getItem("planoAtivo") || "Free";
    setPlanoAtivo(planoSalvo);
  }, []);

  const navItems = [
    { label: "Início", to: "/dashboard", icon: <Home size={18} /> },
    { label: "Agendador", to: "/dashboard/agendador", icon: <Calendar size={18} /> },
    { label: "IA de Conteúdo", to: "/dashboard/ia", icon: <Sparkles size={18} /> },
    {
      label: "Análise Estratégica",
      to: "/dashboard/analise",
      icon: <LineChart size={18} />,
      disabled: planoAtivo === "Free"
    },
    {
      label: "Modo Tutor",
      to: "/dashboard/tutor",
      icon: <GraduationCap size={18} />,
      disabled: planoAtivo === "Free" || planoAtivo === "Starter"
    },
    {
      label: "Planos",
      to: "/dashboard/planos",
      icon: <BadgeDollarSign size={18} />,
      badge: planoAtivo
    }
  ];

  const handleUpgradeClick = () => {
    toast.success("Redirecionando para os planos...");
    setTimeout(() => {
      navigate("/dashboard/planos");
    }, 1000);
  };

  const agendamentosPermitidos = {
    Free: 5,
    Starter: 25,
    Plus: 100,
    Premium: Infinity
  };

  return (
    <div className="flex min-h-screen text-gray-900 font-sans">
      {/* Menu lateral */}
      <aside className="w-64 bg-[#0d1b25] text-white p-6">
        <h2 className="text-2xl font-bold mb-8">EstrategIA</h2>
        <nav className="space-y-3">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center justify-between px-3 py-2 rounded-md transition ${
                location.pathname === item.to ? "bg-blue-600" : "hover:bg-blue-600"
              } ${item.disabled ? "pointer-events-none opacity-40" : ""}`}
            >
              <div className="flex items-center gap-2">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="bg-blue-500 text-xs px-2 py-0.5 rounded-full font-medium">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Selo do Premium */}
        <div className="mt-10 p-3 text-sm bg-green-700/20 border border-green-500 rounded-lg text-green-300">
          <span className="font-semibold">🔥 Plano Premium</span> — mais popular entre os criadores!
        </div>
      </aside>

      {/* Área principal */}
      <main className="flex-1 bg-white p-8 overflow-y-auto">
        {/* Faixa de plano ativo e limite de agendamentos */}
        <div className="mb-6 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-800 rounded-md text-sm shadow-sm flex items-center justify-between">
          <span>
            Você está no plano <strong>{planoAtivo}</strong> — Agendamentos permitidos:{" "}
            {agendamentosPermitidos[planoAtivo] === Infinity
              ? "Ilimitado"
              : agendamentosPermitidos[planoAtivo]}
          </span>
          {planoAtivo === "Free" && (
            <button
              onClick={handleUpgradeClick}
              className="bg-blue-600 text-white text-xs px-4 py-1.5 rounded-md hover:bg-blue-700 transition"
            >
              Fazer upgrade
            </button>
          )}
        </div>

        <Outlet />
      </main>
    </div>
  );
}
