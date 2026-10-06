const pecaController = require('../controllers/pecaController');

module.exports = function(router) {
    router.post('/api/pecas', (req, res) => pecaController.criar(req, res));
    router.get('/api/pecas', (req, res) => pecaController.listar(req, res));
    router.get('/api/pecas/historico', (req, res) => pecaController.historico(req, res));
    router.get('/api/pecas/:id', (req, res) => pecaController.buscarPorId(req, res));
    router.put('/api/pecas/:id', (req, res) => pecaController.atualizar(req, res));
    router.delete('/api/pecas/:id', (req, res) => pecaController.excluir(req, res));
    router.get('/api/ordens-servico/:id/custo-total', (req, res) => pecaController.custoTotalOS(req, res));
};