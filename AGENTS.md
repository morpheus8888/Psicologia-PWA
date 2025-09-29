# Repository Guidelines

## Project Structure & Modules
- `components/` keeps reusable UI logic; pages should import from here.
- `pages/` defines routes and must stay thin, delegating work to `components/` and `lib/`.
- `lib/` hosts shared hooks, Prisma helpers, and the i18n core; respect existing module boundaries.
- `locales/` holds the typed catalogs (`en`, `it`); every new key must land in both files.
- Data and schema live in `prisma/`; global assets sit in `public/` and `styles/`.

## Internationalization Duties
- Never ship raw strings: use `useTranslations().t(...)`, `<Trans id='…' />`, or `defineMessage(...)`.
- When persisting ids in arrays/options, type them as `MessageKey` or `MessageDescriptor` (e.g., `defineMessage('Profile')`) so TypeScript catches mismatches.
- Replace any hard-coded wording or locale logic you touch; align dependent modules before merging and update both catalogs immediately.
- Prefer `Intl.DateTimeFormat`/`Intl.NumberFormat` with `i18n.locale` for dates, numbers, weekday labels, and placeholders.
- Validate both locales via the language toggle or `/path?locale=en` before you sign off.
- Our runtime compiles raw catalogs via `setMessagesCompiler(compileMessage)`: never remove or bypass it, and watch browser consoles for “Uncompiled message detected” warnings—if one appears, add the missing key to both catalogs right away.

## Build, Test, and Dev Commands
- `npm run dev` – Next.js dev server with HMR.
- `npm run lint` – ESLint in strict TypeScript mode; must be clean pre-commit.
- `npm run build` – prisma generate, migrations (needs `DATABASE_URL`), Next.js production build.
- `npm run start` – run the compiled app after a successful build.

## Style & Naming
- Follow Prettier defaults (tabs, single quotes, no semicolons) and keep functions typed.
- Favour functional components; share cross-cutting logic through `lib/` utilities.
- Use kebab-case for file names (`user-avatar.tsx`) and lowerCamelCase for exports.

## Testing Expectations
- Lint and build are the enforced checks; always run both before a PR.
- Note manual QA in descriptions (e.g., “diary flow verified in it/en”).
- DB-sensitive work requires `.env` with `DATABASE_URL` and `JWT_SECRET` so migrations succeed locally.

## Commits & PRs
- Write imperative commit subjects (`Add diary mood intl helpers`).
- PRs must include scope summary, affected routes/components, test evidence, and linked issues; list touched message ids when translations change.

## Vercel Documentation Compliance
- Before coding, review the docs in `vercel/`; implementation must match those instructions precisely.
- If repo guidance conflicts or feels incomplete, confirm behaviour against the official Vercel docs and align the code accordingly.
- Record any clarifications or updates back into `vercel/` docs to keep the repository authoritative.

## Security & Configuration
- Keep secrets (`DATABASE_URL`, `JWT_SECRET`, `DIARY_MASTER_KEY`) out of Git; use `.env` and Vercel project settings.
- Always consult the README for operational/env requirements and update it if your changes alter the setup. If you cannot propagate a required env var to Vercel yourself (missing credentials/network), stop and request maintainer assistance instead of assuming the deploy is ready.
- Run `scripts/run-migrations.js` only against backed-up databases.
