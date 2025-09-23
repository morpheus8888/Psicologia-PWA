# Psicologia PWA

Progressive Web App per supporto psicologico personale, costruita con Next.js 14, Prisma e Lingui, pensata per deployment continuo su Vercel.

## Stack principale
- **Next.js 14** con `pages/` routing e middleware API
- **Prisma** + PostgreSQL per la persistenza dati
- **JWT** per autenticazione lato API (token salvato su client)
- **TailwindCSS & next-themes** per UI reattiva e tematizzazione light/dark
- **Lingui** per localizzazione IT/EN
- **React-Quill** per editor rich text del diario

> ℹ️ **Linee guida**: ogni feature o refactor deve sempre preservare il supporto multilingua (IT/EN) aggiornando i cataloghi Lingui dove necessario.

## Requisiti
- Node.js 18+
- PostgreSQL (locale o gestito, es. Vercel Postgres / Supabase)
- npm, pnpm o yarn (le istruzioni sotto usano npm)

## Variabili d'ambiente

a) Duplica `.env.example` → `.env`

b) Imposta almeno:

```
DATABASE_URL="postgres://user:password@host:port/db"
JWT_SECRET="string casuale lunga e complessa"
DIARY_ENCRYPTION_KEY="chiave AES-256 di 32 caratteri alfanumerici"
```

> ⚠️ **Obbligatorio:** `JWT_SECRET` deve essere valorizzata sia in locale sia sui progetti Vercel, altrimenti le API rifiutano login/aggiornamenti profilo.
> 🔐 **Sicurezza diario:** `DIARY_ENCRYPTION_KEY` è usata per cifrare le voci del diario prima di salvarle nel database. Genera una stringa di almeno 32 caratteri casuali e conservala al sicuro.

## Setup locale

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

L'app è disponibile su <http://localhost:3000>.

### Test e lint

```bash
npm run lint
npm run build # esegue anche prisma generate
```

## Deployment su Vercel

1. Collega la repo GitHub `morpheus8888/Psicologia-PWA` a Vercel.
2. Vercel esegue automaticamente `pnpm install --frozen-lockfile`, `npm run build` e `prisma migrate deploy` (workflow ufficiale documentato su <https://vercel.com/docs/deployments/configure-a-build>).
   - ⚠️ Ricordati di aggiornare sempre `pnpm-lock.yaml` con `pnpm install --lockfile-only` ogni volta che modifichi le dipendenze, altrimenti la build fallisce.
3. Configura nel progetto Vercel le environment variables (Production, Preview e Development) per `DATABASE_URL` e `JWT_SECRET`.
4. Ogni push su `main` (o branch configurato) attiva il deploy automatico; le pull request generano build di preview.

## Tipologie di account
- Alla registrazione si ottiene il ruolo `CLIENT`.
- Il primo account creato nella piattaforma viene promosso automaticamente a `ADMIN`.
- Gli amministratori possono promuovere/demansionare gli utenti tra `ADMIN`, `PROFESSIONAL` e `CLIENT` dal pannello `/admin`.
- Puoi verificare chi possiede privilegi elevati con la query: `SELECT email, role FROM "User" WHERE "role" = 'ADMIN';`.
- Gli admin accedono al pannello `/admin` per inviare messaggi broadcast, gestire le statistiche utenti, amministrare i profili e visionare (solo se pubblici) i diari cifrati.

## Flussi principali
- **Autenticazione**: registrazione/login utente, token JWT salvato in `localStorage` e condiviso via `AuthProvider`.
- **Diario**: domande giornaliere seed-based, editor WYSIWYG e mood tracker con salvataggio versionato.
- **Messaggi**: inbox utente + marcatore letto.
- **Profilo**: avatar animale, email, telefono e password aggiornabili.
- **Admin**: invio broadcast messaggi e statistiche utenti (richiede flag `isAdmin`).

## Contributi
1. Crea branch (`git checkout -b feature/...`).
2. Implementa e testa (`npm run lint` + eventuali test manuali).
3. Commit e push → apri Pull Request su GitHub.
4. Vercel esegue build di preview automaticamente.

Per domande o problemi apri una issue nella repo GitHub.
