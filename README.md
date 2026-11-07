<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="brand/logo-dark.svg">
    <img src="brand/logo.svg" alt="" width="64" height="64">
  </picture>
</p>

# Tavola

A React admin data table, published as `@tavola/react`. The library and its documentation live in [`packages/react`](packages/react/README.md).

## Repository

| Path              | What                                                                  |
| ----------------- | --------------------------------------------------------------------- |
| `packages/react`  | The library: source, stylesheet, tests.                               |
| `apps/docs`       | The docs site (Astro Starlight), deployed to GitHub Pages on release. |
| `apps/playground` | A Vite app with the table in client and server mode; the e2e target.  |
| `compat/react-18` | Runs the library's tests against React 18.                            |
| `tooling`         | Tavola's own oxlint rules.                                            |

## Develop

Node and pnpm versions are pinned in `.tool-versions` (mise or asdf).

```sh
pnpm install   # also installs the git hooks
pnpm dev       # playground on http://localhost:5190, using the library source
pnpm check     # what CI runs: format, lint, structure, knip, typecheck, test, build
```

Single steps: `pnpm format:fix`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`.

Git hooks (lefthook): pre-commit formats and restages, lints and typechecks; commit-msg enforces Conventional Commits; pre-push runs knip, the tests and the build.

## Releases

Releases are cut by [release-please](https://github.com/googleapis/release-please) from the Conventional Commits on `main`:

1. Every push to `main` runs the checks, the React 18 suite and the browser tests (Chromium, Firefox, WebKit).
2. When they pass, release-please opens or updates a release PR with the next version and the changelog. `feat` bumps the minor version and `fix` the patch while below 1.0.
3. Merging the release PR tags the version and creates the GitHub release. The same run publishes `@tavola/react` to npm (once `NPM_PUBLISH` is enabled) and deploys the docs for that version.

To redeploy the docs without a release, run the CI workflow by hand with "Deploy the docs".
