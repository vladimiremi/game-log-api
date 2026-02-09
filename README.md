# Game Log API

Este projeto é uma API backend para **processar logs de partidas**, persistir os dados em **PostgreSQL** e expor **ranking por partida**. Foi desenvolvido com **NestJS** e **TypeScript**, usando **Prisma** como camada de acesso a dados.

## Features

- **Upload de logs**: endpoint multipart para envio de arquivos `.log` ou `.txt`
- **Parser de eventos**: identifica início/fim de partida e kills
- **Persistência**: salva jogadores, armas, partidas e kills no banco
- **Ranking por partida**: ranking ordenado por frags, exclui `<WORLD>`
- **Documentação Interativa**: Swagger/OpenAPI
- **Testes**: unitários e e2e com Jest e Supertest

## Arquitetura & Boas Práticas

- **Camadas definidas**: `domain`, `modules` (casos de uso) e `infrastructure`
- **Domínio explícito**: entidades e value objects para regras de negócio
- **Persistência isolada**: repositórios com implementação via Prisma
- **Testabilidade**: testes unitários para domínio e e2e para endpoints

## Tech Stack

- **Core Framework**: NestJS, TypeScript
- **Persistência**: Prisma, PostgreSQL
- **Documentação**: @nestjs/swagger
- **Testing**: Jest, Supertest
- **Linting & Formatting**: ESLint, Prettier

## Architecture Overview

O projeto segue uma organização em camadas:

- **Domain**: regras de negócio, entidades e value objects
- **Modules**: casos de uso e controllers HTTP
- **Infrastructure**: implementação de repositórios e acesso ao banco

Essa separação mantém o domínio independente e facilita manutenção e testes.

## Project Structure

```plaintext
src/
├── app.module.ts
├── main.ts
├── domain/
│   ├── entities/           # kill, match, player, weapon
│   ├── errors/
│   ├── repositories/       # interfaces dos repositórios
│   ├── types/
│   └── value-objects/
├── infrastructure/
│   └── persistence/prisma/ # mappers, repositories, schema
├── modules/
│   ├── parser/             # controller, interfaces, pipes, services, use-case
│   └── ranking/            # controller, use-case
└── shared/
    └── helpers/
```

## API Usage

### Base URLs

- API: `http://localhost:3000`
- Swagger UI: `http://localhost:3000/api/docs`

## Testing

### Running Tests

```bash
# Unit tests
npm test

# E2E
npm run test:e2e

# Coverage
npm run test:cov
```

## Configuration

### Setup

```bash
# Instalar dependências
yarn install

# Subir banco
docker compose up -d

# Criar .env
cp .env.example .env

# Rodar migrations
npx prisma migrate dev

# Iniciar server em dev
yarn start:dev
```

## Diagrama de entidade relacioinamento

<img width="1890" height="940" alt="image" src="https://github.com/user-attachments/assets/802343d5-1f97-494c-9af6-78e8bd8ff4a3" />
