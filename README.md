# 🚀 Starter Vue.js

A modern, production-ready Vue 3 starter template with TypeScript, TanStack Query, Zod validation, and Tailwind CSS.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.19.0-brightgreen)](https://nodejs.org/)
[![Vue 3](https://img.shields.io/badge/Vue-3.5-brightgreen.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)

## ✨ What's Inside

- ⚡️ **Vue 3** with `<script setup>` syntax
- 🔷 **TypeScript** for type safety
- 🎨 **Tailwind CSS v4** for styling
- 🔄 **TanStack Query** for data fetching & caching
- ✅ **Zod** for schema validation
- 🛣️ **Vue Router** with lazy-loaded routes
- 📦 **Vite** for fast development & optimized builds
- 🧹 **ESLint + Prettier** with auto-fix on commit
- 🪝 **Husky** for Git hooks
- 🎯 Complete **CRUD example** included

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Start development server
pnpm dev
```

👉 **New to this template?** Check out the [Getting Started Guide](docs/GETTING_STARTED.md) for a detailed walkthrough.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
pnpm install
```

### Compile and Hot-Reload for Development

```sh
pnpm dev
```

### Type-Check, Compile and Minify for Production

```sh
pnpm build
```

### Lint with [ESLint](https://eslint.org/)

```sh
pnpm lint
```

### Format with [Prettier](https://prettier.io/)

```sh
pnpm format
```

## Features

### 🚀 Vue Router

The project uses Vue Router for client-side navigation with:

- **Lazy-loaded routes** for optimal performance
- **Layouts** (Header, Main, Footer) for consistent UI
- **404 handling** for unknown routes
- **Auto document title** updates based on route meta

```typescript
// Routes are automatically code-split
{
  path: '/',
  name: 'home',
  component: () => import('@/views/HomePage.vue')
}
```

### 🔄 TanStack Query (Vue Query)

Powerful data fetching and caching library configured with:

- **Smart caching** (5 min stale time, 10 min cache)
- **Auto retry** on errors
- **Refetch on window focus** (disabled in dev)
- **Optimistic updates** support

See [API Guide](docs/API_GUIDE.md) for detailed usage.

### ✅ Zod Schema Validation

Type-safe schema validation with Zod for runtime type checking and data validation:

- **Schema-first approach** - Define schemas once, infer TypeScript types automatically
- **Validation helpers** - Built-in validation functions for forms and API responses
- **Type safety** - Full TypeScript support with autocompletion
- **Error handling** - Clear validation error messages

```typescript
import { userSchema, createUserSchema, validateCreateUser } from '@/types/user'
import type { User, CreateUserDto } from '@/types/user'

// Define schema with validation rules
export const userSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  username: z.string().min(3).max(50),
  phone: z.string().optional(),
  website: z.string().url().optional(),
})

// Infer TypeScript type from schema
type User = z.infer<typeof userSchema>

// Validate data
const user = validateCreateUser(formData) // throws ZodError if invalid

// Safe validation (no throw)
const result = safeValidateCreateUser(formData)
if (result.success) {
  console.log(result.data) // typed as CreateUserDto
} else {
  console.error(result.error.issues) // validation errors
}
```

**Key Benefits:**

- **Runtime validation** catches errors before sending to API
- **Automatic type inference** reduces code duplication
- **Schema composition** with `.omit()`, `.partial()`, `.extend()`
- **Form validation** with detailed error messages
- **API response validation** ensures data integrity

### 🌐 Type-Safe API Utility

A fully typed API utility function for making HTTP requests:

```typescript
import { api } from '@/utils/api'

// Type-safe with generics
const users = await api<User[]>('/users', 'GET')
const newUser = await api<User>('/users', 'POST', { name: 'John' })

// Or use helpers
import { get, post, put, del } from '@/utils/api'
const users = await get<User[]>('/users')
```

**Features:**

- Type-safe responses with TypeScript generics
- Automatic timeout handling
- Custom `ApiError` class for error handling
- Support for all HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Optional data and config parameters

## Code Quality & Git Hooks

This project uses ESLint, Prettier, Husky, and lint-staged to ensure code quality and consistency.

### Automatic Checks

#### Pre-commit Hook

Before each commit, the following checks run automatically on staged files:

- **ESLint**: Fixes and validates code (with `--max-warnings 0`)
- **Prettier**: Formats code automatically
- ❌ Commits will be **blocked** if there are any linting errors

#### Pre-push Hook

Before each push, the following checks run:

- **ESLint**: Full codebase validation
- **TypeScript**: Type checking

#### Build Process

The `pnpm build` command runs:

1. Type checking with `vue-tsc`
2. Linting with `eslint --max-warnings 0`
3. Build with Vite

❌ Builds will **fail** if there are any linting errors or warnings.

### Manual Commands

```sh
# Run ESLint with auto-fix
pnpm lint

# Run ESLint without fixing (used in CI/build)
pnpm lint:check

# Format all files with Prettier
pnpm format
```

### VSCode Integration

The project includes VSCode settings (`.vscode/settings.json`) that:

- Format files on save with Prettier
- Auto-fix ESLint issues on save
- Validate Vue, TypeScript, and JavaScript files

### Configuration Files

- **ESLint**: `eslint.config.ts` - Vue 3 + TypeScript rules
- **Prettier**: `.prettierrc.json` - Code formatting rules
- **Husky**: `.husky/` - Git hooks configuration
- **lint-staged**: `package.json` - Pre-commit file processing

## 📖 Documentation

- **[Getting Started Guide](docs/GETTING_STARTED.md)** - Complete setup and development guide
- **[API Guide](docs/API_GUIDE.md)** - Detailed API usage with examples

## 🎯 Example Usage

Check `src/views/HomePage.vue` for a complete CRUD example with:

- Form validation using Zod
- Create, Read, Update, Delete operations
- Search functionality
- Error handling
- Loading states

## Environment Variables

This project uses **Zod** for type-safe environment variable validation.

### Setup

1. Copy `.env.example` to `.env`:

```sh
cp .env.example .env
```

2. Update the variables in `.env` with your configuration

### Available Variables

All environment variables must be prefixed with `VITE_` to be exposed to the client:

| Variable                | Type      | Description              | Example                                   |
| ----------------------- | --------- | ------------------------ | ----------------------------------------- |
| `VITE_APP_NAME`         | `string`  | Application name         | `Vexa Front`                              |
| `VITE_APP_VERSION`      | `string`  | Application version      | `0.0.0`                                   |
| `VITE_API_URL`          | `string`  | API base URL             | `http://localhost:3000/api`               |
| `VITE_API_TIMEOUT`      | `number`  | API request timeout (ms) | `30000`                                   |
| `VITE_ENABLE_DEV_TOOLS` | `boolean` | Enable Vue DevTools      | `true`                                    |
| `VITE_ENABLE_ANALYTICS` | `boolean` | Enable analytics         | `false`                                   |
| `VITE_ENV`              | `enum`    | Environment              | `development`, `staging`, or `production` |

### Type-Safe Usage

Import validated environment variables from `src/env.ts`:

```typescript
import { env, isDevelopment, isProduction } from '@/env'

// All variables are typed and validated
const apiUrl = env.VITE_API_URL // string (URL validated)
const timeout = env.VITE_API_TIMEOUT // number (converted from string)
const devTools = env.VITE_ENABLE_DEV_TOOLS // boolean

// Helper functions
if (isDevelopment) {
  console.log('Running in development mode')
}
```

### Validation

The application **validates all environment variables on startup** using Zod:

- Type checking (string, number, boolean, enum)
- URL format validation for API URLs
- Positive number validation for timeout
- Enum validation for environment

If validation fails, the application will display a detailed error message indicating which variables are invalid.

### Files

- `.env` - Your local environment variables (git-ignored)
- `.env.example` - Template with all required variables
- `src/env.ts` - Zod schema and validation logic
- `env.d.ts` - TypeScript declarations for `import.meta.env`

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest new features
- Submit pull requests

Please ensure your code follows the project's code style and passes all linting checks.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Credits

Built with:

- [Vue.js](https://vuejs.org/) - The Progressive JavaScript Framework
- [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling
- [TanStack Query](https://tanstack.com/query) - Powerful asynchronous state management
- [Zod](https://zod.dev/) - TypeScript-first schema validation
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework

---

**Made with ❤️ by [Baker Vibes](https://github.com/bakervibes)**
