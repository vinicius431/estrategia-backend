// middleware/limitesPlano.js

const limitesPorPlano = {
  Starter: { agendamentosMes: 15, iaInputsDia: 2, hashtagsDia: 1 },
  Plus: { agendamentosMes: 30, iaInputsDia: 5, hashtagsDia: 5 },
  Premium: { agendamentosMes: Infinity, iaInputsDia: 15, hashtagsDia: Infinity }
};

const checarLimitePlano = (tipo) => {
  return async (req, res, next) => {
    try {
      const usuario = req.usuario; // já vem do autenticarToken + findById
      const plano = usuario.planoAtivo || 'Starter';
      const limites = limitesPorPlano[plano];

      if (tipo === "agendamento" && usuario.agendamentosMes >= limites.agendamentosMes) {
        return res.status(403).json({ erro: `Limite de agendamentos atingido para o plano ${plano}` });
      }

      if (tipo === "ia" && usuario.iaInputsHoje >= limites.iaInputsDia) {
        return res.status(403).json({ erro: `Limite de uso da IA atingido para o plano ${plano}` });
      }

      if (tipo === "hashtag" && usuario.hashtagsHoje >= limites.hashtagsDia) {
        return res.status(403).json({ erro: `Limite de hashtag atingido para o plano ${plano}` });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ erro: "Erro ao validar limite do plano." });
    }
  };
};

module.exports = checarLimitePlano;
