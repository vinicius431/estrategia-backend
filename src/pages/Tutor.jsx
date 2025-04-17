import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Tutor() {
  const navigate = useNavigate();

  const [tema, setTema] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [cta, setCta] = useState("");
  const [hashtagsSelecionadas, setHashtagsSelecionadas] = useState([]);
  const todasHashtags = [
    "#marketingdigital",
    "#negocios",
    "#empreendedorismo",
    "#conteudointeligente",
    "#estrategia",
    "#produtividade",
    "#sucesso",
    "#foco",
    "#instagram",
    "#branding"
  ];

  const gerarIdeias = () => {
    if (!tema.trim()) return;

    // Geração automática simulada (poderá ser IA futuramente)
    const ideia = tema.trim();

    setTitulo(`Como aplicar ${ideia} de forma eficaz`);
    setDescricao(`Descubra como usar ${ideia} no seu dia a dia para gerar mais resultados, engajamento e crescimento no digital.`);
    setCta(`Clique no link da bio e aprenda a dominar ${ideia}!`);
    setHashtagsSelecionadas(
      todasHashtags
        .filter((tag) => tag.toLowerCase().includes(ideia.toLowerCase().split(" ")[0]))
        .slice(0, 5)
    );
  };

  const toggleHashtag = (tag) => {
    if (hashtagsSelecionadas.includes(tag)) {
      setHashtagsSelecionadas(hashtagsSelecionadas.filter((t) => t !== tag));
    } else {
      setHashtagsSelecionadas([...hashtagsSelecionadas, tag]);
    }
  };

  const irParaAgendador = () => {
    const query = new URLSearchParams({
      titulo: encodeURIComponent(titulo),
      descricao: encodeURIComponent(descricao),
      cta: encodeURIComponent(cta),
      hashtags: encodeURIComponent(hashtagsSelecionadas.join(" ")),
    }).toString();

    navigate(`/dashboard/agendador?${query}`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Modo Tutor 👨‍🏫</h1>

      <div>
        <label className="block font-semibold mb-1">Sobre o que você quer criar conteúdo?</label>
        <input
          type="text"
          value={tema}
          onChange={(e) => setTema(e.target.value)}
          placeholder="Ex: treinos em casa, vendas online, foco no trabalho..."
          className="w-full px-4 py-2 border rounded-md text-black"
        />
        <button
          onClick={gerarIdeias}
          className="mt-2 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Gerar sugestões
        </button>
      </div>

      <div>
        <label className="block font-semibold mb-1">Headline (Título)</label>
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="w-full px-4 py-2 border rounded-md text-black"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Descrição</label>
        <textarea
          rows="3"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="w-full px-4 py-2 border rounded-md text-black"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">CTA (Chamada para ação)</label>
        <input
          type="text"
          value={cta}
          onChange={(e) => setCta(e.target.value)}
          className="w-full px-4 py-2 border rounded-md text-black"
        />
      </div>

      <div>
        <label className="block font-semibold mb-2">Hashtags</label>
        <div className="flex flex-wrap gap-2">
          {todasHashtags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleHashtag(tag)}
              className={`px-3 py-1 rounded-full border text-sm ${
                hashtagsSelecionadas.includes(tag)
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4">
        <button
          onClick={irParaAgendador}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
        >
          Usar no Agendador
        </button>
      </div>
    </div>
  );
}
