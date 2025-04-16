import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

export default function Agendador() {
  const [searchParams] = useSearchParams();
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [data, setData] = useState("");
  const [midia, setMidia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [planoAtivo, setPlanoAtivo] = useState("Free");
  const [agendamentos, setAgendamentos] = useState([]);

  const limites = {
    Free: 5,
    Starter: 25,
    Plus: 100,
    Premium: Infinity
  };

  useEffect(() => {
    const planoSalvo = localStorage.getItem("planoAtivo") || "Free";
    setPlanoAtivo(planoSalvo);

    const agendamentosSalvos = JSON.parse(localStorage.getItem("agendamentos") || "[]");
    setAgendamentos(agendamentosSalvos);

    const tituloURL = searchParams.get("titulo");
    const descricaoURL = searchParams.get("descricao");

    if (tituloURL) setTitulo(decodeURIComponent(tituloURL));
    if (descricaoURL) setDescricao(decodeURIComponent(descricaoURL));
  }, [searchParams]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (agendamentos.length >= limites[planoAtivo]) {
      toast.error("Limite de agendamentos atingido para seu plano.");
      return;
    }

    const novoAgendamento = {
      titulo,
      descricao,
      data,
      midia: midia?.name || "Sem mídia"
    };

    setLoading(true);

    setTimeout(() => {
      const novos = [...agendamentos, novoAgendamento];
      localStorage.setItem("agendamentos", JSON.stringify(novos));
      setAgendamentos(novos);
      toast.success("✅ Agendamento salvo!");
      setLoading(false);
      setTitulo("");
      setDescricao("");
      setData("");
      setMidia(null);
    }, 1000);
  };

  const limiteAtingido = agendamentos.length >= limites[planoAtivo];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Agendador de Conteúdo</h1>
      <p className="mb-4 text-gray-700">
        Você já agendou <strong>{agendamentos.length}</strong> de{" "}
        <strong>{limites[planoAtivo] === Infinity ? "∞" : limites[planoAtivo]}</strong> permitidos no seu plano.
      </p>

      {limiteAtingido ? (
        <div className="bg-red-50 border border-red-300 text-red-700 p-5 rounded-md">
          <p className="mb-2 font-semibold">❌ Limite atingido</p>
          <p className="mb-2">Você já usou todos os agendamentos permitidos pelo plano <strong>{planoAtivo}</strong>.</p>
          <button
            onClick={() => window.location.href = "/dashboard/planos"}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Fazer upgrade de plano
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-md shadow-md border border-gray-200">
          <div>
            <label className="block mb-1 font-medium">Título do Post</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-4 py-2 rounded-md border"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Descrição</label>
            <textarea
              rows="4"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full px-4 py-2 rounded-md border"
              required
            ></textarea>
          </div>

          <div>
            <label className="block mb-1 font-medium">Data de Publicação</label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="px-4 py-2 rounded-md border"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Mídia (imagem ou vídeo)</label>
            <input
              type="file"
              onChange={(e) => setMidia(e.target.files[0])}
              accept="image/*,video/*"
              className="block"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            {loading ? "Agendando..." : "Agendar Conteúdo"}
          </button>
        </form>
      )}
    </div>
  );
}
