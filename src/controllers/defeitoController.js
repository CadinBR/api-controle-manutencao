const defeitosService = require('../services/defeitoService');

// Padrão do projeto: o controller só chama o service e responde com res.json(status, dados).
// Não precisa de try/catch nem de next: se o service lançar um erro (AppError),
// o router captura e o errorHandler monta a resposta.
class DefeitosController {
  async criar(req, res) {
    const resultado = await defeitosService.criarDefeito(req.body);
    res.json(201, resultado);
  }

  async listar(req, res) {
    const { severidade } = req.query;
    const resultado = await defeitosService.listarDefeitos(severidade);
    res.json(200, resultado);
  }

  async listarCriticos(req, res) {
    const resultado = await defeitosService.listarCriticos();
    res.json(200, resultado);
  }

  async buscarPorId(req, res) {
    const resultado = await defeitosService.buscarPorId(req.params.id);
    res.json(200, resultado);
  }

  async listarPorEquipamento(req, res) {
    const resultado = await defeitosService.listarPorEquipamento(req.params.id);
    res.json(200, resultado);
  }

  async atualizar(req, res) {
    const resultado = await defeitosService.atualizarDefeito(req.params.id, req.body);
    res.json(200, resultado);
  }

  async deletar(req, res) {
    await defeitosService.deletarDefeito(req.params.id);
    res.json(204); // sem corpo
  }
}

module.exports = new DefeitosController();