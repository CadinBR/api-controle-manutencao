const db = require('../config/db');

class PreventivaRepository {
    async criar(dados) {
        const { equipamentoId, periodicidadeDias, ultimaManutencao, proximaManutencao } = dados;
        const [result] = await db.execute(
            'INSERT INTO preventivas (equipamentoId, periodicidadeDias, ultimaManutencao, proximaManutencao) VALUES (?, ?, ?, ?)',
            [equipamentoId, periodicidadeDias, ultimaManutencao || null, proximaManutencao]
        );
        return await this.buscarPorId(result.insertId);
    }

    async obterTodas() {
        const [rows] = await db.execute('SELECT * FROM preventivas');
        return rows;
    }

    async buscarPorId(id) {
        const [rows] = await db.execute('SELECT * FROM preventivas WHERE id = ?', [id]);
        return rows[0] || null;
    }

    async buscarVencidas(dataAtual) {
        const [rows] = await db.execute(
            'SELECT * FROM preventivas WHERE proximaManutencao < ?',
            [dataAtual]
        );
        return rows;
    }

    async atualizar(id, dados) {
        const { equipamentoId, periodicidadeDias, ultimaManutencao, proximaManutencao } = dados;
        await db.execute(
            'UPDATE preventivas SET equipamentoId = ?, periodicidadeDias = ?, ultimaManutencao = ?, proximaManutencao = ? WHERE id = ?',
            [equipamentoId, periodicidadeDias, ultimaManutencao, proximaManutencao, id]
        );
        return await this.buscarPorId(id);
    }

    async atualizarRealizacao(id, ultimaManutencao, proximaManutencao) {
        await db.execute(
            'UPDATE preventivas SET ultimaManutencao = ?, proximaManutencao = ? WHERE id = ?',
            [ultimaManutencao, proximaManutencao, id]
        );
        return await this.buscarPorId(id);
    }

    async excluir(id) {
        const preventiva = await this.buscarPorId(id);
        if (!preventiva) return null;
        await db.execute('DELETE FROM preventivas WHERE id = ?', [id]);
        return preventiva;
    }
}

module.exports = new PreventivaRepository();