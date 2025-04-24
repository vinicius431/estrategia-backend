import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const frases = [
  "Crie uma solução antes do problema surgir.",
  "Ideias ganham poder quando são executadas.",
  "Você não precisa postar mais, precisa postar certo.",
  "Quem planeja, lucra. Quem improvisa, cansa.",
  "Uma headline poderosa vale por mil palavras.",
];

const fraseDoDia = frases[Math.floor(Math.random() * frases.length)];

export default function CentralIdeias() {
  const [tema, setTema] = useState("");
  const [headlines, setHeadlines] = useState([]);
  const [descricoes, setDescricoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [headlineSelecionada, setHeadlineSelecionada] = useState("");
  const [descricaoSelecionada, setDescricaoSelecionada] = useState("");
  const navigate = useNavigate();

  const gerar = async () => {
    if (!tema.trim()) return;

    setLoading(true);
    setMensagem("");
    setHeadlines([]);
    setDescricoes([]);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/gerar-conteudo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tema }),
      });

      const data = await res.json();

      if (res.ok) {
        setHeadlines(data.headlines || []);
        setDescricoes(data.descricoes || []);
      } else {
        setMensagem("❌ Erro: " + (data.erro || "Erro desconhecido"));
      }
    } catch (err) {
      console.error(err);
      setMensagem("❌ Erro de conexão com o servidor.");
    }

    setLoading(false);
  };

  const enviarParaAgendador = () => {
    const titulo = encodeURIComponent(headlineSelecionada);
    const descricao = encodeURIComponent(descricaoSelecionada);
    navigate(`/dashboard/agendador?titulo=${titulo}&descricao=${descricao}`);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Central de Ideias ✨</h1>
      <p className="mb-4 text-gray-700 italic">“{fraseDoDia}”</p>

      <div className="mb-6">
        <label className="block font-semibold mb-1">Sobre o que é seu conteúdo?</label>
        <input
          type="text"
          value={tema}
          onChange={(e) => setTema(e.target.value)}
          placeholder="Ex: Dicas de produtividade para redes sociais"
          className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={gerar}
          disabled={loading}
          className="mt-3 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? "Gerando..." : "Gerar com IA"}
        </button>
      </div>

      {mensagem && (
        <div className="text-red-600 bg-red-100 p-3 rounded mb-4">{mensagem}</div>
      )}

      {headlines.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="font-semibold mb-2">Escolha uma Headline:</h2>
            <ul className="space-y-2">
              {headlines.map((h, i) => (
                <li
                  key={i}
                  className={`p-3 border rounded cursor-pointer transition ${
                    headlineSelecionada === h
                      ? "bg-blue-100 border-blue-500"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setHeadlineSelecionada(h)}
                >
                  {h}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-semibold mb-2">Escolha uma Descrição:</h2>
            <ul className="space-y-2">
              {descricoes.map((d, i) => (
                <li
                  key={i}
                  className={`p-3 border rounded cursor-pointer transition ${
                    descricaoSelecionada === d
                      ? "bg-green-100 border-green-500"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setDescricaoSelecionada(d)}
                >
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {headlineSelecionada && descricaoSelecionada && (
        <div className="mt-6">
          <button
            onClick={enviarParaAgendador}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
          >
            Usar no Agendador
          </button>
        </div>
      )}
    </div>
  );
}
