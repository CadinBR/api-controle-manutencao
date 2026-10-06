const AppError = require('./errors/AppError');
const { tratarErro } = require('./middlewares/errorHandler');

// Lista de rotas registradas. Cada rota tem: método, regex do caminho e a função (handler).
const rotas = [];

function adicionar(metodo, caminho, handler) {
  // "/api/equipamentos/:id" vira a regex /^\/api\/equipamentos\/([^/]+)$/
  const regex = new RegExp('^' + caminho.replace(/:\w+/g, '([^/]+)') + '$');
  const nomes = (caminho.match(/:\w+/g) || []).map((n) => n.slice(1)); // ["id"]
  rotas.push({ metodo, regex, nomes, handler });
}

// O corpo da requisição chega em pedaços; juntamos tudo e convertemos de JSON para objeto.
function lerBody(req) {
  return new Promise((resolve, reject) => {
    let texto = '';
    req.on('data', (pedaco) => (texto += pedaco));
    req.on('end', () => {
      if (texto.trim() === '') return resolve({});
      try {
        resolve(JSON.parse(texto) || {});
      } catch {
        reject(new AppError(400, 'JSON inválido no corpo da requisição'));
      }
    });
  });
}

async function tratar(req, res) {
  // atalho para responder em JSON: res.json(200, dados)
  res.json = (status, dados) => {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(dados === undefined ? undefined : JSON.stringify(dados));
  };

  try {
    const url = new URL(req.url, 'http://localhost');
    const caminho = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, '') : url.pathname;
    let caminhoExiste = false;

    for (const rota of rotas) {
      const encontrado = rota.regex.exec(caminho);
      if (!encontrado) continue;

      caminhoExiste = true;
      if (rota.metodo !== req.method) continue;

      // deixa tudo pronto para o controller usar
      req.params = {};
      rota.nomes.forEach((nome, i) => (req.params[nome] = encontrado[i + 1]));
      req.query = Object.fromEntries(url.searchParams);

      const temBody = ['POST', 'PUT', 'PATCH'].includes(req.method);
      req.body = temBody ? await lerBody(req) : {};

      return await rota.handler(req, res);
    }

    if (caminhoExiste) throw new AppError(405, 'Método não permitido para esta rota');
    throw new AppError(404, 'Rota não encontrada');
  } catch (err) {
    tratarErro(err, res);
  }
}

// ATENÇÃO: as rotas são testadas na ordem em que foram registradas.
// Rotas fixas (/em-manutencao, /criticos) devem vir ANTES das rotas com :id.
module.exports = {
  get: (caminho, handler) => adicionar('GET', caminho, handler),
  post: (caminho, handler) => adicionar('POST', caminho, handler),
  put: (caminho, handler) => adicionar('PUT', caminho, handler),
  patch: (caminho, handler) => adicionar('PATCH', caminho, handler),
  delete: (caminho, handler) => adicionar('DELETE', caminho, handler),
  tratar,
};