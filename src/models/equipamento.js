
const STATUS = ['ATIVO', 'EM_MANUTENCAO', 'INATIVO'];

class Equipamento {
  constructor(dados) {
    this.nome = dados.nome;
    this.modelo = dados.modelo;
    this.fabricante = dados.fabricante;
    this.dataInstalacao = dados.dataInstalacao; // formato AAAA-MM-DD
    this.status = dados.status;
  }
}

module.exports = { Equipamento, STATUS };
