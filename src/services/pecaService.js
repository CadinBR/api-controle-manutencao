const pecaRepository = require('../repositories/pecaRepository');
const ordemServicoRepository = require('../repositories/ordemServicoRepository');
const AppError = require('../errors/AppError');
const { validarId, textoPreenchido, ausente } = require('../utils/validacoes');

// Valida nome, código, quantidade e custo. Devolve os valores já normalizados.
function validarCampos(dados) {
    const erros = [];

    if (!textoPreenchido(dados.nome)) erros.push('nome é obrigatório');
    else if (dados.nome.trim().length > 100) erros.push('nome deve ter no máximo 100 caracteres');

    if (!textoPreenchido(dados.codigo)) erros.push('codigo é obrigatório');
    else if (dados.codigo.trim().length > 50) erros.push('codigo deve ter no máximo 50 caracteres');

    const quantidade = ausente(dados.quantidade) ? NaN : Number(dados.quantidade);
    if (!Number.isInteger(quantidade) || quantidade <= 0) erros.push('quantidade deve ser um número inteiro maior que 0');

    const custoUnitario = ausente(dados.custoUnitario) ? NaN : Number(dados.custoUnitario);
    if (!Number.isFinite(custoUnitario) || custoUnitario < 0) erros.push('custoUnitario deve ser um número maior ou igual a 0');

    if (erros.length > 0) throw new AppError(400, 'Dados inválidos', erros);

    return { nome: dados.nome.trim(), codigo: dados.codigo.trim(), quantidade, custoUnitario };
}

class PecaService {
    async criar(dados) {
        if (!dados || typeof dados !== 'object') {
            throw new AppError(400, 'Dados da requisição são obrigatórios');
        }
        if (ausente(dados.ordemServicoId)) {
            throw new AppError(400, 'Dados inválidos', ['ordemServicoId é obrigatório', ...this._errosDosCampos(dados)]);
        }
        const campos = validarCampos(dados);
        const ordemServicoId = validarId(dados.ordemServicoId, 'ordemServicoId');

        // Valida se a OS existe
        const os = await ordemServicoRepository.buscarPorId(ordemServicoId);
        if (!os) {
            throw new AppError(404, 'Ordem de Serviço não encontrada');
        }

        // Valida se a OS está finalizada
        if (os.status === 'FINALIZADA') {
            throw new AppError(409, 'Não é possível lançar peça em OS finalizada');
        }

        return await pecaRepository.criar({ ordemServicoId, ...campos });
    }

    // Reúne os erros dos campos da peça sem lançar (usado para listar todos os problemas de uma vez)
    _errosDosCampos(dados) {
        try { validarCampos(dados); return []; } catch (e) { return e.detalhes || []; }
    }

    async listarTodas() {
        return await pecaRepository.obterTodas();
    }

    async buscarPorId(id) {
        const peca = await pecaRepository.buscarPorId(validarId(id));
        if (!peca) throw new AppError(404, 'Peça substituída não encontrada');
        return peca;
    }

    async historicoPorCodigo(codigo) {
        if (!textoPreenchido(codigo)) throw new AppError(400, 'Código da peça é obrigatório (use ?codigo=)');
        return await pecaRepository.buscarPorCodigoHistorico(codigo.trim());
    }

    // Problema 8: soma de quantidade x custo unitário das peças da OS
    async custoTotalPorOS(ordemServicoId) {
        const osId = validarId(ordemServicoId);
        const os = await ordemServicoRepository.buscarPorId(osId);
        if (!os) throw new AppError(404, 'Ordem de Serviço não encontrada');

        const pecas = await pecaRepository.buscarPorOrdemServico(osId);
        const soma = pecas.reduce((total, peca) => total + peca.quantidade * Number(peca.custoUnitario), 0);
        const custoTotal = Math.round(soma * 100) / 100;

        return { ordemServicoId: osId, custoTotal, pecas };
    }

    // Atualização parcial: só muda os campos enviados (a OS vinculada não muda)
    async atualizar(id, dados) {
        const existente = await this.buscarPorId(id);
        if (!dados || typeof dados !== 'object') {
            throw new AppError(400, 'Dados da requisição são obrigatórios');
        }
        const campos = validarCampos({
            nome: dados.nome !== undefined ? dados.nome : existente.nome,
            codigo: dados.codigo !== undefined ? dados.codigo : existente.codigo,
            quantidade: dados.quantidade !== undefined ? dados.quantidade : existente.quantidade,
            custoUnitario: dados.custoUnitario !== undefined ? dados.custoUnitario : existente.custoUnitario
        });
        return await pecaRepository.atualizar(existente.id, campos);
    }

    async excluir(id) {
        const peca = await this.buscarPorId(id);
        return await pecaRepository.excluir(peca.id);
    }
}

module.exports = new PecaService();
