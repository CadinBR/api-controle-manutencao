const preventivaController = require('../controllers/preventivaController');

module.exports = function(router) {
    // 1. Rotas estáticas primeiro
    router.get('/api/preventivas/vencidas', (req, res) => preventivaController.listarVencidas(req, res));
    
    // 2. Rotas gerais de listagem e criação
    router.get('/api/preventivas', (req, res) => preventivaController.listar(req, res));
    router.post('/api/preventivas', (req, res) => preventivaController.criar(req, res));
    
    // 3. Rotas com ID por último
    router.get('/api/preventivas/:id', (req, res) => preventivaController.buscarPorId(req, res));
    router.put('/api/preventivas/:id', (req, res) => preventivaController.atualizar(req, res));
    router.put('/api/preventivas/:id/realizar', (req, res) => preventivaController.realizar(req, res));
    router.delete('/api/preventivas/:id', (req, res) => preventivaController.excluir(req, res));
};