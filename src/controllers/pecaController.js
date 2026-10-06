const pecaService = require('../services/pecaService');

// Padrão do projeto: o controller chama o service e responde com res.json(status, dados).
class PecaController {
    async criar(req, res) {
        res.json(201, await pecaService.criar(req.body));
    }

    async listar(req, res) {
        if (req.query.codigo) {
            return res.json(200, await pecaService.historicoPorCodigo(req.query.codigo));
        }
        res.json(200, await pecaService.listarTodas());
    }

    async historico(req, res) {
        res.json(200, await pecaService.historicoPorCodigo(req.query.codigo));
    }

    async buscarPorId(req, res) {
        res.json(200, await pecaService.buscarPorId(req.params.id));
    }

    async custoTotalOS(req, res) {
        res.json(200, await pecaService.custoTotalPorOS(req.params.id));
    }

    async atualizar(req, res) {
        res.json(200, await pecaService.atualizar(req.params.id, req.body));
    }

    async excluir(req, res) {
        await pecaService.excluir(req.params.id);
        res.json(200, { mensagem: 'Peça excluída com sucesso' });
    }
}

module.exports = new PecaController();
