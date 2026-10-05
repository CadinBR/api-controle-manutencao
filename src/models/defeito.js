class Defeito {
  constructor({ id, equipamentoId, descricao, severidade, dataRegistro }) {
    this.id = Number(id);
    this.equipamentoId = Number(equipamentoId);
    this.descricao = descricao;
    this.severidade = severidade ? severidade.toUpperCase() : severidade;
    this.dataRegistro = dataRegistro || new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      equipamentoId: this.equipamentoId,
      descricao: this.descricao,
      severidade: this.severidade,
      dataRegistro: this.dataRegistro,
      prioridade: this.severidade === 'CRITICO' ? 'MAXIMA' : 'NORMAL'
    };
  }
}

module.exports = Defeito;