const ordemServicoService = require('../services/ordemServicoService');

class OrdemServicoController {

  async criar(req, res) {
    try {
      const novaOS = await ordemServicoService.criar(req.body);

      return res.json(201, novaOS);
    } catch (erro) {
      throw erro;
    }
  }

  async listarTodas(req, res) {
    try {
      const ordens = await ordemServicoService.listarTodas();

      return res.json(200, ordens);
    } catch (erro) {
      throw erro;
    }
  }

  async buscarPorId(req, res) {
    try {
      const { id } = req.params;

      const os = await ordemServicoService.obterPorId(id);

      return res.json(200, os);
    } catch (erro) {
      throw erro;
    }
  }

  async iniciar(req, res) {
    try {
      const { id } = req.params;

      const osAtualizada = await ordemServicoService.iniciar(id);

      return res.json(200, osAtualizada);
    } catch (erro) {
      throw erro;
    }
  }

  async finalizar(req, res) {
    try {
      const { id } = req.params;

      const osAtualizada = await ordemServicoService.finalizar(id);

      return res.json(200, osAtualizada);
    } catch (erro) {
      throw erro;
    }
  }

  async atualizar(req, res) {
    try {
      const { id } = req.params;

      const osAtualizada = await ordemServicoService.atualizar(
        id,
        req.body
      );

      return res.json(200, osAtualizada);
    } catch (erro) {
      throw erro;
    }
  }

  async excluir(req, res) {
    try {
      const { id } = req.params;

      await ordemServicoService.excluir(id);

      res.writeHead(204);
      return res.end();
    } catch (erro) {
      throw erro;
    }
  }

}

module.exports = new OrdemServicoController();