const AppError = require('../errors/AppError');
const repository = require('../repositories/equipamentoRepository');
const { Equipamento, STATUS } = require('../models/equipamento');

function validarId(texto) {
  if (!/^[1-9]\d*$/.test(texto)) {
    throw new AppError(400, 'ID inválido: informe um número inteiro positivo');
  }
  return Number(texto);
}

function dataValida(texto) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const data = new Date(texto + 'T00:00:00Z');
  return !isNaN(data) && data.toISOString().slice(0, 10) === texto;
}

function validarDados(dados, statusPadrao) {
  const erros = [];
  const status = String(dados.status || statusPadrao || '').toUpperCase();

  if (!dados.nome) erros.push('nome é obrigatório');
  if (!dados.modelo) erros.push('modelo é obrigatório');
  if (!dados.fabricante) erros.push('fabricante é obrigatório');
  if (!dataValida(dados.dataInstalacao)) {
    erros.push('dataInstalacao é obrigatória no formato AAAA-MM-DD (data válida)');
  }
  if (!STATUS.includes(status)) {
    erros.push('status deve ser um destes: ' + STATUS.join(', '));
  }

  if (erros.length > 0) throw new AppError(400, 'Dados inválidos', erros);

  return new Equipamento({ ...dados, status });
}

async function criar(dados) {
  return await repository.salvar(validarDados(dados, 'ATIVO')); // sem status, nasce ATIVO
}

async function listar(filtros) {
  if (!filtros.status) return await repository.listar();
  return await repository.listarPorStatus(filtros.status.toUpperCase());
}

// Problema 7: equipamentos que estão em manutenção agora
async function listarEmManutencao() {
  return await repository.listarPorStatus('EM_MANUTENCAO');
}

async function buscarPorId(idTexto) {
  const equipamento = await repository.buscarPorId(validarId(idTexto));
  if (!equipamento) throw new AppError(404, 'Equipamento não encontrado');
  return equipamento;
}

// Problema 1: corrigir um equipamento cadastrado errado
async function atualizar(idTexto, dados) {
  const equipamento = await buscarPorId(idTexto); // já valida o ID e dá 404 se não existir
  return await repository.atualizar(equipamento.id, validarDados(dados));
}

// Problema 6: não deixa excluir se o equipamento tem registros vinculados
async function remover(idTexto) {
  const equipamento = await buscarPorId(idTexto);

  const vinculos = await repository.contarVinculos(equipamento.id);
  const total = vinculos.ordensServico + vinculos.defeitos + vinculos.preventivas;

  if (total > 0) {
    throw new AppError(
      409,
      'Não é possível excluir: o equipamento tem registros vinculados. Altere o status para INATIVO.',
      [vinculos]
    );
  }

  await repository.excluir(equipamento.id);
}

module.exports = { criar, listar, listarEmManutencao, buscarPorId, atualizar, remover };
