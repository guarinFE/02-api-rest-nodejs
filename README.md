# API de transações

API REST para registrar entradas e saídas e consultar o saldo das transações de uma sessão.

Projeto de estudo desenvolvido acompanhando o Diego no curso de Node.js da **Rocketseat**, conforme o contexto registrado originalmente neste repositório.

## O que está implementado

- Criação de transações de crédito e débito.
- Listagem e consulta por ID, filtradas pela sessão.
- Resumo com a soma dos valores da sessão.
- Identificação da sessão por cookie `sessionId`, criado na primeira transação e configurado para durar sete dias.
- Validação do corpo da criação e do ID com Zod.
- Persistência com Knex e migrations.

O cookie identifica uma sessão; não há cadastro nem login de usuários implementados. As rotas de consulta retornam `401` quando o cookie está ausente.

## Tecnologias

Node.js, TypeScript, Fastify, `@fastify/cookie`, Knex, Zod e dotenv. O projeto inclui drivers para SQLite e PostgreSQL e testes com Vitest e Supertest.

## Executar localmente com SQLite

### Pré-requisitos

- Node.js e npm.
- Git, para clonar o repositório.

**Compatibilidade:** o `package.json` declara Node.js 18, mas a dependência Fastify 5 exige Node.js 20 ou superior, segundo a [documentação oficial](https://fastify.dev/docs/v5.3.x/Guides/Migration-Guide-V5/#long-term-support-cycle). Essa declaração no projeto precisa ser alinhada antes de considerar a configuração de runtime definitiva.

### Instalação

```sh
git clone https://github.com/guarinFE/02-api-rest-nodejs.git
cd 02-api-rest-nodejs
npm ci
```

Crie um arquivo `.env` na raiz:

```dotenv
NODE_ENV=development
DATABASE_CLIENT=sqlite3
DATABASE_URL=./src/database/app.db
PORT=3456
```

Execute as migrations e inicie o servidor, a partir da raiz do projeto:

```sh
npm run knex -- migrate:latest --env development
npm run dev
```

A API usa `http://localhost:3456`. O comando de migrations acima utiliza o script `knex`, que já executa o CLI com `tsx`.

## Rotas

| Método | Rota | Descrição | Cookie necessário |
| --- | --- | --- | --- |
| `POST` | `/transactions` | Cria uma transação; responde `201`, sem corpo. | Não; cria a sessão se estiver ausente. |
| `GET` | `/transactions` | Retorna `{ transactions: [...] }` da sessão. | Sim |
| `GET` | `/transactions/:id` | Retorna `{ transaction: [...] }`, filtrando por ID e sessão. | Sim |
| `GET` | `/transactions/summary` | Retorna `{ summary: { amount: ... } }`. | Sim |

Exemplo de corpo para criação:

```json
{
  "title": "Entrada de exemplo",
  "amount": 100,
  "type": "credit"
}
```

`type` aceita `credit` ou `debit`. No débito, o código multiplica `amount` por `-1` antes de salvar. A validação atual aceita qualquer número, sem exigir valor positivo.

No cliente HTTP, mantenha o cookie recebido na criação para consultar as mesmas transações. Não são operações bancárias reais: os valores são registros no banco da aplicação.

## Testes

O arquivo `test/transactions.spec.ts` contém testes para criação, listagem, consulta por ID e resumo.

**Use exclusivamente um banco de testes:** a suíte limpa a tabela `transactions` antes de cada teste. A configuração `test` do Knex aponta para `src/database/test.db`.

Crie `.env.test` na raiz com:

```dotenv
NODE_ENV=test
DATABASE_CLIENT=sqlite3
DATABASE_URL=./src/database/test.db
PORT=3457
```

Defina `NODE_ENV=test` no terminal antes de executar a suíte. No PowerShell:

```powershell
$env:NODE_ENV = 'test'
npm run knex -- migrate:latest --env test
npm test -- --run
```

Em shells POSIX, use `export NODE_ENV=test` no lugar da primeira linha. Execute os testes em outro terminal para não manter `NODE_ENV=test` na sessão usada para desenvolvimento.

## Organização

```text
src/
  app.ts                        # Configuração do Fastify e registro das rotas
  server.ts                     # Inicialização do servidor
  database.ts                   # Conexão com o banco
  database/migrations/          # Criação e evolução da tabela
  env/index.ts                  # Leitura e validação do ambiente
  middlewares/                  # Verificação do cookie de sessão
  routes/transactions.ts        # Rotas de transações
test/transactions.spec.ts        # Testes HTTP
knexfile.ts                     # Configurações das migrations por ambiente
```

## Escopo atual

Este é um projeto de aprendizado. As rotas atuais não incluem edição ou exclusão de transações. A configuração local descrita usa SQLite; o código também prevê PostgreSQL por variáveis de ambiente. A existência dessa configuração não representa uma implantação validada em produção.
