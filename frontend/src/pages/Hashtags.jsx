import React, { useState } from "react";

export default function Hashtags() {
  const [tema, setTema] = useState("");
  const [hashtags, setHashtags] = useState([]);

  const gerarHashtags = (termo) => {
    if (!termo) {
      setHashtags([]);
      return;
    }

    const base = termo.toLowerCase().replace(/\s/g, "");
    const listaGerada = [
      `#${base}`,
      `#${base}2024`,
      `#${base}estrategia`,
      `#foco${base}`,
      `#vida${base}`,
      `#top${base}`,
      `#dicas${base}`,
      `#${base}naweb`,
      `#${base}digital`,
      `#auto${base}`,
    ];

    setHashtags(listaGerada);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Gerador de Hashtags 🧠</h1>
      <p className="mb-4 text-gray-600">
        Digite um tema ou palavra-chave e veja sugestões automáticas de hashtags para usar nos seus conteúdos.
      </p>

      <div className="space-y-4 bg-white border p-6 rounded-lg shadow-md max-w-lg">
        <input
          type="text"
          value={tema}
          onChange={(e) => {
            setTema(e.target.value);
            gerarHashtags(e.target.value);
          }}
          placeholder="Ex: produtividade, fé, marketing..."
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {hashtags.length > 0 && (
          <div className="space-y-2">
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
