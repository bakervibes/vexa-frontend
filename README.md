# vexa-front

This template should help get you started developing with Vue 3 in Vite.

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
