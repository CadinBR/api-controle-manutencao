const service = require('../services/equipamentoService');

async function criar(req, res) {
  res.json(201, await service.criar(req.body));
}

async function listar(req, res) {
  res.json(200, await service.listar(req.query));
}

async function listarEmManutencao(req, res) {
  res.json(200, await service.listarEmManutencao());
}

async function buscarPorId(req, res) {
  res.json(200, await service.buscarPorId(req.params.id));
}

async function atualizar(req, res) {
  res.json(200, await service.atualizar(req.params.id, req.body));
}

async function remover(req, res) {
  await service.remover(req.params.id);
  res.json(204); // sem corpo
}

module.exports = { criar, listar, listarEmManutencao, buscarPorId, atualizar, remover };
