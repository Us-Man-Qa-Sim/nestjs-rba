# NestJS Role-Based Authentication

Boilerplate for NestJS with PostgreSQL.

## Table of Contents

- [Main Branch](#main-branch)
- [Database](#database)
- [Getting Started](#getting-started)
  - [Pre-requisites](#pre-requisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
  - [Swagger Documentation](#swagger-documentation)
- [Migrations](#migrations)
- [Authentication](#authentication)
- [License](#license)
- [Contributing](#contributing)
- [Contact](#contact)

## Main Branch

This branch includes the following modules and features:

1. **Auth Module**:

   - JwtAuth Guard
   - Permission Guard

2. **Permissions Module**:

   - Role-Based Access Control (RBAC)

3. **Roles Module**

4. **Shared Module**:

   - Custom decorators
   - Transformers
   - Other shared functionalities

5. **Users Module**

6. **Users-Role Module**

7. **Seeders**:

   - Users
   - Roles
   - Permissions

8. **Passport JWT Strategy**

9. **Global Exception Handling**

## Database

- **PostgreSQL**

## Getting Started

### Pre-requisites

Ensure you have the following installed:

1. Node.js 20.10.0
2. NestJS 10.2.1
3. PostgreSQL 16.1
4. TypeORM 0.3.17

# Installation

1. Clone the repository:

   ```sh
   git clone git@github.com:Us-Man-Qa-Sim/nestjs-rba.git
   cd nestjs-rba
   ```

2. Install dependencies:

```sh
npm install
```

3.  Create a .env file and update your environment configuration accordingly:

```sh
DATABASE_HOST=
DATABASE_PORT=
DATABASE_USERNAME=
DATABASE_PASSWORD=
DATABASE_NAME=
PORT=
JWT_SECRET=
BCRYPT_WORK=
ACCESS_TOEKN_EXPIRY_TIME_IN_HOURS=
ENABLE_DOCS=
```

4. Run database migrations:

```sh
npm run typeorm:run-migrations
```

5. Seed the database:

```sh
npm run seed
```

Running the Application
To start the application, you can use one of the following commands:
For regular start:

```sh
npm run start
```

For development with watch mode:

```sh
npm run start:dev
```

## API Documentation

API documentation is available via Swagger at baseUrl + /api-documentation. For example, if you are running the application locally on port 3000, the API documentation will be available at:

```sh
https://localhost:3000/api-documentation
```

## Swagger Documentation

Swagger documentation is generated using the @nestjs/swagger plugin with appropriate configurations in nest-cli.

## Migrations

Use the following npm scripts to manage database migrations:

## Generate a new migration:

```sh
npm run typeorm:generate-migration
```

## Create a migration:

```sh
npm run typeorm:create-migration
```

## Run migrations:

```sh
npm run typeorm:run-migrations
```

## Revert migrations:

```sh
npm run typeorm:revert-migration
```

## Authentication

JWT is used for authentication with the Passport strategy.
