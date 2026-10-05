// Erro com status HTTP. Exemplo: throw new AppError(404, 'Equipamento não encontrado');
class AppError extends Error {
  constructor(status, mensagem, detalhes = []) {
    super(mensagem);
    this.status = status;
    this.detalhes = detalhes;
  }
}

module.exports = AppError;
