import React, { useState } from "react";

export default function Analise() {
  const [imagem, setImagem] = useState(null);
  const [preview, setPreview] = useState(null);
  const [url, setUrl] = useState("");
  const [feedback, setFeedback] = useState("");

  const handleImagem = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagem(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const analisar = () => {
    if (!imagem && !url.trim()) {
      setFeedback("Envie uma imagem ou uma URL para receber sugestões.");
      return;
    }

    let base = "Análise gerada com base nas informações fornecidas:\n";

    if (imagem) {
      base += "- Imagem carregada: pode ser avaliada visualmente.\n";
    }

    if (url.trim()) {
      base += `- URL: "${url}" aparenta estar no ar.\n`;
      base += "- Sugestão: verifique se a página contém CTA visível, linguagem persuasiva e estrutura responsiva.\n";
    }

    base += "\n🔍 Dica extra: Certifique-se de que sua proposta de valor está clara nos primeiros 3 segundos.";

    setFeedback(base);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Análise Estratégica</h1>
      <p className="mb-6 text-gray-700">
        Envie uma imagem ou cole a URL de sua landing page para receber sugestões de melhoria.
      </p>

      <div className="bg-[#0d1b25] p-6 rounded-xl shadow-md text-white space-y-4">
        {/* Upload de Imagem */}
        <div>
          <label className="block mb-1">Imagem (opcional)</label>
          <input type="file" accept="image/*" onChange={handleImagem} />
          {preview && (
            <div className="mt-3">
              <p className="text-sm mb-1">Preview da Imagem:</p>
              <img src={preview} alt="preview" className="max-w-xs rounded shadow-md" />
            </div>
          )}
        </div>

        {/* Campo de URL */}
        <div>
          <label className="block mb-1">URL da sua página</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://exemplo.com"
            className="w-full px-4 py-2 rounded-md border border-gray-300 text-black"
          />
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-blue-400 hover:underline text-sm"
            >
              Visualizar site ↗
            </a>
          )}
        </div>

        {/* Botão de Análise */}
        <button
          onClick={analisar}
          className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
        >
          Analisar
        </button>

        {/* Feedback da análise */}
        {feedback && (
          <div className="mt-4 bg-white text-gray-800 p-4 rounded shadow">
            <pre className="whitespace-pre-wrap text-sm">{feedback}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
