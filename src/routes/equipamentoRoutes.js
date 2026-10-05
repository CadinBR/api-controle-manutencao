const controller = require('../controllers/equipamentoController');

module.exports = function registrar(router) {
  router.post('/api/equipamentos', controller.criar);
  router.get('/api/equipamentos', controller.listar);
  router.get('/api/equipamentos/em-manutencao', controller.listarEmManutencao); // antes do :id!
  router.get('/api/equipamentos/:id', controller.buscarPorId);
  router.put('/api/equipamentos/:id', controller.atualizar);
  router.delete('/api/equipamentos/:id', controller.remover);
};
