const db = require('../config/db');

// Defeitos agora ficam na tabela "defeitos" do MySQL, como os demais módulos.
class DefeitosRepository {
  async findAll() {
    const [linhas] = await db.query('SELECT * FROM defeitos ORDER BY id');
    return linhas;
  }

  async findById(id) {
    const [linhas] = await db.query('SELECT * FROM defeitos WHERE id = ?', [id]);
    return linhas[0] || null;
  }

  async findByEquipamentoId(equipamentoId) {
    const [linhas] = await db.query('SELECT * FROM defeitos WHERE equipamentoId = ? ORDER BY id', [equipamentoId]);
    return linhas;
  }

  async create(defeito) {
    const [resultado] = await db.query(
      'INSERT INTO defeitos (equipamentoId, descricao, severidade, dataRegistro) VALUES (?, ?, ?, ?)',
      [defeito.equipamentoId, defeito.descricao, defeito.severidade, defeito.dataRegistro]
    );
    return this.findById(resultado.insertId);
  }

  async update(id, dados) {
    await db.query(
      'UPDATE defeitos SET equipamentoId = ?, descricao = ?, severidade = ? WHERE id = ?',
      [dados.equipamentoId, dados.descricao, dados.severidade, id]
    );
    return this.findById(id);
  }

  async delete(id) {
    const [resultado] = await db.query('DELETE FROM defeitos WHERE id = ?', [id]);
    return resultado.affectedRows > 0;
  }
}

module.exports = new DefeitosRepository();
