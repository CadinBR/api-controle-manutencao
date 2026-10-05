const ordemServicoService = require('../services/ordemServicoService');

class OrdemServicoController {
    async criar(req, res, next) {
        try {
            const novaOS = await ordemServicoService.criar(req.body);
            return res.status(201).json(novaOS); // 201 Created
        } catch (erro) {
            next(erro); // Envia o erro para o tratamento global
        }
    }

    async listarTodas(req, res, next) {
        try {
            const ordens = await ordemServicoService.listarTodas();
            return res.status(200).json(ordens);
        } catch (erro) {
            next(erro);
        }
    }

    async buscarPorId(req, res, next) {
        try {
            const { id } = req.params;
            const os = await ordemServicoService.obterPorId(id);
            return res.status(200).json(os);
        } catch (erro) {
            next(erro);
        }
    }

    async iniciar(req, res, next) {
        try {
            const { id } = req.params;
            const osAtualizada = await ordemServicoService.iniciar(id);
            return res.status(200).json(osAtualizada);
        } catch (erro) {
            next(erro);
        }
    }

    async finalizar(req, res, next) {
        try {
            const { id } = req.params;
            const osAtualizada = await ordemServicoService.finalizar(id);
            return res.status(200).json(osAtualizada);
        } catch (erro) {
            next(erro);
        }
    }

    async atualizar(req, res, next) {
        try {
            const { id } = req.params;
            const osAtualizada = await ordemServicoService.atualizar(id, req.body);
            return res.status(200).json(osAtualizada);
        } catch (erro) {
            next(erro);
        }
    }

    async excluir(req, res, next) {
        try {
            const { id } = req.params;
            await ordemServicoService.excluir(id);
            return res.status(204).send(); // 204 No Content (Sucesso, mas sem corpo na resposta)
        } catch (erro) {
            next(erro);
        }
    }
}

module.exports = new OrdemServicoController();