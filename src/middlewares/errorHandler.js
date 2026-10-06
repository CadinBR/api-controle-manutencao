const AppError = require('../errors/AppError');

// Todo erro da API passa por aqui e sai no mesmo formato: { status, erro, detalhes }
function tratarErro(err, res) {
  // Se a resposta já começou a ser enviada, só encerra a conexão
  if (res.headersSent) {
    console.error(err);
    return res.end();
  }

  // Só confia no status se for um código HTTP válido (evita derrubar o servidor por um AppError mal montado)
  if (err instanceof AppError && Number.isInteger(err.status) && err.status >= 400 && err.status <= 599) {
    return res.json(err.status, { status: err.status, erro: err.message, detalhes: err.detalhes });
  }

  console.error(err); // erro inesperado: só aparece no terminal
  res.json(500, { status: 500, erro: 'Erro interno do servidor', detalhes: [] });
}

module.exports = { tratarErro };
