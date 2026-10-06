const db = require('../config/db');

class PecaRepository {
    async criar(dados) {
        const { ordemServicoId, nome, codigo, quantidade, custoUnitario } = dados;
        const [result] = await db.execute(
            'INSERT INTO pecas (ordemServicoId, nome, codigo, quantidade, custoUnitario) VALUES (?, ?, ?, ?, ?)',
            [ordemServicoId, nome, codigo, quantidade, custoUnitario]
        );
        return await this.buscarPorId(result.insertId);
    }

    async obterTodas() {
        const [rows] = await db.execute('SELECT * FROM pecas ORDER BY id');
        return rows;
    }

    async buscarPorId(id) {
        const [rows] = await db.execute('SELECT * FROM pecas WHERE id = ?', [id]);
        return rows[0] || null;
    }

    // Problema 4: todas as vezes que uma peça (pelo código) foi usada, com equipamento e data da OS
    async buscarPorCodigoHistorico(codigo) {
        const [rows] = await db.execute(`
            SELECT p.*, os.equipamentoId, os.dataAbertura
            FROM pecas p
            JOIN ordens_servico os ON p.ordemServicoId = os.id
            WHERE p.codigo = ?
            ORDER BY os.dataAbertura, p.id
        `, [codigo]);
        return rows;
    }

    async buscarPorOrdemServico(ordemServicoId) {
        const [rows] = await db.execute('SELECT * FROM pecas WHERE ordemServicoId = ? ORDER BY id', [ordemServicoId]);
        return rows;
    }

    async atualizar(id, dados) {
        const { nome, codigo, quantidade, custoUnitario } = dados;
        await db.execute(
            'UPDATE pecas SET nome = ?, codigo = ?, quantidade = ?, custoUnitario = ? WHERE id = ?',
            [nome, codigo, quantidade, custoUnitario, id]
        );
        return await this.buscarPorId(id);
    }

    async excluir(id) {
        const peca = await this.buscarPorId(id);
        if (!peca) return null;
        await db.execute('DELETE FROM pecas WHERE id = ?', [id]);
        return peca;
    }
}

module.exports = new PecaRepository();
