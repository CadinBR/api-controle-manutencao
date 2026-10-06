const db = require('..//config/db'); // Ajuste o caminho para o seu db.js se necessário

class ordemServicoRepository {
    async criar(dados) {
        const { equipamentoId, tipo, dataAbertura, responsavel, status = 'ABERTA' } = dados;
        const [result] = await db.execute(
            'INSERT INTO ordens_servico (equipamentoId, tipo, dataAbertura, responsavel, status) VALUES (?, ?, ?, ?, ?)',
            [equipamentoId, tipo, dataAbertura, responsavel, status]
        );
        return await this.buscarPorId(result.insertId);
    }

    async listarTodas() {
        const [rows] = await db.execute('SELECT * FROM ordens_servico');
        return rows;
    }

    async buscarPorId(id) {
        const [rows] = await db.execute('SELECT * FROM ordens_servico WHERE id = ?', [id]);
        return rows[0] || null;
    }

    async atualizar(id, dados) {
        const { equipamentoId, tipo, dataAbertura, responsavel, status } = dados;
        await db.execute(
            'UPDATE ordens_servico SET equipamentoId = ?, tipo = ?, dataAbertura = ?, responsavel = ?, status = ? WHERE id = ?',
            [equipamentoId, tipo, dataAbertura, responsavel, status, id]
        );
        return await this.buscarPorId(id);
    }

    async atualizarStatus(id, status, dataConclusao = null) {
        await db.execute(
            'UPDATE ordens_servico SET status = ?, dataConclusao = ? WHERE id = ?',
            [status, dataConclusao, id]
        );
        return await this.buscarPorId(id);
    }

    async excluir(id) {
        const os = await this.buscarPorId(id);
        if (!os) return null;
        await db.execute('DELETE FROM ordens_servico WHERE id = ?', [id]);
        return os;
    }
}

module.exports = new ordemServicoRepository();