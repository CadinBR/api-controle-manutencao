const ordemServicoController = require('../controllers/ordemServicoController');

module.exports = function registrarOrdemServico(router) {
    router.post('/ordens-servico', (req, res, next) => ordemServicoController.criar(req, res, next));
    router.get('/ordens-servico', (req, res, next) => ordemServicoController.listarTodas(req, res, next));
    router.get('/ordens-servico/:id', (req, res, next) => ordemServicoController.buscarPorId(req, res, next));
    router.patch('/ordens-servico/:id/iniciar', (req, res, next) => ordemServicoController.iniciar(req, res, next));
    router.patch('/ordens-servico/:id/finalizar', (req, res, next) => ordemServicoController.finalizar(req, res, next));
    router.put('/ordens-servico/:id', (req, res, next) => ordemServicoController.atualizar(req, res, next));
    router.delete('/ordens-servico/:id', (req, res, next) => ordemServicoController.excluir(req, res, next));
};