const { hojeISO } = require('../utils/validacoes');

class OrdemServico {
    constructor(id, equipamentoId, tipo, responsavel, status = 'ABERTA', dataAbertura = null) {
        this.id = id;
        this.equipamentoId = equipamentoId;
        this.tipo = tipo;
        this.responsavel = responsavel;
        this.status = status;

        // Se receber data, usa-a; senão, usa a data atual no formato AAAA-MM-DD
        this.dataAbertura = dataAbertura || hojeISO();

        this.dataConclusao = null;
    }
}

module.exports = OrdemServico;
