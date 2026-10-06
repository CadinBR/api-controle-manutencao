const AppError = require('../errors/AppError');

// Valida um ID vindo da URL ou do body (inteiro positivo) e devolve como número.
function validarId(valor, nome = 'ID') {
  if (!/^[1-9]\d*$/.test(String(valor))) {
    throw new AppError(400, `${nome} inválido: informe um número inteiro positivo`);
  }
  return Number(valor);
}

// Aceita somente datas reais no formato AAAA-MM-DD.
function dataValida(texto) {
  if (typeof texto !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const data = new Date(texto + 'T00:00:00Z');
  return !isNaN(data) && data.toISOString().slice(0, 10) === texto;
}

// Data de hoje no fuso do servidor, no formato AAAA-MM-DD.
function hojeISO() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

// Soma dias a uma data AAAA-MM-DD e devolve outra data AAAA-MM-DD.
function somarDias(dataISO, dias) {
  const d = new Date(dataISO + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + Number(dias));
  return d.toISOString().slice(0, 10);
}

function textoPreenchido(valor) {
  return typeof valor === 'string' && valor.trim() !== '';
}

function ausente(valor) {
  return valor === undefined || valor === null || valor === '';
}

module.exports = { validarId, dataValida, hojeISO, somarDias, textoPreenchido, ausente };
