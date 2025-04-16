import React, { useState } from "react";

export default function Analise() {
  const [url, setUrl] = useState("");
  const [imagem, setImagem] = useState(null);
  const [feedback, setFeedback] = useState("");

  const analisarCampanha = (e) => {
    e.preventDefault();

    if (!url && !imagem) {
      setFeedback("Por favor, insira uma URL ou envie uma imagem para análise.");
      return;
    }

    // Simulação de análise da IA
    setFeedback(
      `🧠 Sugestões Estratégicas:\n
🔹 Copy: O título da landing page está genérico. Que tal usar algo mais direto como “Transforme sua rotina em 7 dias com X técnica”?  
🔹 CTA: “Clique aqui” pode ser substituído por “Quero melhorar agora”.  
🔹 Estrutura: Insira depoimentos antes do botão de ação para aumentar conversão.  
🔹 Visual: Falta contraste entre o fundo e os botões.  
\n⚙️ Versão real em breve com IA integrada.`
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Análise Estratégica com IA</h1>
      <p className="mb-6">Cole a URL da sua página ou envie uma imagem da campanha para obter sugestões de melhoria.</p>

      <form onSubmit={analisarCampanha} className="space-y-4 mb-6">
        <input
          type="text"
          placeholder="https://exemplo.com/minha-pagina"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImagem(e.target.files[0])}
          className="block"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-200"
        >
          Analisar com IA
        </button>
      </form>

      {feedback && (
        <div className="bg-[#0d1b25] text-white p-4 rounded-md whitespace-pre-wrap shadow-md">
          {feedback}
        </div>
      )}
    </div>
  );
}
