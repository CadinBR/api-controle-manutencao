class OrdemServico {
    constructor(id, equipamentoId, tipo, responsavel) {
        this.id = id;
        this.equipamentoId = equipamentoId;
        this.tipo = tipo;
        this.responsavel = responsavel;
        this.status = 'ABERTA';
        this.dataAbertura = new Date().ToISOString();
        this.dataConclusao = null;

    }
}

module.exports = OrdemServico;