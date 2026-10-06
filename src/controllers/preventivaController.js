const preventivaService = require('../services/preventivaService');

class PreventivaController {
    async criar(req, res) {
        const novaPreventiva = await preventivaService.criar(req.body);
        return res.json(201, novaPreventiva);
    }

    async listar(req, res) {
        const todas = await preventivaService.listarTodas();
        return res.json(200, todas);
    }

    async listarVencidas(req, res) {
        const vencidas = await preventivaService.listarVencidas();
        return res.json(200, vencidas);
    }

    async buscarPorId(req, res) {
        const preventiva = await preventivaService.buscarPorId(req.params.id);
        return res.json(200, preventiva);
    }

    async realizar(req, res) {
        const realizada = await preventivaService.realizarManutencao(req.params.id);
        return res.json(200, realizada);
    }

    async atualizar(req, res) {
        const atualizada = await preventivaService.atualizar(req.params.id, req.body);
        return res.json(200, atualizada);
    }

    async excluir(req, res) {
        await preventivaService.excluir(req.params.id);
        return res.json(200, { mensagem: "Manutenção preventiva excluída com sucesso" });
    }
}

module.exports = new PreventivaController();