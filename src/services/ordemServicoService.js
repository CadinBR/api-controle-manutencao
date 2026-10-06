const ordemServicoRepository = require('../repositories/ordemServicoRepository');
const equipamentoService = require('./equipamentoService');
const OrdemServico = require('../models/ordemServico');
const AppError = require('../errors/AppError');
const { validarId, dataValida, hojeISO, textoPreenchido, ausente } = require('../utils/validacoes');

const TIPOS = ['PREVENTIVA', 'CORRETIVA'];

function normalizarTipo(valor) {
    return typeof valor === 'string' ? valor.trim().toUpperCase() : '';
}

class OrdemServicoService {
    async criar(dados) {
        if (!dados || typeof dados !== 'object') {
            throw new AppError(400, 'Dados da requisição são obrigatórios');
        }

        // 1. Campos obrigatórios
        const erros = [];
        if (ausente(dados.equipamentoId)) erros.push('equipamentoId é obrigatório');

        const tipo = normalizarTipo(dados.tipo);
        if (ausente(dados.tipo)) erros.push('tipo é obrigatório');
        else if (!TIPOS.includes(tipo)) erros.push('tipo deve ser um destes: ' + TIPOS.join(', '));

        if (!textoPreenchido(dados.responsavel)) erros.push('responsavel é obrigatório');
        else if (dados.responsavel.trim().length > 100) erros.push('responsavel deve ter no máximo 100 caracteres');

        if (erros.length > 0) throw new AppError(400, 'Dados inválidos', erros);

        // 2. Valida se o equipamento existe (Problema 2): ID inválido dá 400, inexistente dá 404
        const equipamento = await equipamentoService.buscarPorId(dados.equipamentoId);

        // 3. Impede a abertura de OS para equipamento INATIVO
        if (equipamento.status === 'INATIVO') {
            throw new AppError(422, 'Não é possível abrir OS para equipamento INATIVO');
        }

        // 4. Cria a Ordem de Serviço
        const novaOS = new OrdemServico(null, equipamento.id, tipo, dados.responsavel.trim());
        const osCriada = await ordemServicoRepository.criar(novaOS);

        // 5. Atualiza o status do equipamento para EM_MANUTENCAO
        await equipamentoService.atualizar(equipamento.id, { ...equipamento, status: 'EM_MANUTENCAO' });

        return osCriada;
    }

    async listarTodas() {
        return await ordemServicoRepository.obterTodas();
    }

    async obterPorId(id) {
        const os = await ordemServicoRepository.obterPorId(validarId(id));
        if (!os) {
            throw new AppError(404, 'Ordem de Serviço não encontrada');
        }
        return os;
    }

    async iniciar(id) {
        const os = await this.obterPorId(id);
        if (os.status === 'FINALIZADA') {
            throw new AppError(409, 'Não é possível alterar uma OS já finalizada');
        }

        os.status = 'EM_ANDAMENTO';
        return await ordemServicoRepository.atualizar(os.id, os);
    }

    async finalizar(id) {
        const os = await this.obterPorId(id);
        if (os.status === 'FINALIZADA') {
            throw new AppError(409, 'A OS já está finalizada');
        }

        os.status = 'FINALIZADA';
        os.dataConclusao = hojeISO();

        // Devolve o equipamento para ATIVO
        const equipamento = await equipamentoService.buscarPorId(os.equipamentoId);
        await equipamentoService.atualizar(equipamento.id, { ...equipamento, status: 'ATIVO' });

        return await ordemServicoRepository.atualizar(os.id, os);
    }

    // Atualização parcial: só muda os campos enviados. O status não pode ser alterado por aqui.
    async atualizar(id, dados) {
        const os = await this.obterPorId(id);
        if (os.status === 'FINALIZADA') {
            throw new AppError(409, 'Não é possível editar uma OS já finalizada');
        }
        if (!dados || typeof dados !== 'object') {
            throw new AppError(400, 'Dados da requisição são obrigatórios');
        }

        const novo = { ...os };
        const erros = [];

        if (dados.tipo !== undefined) {
            const tipo = normalizarTipo(dados.tipo);
            if (!TIPOS.includes(tipo)) erros.push('tipo deve ser um destes: ' + TIPOS.join(', '));
            else novo.tipo = tipo;
        }

        if (dados.responsavel !== undefined) {
            if (!textoPreenchido(dados.responsavel) || dados.responsavel.trim().length > 100) {
                erros.push('responsavel deve ser um texto de 1 a 100 caracteres');
            } else novo.responsavel = dados.responsavel.trim();
        }

        if (dados.dataAbertura !== undefined) {
            if (!dataValida(dados.dataAbertura)) erros.push('dataAbertura deve estar no formato AAAA-MM-DD (data válida)');
            else novo.dataAbertura = dados.dataAbertura;
        }

        if (erros.length > 0) throw new AppError(400, 'Dados inválidos', erros);

        if (dados.equipamentoId !== undefined) {
            const equipamento = await equipamentoService.buscarPorId(dados.equipamentoId);
            novo.equipamentoId = equipamento.id;
        }

        return await ordemServicoRepository.atualizar(os.id, novo);
    }

    async excluir(id) {
        const os = await this.obterPorId(id);
        if (os.status === 'FINALIZADA') {
            throw new AppError(409, 'Não é possível excluir uma OS já finalizada');
        }

        await ordemServicoRepository.excluir(os.id);
    }
}

module.exports = new OrdemServicoService();
