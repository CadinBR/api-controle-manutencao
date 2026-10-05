const express = require('express');
const router = express.Router();
const defeitosController = require('../controllers/defeitosController');

router.post('/defeitos', (req, res, next) => defeitosController.criar(req, res, next));
router.get('/defeitos', (req, res, next) => defeitosController.listar(req, res, next));
router.get('/defeitos/criticos', (req, res, next) => defeitosController.listarCriticos(req, res, next));
router.get('/defeitos/:id', (req, res, next) => defeitosController.buscarPorId(req, res, next));
router.get('/equipamentos/:id/defeitos', (req, res, next) => defeitosController.listarPorEquipamento(req, res, next));
router.put('/defeitos/:id', (req, res, next) => defeitosController.atualizar(req, res, next));
router.delete('/defeitos/:id', (req, res, next) => defeitosController.deletar(req, res, next));

module.exports = router;