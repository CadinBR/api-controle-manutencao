const defeitosRepository = require('../repositories/defeitosRepository');
const equipamentosRepository = require('../repositories/equipamentosRepository'); // implementado pela Pessoa 1
const AppError = require('../errors/AppError'); // padronizado pela Pessoa 1
const Defeito = require('../models/defeito');

const SEVERIDADES_VALIDAS = ['BAIXO', 'MEDIO', 'ALTO', 'CRITICO'];
const PESO_SEVERIDADE = {
  CRITICO: 4,
  ALTO: 3,
  MEDIO: 2,
  BAIXO: 1
};

class DefeitosService {
  async criarDefeito(dados) {
    const erros = [];
    if (!dados.equipamentoId) erros.push('equipamentoId é obrigatório');
    if (!dados.descricao || dados.descricao.trim() === '') erros.push('descricao é obrigatória');
    if (!dados.severidade) erros.push('severidade é obrigatória');
    
    const severidadeUpper = dados.severidade ? dados.severidade.toUpperCase() : null;
    if (severidadeUpper && !SEVERIDADES_VALIDAS.includes(severidadeUpper)) {
      erros.push(`severidade deve ser uma das seguintes: ${SEVERIDADES_VALIDAS.join(', ')}`);
    }

    if (erros.length > 0) {
      throw new AppError('Campos obrigatórios ausentes ou valores inválidos', 400, erros);
    }

    // Valida se o equipamento existe (Problema 2 / Regra)
    const equipamento = await equipamentosRepository.findById(dados.equipamentoId);
    if (!equipamento) {
      throw new AppError('Equipamento não encontrado', 404);
    }

    const novoDefeito = new Defeito({
      equipamentoId: dados.equipamentoId,
      descricao: dados.descricao.trim(),
      severidade: severidadeUpper
    });

    const criado = await defeitosRepository.create(novoDefeito);
    return new Defeito(criado).toJSON();
  }

  async listarDefeitos(filtroSeveridade) {
    let lista = await defeitosRepository.findAll();

    if (filtroSeveridade) {
      const filtroUpper = filtroSeveridade.toUpperCase();
      lista = lista.filter((d) => d.severidade === filtroUpper);
    }

    // Ordenar de forma decrescente: CRITICO -> ALTO -> MEDIO -> BAIXO
    lista.sort((a, b) => (PESO_SEVERIDADE[b.severidade] || 0) - (PESO_SEVERIDADE[a.severidade] || 0));

    return lista.map((d) => new Defeito(d).toJSON());
  }

  async listarCriticos() {
    const lista = await defeitosRepository.findAll();
    return lista
      .filter((d) => d.severidade === 'CRITICO')
      .map((d) => new Defeito(d).toJSON());
  }

  async buscarPorId(id) {
    const numId = Number(id);
    if (isNaN(numId)) {
      throw new AppError('ID inválido', 400);
    }

    const defeito = await defeitosRepository.findById(numId);
    if (!defeito) {
      throw new AppError('Defeito não encontrado', 404);
    }

    return new Defeito(defeito).toJSON();
  }

  async listarPorEquipamento(equipamentoId) {
    const numId = Number(equipamentoId);
    if (isNaN(numId)) {
      throw new AppError('ID inválido', 400);
    }

    const equipamento = await equipamentosRepository.findById(numId);
    if (!equipamento) {
      throw new AppError('Equipamento não encontrado', 404);
    }

    const defeitos = await defeitosRepository.findByEquipamentoId(numId);
    return defeitos.map((d) => new Defeito(d).toJSON());
  }

  async atualizarDefeito(id, dados) {
    const numId = Number(id);
    if (isNaN(numId)) throw new AppError('ID inválido', 400);

    const defeitoExistente = await defeitosRepository.findById(numId);
    if (!defeitoExistente) throw new AppError('Defeito não encontrado', 404);

    if (dados.equipamentoId) {
      const equip = await equipamentosRepository.findById(dados.equipamentoId);
      if (!equip) throw new AppError('Equipamento não encontrado', 404);
    }

    if (dados.severidade) {
      dados.severidade = dados.severidade.toUpperCase();
      if (!SEVERIDADES_VALIDAS.includes(dados.severidade)) {
        throw new AppError('Severidade inválida', 400, SEVERIDADES_VALIDAS);
      }
    }

    const atualizado = await defeitosRepository.update(numId, dados);
    return new Defeito(atualizado).toJSON();
  }

  async deletarDefeito(id) {
    const numId = Number(id);
    if (isNaN(numId)) throw new AppError('ID inválido', 400);

    const defeito = await defeitosRepository.findById(numId);
    if (!defeito) throw new AppError('Defeito não encontrado', 404);

    await defeitosRepository.delete(numId);
    return true;
  }
}

module.exports = new DefeitosService();