# Gestão Assas

Sistema de gestão com arquitetura frontend e backend separados.

## Estrutura do Projeto

```
gestaoAssas/
├── frontend/          # Next.js com Tailwind CSS
├── backend/           # NestJS com TypeORM
└── README.md
```

## Frontend (Next.js + Tailwind CSS)

O frontend é construído com Next.js 15 e Tailwind CSS para estilização.

### Tecnologias utilizadas:
- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **ESLint** - Linting

### Como executar o frontend:

```bash
cd frontend
npm run dev
```

O frontend estará disponível em: `http://localhost:3000`

### Scripts disponíveis:
- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run start` - Inicia servidor de produção
- `npm run lint` - Executa o linting

## Backend (NestJS + TypeORM)

O backend é construído com NestJS e usa TypeORM para gerenciamento de banco de dados.

### Tecnologias utilizadas:
- **NestJS** - Framework Node.js
- **TypeScript** - Tipagem estática
- **TypeORM** - ORM para banco de dados
- **MySQL2** - Driver MySQL

### Como executar o backend:

```bash
cd backend
npm run start:dev
```

O backend estará disponível em: `http://localhost:8080`

### Scripts disponíveis:
- `npm run start:dev` - Inicia o servidor em modo desenvolvimento
- `npm run start` - Inicia o servidor de produção
- `npm run build` - Gera build de produção
- `npm run test` - Executa os testes

## Configuração do Banco de Dados

Para configurar o TypeORM no backend, você precisará:

1. Criar um arquivo `.env` na pasta `backend` com as configurações do banco:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=sua_senha
DB_DATABASE=gestao_assas
```

2. Configurar o TypeORM no arquivo `app.module.ts` do backend

## Próximos Passos

1. Configure o banco de dados MySQL
2. Implemente as entidades do TypeORM
3. Crie os controladores e serviços no NestJS
4. Desenvolva as páginas do frontend em Next.js
5. Integre o frontend com a API do backend

## Comandos Úteis

### Executar ambos os projetos simultaneamente (Recomendado):
```bash
# Na raiz do projeto
npm run dev
```

### Instalar dependências em todos os projetos:
```bash
# Na raiz do projeto
npm run install:all
```

### Instalar dependências individualmente:
```bash
# Frontend
cd frontend && npm install

# Backend
cd backend && npm install
```

### Executar projetos separadamente:
```bash
# Terminal 1 - Backend
cd backend && npm run start:dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### Build de produção:
```bash
# Build completo
npm run build

# Build individual
npm run build:frontend
npm run build:backend
```
