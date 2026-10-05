// Exemplo usando array ou lendo/gravando no db.json/db.js
const fs = require('fs');
const path = require('path');

const DB_PATH = path.resolve(__dirname, '../config/db.json');

function lerBanco() {
  if (!fs.existsSync(DB_PATH)) {
    return { defeitos: [], equipamentos: [] };
  }
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

function salvarBanco(dados) {
  fs.writeFileSync(DB_PATH, JSON.stringify(dados, null, 2), 'utf-8');
}

class DefeitosRepository {
  async findAll() {
    const db = lerBanco();
    return db.defeitos || [];
  }

  async findById(id) {
    const db = lerBanco();
    return (db.defeitos || []).find((d) => d.id === Number(id)) || null;
  }

  async findByEquipamentoId(equipamentoId) {
    const db = lerBanco();
    return (db.defeitos || []).filter((d) => d.equipamentoId === Number(equipamentoId));
  }

  async create(defeito) {
    const db = lerBanco();
    db.defeitos = db.defeitos || [];
    
    // Auto-incremento de ID
    const nextId = db.defeitos.length > 0 
      ? Math.max(...db.defeitos.map((d) => d.id)) + 1 
      : 1;

    defeito.id = nextId;
    db.defeitos.push(defeito);
    salvarBanco(db);
    return defeito;
  }

  async update(id, dadosAtualizados) {
    const db = lerBanco();
    const index = (db.defeitos || []).findIndex((d) => d.id === Number(id));
    if (index === -1) return null;

    db.defeitos[index] = { ...db.defeitos[index], ...dadosAtualizados, id: Number(id) };
    salvarBanco(db);
    return db.defeitos[index];
  }

  async delete(id) {
    const db = lerBanco();
    const index = (db.defeitos || []).findIndex((d) => d.id === Number(id));
    if (index === -1) return false;

    db.defeitos.splice(index, 1);
    salvarBanco(db);
    return true;
  }
}

module.exports = new DefeitosRepository();