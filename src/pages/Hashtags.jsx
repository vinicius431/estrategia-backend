import React, { useState } from "react";

export default function Hashtags() {
  const [tema, setTema] = useState("");
  const [hashtags, setHashtags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const gerarHashtags = async () => {
    if (!tema.trim()) return;

    setLoading(true);
    setErro("");
    setHashtags([]);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/gerar-hashtags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tema }),
      });

      const data = await res.json();

      if (res.ok) {
        setHashtags(data.hashtags || []);
      } else {
        setErro(data.erro || "Erro desconhecido.");
      }
    } catch (err) {
      setErro("Erro de conexão com o servidor.");
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Gerador de Hashtags 🧠</h1>
      <p className="mb-4 text-gray-600">
        Digite um tema ou palavra-chave e veja sugestões reais de hashtags geradas por IA para usar nos seus conteúdos.
      </p>

      <div className="space-y-4 bg-white border p-6 rounded-lg shadow-md">
        <input
          type="text"
          value={tema}
          onChange={(e) => setTema(e.target.value)}
          placeholder="Ex: produtividade, fé, marketing..."
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={gerarHashtags}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? "Gerando..." : "Gerar Hashtags"}
        </button>

        {erro && <p className="text-red-600">{erro}</p>}

        {hashtags.length > 0 && (
          <div className="space-y-2">
            <p className="font-semibold text-gray-700">Sugestões da IA:</p>
            <div className="flex flex-wrap gap-2">
              {hashtags.map((tag, i) => (
                <span
                  key={i}
                  className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium"
                >
                  #{tag.replace(/^#/, "")}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
