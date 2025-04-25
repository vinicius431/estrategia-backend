import React, { useEffect, useState } from "react";
import {
  CalendarCheck,
  Sparkles,
  Clock,
  ArrowRight,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// Frases motivacionais rotativas
const frases = [
  "Quem planta consistência colhe resultados.",
  "Pequenos passos diários constroem grandes conquistas.",
  "Ideias são sementes. Ação é rega.",
  "Você não precisa postar mais. Precisa postar certo.",
  "A constância vence o talento quando o talento não é constante.",
  "Sua mensagem só transforma se for compartilhada.",
];

const fraseDoDia = frases[new Date().getDate() % frases.length];

export default function Home() {
  const [totalAgendados, setTotalAgendados] = useState(0);
  const [ultimaData, setUltimaData] = useState("");
  const [ultimoTema, setUltimoTema] = useState("");
  const [frequencia, setFrequencia] = useState([]);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    const agendados = JSON.parse(localStorage.getItem("agendamentos")) || [];
    setTotalAgendados(agendados.length);

    if (agendados.length > 0) {
      const ultima = agendados[agendados.length - 1];
      setUltimaData(ultima.data || "Não informado");
    }

    const tutorInfo = JSON.parse(localStorage.getItem("tutorTema"));
    if (tutorInfo) setUltimoTema(tutorInfo);

    // Organizar por semana
    const frequenciaSemanal = [0, 0, 0, 0]; // 4 semanas
    const hoje = new Date();

    agendados.forEach((post) => {
      const data = new Date(post.data);
      const diff = Math.floor((hoje - data) / (1000 * 60 * 60 * 24));
      const semana = Math.floor(diff / 7);
      if (semana >= 0 && semana < 4) {
        frequenciaSemanal[3 - semana]++; // inverso pra mostrar do passado pro presente
      }
    });

    const labels = ["Há 3 sem", "Há 2 sem", "Semana passada", "Atual"];
    const dataset = frequenciaSemanal.map((qtd, i) => ({
      semana: labels[i],
      posts: qtd,
    }));

    setFrequencia(dataset);

    const atual = dataset[3].posts;
    const anterior = dataset[2].posts;

    if (atual > anterior) {
      setMensagem("🎉 Sua frequência aumentou. Continue nesse ritmo!");
    } else if (atual < anterior) {
      setMensagem("⚠️ Sua frequência caiu. Lembre-se: constância gera resultados.");
    } else {
      setMensagem("📌 Frequência estável. A constância faz o sucesso acontecer.");
    }
  }, []);

  return (
    <div className="space-y-8">
      {/* Frase motivacional */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold">Motivação do Dia</h2>
        <p className="text-lg italic mt-2">“{fraseDoDia}”</p>
      </div>

      {/* Indicadores principais */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white p-4 rounded-lg shadow border flex items-center gap-4">
          <CalendarCheck className="text-blue-600" size={32} />
          <div>
            <h3 className="text-lg font-semibold">Agendados</h3>
            <p className="text-2xl font-bold">{totalAgendados}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border flex items-center gap-4">
          <Clock className="text-yellow-500" size={32} />
          <div>
            <h3 className="text-lg font-semibold">Última Publicação</h3>
            <p className="text-sm text-gray-600">{ultimaData || "Nenhuma"}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border flex items-center gap-4">
          <Sparkles className="text-purple-600" size={32} />
          <div>
            <h3 className="text-lg font-semibold">Último Tema</h3>
            <p className="text-sm text-gray-600">
              {ultimoTema || "Nada gerado ainda"}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border flex items-center gap-4">
          <ArrowRight className="text-green-600" size={32} />
          <div>
            <h3 className="text-lg font-semibold">Próxima Ação</h3>
            <a
              href="/dashboard/agendador"
              className="text-blue-600 underline text-sm hover:text-blue-800"
            >
              Agendar novo conteúdo →
            </a>
          </div>
        </div>
      </div>

      {/* Gráfico + mensagem */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="mb-4 flex items-center gap-2">
          {mensagem.includes("aumentou") ? (
            <TrendingUp className="text-green-600" />
          ) : mensagem.includes("caiu") ? (
            <TrendingDown className="text-red-600" />
          ) : (
            <Sparkles className="text-blue-600" />
          )}
          <span className="text-sm text-gray-800 font-medium">{mensagem}</span>
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={frequencia}>
            <XAxis dataKey="semana" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="posts" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        <p className="mt-4 text-sm text-gray-600 italic">
          A constância é o diferencial de quem alcança resultados no digital.
        </p>
      </div>
    </div>
  );
}
