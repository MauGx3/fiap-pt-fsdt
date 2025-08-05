# FIAP Tech Challenge - Blog API

Uma API simples de blog construída com Express.js, MongoDB e autenticação JWT.

## 🚀 Rotas Disponíveis

### Autenticação

- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Login de usuário

### Posts

- `GET /api/posts` - Listar todos os posts (público)
- `GET /api/posts/:id` - Buscar post por ID (público)
- `GET /api/posts/search` - Buscar posts (público)
- `POST /api/posts` - Criar novo post (requer autenticação)
- `PUT /api/posts/:id` - Atualizar post (requer autenticação)
- `DELETE /api/posts/:id` - Deletar post (requer autenticação - admin/author)

### Usuários

- `POST /api/users/login` - Login de usuário
- Outras rotas de gerenciamento de usuários (requer autenticação)

### Utilitários

- `GET /health` - Health check da API

## 🧪 Testes

Os testes foram integrados usando Jest e SuperTest, organizados em:

### Estrutura de Testes

- **Unit Tests**: Testes unitários para models, controllers e middleware
- **Integration Tests**: Testes de integração para rotas e funcionalidades completas
- **Test Scripts**: Scripts customizados para diferentes cenários

### Scripts de Teste Disponíveis

```bash
npm test              # Executa todos os testes
npm run test:watch    # Executa testes em modo watch
npm run test:coverage # Executa testes com relatório de cobertura
npm run test:unit     # Executa apenas testes unitários
npm run test:integration # Executa apenas testes de integração
npm run test:ci       # Executa testes para CI/CD
```

### Tecnologias de Teste

- **Jest**: Framework de testes
- **SuperTest**: Testes de API HTTP
- **MongoDB Memory Server**: Banco de dados em memória para testes

## ⚙️ Workflows GitHub Actions

O repositório possui 3 workflows configurados:

### 1. Node.js CI (`node.js.yml`)

- **Trigger**: Push e PR para branch `main`
- **Ações**:
  - Testa em múltiplas versões do Node.js (18.x, 20.x, 22.x)
  - Instala dependências e executa testes
  - Cache para MongoDB binaries

### 2. Docker Image CI (`docker-image.yml`)

- **Trigger**: Push e PR para branch `main`
- **Ações**:
  - Testa aplicação em container Docker
  - Build e validação de imagens Docker

### 3. CodeQL Advanced (`codeql.yml`)

- **Trigger**: Push, PR para `main` e schedule semanal
- **Ações**:
  - Análise estática de segurança do código
  - Detecção de vulnerabilidades

## 🛠️ Como Executar

```bash
# Instalar dependências
cd tech_challenge1/backend
npm install

# Executar em desenvolvimento
npm run dev

# Executar testes
npm test

# Executar com Docker
docker-compose up
```

## 📝 Variáveis de Ambiente

- `MONGO_URI`: URI de conexão com MongoDB
- `JWT_SECRET`: Chave secreta para JWT
- `PORT`: Porta da aplicação (padrão: 3000)
- `NODE_ENV`: Ambiente de execução
