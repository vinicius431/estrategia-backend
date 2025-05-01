import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Home, Calendar, LineChart, GraduationCap, BadgeDollarSign,
  Menu, X, Wand2, Image, LayoutGrid, Hash, LogOut, RefreshCcw
} from "lucide-react";

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [planoAtivo, setPlanoAtivo] = useState("Free");
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("usuario");
    if (usuarioSalvo) {
      const usuario = JSON.parse(usuarioSalvo);
      setPlanoAtivo(usuario.plano || "Free");
    }

    // ✅ Escuta de exclusão global
    window.addEventListener("toast-excluir", () => {
      toast.success("Conteúdo excluído com sucesso!");
    });

    return () => {
      window.removeEventListener("toast-excluir", () => {});
    };
  }, []);

  const recarregarPlano = async () => {
    const usuarioStr = localStorage.getItem("usuario");
    if (!usuarioStr) return toast.error("Usuário não encontrado.");

    const usuario = JSON.parse(usuarioStr);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/recarregar-plano`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: usuario.email })
      });

      const data = await res.json();

      if (res.ok) {
        usuario.plano = data.plano;
        localStorage.setItem("usuario", JSON.stringify(usuario));
        localStorage.setItem("planoAtivo", data.plano);
        setPlanoAtivo(data.plano);
        toast.success("Plano recarregado com sucesso!");
      } else {
        toast.error(data.erro || "Erro ao recarregar plano.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro de conexão.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Você saiu da sua conta.");
    setTimeout(() => navigate("/"), 1000);
  };

  const handleUpgradeClick = () => {
    toast.success("Redirecionando para os planos...");
    setTimeout(() => navigate("/dashboard/planos"), 1000);
  };

  const agendamentosPermitidos = {
    Free: 5,
    Starter: 25,
    Plus: 100,
    Premium: Infinity
  };

  const navItems = [
    { label: "Início", to: "/dashboard", icon: <Home size={18} /> },
    { label: "Agendador", to: "/dashboard/agendador", icon: <Calendar size={18} /> },
    { label: "Central de Ideias", to: "/dashboard/central", icon: <Wand2 size={18} /> },
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
      label: "Biblioteca", to: "/dashboard/biblioteca", icon: <Image size={18} />
    },
    {
      label: "Hashtags", to: "/dashboard/hashtags", icon: <Hash size={18} />
    },
    {
      label: "Meus Conteúdos", to: "/dashboard/meus-conteudos", icon: <LayoutGrid size={18} />
    },
    {
      label: "Feed", to: "/dashboard/feed", icon: <LayoutGrid size={18} />
    },
    {
      label: "Planos", to: "/dashboard/planos", icon: <BadgeDollarSign size={18} />, badge: planoAtivo
    },
    {
      label: "Sair", to: "#", icon: <LogOut size={18} />, action: handleLogout
    }
  ];

  return (
    <div className="flex min-h-screen text-gray-900 font-sans relative">
      <button
        onClick={() => setMenuAberto(!menuAberto)}
        className="absolute top-4 left-4 z-30 md:hidden text-white bg-blue-600 p-2 rounded"
      >
        {menuAberto ? <X /> : <Menu />}
      </button>

      <aside className={`fixed z-20 inset-y-0 left-0 w-64 bg-[#0d1b25] text-white p-6 transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${menuAberto ? "translate-x-0" : "-translate-x-full"}`}>
        <h2 className="text-2xl font-bold mb-8">EstrategIA</h2>
        <nav className="space-y-3">
          {navItems.map((item) => (
            <button
              key={item.to}
              onClick={() => {
                if (item.action) item.action();
                else navigate(item.to);
                setMenuAberto(false);
              }}
              className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-md transition ${
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
            </button>
          ))}
        </nav>

        <div className="mt-10 p-3 text-sm bg-green-700/20 border border-green-500 rounded-lg text-green-300">
          <span className="font-semibold">🔥 Plano Premium</span> — mais popular entre os criadores!
        </div>
      </aside>

      <main className="flex-1 bg-white p-8 md:ml-64 w-full overflow-y-auto">
        {localStorage.getItem("usuario") && (
          <div className="flex justify-end mb-4">
            <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full shadow text-sm text-gray-800 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9.004 9.004 0 0112 15c2.21 0 4.21.806 5.879 2.136M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{JSON.parse(localStorage.getItem("usuario")).nome}</span>
            </div>
          </div>
        )}

        <div className="mb-6 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-800 rounded-md text-sm shadow-sm flex items-center justify-between">
          <span>
            Você está no plano <strong>{planoAtivo}</strong> — Agendamentos permitidos:{" "}
            {agendamentosPermitidos[planoAtivo] === Infinity
              ? "Ilimitado"
              : agendamentosPermitidos[planoAtivo]}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={recarregarPlano}
              className="text-xs text-blue-700 hover:underline flex items-center gap-1"
            >
              <RefreshCcw size={14} /> Recarregar Plano
            </button>
            {planoAtivo === "Free" && (
              <button
                onClick={handleUpgradeClick}
                className="bg-blue-600 text-white text-xs px-4 py-1.5 rounded-md hover:bg-blue-700 transition"
              >
                Fazer upgrade
              </button>
            )}
          </div>
        </div>

        <Outlet />
      </main>
    </div>
  );
}
