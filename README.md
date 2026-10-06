# Sistema de Controle e Gestão de Manutenção

API REST desenvolvida em **Node.js** e **MySQL** para o gerenciamento de equipamentos, ordens de serviço, defeitos, peças substituídas e manutenções preventivas de uma indústria de médio porte.

> Documentação completa dos endpoints (URL, método, body e resposta esperada): `docs/DOCUMENTACAO_API.pdf`.

## 🛠️ Arquitetura e Tecnologias

O projeto usa arquitetura em camadas (**Route → Controller → Service → Repository**) com um **roteador HTTP próprio** (`src/router.js`) sobre o módulo nativo `http` do Node.js.

* **Backend**: Node.js
* **Banco de dados**: MySQL (`mysql2/promise`, com pool de conexões e `dateStrings`)
* **Padrão**: Repository-Service-Controller
* **Tratamento de erros**: centralizado (`AppError` + `errorHandler`)
* **Testes**: coleção do Postman (`docs/NP1_API_Manutencao.postman_collection.json`) com testes automáticos

## ▶️ Como executar

```bash
npm install
mysql -u root -p < schema/schema.sql   # cria o banco "manutencao" e as tabelas
node server.js                         # http://localhost:3000
```

Para testar, importe `docs/NP1_API_Manutencao.postman_collection.json` no Postman e execute a coleção inteira (Collection Runner), com a API rodando.

A conexão com o banco é configurada em `src/config/db.js` (padrão: `localhost:3306`, usuário `root`, senha `root`). A porta do servidor pode ser alterada com a variável de ambiente `PORT`.

## 🚀 Módulos do Sistema

### 1. Equipamentos
* Cadastro base dos ativos: nome, modelo, fabricante, data de instalação e status (`ATIVO`, `EM_MANUTENCAO`, `INATIVO`).
* Validação de datas (`AAAA-MM-DD`) e de status.
* **Não permite excluir** equipamentos com ordens de serviço, defeitos ou preventivas vinculados (resposta 409), sugerindo alterar o status para `INATIVO`.
* Endpoint dedicado para listar equipamentos em manutenção.

### 2. Ordens de Serviço (OS)
* Controle das intervenções `PREVENTIVA` ou `CORRETIVA`.
* Impede OS para equipamento inexistente (404) ou `INATIVO` (422).
* Ao abrir a OS, o equipamento vai para `EM_MANUTENCAO`; ao finalizar, volta para `ATIVO`.
* Bloqueia edição, exclusão e novas peças em OS `FINALIZADA` (409).

### 3. Defeitos
* Severidades: `BAIXO`, `MEDIO`, `ALTO`, `CRITICO`.
* Listagem ordenada por severidade; defeitos `CRITICO` recebem `prioridade: "MAXIMA"` e têm rota própria.

### 4. Peças Substituídas
* Registro de peças usadas em uma OS (nome, código, quantidade e custo unitário).
* Histórico por código da peça e cálculo do custo total por OS (soma de quantidade × custo unitário).

### 5. Manutenções Preventivas
* Periodicidade em dias, última manutenção e próxima manutenção prevista (se não informada, é calculada).
* Rota de manutenções vencidas (próxima manutenção anterior à data atual).
* Rota `realizar`: registra a execução e recalcula a próxima data somando a periodicidade.

---

## 📌 Endpoints

### Equipamentos
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/equipamentos` | Cadastra equipamento |
| GET | `/api/equipamentos` | Lista (filtro opcional `?status=`) |
| GET | `/api/equipamentos/em-manutencao` | Lista os que estão em manutenção |
| GET | `/api/equipamentos/:id` | Detalha um equipamento |
| PUT | `/api/equipamentos/:id` | Atualiza (todos os campos) |
| DELETE | `/api/equipamentos/:id` | Remove, se não houver vínculos |
| GET | `/api/equipamentos/:id/defeitos` | Lista defeitos do equipamento |

### Ordens de Serviço (atenção: rotas sem o prefixo `/api`)
| Método | Rota | Descrição |
|---|---|---|
| POST | `/ordens-servico` | Abre uma OS |
| GET | `/ordens-servico` | Lista as OS |
| GET | `/ordens-servico/:id` | Detalha uma OS |
| PUT | `/ordens-servico/:id` | Edita dados da OS (não altera o status) |
| PUT | `/ordens-servico/:id/iniciar` | Status → `EM_ANDAMENTO` |
| PUT | `/ordens-servico/:id/finalizar` | Finaliza e reativa o equipamento |
| DELETE | `/ordens-servico/:id` | Remove, se não finalizada |

### Defeitos
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/defeitos` | Registra defeito |
| GET | `/api/defeitos` | Lista por severidade (filtro `?severidade=`) |
| GET | `/api/defeitos/criticos` | Apenas críticos |
| GET | `/api/defeitos/:id` | Detalha um defeito |
| PUT | `/api/defeitos/:id` | Atualiza |
| DELETE | `/api/defeitos/:id` | Remove |

### Peças
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/pecas` | Lança peça em uma OS |
| GET | `/api/pecas` | Lista (ou histórico com `?codigo=`) |
| GET | `/api/pecas/historico?codigo=` | Histórico por código da peça (código obrigatório) |
| GET | `/api/pecas/:id` | Detalha uma peça |
| PUT | `/api/pecas/:id` | Atualiza |
| DELETE | `/api/pecas/:id` | Remove |
| GET | `/api/ordens-servico/:id/custo-total` | Custo total das peças da OS |

### Preventivas
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/preventivas` | Agenda preventiva |
| GET | `/api/preventivas` | Lista |
| GET | `/api/preventivas/vencidas` | Lista as vencidas |
| GET | `/api/preventivas/:id` | Detalha |
| PUT | `/api/preventivas/:id` | Atualiza |
| PUT | `/api/preventivas/:id/realizar` | Registra realização e recalcula a próxima |
| DELETE | `/api/preventivas/:id` | Remove |

---

## 🛡️ Tratamento de Erros

Toda falha tratada usa o mesmo formato, gerado por `AppError` e `errorHandler`:

```json
{
  "status": 400,
  "erro": "Mensagem descritiva do problema",
  "detalhes": []
}
```

| Status | Uso |
|---|---|
| 400 | Dados inválidos, campos ausentes, ID inválido, JSON malformado |
| 404 | Registro ou rota inexistente |
| 405 | Método não permitido para a rota |
| 409 | Conflito de regra de negócio (OS finalizada, equipamento com vínculos) |
| 422 | Operação não permitida pelo estado (OS para equipamento `INATIVO`) |
| 500 | Erro inesperado |
