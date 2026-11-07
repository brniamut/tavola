# CLAUDE.md

Instructions for AI coding agents (and people) changing this repo. Keep it short and correct; fix it in the same change when it is wrong.

## What this is

Tavola, a React admin data table (`packages/react`, published as `@tavola/react`) on TanStack Table v9 and `@dnd-kit/react`, with a playground (`apps/playground`), docs (`apps/docs`, Astro Starlight) and a React 18 test run (`compat/react-18`). Developer experience for the people who use the library comes first: a typed column API, sensible defaults, one query object for server mode, no state traps.

## Commands

```sh
pnpm dev        # playground on :5190, using the library source
pnpm check      # format, lint, knip, typecheck, tests (React 19 and 18), builds
pnpm test:e2e   # Playwright in Chromium, Firefox and WebKit against the playground
pnpm format:fix # oxfmt
```

Claude Code formats each edited file and checks types and lint on changed files before it stops (`.claude/settings.json`). Git hooks (`lefthook.yml`) format, lint and typecheck on commit, and run knip, tests and builds on push.

## Code rules

`pnpm lint` enforces these with oxlint, its jsdoc plugin and Tavola's own plugin in `tooling/oxlint-plugin-tavola`. Make code pass rather than loosening a rule; if a rule is wrong, say so and change it deliberately.

- Every top-level function and component has a JSDoc block: what it does and why, each parameter, the result. Users of a library read these on hover.
- One exported function, component or class per module. Types and interfaces go in `*.type.ts` files, which contain only types. `src/index.ts` is the one re-exporting module.
- Small and flat: complexity 10, nesting depth 3, three parameters (then an options object), 60 lines per function, 300 per file.
- Names of two characters or more (`_` for unused parameters), kebab-case file names, named constants for numbers with the unit in the name (`DEBOUNCE_MS`). Tests, e2e and example data may use literals.
- No `any`, no non-null assertions, no floating promises, exhaustive switches, no import cycles, named exports only.
- Narrowing casts are allowed where the user's row type meets TanStack's generic types; keep them in the glue code.

## Library design rules

These follow from what developers struggle with in other table libraries. Keep them.

- The public API is `DataTable`, `defineColumns`, the adapters and the types in `src/index.ts`. TanStack types do not leak, except `TanStackTable` for the escape hatch.
- Tavola owns all state (query, layout, selection) and passes it to TanStack as controlled state (`to-tanstack-state.ts`, `create-state-handlers.ts`). TanStack never holds state the user cannot see.
- New `data`, `columns` or callbacks on every render must not cause loops or refetches: column definitions are keyed by a structural signature and callbacks go through `useLatest`.
- Server mode is one `fetcher(query, { signal })`. Sort, filter and search changes reset the page in the same update. Cursor APIs return `nextCursor`.
- Saved layouts are versioned (`LAYOUT_VERSION`) and reconciled against the current columns. Bump the version only for incompatible storage changes.
- Selection is keyed by `getRowId`, never by index.
- Styles live in `@layer tavola` and are themed with `--tv-*` variables; state is exposed as `data-*` attributes. Every text colour in every theme meets WCAG AA in light and dark; check new colours before adding them.
- Accessibility: real table semantics, labelled controls, keyboard paths for drag and resize.

## Conventions

- Conventional Commits (`feat:`, `fix:`, `refactor:` ...); every commit builds and passes the tests. release-please derives versions and the changelog from them, so never edit `CHANGELOG.md` or the version by hand.
- A bug fix comes with a test. Type-level guarantees go in `test/types.test.ts` with `@ts-expect-error`.
- UI text, docs and comments: plain English, no exclamation marks, emojis or em dashes.
- Hosting: GitHub `brniamut/tavola`. Docs deploy to GitHub Pages on release.
