# Fullstack Challenge - Dictionary

Este é um desafio para demonstrar habilidades de **Fullstack Development**, construindo um aplicativo para listar palavras em inglês utilizando a [Free Dictionary API](https://dictionaryapi.dev/).  
O sistema contém **backend (API NestJS + Postgres + Redis)** e **frontend (Next.js)**, com suporte a autenticação, favoritos e histórico de palavras.

---

## 🚀 Tecnologias usadas

### Backend

- [NestJS](https://nestjs.com/)
- [TypeORM](https://typeorm.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [Redis](https://redis.io/) (cache)
- [Docker Compose](https://docs.docker.com/compose/)

### Frontend

- [Next.js 14](https://nextjs.org/)
- [React](https://react.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [Zustand](https://zustand-demo.pmnd.rs/) (estado global)
- [Yarn](https://yarnpkg.com/)

### Infra

- Node.js **22.14.0**
- Docker + Docker Compose

---

## 📦 Como rodar o projeto (dev)

### 1. Backend (API + DB + Redis)

```bash
cd backend
docker compose up -d --build
```

A API estará disponível em:  
👉 `http://localhost:3000`

---

### 2. Frontend (Next.js)

⚠️ Requer Node.js **22.14.0**.  
Recomenda-se `nvm` para garantir a versão:

```bash
nvm use 22.14.0
```

Rodando o frontend:

```bash
cd my-app
yarn install
```

Crie um arquivo `.env.local`:

```env
NEXT_PUBLIC_API_BASE=http://localhost:3001
```

Suba o app:

```bash
yarn dev
```

👉 Frontend disponível em:  
`http://localhost:3001`

---

## 📚 Funcionalidades

- 🔐 Autenticação (signup / signin via JWT)
- 📚 Consulta a palavras na Free Dictionary API (proxy no backend)
- ⭐ Favoritar / desfavoritar palavras
- 📜 Histórico de buscas
- ⚡ Cache de respostas (Redis)
- 📄 API documentada em OpenAPI 3.0 (swagger)
- 🧪 Testes unitários e de integração no backend
- 📦 Deploy facilitado via Docker

---

## 📂 Estrutura do Repositório

```
dictionary/
├── backend/        # API NestJS + Docker Compose
├── my-app/         # Frontend Next.js
└── README.md       # Este arquivo
```

---

## ✅ Challenge

This is a challenge by [Coodesh](https://coodesh.com/)
