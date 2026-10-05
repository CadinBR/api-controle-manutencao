const defeitosService = require('../services/defeitosService');

class DefeitosController {
  async criar(req, res, next) {
    try {
      const resultado = await defeitosService.criarDefeito(req.body);
      return res.status(201).json(resultado);
    } catch (err) {
      next(err);
    }
  }

  async listar(req, res, next) {
    try {
      const { severidade } = req.query;
      const resultado = await defeitosService.listarDefeitos(severidade);
      return res.status(200).json(resultado);
    } catch (err) {
      next(err);
    }
  }

  async listarCriticos(req, res, next) {
    try {
      const resultado = await defeitosService.listarCriticos();
      return res.status(200).json(resultado);
    } catch (err) {
      next(err);
    }
  }

  async buscarPorId(req, res, next) {
    try {
      const resultado = await defeitosService.buscarPorId(req.params.id);
      return res.status(200).json(resultado);
    } catch (err) {
      next(err);
    }
  }

  async listarPorEquipamento(req, res, next) {
    try {
      const resultado = await defeitosService.listarPorEquipamento(req.params.id);
      return res.status(200).json(resultado);
    } catch (err) {
      next(err);
    }
  }

  async atualizar(req, res, next) {
    try {
      const resultado = await defeitosService.atualizarDefeito(req.params.id, req.body);
      return res.status(200).json(resultado);
    } catch (err) {
      next(err);
    }
  }

  async deletar(req, res, next) {
    try {
      await defeitosService.deletarDefeito(req.params.id);
      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new DefeitosController();