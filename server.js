const http = require('http');
const router = require('./src/router');
const registrarRotas = require('./src/routes');

registrarRotas(router);

const PORTA = process.env.PORT || 3000;

const servidor = http.createServer((req, res) => router.tratar(req, res));

servidor.listen(PORTA, () => {
  console.log(`API rodando em http://localhost:${PORTA}`);
});
