const preventivaRepository = require('../repositories/preventivaRepository');
const equipamentoRepository = require('../repositories/equipamentoRepository');
const AppError = require('../errors/AppError');
const { validarId, dataValida, hojeISO, somarDias, ausente } = require('../utils/validacoes');

function periodicidadeValida(valor) {
    const n = ausente(valor) ? NaN : Number(valor);
    return Number.isInteger(n) && n > 0;
}

async function garantirEquipamento(equipamentoId) {
    const id = validarId(equipamentoId, 'equipamentoId');
    const equipamento = await equipamentoRepository.buscarPorId(id);
    if (!equipamento) throw new AppError(404, 'Equipamento não encontrado');
    return id;
}

class PreventivaService {
    async criar(dados) {
        if (!dados || typeof dados !== 'object') {
            throw new AppError(400, 'Dados da requisição são obrigatórios');
        }

        const erros = [];
        if (ausente(dados.equipamentoId)) erros.push('equipamentoId é obrigatório');
        if (!periodicidadeValida(dados.periodicidadeDias)) erros.push('periodicidadeDias deve ser um número inteiro maior que zero');
        if (!ausente(dados.ultimaManutencao) && !dataValida(dados.ultimaManutencao)) erros.push('ultimaManutencao deve estar no formato AAAA-MM-DD (data válida)');
        if (!ausente(dados.proximaManutencao) && !dataValida(dados.proximaManutencao)) erros.push('proximaManutencao deve estar no formato AAAA-MM-DD (data válida)');
        if (erros.length > 0) throw new AppError(400, 'Dados inválidos', erros);

        const equipamentoId = await garantirEquipamento(dados.equipamentoId);

        const periodicidadeDias = Number(dados.periodicidadeDias);
        const ultimaManutencao = ausente(dados.ultimaManutencao) ? null : dados.ultimaManutencao;
        // Sem próxima data informada, ela é calculada: última manutenção (ou hoje) + periodicidade
        const proximaManutencao = ausente(dados.proximaManutencao)
            ? somarDias(ultimaManutencao || hojeISO(), periodicidadeDias)
            : dados.proximaManutencao;

        return await preventivaRepository.criar({ equipamentoId, periodicidadeDias, ultimaManutencao, proximaManutencao });
    }

    async listarTodas() {
        return await preventivaRepository.obterTodas();
    }

    async buscarPorId(id) {
        const preventiva = await preventivaRepository.buscarPorId(validarId(id));
        if (!preventiva) throw new AppError(404, 'Manutenção preventiva não encontrada');
        return preventiva;
    }

    // Problema 3: preventivas cuja próxima manutenção já passou (usa a data de hoje)
    async listarVencidas() {
        return await preventivaRepository.buscarVencidas(hojeISO());
    }

    async realizarManutencao(id) {
        const preventiva = await this.buscarPorId(id);

        const hoje = hojeISO();
        const proxima = somarDias(hoje, preventiva.periodicidadeDias);

        return await preventivaRepository.atualizarRealizacao(preventiva.id, hoje, proxima);
    }

    // Atualização parcial: só muda os campos enviados
    async atualizar(id, dados) {
        const existente = await this.buscarPorId(id);
        if (!dados || typeof dados !== 'object') {
            throw new AppError(400, 'Dados da requisição são obrigatórios');
        }

        const novo = {
            equipamentoId: existente.equipamentoId,
            periodicidadeDias: existente.periodicidadeDias,
            ultimaManutencao: existente.ultimaManutencao,
            proximaManutencao: existente.proximaManutencao
        };
        const erros = [];

        if (dados.periodicidadeDias !== undefined) {
            if (!periodicidadeValida(dados.periodicidadeDias)) erros.push('periodicidadeDias deve ser um número inteiro maior que zero');
            else novo.periodicidadeDias = Number(dados.periodicidadeDias);
        }
        if (dados.ultimaManutencao !== undefined) {
            if (dados.ultimaManutencao !== null && !dataValida(dados.ultimaManutencao)) erros.push('ultimaManutencao deve ser null ou uma data AAAA-MM-DD válida');
            else novo.ultimaManutencao = dados.ultimaManutencao;
        }
        if (dados.proximaManutencao !== undefined) {
            if (!dataValida(dados.proximaManutencao)) erros.push('proximaManutencao deve estar no formato AAAA-MM-DD (data válida)');
            else novo.proximaManutencao = dados.proximaManutencao;
        }
        if (erros.length > 0) throw new AppError(400, 'Dados inválidos', erros);

        if (dados.equipamentoId !== undefined) {
            novo.equipamentoId = await garantirEquipamento(dados.equipamentoId);
        }

        return await preventivaRepository.atualizar(existente.id, novo);
    }

    async excluir(id) {
        const preventiva = await this.buscarPorId(id);
        return await preventivaRepository.excluir(preventiva.id);
    }
}

module.exports = new PreventivaService();
