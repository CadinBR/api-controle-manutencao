const ordemServicoRepository = require('../repositories/ordemServicoRepository');
const equipamentoService = require('./equipamentoService'); // Importa o serviço da Pessoa 1
const OrdemServico = require('../models/ordemServico');
const AppError = require('../errors/AppError'); // Padronizando o erro com o resto do projeto

class OrdemServicoService {
    async criar(dados) {
        // 1. Valida se o equipamento existe (o buscarPorId da Pessoa 1 já dá erro 404 se não existir)
        const equipamento = await equipamentoService.buscarPorId(dados.equipamentoId);

        // 2. Impede a abertura de OS para equipamento INATIVO
        if (equipamento.status === 'INATIVO') {
            throw new AppError(422, 'Não é possível abrir OS para equipamento INATIVO');
        }

        // 3. Cria a Ordem de Serviço
        const novaOS = new OrdemServico(null, dados.equipamentoId, dados.tipo, dados.responsavel);
        const osCriada = await ordemServicoRepository.criar(novaOS);

        // 4. Atualiza o status do equipamento para EM_MANUTENCAO
        const equipAtualizado = { ...equipamento, status: 'EM_MANUTENCAO' };
        await equipamentoService.atualizar(equipamento.id, equipAtualizado);

        return osCriada;
    }

    async listarTodas() {
        return await ordemServicoRepository.obterTodas();
    }

    async obterPorId(id) {
        const os = await ordemServicoRepository.obterPorId(id);
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
        return await ordemServicoRepository.atualizar(id, os);
    }

    async finalizar(id) {
        const os = await this.obterPorId(id);
        if (os.status === 'FINALIZADA') {
            throw new AppError(409, 'A OS já está finalizada');
        }
        
        os.status = 'FINALIZADA';
        os.dataConclusao = new Date().toISOString(); 
        
        // Atualiza o status do equipamento de volta para ATIVO
        const equipamento = await equipamentoService.buscarPorId(os.equipamentoId);
        const equipAtualizado = { ...equipamento, status: 'ATIVO' };
        await equipamentoService.atualizar(equipamento.id, equipAtualizado);

        return await ordemServicoRepository.atualizar(id, os);
    }

    async atualizar(id, dados) {
        const os = await this.obterPorId(id);
        if (os.status === 'FINALIZADA') {
            throw new AppError(409, 'Não é possível editar uma OS já finalizada');
        }
        
        delete dados.status; // Impede que o status seja burlado por aqui
        return await ordemServicoRepository.atualizar(id, dados);
    }

    async excluir(id) {
        const os = await this.obterPorId(id);
        if (os.status === 'FINALIZADA') {
            throw new AppError(409, 'Não é possível excluir uma OS já finalizada');
        }
        
        await ordemServicoRepository.excluir(id);
    }
}

module.exports = new OrdemServicoService();