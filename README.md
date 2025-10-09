# FIAP Tech Challenge Fase 2

Uma API simples de blog construída com Express.js, MongoDB e autenticação JWT.

A API está disponível também através do Render pela URL [https://fiap-pt-fsdt.onrender.com](https://fiap-pt-fsdt.onrender.com) (aguarde a reinicialização do container e atualize a página).

## Rotas Disponíveis

### Autenticação

- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Login de usuário

### Posts

- `GET /api/posts` - Listar todos os posts (público)
- `GET /api/posts/:id` - Buscar post por ID (público)
- `GET /api/posts/search` - Buscar posts (público)
- `POST /api/posts` - Criar novo post (requer autenticação)
- `PUT /api/posts/:id` - Atualizar post (requer autenticação)
- `DELETE /api/posts/:id` - Deletar post (requer autenticação - admin/autor)

### Usuários

- `POST /api/users/login` - Login de usuário
- `POST /api/users/logout` - Logout de usuário (requer autenticação)
- `GET /api/users/me` - Obter perfil do usuário atual (requer autenticação)
- `PUT /api/users/me` - Atualizar perfil do usuário atual (requer autenticação)
- `PUT /api/users/me/password` - Alterar senha do usuário atual (requer autenticação)
- `POST /api/users` - Criar novo usuário (público)
- `GET /api/users` - Listar todos os usuários (público)
- `GET /api/users/:uuid` - Buscar usuário por UUID (público)

### Utilitários

- `GET /health` - Health check da API

## Testes

Os testes foram integrados usando Jest e SuperTest, organizados em:

### Estrutura de Testes

- **Unit Tests**: Testes unitários para models, controllers e middleware
- **Integration Tests**: Testes de integração para rotas e funcionalidades completas
- **Test Scripts**: Scripts customizados para diferentes cenários

## Workflows GitHub Actions

O repositório possui 3 workflows configurados:

### 1. Node.js CI (`node.js.yml`)

- **Trigger**: Push e PR para branch `main`
- **Ações**:
  - Testa em múltiplas versões do Node.js (18.x, 20.x, 22.x)
  - Instala dependências e executa testes
  - Cache para MongoDB

### 2. Docker Image CI (`docker-image.yml`)

- **Trigger**: Push e PR para branch `main`
- **Ações**:
  - Testa container Docker
  - Build e validação da imagem do Docker

### 3. CodeQL Advanced (`codeql.yml`)

- **Trigger**: Push, PR para `main` e schedule semanal
- **Ações**:
  - Análise estática de segurança do código
  - Detecção de vulnerabilidades

## Como Executar (Local)

```bash
# Instalar dependências do backend
cd tech_challenge1/backend
npm install

# Executar em desenvolvimento
npm run dev

# Executar testes
npm test
```

## Executando a stack completa com Docker Compose

1. Duplique o arquivo `.env.example` para `.env` na raiz do projeto e ajuste os valores:
  - `JWT_SECRET`: defina uma chave secreta (obrigatório).
  - `BACKEND_PORT` e `FRONTEND_PORT`: altere apenas se quiser utilizar portas diferentes de `8080` e `3000`.

2. Faça o build das imagens e inicie os serviços:
  ```bash
  docker compose up --build
  ```

  Para o ambiente de debug (backend com debugger Node.js em `9229`), utilize:
  ```bash
  docker compose -f compose.debug.yaml up --build
  ```

3. Acesse os serviços:
  - Frontend: http://localhost:8080 (ou `FRONTEND_PORT`)
  - API: http://localhost:3000/api (ou `BACKEND_PORT`)
  - MongoDB: acessível internamente em `mongodb://mongo:27017/fiap-blog`

Os containers possuem health checks configurados: o frontend somente inicia após o backend e o backend depende de um MongoDB saudável.

## Variáveis de Ambiente

- `MONGO_URI`: URI de conexão com MongoDB (já configurada no docker-compose).
- `JWT_SECRET`: Chave secreta para JWT (obrigatório, string de teste usada para estudos).
- `PORT`: Porta do backend (padrão: 3000).
- `NODE_ENV`: Ambiente de execução.
- `JWT_EXPIRES_IN`: Tempo de expiração do token JWT (padrão `7d`).
