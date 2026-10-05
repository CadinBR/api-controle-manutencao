const db = require('../config/db');

async function listar() {
  const [linhas] = await db.query('SELECT * FROM equipamentos');
  return linhas;
}

async function listarPorStatus(status) {
  const [linhas] = await db.query('SELECT * FROM equipamentos WHERE status = ?', [status]);
  return linhas;
}

async function buscarPorId(id) {
  const [linhas] = await db.query('SELECT * FROM equipamentos WHERE id = ?', [id]);
  return linhas[0]; 
}

async function salvar(dados) {
  const [resultado] = await db.query(
    'INSERT INTO equipamentos (nome, modelo, fabricante, dataInstalacao, status) VALUES (?, ?, ?, ?, ?)',
    [dados.nome, dados.modelo, dados.fabricante, dados.dataInstalacao, dados.status]
  );
  return buscarPorId(resultado.insertId);
}

async function atualizar(id, dados) {
  await db.query(
    'UPDATE equipamentos SET nome = ?, modelo = ?, fabricante = ?, dataInstalacao = ?, status = ? WHERE id = ?',
    [dados.nome, dados.modelo, dados.fabricante, dados.dataInstalacao, dados.status, id]
  );
  return buscarPorId(id);
}

async function excluir(id) {
  await db.query('DELETE FROM equipamentos WHERE id = ?', [id]);
}

// Quantos registros de outros módulos apontam para este equipamento (problema 6)
async function contarVinculos(id) {
  const [[contagem]] = await db.query(
    `SELECT
       (SELECT COUNT(*) FROM ordens_servico WHERE equipamentoId = ?) AS ordensServico,
       (SELECT COUNT(*) FROM defeitos WHERE equipamentoId = ?) AS defeitos,
       (SELECT COUNT(*) FROM preventivas WHERE equipamentoId = ?) AS preventivas`,
    [id, id, id]
  );
  return contagem;
}

module.exports = { listar, listarPorStatus, buscarPorId, salvar, atualizar, excluir, contarVinculos };
