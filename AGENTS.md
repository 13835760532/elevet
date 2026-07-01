# Repository Guidelines

## Project Structure & Module Organization

This is a Vue 3 + Vite admin application using TypeScript, Element Plus, Pinia, Vue Router, UnoCSS, and Vitest. Application code lives in `src/`. Use `src/views/` for routed pages, `src/components/` for reusable UI, `src/api/` for request modules grouped by domain, `src/store/` for Pinia modules, `src/router/` for route registration, and `src/utils/` or `src/hooks/` for shared helpers. Static assets belong in `src/assets/` when imported by code, or `public/` when served directly. Build output directories such as `dist/` and `dist-prod/` should not be edited by hand.

## Build, Test, and Development Commands

Use pnpm, matching the project engines (`node >=16`, `pnpm >=8.6`).

- `pnpm i`: install dependencies.
- `pnpm dev`: start Vite with `env.local`.
- `pnpm dev-server`: start Vite with the `dev` mode.
- `pnpm test:unit`: run Vitest with `vitest.config.mjs`.
- `pnpm ts:check`: run `vue-tsc --noEmit`.
- `pnpm build:stage` / `pnpm build:prod`: create stage or production bundles.
- `pnpm preview`: build locally and preview the generated app.

## Coding Style & Naming Conventions

Follow `.editorconfig` and `prettier.config.js`: UTF-8, LF endings, 2-space indentation, 100-column preferred width, single quotes, no semicolons, and no trailing commas. Prefer Vue single-file components with `<script setup lang="ts">` where possible. Name reusable components with PascalCase directories or files, for example `src/components/PageHeader/`. Keep API modules domain-scoped under `src/api/<domain>/`, and use the `@` alias for imports from `src`.

## Testing Guidelines

Vitest runs in a Node environment and includes `src/**/*.test.ts`. Place tests beside the implementation they cover and name them `*.test.ts`; use `*.integration.test.ts` for tests that cross module boundaries. Run `pnpm test:unit` for test changes, and add `pnpm ts:check` when touching shared types, stores, routes, or API contracts.

## Commit & Pull Request Guidelines

Recent history uses short, imperative messages such as `fix bug`, `fix input`, and `fix 优化`. Keep commits focused and describe the changed behavior clearly. For pull requests, include a short summary, affected pages or modules, test results, related issue links when available, and screenshots or screen recordings for visible UI changes.

## Agent-Specific Instructions

When code discovery is needed, prefer the codebase-memory MCP tools first: `search_graph`, `trace_path`, `get_code_snippet`, `query_graph`, then fallback text search for literals, configs, and non-code files.
