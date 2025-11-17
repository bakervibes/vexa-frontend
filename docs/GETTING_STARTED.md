# Getting Started with Starter Vue.js

Welcome to Starter Vue.js! This guide will help you get up and running quickly.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v20.19.0+ or v22.12.0+
- **pnpm**: v8+ (recommended package manager)

To install pnpm:

```bash
npm install -g pnpm
```

## 🚀 Quick Start

### 1. Clone or Use This Template

```bash
# Clone the repository
git clone https://github.com/bakervibes/starter-vue-js.git my-project
cd my-project

# Or use as GitHub template
# Click "Use this template" on GitHub
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Application Configuration
VITE_APP_NAME=My Awesome App
VITE_APP_VERSION=1.0.0

# API Configuration
VITE_API_URL=http://localhost:3000/api
VITE_API_TIMEOUT=30000

# Feature Flags
VITE_ENABLE_DEV_TOOLS=true
VITE_ENABLE_ANALYTICS=false

# Environment
VITE_ENV=development
```

### 4. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🏗️ Project Structure

```
starter-vue-js/
├── src/
│   ├── assets/          # Static assets (CSS, images)
│   ├── components/      # Reusable Vue components
│   │   └── layout/      # Layout components (Header, Footer, etc.)
│   ├── composables/     # Vue composables (reusable logic)
│   │   └── useUsers.ts  # Example: User CRUD operations
│   ├── plugins/         # Vue plugins configuration
│   │   └── vue-query.ts # TanStack Query configuration
│   ├── router/          # Vue Router configuration
│   │   └── index.ts     # Route definitions
│   ├── types/           # TypeScript types and Zod schemas
│   │   └── user.ts      # Example: User types & schemas
│   ├── utils/           # Utility functions
│   │   └── api.ts       # Type-safe API client
│   ├── views/           # Page components
│   │   ├── HomePage.vue # Example CRUD page
│   │   └── NotFoundPage.vue
│   ├── App.vue          # Root component
│   ├── main.ts          # Application entry point
│   └── env.ts           # Environment validation (Zod)
├── docs/                # Documentation
│   ├── API_GUIDE.md     # Detailed API usage guide
│   └── GETTING_STARTED.md # This file
├── public/              # Public static assets
├── .env.example         # Environment variables template
├── package.json         # Dependencies and scripts
├── vite.config.ts       # Vite configuration
└── tsconfig.json        # TypeScript configuration
```

## 📚 Core Concepts

### 1. Type-Safe API Client

All API calls are type-safe using TypeScript generics:

```typescript
import { api, get, post } from '@/utils/api'
import type { User } from '@/types/user'

// Using api() function
const users = await api<User[]>('/users', 'GET')

// Using helper functions
const user = await get<User>('/users/1')
const newUser = await post<User>('/users', { name: 'John' })
```

### 2. Zod Schema Validation

Define schemas once, use everywhere:

```typescript
// src/types/product.ts
import { z } from 'zod'

export const productSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Name required'),
  price: z.number().positive('Price must be positive'),
  inStock: z.boolean(),
})

export type Product = z.infer<typeof productSchema>
```

### 3. Vue Query Composables

Encapsulate data fetching logic:

```typescript
// src/composables/useProducts.ts
import { useQuery, useMutation } from '@tanstack/vue-query'
import { api } from '@/utils/api'
import type { Product } from '@/types/product'

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => api<Product[]>('/products', 'GET'),
  })
}

export function useCreateProduct() {
  return useMutation({
    mutationFn: (data: CreateProductDto) => api<Product>('/products', 'POST', data),
  })
}
```

### 4. Vue Components with Composition API

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useProducts, useCreateProduct } from '@/composables/useProducts'

const { data: products, isLoading } = useProducts()
const { mutate: createProduct } = useCreateProduct()

const newProduct = ref({ name: '', price: 0 })

function handleSubmit() {
  createProduct(newProduct.value)
}
</script>

<template>
  <div>
    <form @submit.prevent="handleSubmit">
      <input v-model="newProduct.name" />
      <button type="submit">Create</button>
    </form>

    <div v-if="isLoading">Loading...</div>
    <div v-for="product in products" :key="product.id">
      {{ product.name }}
    </div>
  </div>
