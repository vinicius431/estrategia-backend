import React, { useEffect, useState } from "react";

export default function MeusConteudos() {
  const [conteudos, setConteudos] = useState([]);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    const fetchAgendados = async () => {
      try {
        const res = await fetch("http://localhost:3001/agendamentos");
        const data = await res.json();
        setConteudos(data.reverse());
      } catch (err) {
        console.error("Erro ao buscar conteúdos:", err);
      }
    };

    fetchAgendados();
  }, []);

  const handleExcluir = async (index) => {
    const confirmacao = confirm("Tem certeza que deseja excluir este agendamento?");
    if (!confirmacao) return;

    try {
      const res = await fetch(`http://localhost:3001/agendamentos/${index}`, {
        method: "DELETE",
      });

      if (res.ok) {
        const novos = [...conteudos];
        novos.splice(index, 1);
        setConteudos(novos);
      } else {
        const erro = await res.json();
        alert("Erro ao excluir: " + erro.erro);
      }
    } catch (err) {
      console.error("Erro ao excluir:", err);
      alert("Erro ao conectar com o servidor.");
    }
  };

  const filtrados = conteudos.filter((item) =>
    item.titulo.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">
          Meus Conteúdos ({filtrados.length})
        </h1>
        <input
          type="text"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          placeholder="Filtrar por título..."
          className="px-4 py-2 border rounded-md w-full sm:w-64 text-sm"
        />
      </div>

      {filtrados.length === 0 ? (
        <p className="text-gray-500">Nenhum conteúdo encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filtrados.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden border"
            >
              {item.imagem && (
                <img
                  src={item.imagem}
                  alt="Post"
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h2 className="text-lg font-bold text-gray-800 mb-2">
                  {item.titulo}
                </h2>
                <p className="text-sm text-gray-500 mb-1">
                  Publicação em: {item.data}
                </p>
                {item.descricao && (
                  <p className="text-sm text-gray-600 mb-3">{item.descricao}</p>
                )}
                <button
                  onClick={() => handleExcluir(index)}
                  className="text-red-600 text-sm hover:underline"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
