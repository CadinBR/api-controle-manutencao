const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'ordens.json');

if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
}

class ordemServicoRepository {
    async obterTodas() {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    }

    async obterPorId(id) {
        const ordens = await this.obterTodas();
        return ordens.find(o => o.id === Number(id));
    }

    async criar(ordem) {
        const ordens = await this.obterTodas();
        const novoId = ordens.length > 0 ? Math.max(...ordens.map(o => o.id)) + 1 : 1;
        ordem.id = novoId;
        ordens.push(ordem);
        fs.writeFileSync(filePath, JSON.stringify(ordens, null, 2));
        return ordem;
    }

    async atualizar(id, dadosAtualizados) {
        let ordens = await this.obterTodas();
        const index = ordens.findIndex(o => o.id === Number(id));
        if (index === -1) return null;
        ordens[index] = { ...ordens[index], ...dadosAtualizados };
        fs.writeFileSync(filePath, JSON.stringify(ordens, null, 2));
        return ordens[index];
    }

    async excluir(id) {
        let ordens = await this.obterTodas();
        const novaLista = ordens.filter(o => o.id !== Number(id));
        fs.writeFileSync(filePath, JSON.stringify(novaLista, null, 2));
    }
}

module.exports = new ordemServicoRepository();