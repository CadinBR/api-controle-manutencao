const registrarEquipamento = require('./equipamentoRoutes');
const registrarOrdemServico = require('./ordemServicoRoutes');
const registrarDefeito = require('./defeitoRoutes');
const registrarPeca = require('./pecaRoutes');
const registrarPreventiva = require('./preventivaRoutes');

module.exports = function registrarRotas(router) {
registrarEquipamento(router);
registrarOrdemServico(router);
registrarDefeito(router);
registrarPeca(router);
registrarPreventiva(router);
};
