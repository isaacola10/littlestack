# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

LittleStack is a Node.js REST API built with Express.js, using Drizzle ORM with Neon (PostgreSQL), JWT authentication, and structured logging with Winston. The project uses ES modules and path aliases for clean imports.

## Development Commands

### Running the Application
```bash
npm run dev          # Start with hot-reload (--watch flag)
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues automatically
npm run format       # Format code with Prettier
npm run format:check # Check formatting without modifying files
```

### Database Operations
```bash
npm run db:generate  # Generate Drizzle migrations from schema changes
npm run db:migrate   # Apply migrations to database
npm run db:studio    # Open Drizzle Studio (GUI for database)
```

## Architecture

### Path Aliases
The project uses Node.js subpath imports (defined in `package.json`) for cleaner imports:
- `#config/*` → `./src/config/*`
- `#controllers/*` → `./src/controllers/*`
- `#middleware/*` → `./src/middleware/*`
- `#models/*` → `./src/models/*`
- `#routes/*` → `./src/routes/*`
- `#services/*` → `./src/services/*`
- `#utils/*` → `./src/utils/*`
- `#validations/*` → `./src/validations/*`

Always use these aliases instead of relative paths when importing across directories.

### Application Structure
The app follows a layered architecture with clear separation of concerns:

**Entry Point Flow**: `index.js` → `server.js` → `app.js`
- `index.js` loads environment variables and starts the server
- `server.js` initializes the HTTP server
- `app.js` configures Express middleware and routes

**Layer Responsibilities**:
- **Models** (`src/models/`): Drizzle ORM schema definitions (e.g., `users` table)
- **Routes** (`src/routes/`): Express route definitions, mapping HTTP endpoints to controllers
- **Controllers** (`src/controllers/`): Request handling, validation, and response formatting
- **Services** (`src/services/`): Business logic and database operations
- **Validations** (`src/validations/`): Zod schemas for input validation
- **Utils** (`src/utils/`): Reusable utilities (JWT, cookies, formatting)
- **Config** (`src/config/`): Database connection and logger configuration

### Database
- **ORM**: Drizzle ORM with Neon PostgreSQL serverless driver
- **Connection**: Configured in `src/config/database.js`, exports `db` and `sql`
- **Models**: Define tables using Drizzle's `pgTable` in `src/models/`
- **Migrations**: Generated in `drizzle/` directory; schema path is `./src/models/*.js`

### Authentication
- JWT tokens for authentication (utilities in `src/utils/jwt.js`)
- Cookies managed via `src/utils/cookies.js` with security defaults (httpOnly, sameSite, secure in production)
- Password hashing with bcrypt (10 rounds)

### Logging
Winston logger configured in `src/config/logger.js`:
- Error logs: `logs/error.log`
- All logs: `logs/combined.log`
- Console output in non-production environments
- Morgan middleware integrates HTTP request logging with Winston

## Environment Variables
Required variables (see `.env.example`):
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `LOG_LEVEL`: Winston log level (default: info)
- `DATABASE_URL`: Neon PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT signing (required in production)

## Code Style
- **Linting**: ESLint with recommended rules, 2-space indentation, single quotes, semicolons required
- **Formatting**: Prettier with 80-char line width, single quotes, trailing commas (ES5)
- Prefer `const` over `let`, no `var`
- Use arrow functions where appropriate
- Unused variables prefixed with `_` are allowed

## Common Patterns

### Adding a New Model
1. Create schema in `src/models/[model-name].model.js` using Drizzle's `pgTable`
2. Run `npm run db:generate` to create migration
3. Run `npm run db:migrate` to apply migration

### Adding a New Route
1. Create validation schema in `src/validations/`
2. Create service functions in `src/services/`
3. Create controller in `src/controllers/`
4. Define routes in `src/routes/`
5. Register route in `src/app.js`

### Error Handling
- Controllers use try-catch with `next(error)` for unhandled errors
- Log errors with `logger.error()` before passing to next middleware
- Validation errors return 400 with formatted Zod errors using `formatValidationError`
