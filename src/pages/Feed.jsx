import React, { useEffect, useState } from "react";

export default function Feed() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const buscarPosts = async () => {
      try {
        const res = await fetch("http://localhost:3001/agendamentos");
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        console.error("Erro ao buscar agendamentos:", err);
      }
    };

    buscarPosts();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Feed de Conteúdos Agendados</h1>
      <p className="mb-6 text-gray-600">Veja todos os posts programados com imagens e legendas.</p>

      {posts.length === 0 ? (
        <p className="text-gray-500 text-sm">Nenhum conteúdo agendado ainda.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {posts.map((post, index) => (
            <div key={index} className="bg-white border rounded-lg shadow p-4 space-y-3">
              {post.imagem ? (
                <img
                  src={post.imagem}
                  alt={`Post ${index}`}
                  className="w-full h-40 object-cover rounded"
                />
              ) : (
                <div className="h-40 flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
                  Sem imagem
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold">{post.titulo}</h3>
                <p className="text-sm text-gray-500">Publicar em: {post.data}</p>
                <p className="text-sm mt-2 text-gray-700 whitespace-pre-line">
                  {post.descricao?.length > 120
                    ? post.descricao.substring(0, 120) + "..."
                    : post.descricao}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
