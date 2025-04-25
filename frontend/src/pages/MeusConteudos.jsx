import React, { useEffect, useState } from "react";

export default function MeusConteudos() {
  const [conteudos, setConteudos] = useState([]);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    const fetchAgendados = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/agendamentos`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await res.json();

        if (Array.isArray(data)) {
          setConteudos(data.reverse());
        } else {
          console.error("Dados retornados não são um array:", data);
        }
      } catch (err) {
        console.error("Erro ao buscar conteúdos:", err);
      }
    };

    fetchAgendados();
  }, []);

  const handleExcluir = async (id) => {
    const confirmacao = confirm("Tem certeza que deseja excluir este agendamento?");
    if (!confirmacao) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/agendamentos/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.ok) {
        setConteudos((prev) => prev.filter((item) => item._id !== id));
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
          {filtrados.map((item) => (
            <div
              key={item._id}
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
                {item.status && (
                  <p className="text-xs mb-2">
                    <span className={`inline-block px-2 py-1 rounded-full text-white text-[11px] font-semibold ${item.status === "agendado" ? "bg-blue-500" : "bg-green-500"}`}>
                      {item.status.toUpperCase()}
                    </span>
                  </p>
                )}
                {item.descricao && (
                  <p className="text-sm text-gray-600 mb-3">{item.descricao}</p>
                )}
                <button
                  onClick={() => handleExcluir(item._id)}
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
