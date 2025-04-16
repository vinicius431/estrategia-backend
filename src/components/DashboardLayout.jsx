import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Home,
  Calendar,
  Sparkles,
  LineChart,
  GraduationCap,
  BadgeDollarSign,
  Menu,
  X
} from "lucide-react";

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [planoAtivo, setPlanoAtivo] = useState("Free");
  const [menuAberto, setMenuAberto] = useState(false);

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
    <div className="flex min-h-screen text-gray-900 font-sans relative">
      {/* Botão Hamburguer */}
      <button
        onClick={() => setMenuAberto(!menuAberto)}
        className="absolute top-4 left-4 z-30 md:hidden text-white bg-blue-600 p-2 rounded"
      >
        {menuAberto ? <X /> : <Menu />}
      </button>

      {/* Menu lateral */}
      <aside
        className={`fixed z-20 inset-y-0 left-0 w-64 bg-[#0d1b25] text-white p-6 transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          menuAberto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <h2 className="text-2xl font-bold mb-8">EstrategIA</h2>
        <nav className="space-y-3">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMenuAberto(false)}
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

        {/* Selo Premium */}
        <div className="mt-10 p-3 text-sm bg-green-700/20 border border-green-500 rounded-lg text-green-300">
          <span className="font-semibold">🔥 Plano Premium</span> — mais popular entre os criadores!
        </div>
      </aside>

      {/* Área principal */}
      <main className="flex-1 bg-white p-8 md:ml-64 w-full overflow-y-auto">
        {/* Faixa do plano ativo */}
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
