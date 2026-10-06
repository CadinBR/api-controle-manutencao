const defeitosRepository = require('../repositories/defeitoRepository');
const equipamentosRepository = require('../repositories/equipamentoRepository');
const AppError = require('../errors/AppError');
const Defeito = require('../models/defeito');
const { validarId, textoPreenchido, ausente } = require('../utils/validacoes');

const SEVERIDADES_VALIDAS = ['BAIXO', 'MEDIO', 'ALTO', 'CRITICO'];

const PESO_SEVERIDADE = { CRITICO: 4, ALTO: 3, MEDIO: 2, BAIXO: 1 };

function normalizarSeveridade(valor) {
  return typeof valor === 'string' ? valor.trim().toUpperCase() : '';
}

class DefeitosService {

  async criarDefeito(dados) {
    if (!dados || typeof dados !== 'object') {
      throw new AppError(400, 'Dados da requisição são obrigatórios');
    }

    const erros = [];

    if (ausente(dados.equipamentoId)) erros.push('equipamentoId é obrigatório');

    if (!textoPreenchido(dados.descricao)) erros.push('descricao é obrigatória');
    else if (dados.descricao.trim().length > 255) erros.push('descricao deve ter no máximo 255 caracteres');

    const severidade = normalizarSeveridade(dados.severidade);
    if (ausente(dados.severidade)) erros.push('severidade é obrigatória');
    else if (!SEVERIDADES_VALIDAS.includes(severidade)) {
      erros.push(`severidade deve ser uma das seguintes: ${SEVERIDADES_VALIDAS.join(', ')}`);
    }

    if (erros.length > 0) {
      throw new AppError(400, 'Campos obrigatórios ausentes ou valores inválidos', erros);
    }

    const equipamentoId = validarId(dados.equipamentoId, 'equipamentoId');
    const equipamento = await equipamentosRepository.buscarPorId(equipamentoId);
    if (!equipamento) throw new AppError(404, 'Equipamento não encontrado');

    const novoDefeito = new Defeito({ equipamentoId, descricao: dados.descricao.trim(), severidade });
    const criado = await defeitosRepository.create(novoDefeito);

    return new Defeito(criado).toJSON();
  }

  async listarDefeitos(filtroSeveridade) {
    let lista = await defeitosRepository.findAll();

    if (filtroSeveridade) {
      const filtro = normalizarSeveridade(filtroSeveridade);
      lista = lista.filter((d) => d.severidade === filtro);
    }

    // Problema 5: os mais graves aparecem primeiro
    lista.sort((a, b) => (PESO_SEVERIDADE[b.severidade] || 0) - (PESO_SEVERIDADE[a.severidade] || 0));

    return lista.map((d) => new Defeito(d).toJSON());
  }

  async listarCriticos() {
    const lista = await defeitosRepository.findAll();
    return lista.filter((d) => d.severidade === 'CRITICO').map((d) => new Defeito(d).toJSON());
  }

  async buscarPorId(id) {
    const defeito = await defeitosRepository.findById(validarId(id));
    if (!defeito) throw new AppError(404, 'Defeito não encontrado');
    return new Defeito(defeito).toJSON();
  }

  async listarPorEquipamento(equipamentoId) {
    const numId = validarId(equipamentoId);

    const equipamento = await equipamentosRepository.buscarPorId(numId);
    if (!equipamento) throw new AppError(404, 'Equipamento não encontrado');

    const defeitos = await defeitosRepository.findByEquipamentoId(numId);
    return defeitos.map((d) => new Defeito(d).toJSON());
  }

  async atualizarDefeito(id, dados) {
    const numId = validarId(id);

    if (!dados || typeof dados !== 'object') {
      throw new AppError(400, 'Dados da requisição são obrigatórios');
    }

    const existente = await defeitosRepository.findById(numId);
    if (!existente) throw new AppError(404, 'Defeito não encontrado');

    const novo = {
      equipamentoId: existente.equipamentoId,
      descricao: existente.descricao,
      severidade: existente.severidade
    };

    if (dados.equipamentoId !== undefined) {
      novo.equipamentoId = validarId(dados.equipamentoId, 'equipamentoId');
      const equipamento = await equipamentosRepository.buscarPorId(novo.equipamentoId);
      if (!equipamento) throw new AppError(404, 'Equipamento não encontrado');
    }

    if (dados.descricao !== undefined) {
      if (!textoPreenchido(dados.descricao) || dados.descricao.trim().length > 255) {
        throw new AppError(400, 'descricao deve ser um texto de 1 a 255 caracteres');
      }
      novo.descricao = dados.descricao.trim();
    }

    if (dados.severidade !== undefined) {
      const severidade = normalizarSeveridade(dados.severidade);
      if (!SEVERIDADES_VALIDAS.includes(severidade)) {
        throw new AppError(400, 'Severidade inválida', SEVERIDADES_VALIDAS);
      }
      novo.severidade = severidade;
    }

    const atualizado = await defeitosRepository.update(numId, novo);
    return new Defeito(atualizado).toJSON();
  }

  async deletarDefeito(id) {
    const numId = validarId(id);

    const defeito = await defeitosRepository.findById(numId);
    if (!defeito) throw new AppError(404, 'Defeito não encontrado');

    await defeitosRepository.delete(numId);
    return true;
  }
}

module.exports = new DefeitosService();
