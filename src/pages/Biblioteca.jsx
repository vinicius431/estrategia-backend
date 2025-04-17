import React, { useState, useEffect } from "react";

export default function Biblioteca() {
  const [imagens, setImagens] = useState([]);
  const [preview, setPreview] = useState([]);

  // Carrega imagens salvas localmente
  useEffect(() => {
    const salvas = JSON.parse(localStorage.getItem("bibliotecaMidias")) || [];
    setPreview(salvas);
  }, []);

  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    const novasImagens = [];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        novasImagens.push(base64);

        // Atualiza após última imagem ser lida
        if (novasImagens.length === files.length) {
          const atualizadas = [...novasImagens, ...preview];
          setPreview(atualizadas);
          localStorage.setItem("bibliotecaMidias", JSON.stringify(atualizadas));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Biblioteca de Mídias</h1>
      <p className="mb-6 text-gray-700">
        Faça upload de imagens e reutilize nos seus conteúdos com facilidade.
      </p>

      <div className="mb-4">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleUpload}
          className="text-sm"
        />
      </div>

      {preview.length === 0 ? (
        <p className="text-sm text-gray-500">Nenhuma imagem salva ainda.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {preview.map((img, i) => (
            <div key={i} className="border rounded shadow overflow-hidden">
              <img src={img} alt={`img-${i}`} className="w-full h-40 object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
