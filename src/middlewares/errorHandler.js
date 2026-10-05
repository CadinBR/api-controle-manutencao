const AppError = require('../errors/AppError');

// Todo erro da API passa por aqui e sai no mesmo formato: { status, erro, detalhes }
function tratarErro(err, res) {
  if (err instanceof AppError) {
    return res.json(err.status, { status: err.status, erro: err.message, detalhes: err.detalhes });
  }

  console.error(err); // erro inesperado: só aparece no terminal
  res.json(500, { status: 500, erro: 'Erro interno do servidor', detalhes: [] });
}

module.exports = { tratarErro };
