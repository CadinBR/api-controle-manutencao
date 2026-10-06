const defeitosController = require('../controllers/defeitoController');

module.exports = function registrarDefeito(router) {
  router.post('/api/defeitos', (req, res) => defeitosController.criar(req, res));
  router.get('/api/defeitos', (req, res) => defeitosController.listar(req, res));
  router.get('/api/defeitos/criticos', (req, res) => defeitosController.listarCriticos(req, res)); // antes do :id
  router.get('/api/defeitos/:id', (req, res) => defeitosController.buscarPorId(req, res));
  router.get('/api/equipamentos/:id/defeitos', (req, res) => defeitosController.listarPorEquipamento(req, res));
  router.put('/api/defeitos/:id', (req, res) => defeitosController.atualizar(req, res));
  router.delete('/api/defeitos/:id', (req, res) => defeitosController.deletar(req, res));
};