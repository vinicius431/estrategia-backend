import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Tutor() {
  const navigate = useNavigate();

  const [tema, setTema] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [cta, setCta] = useState("");
  const [hashtagsSelecionadas, setHashtagsSelecionadas] = useState([]);
  const [loading, setLoading] = useState(false);

  const gerarIdeias = async () => {
    if (!tema.trim()) return toast.error("Digite um tema.");

    setLoading(true);
    setTitulo("");
    setDescricao("");
    setCta("");
    setHashtagsSelecionadas([]);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/gerar-tutor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tema }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.erro || "Erro ao gerar conteúdo.");
        return;
      }

      setTitulo(data.headline || "");
      setDescricao(data.descricao || "");
      setCta(data.cta || "");
      setHashtagsSelecionadas(data.hashtags || []);
      toast.success("Sugestões geradas com IA!");
    } catch (err) {
      console.error(err);
      toast.error("Erro de conexão com a IA.");
    } finally {
      setLoading(false);
    }
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
          disabled={loading}
          className="mt-2 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? "Gerando..." : "Gerar sugestões com IA"}
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
          {hashtagsSelecionadas.map((tag) => (
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