</template>
```

## 🛠️ Development Workflow

### Adding a New Feature

1. **Define Types & Schema** (`src/types/`)

```typescript
import { z } from 'zod'

export const todoSchema = z.object({
  id: z.number(),
  title: z.string(),
  completed: z.boolean(),
})

export type Todo = z.infer<typeof todoSchema>
```

2. **Create Composable** (`src/composables/`)

```typescript
import { useQuery } from '@tanstack/vue-query'
import { api } from '@/utils/api'

export function useTodos() {
  return useQuery({
    queryKey: ['todos'],
    queryFn: () => api<Todo[]>('/todos', 'GET'),
  })
}
```

3. **Create Component** (`src/components/` or `src/views/`)

```vue
<script setup lang="ts">
import { useTodos } from '@/composables/useTodos'

const { data: todos, isLoading } = useTodos()
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-for="todo in todos" :key="todo.id">
    {{ todo.title }}
  </div>
</template>
```

4. **Add Route** (`src/router/index.ts`)

```typescript
{
  path: '/todos',
  name: 'todos',
  component: () => import('@/views/TodosPage.vue'),
  meta: { title: 'Todos' }
}
```

### Code Quality Commands

```bash
# Run linter (auto-fix)
pnpm lint

# Check linter without fixing
pnpm lint:check

# Format code
pnpm format

# Type check
pnpm type-check

# Build for production
pnpm build
```

## 🔧 Configuration

### Changing the API Base URL

Edit `.env`:

```env
VITE_API_URL=https://api.example.com
```

### Customizing Vue Query

Edit `src/plugins/vue-query.ts`:

```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 2,
    },
  },
})
```

### Adding Tailwind Plugins

Edit `postcss.config.js` or install plugins:

```bash
pnpm add @tailwindcss/forms @tailwindcss/typography
```

## 📖 Next Steps

- **Read the [API Guide](./API_GUIDE.md)** for detailed API usage
- **Check `src/views/HomePage.vue`** for a complete CRUD example
- **Explore `src/composables/useUsers.ts`** to understand composables pattern
- **Customize `src/components/layout/`** for your app's layout

## 🆘 Troubleshooting

### Port Already in Use

Change the port in `vite.config.ts`:

```typescript
export default defineConfig({
  server: {
    port: 3000,
  },
})
```

### Environment Variables Not Working

- Ensure variables start with `VITE_`
- Restart dev server after changing `.env`
- Check `src/env.ts` for validation errors

### Type Errors

```bash
# Clear TypeScript cache
rm -rf node_modules/.vite
pnpm type-check
```

## 📝 Common Patterns

### Form Validation

```typescript
const formErrors = ref<Record<string, string>>({})

function validateForm() {
  try {
    mySchema.parse(formData.value)
    return true
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.issues.forEach((issue) => {
        formErrors.value[issue.path[0]] = issue.message
      })
    }
    return false
  }
}
```

### Error Handling

```typescript
import { ApiError } from '@/utils/api'

try {
  const data = await api('/endpoint', 'GET')
} catch (error) {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      console.log('Not found')
    }
  }
}
```

### Optimistic Updates

```typescript
const { mutate } = useMutation({
  mutationFn: updateUser,
  onMutate: async (variables) => {
    // Cancel queries
    await queryClient.cancelQueries(['users'])

    // Save previous
    const previous = queryClient.getQueryData(['users'])

    // Optimistically update
    queryClient.setQueryData(['users'], (old) => /* ... */)

    return { previous }
  },
  onError: (err, variables, context) => {
    // Rollback
    queryClient.setQueryData(['users'], context?.previous)
  },
})
```

## 🎉 You're Ready!

You now have everything you need to start building with Starter Vue.js. Happy coding!

For more help:

- 📚 [API Guide](./API_GUIDE.md)
- 🐛 [Report Issues](https://github.com/bakervibes/starter-vue-js/issues)
- 💬 [Discussions](https://github.com/bakervibes/starter-vue-js/discussions)
