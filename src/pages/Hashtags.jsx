import React, { useState } from "react";
import toast from "react-hot-toast";

export default function Hashtags() {
  const [tema, setTema] = useState("");
  const [hashtags, setHashtags] = useState([]);
  const [loading, setLoading] = useState(false);

  const gerarHashtagsIA = async () => {
    if (!tema.trim()) return toast.error("Digite um tema primeiro.");
    setLoading(true);
    setHashtags([]);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/gerar-hashtags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tema }),
      });

      const data = await res.json();

      if (!res.ok || !data.hashtags) {
        toast.error(data.erro || "Erro ao gerar hashtags com IA.");
        return;
      }

      const top5 = data.hashtags.slice(0, 5);
      setHashtags(top5);
      toast.success("Hashtags geradas com IA!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao conectar com a IA.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Gerador de Hashtags 🧠</h1>
      <p className="mb-4 text-gray-600">
        Digite um tema e descubra hashtags personalizadas para seu conteúdo.
      </p>

      <div className="space-y-4 bg-white border p-6 rounded-lg shadow-md max-w-lg">
        <input
          type="text"
          value={tema}
          onChange={(e) => setTema(e.target.value)}
          placeholder="Ex: produtividade, fé, marketing..."
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={gerarHashtagsIA}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? "Gerando com IA..." : "Gerar com IA 🔮"}
        </button>

        <p className="text-sm text-gray-500 italic">
          Aumente seu alcance com hashtags que estão bombando no seu nicho.
        </p>

        {hashtags.length > 0 && (
          <div className="space-y-2 pt-4">
            <p className="font-semibold text-gray-700">Sugestões:</p>
            <div className="grid grid-cols-2 gap-2">
              {hashtags.map((tag, i) => (
                <span
                  key={i}
                  className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
