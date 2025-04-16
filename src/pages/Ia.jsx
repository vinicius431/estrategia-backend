import React, { useState } from "react";

export default function Ia() {
  const [tema, setTema] = useState("");
  const [resultado, setResultado] = useState(null);

  const gerarConteudo = (e) => {
    e.preventDefault();

    // Simulando resposta da IA
    setResultado({
      titulo: `Dica sobre ${tema}`,
      legenda: `Você sabia que ${tema} pode transformar seus resultados? Descubra como!`,
      cta: "Clique no link da bio e comece agora.",
      imagem: `Sugestão: imagem mostrando ${tema} na prática.`
    });

    setTema("");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">IA de Conteúdo</h1>
      <p className="mb-6">Digite um tema e receba ideias de conteúdo geradas por IA.</p>

      <form onSubmit={gerarConteudo} className="space-y-4 mb-8">
        <input
          type="text"
          placeholder="Digite o tema ou produto..."
          value={tema}
          onChange={(e) => setTema(e.target.value)}
          className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-200"
        >
          Gerar Conteúdo
        </button>
      </form>

      {resultado && (
        <div className="bg-[#0d1b25] p-6 rounded-xl shadow-md text-white space-y-2">
          <p><strong>Título:</strong> {resultado.titulo}</p>
          <p><strong>Legenda:</strong> {resultado.legenda}</p>
          <p><strong>CTA:</strong> {resultado.cta}</p>
          <p><strong>Imagem:</strong> {resultado.imagem}</p>
        </div>
      )}
    </div>
  );
}
