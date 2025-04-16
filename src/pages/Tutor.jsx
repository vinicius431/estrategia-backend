import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Tutor() {
  const [planoAtivo, setPlanoAtivo] = useState("Free");
  const [etapa, setEtapa] = useState(1);
  const [objetivo, setObjetivo] = useState("");
  const [nicho, setNicho] = useState("");
  const [resultado, setResultado] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const planoSalvo = localStorage.getItem("planoAtivo") || "Free";
    setPlanoAtivo(planoSalvo);
  }, []);

  const avancar = () => setEtapa((prev) => prev + 1);
  const voltar = () => setEtapa((prev) => prev - 1);

  const gerarHashtagsPorNicho = (n) => {
    switch (n) {
      case "Marketing Digital": return ["#marketingdigital", "#negociosonline", "#estrategia"];
      case "Fitness": return ["#fitness", "#saude", "#treino"];
      case "Relacionamentos": return ["#relacionamento", "#amor", "#casal"];
      case "Autoajuda": return ["#motivacao", "#mentalidade", "#superacao"];
      case "Moda": return ["#moda", "#estilo", "#tendencia"];
      case "Cristianismo": return ["#fe", "#jesus", "#palavradeDeus"];
      case "Empreendedorismo": return ["#empreender", "#negocios", "#startup"];
      default: return ["#estrategia", "#influencia", "#crescimento"];
    }
  };

  const iniciarIA = () => {
    if (!objetivo.trim() || !nicho) return;
    const tipo = objetivo.toLowerCase().includes("vender") ? "Post Promocional" :
                 objetivo.toLowerCase().includes("autoridade") ? "Post Educativo" :
                 "Post de Engajamento";

    const legenda = `Você sabia que ${objetivo.toLowerCase()} pode começar com uma simples ação? Comece hoje!`;
    const cta = "Comente sua experiência ou envie essa ideia a alguém!";
    const hashtags = gerarHashtagsPorNicho(nicho);

    setResultado({ tipo, legenda, cta, hashtags });
    avancar();
  };

  const irParaAgendador = () => {
    const titulo = encodeURIComponent(`${resultado.tipo} - ${objetivo}`);
    const descricao = encodeURIComponent(`${resultado.legenda} ${resultado.cta} ${resultado.hashtags.join(" ")}`);
    navigate(`/dashboard/agendador?titulo=${titulo}&descricao=${descricao}`);
  };

  // 🔒 BLOQUEIO PARA FREE e STARTER
  if (planoAtivo === "Free" || planoAtivo === "Starter") {
    return (
      <div className="p-6 border border-red-300 bg-red-50 text-red-700 rounded-md">
        <h2 className="text-xl font-bold mb-2">Acesso restrito ❌</h2>
        <p>
          O <strong>Modo Tutor</strong> está disponível apenas para os planos{" "}
          <strong>Plus</strong> e <strong>Premium</strong>. Faça upgrade para desbloquear esse recurso.
        </p>
      </div>
    );
  }

  // ✅ CONTEÚDO LIBERADO
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Modo Tutor 🤖</h1>

      {etapa === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Qual seu objetivo com o conteúdo?</label>
            <input
              type="text"
              placeholder="Ex: Quero engajar meu público"
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Selecione o nicho</label>
            <select
              value={nicho}
              onChange={(e) => setNicho(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione...</option>
              <option>Marketing Digital</option>
              <option>Fitness</option>
              <option>Relacionamentos</option>
              <option>Autoajuda</option>
              <option>Moda</option>
              <option>Cristianismo</option>
              <option>Empreendedorismo</option>
            </select>
          </div>

          <button
            onClick={iniciarIA}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Próximo
          </button>
        </div>
      )}

      {etapa === 2 && resultado && (
        <div className="space-y-4 mt-6">
          <p className="text-gray-700">Aqui está sua estratégia gerada:</p>
          <div className="bg-gray-100 p-4 rounded-md border-l-4 border-blue-600 space-y-2">
            <p><strong>Tipo:</strong> {resultado.tipo}</p>
            <p><strong>Legenda:</strong> {resultado.legenda}</p>
            <p><strong>CTA:</strong> {resultado.cta}</p>
            <p><strong>Hashtags:</strong> {resultado.hashtags.join(" ")}</p>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={voltar}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            >
              Voltar
            </button>
            <button
              onClick={avancar}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Próximo
            </button>
          </div>
        </div>
      )}

      {etapa === 3 && resultado && (
        <div className="space-y-4 mt-6">
          <p className="text-gray-700">Tudo pronto! Deseja enviar este conteúdo para o Agendador?</p>
          <div className="flex gap-4">
            <button
              onClick={voltar}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            >
              Voltar
            </button>
            <button
              onClick={irParaAgendador}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Enviar para Agendador
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
