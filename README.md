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
DIARY_MASTER_KEY="chiave alfanumerica di almeno 32 caratteri"
```

> ⚠️ **Obbligatorio:** `JWT_SECRET` deve essere valorizzata sia in locale sia sui progetti Vercel, altrimenti le API rifiutano login/aggiornamenti profilo.
> 🔐 **Sicurezza diario:** `DIARY_MASTER_KEY` viene usata per derivare le chiavi di cifratura dei diari utente. Genera una stringa robusta di almeno 32 caratteri, conservala al sicuro e non condividerla.

> 📝 **Preview senza DB:** Se `DATABASE_URL` non è impostata (es. su preview Vercel), l'applicazione resta navigabile ma il blog mostra un avviso e nessun articolo. Imposta la variabile prima di rilasciare ambienti destinati agli utenti.

## Migrazioni del database

- Prisma tiene traccia della struttura del database con le migrazioni in `prisma/migrations/`. Ogni volta che aggiungiamo colonne o nuove tabelle viene creata una cartella con gli script SQL da applicare.
- In locale usa `npx prisma migrate dev --name <nome>` per creare le nuove migrazioni e aggiornare il database di sviluppo.
- In ambienti remoti (es. Vercel) le migrazioni vengono applicate automaticamente grazie allo script `scripts/run-migrations.js`, eseguito sia durante `npm run build` sia nel post-build di Vercel. Nessuna azione manuale è richiesta.
- Se il database non è raggiungibile (es. P1001) lo script segnala l'errore ma lascia proseguire il build; al deploy successivo, quando il DB torna disponibile, le migrazioni vengono applicate.
- Se vedi errori del tipo `column "user.role" does not exist` significa che il database era privo di migrazioni e l'ambiente è ripartito senza `DATABASE_URL`. Appena la variabile è presente, il successivo build applicherà automaticamente gli script pendenti.

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
npm run build
```

### Localizzazione

Il supporto IT/EN è gestito da un provider custom (`lib/i18n/index.tsx`) che utilizza dizionari TypeScript (`locales/en/messages.ts`, `locales/it/messages.ts`).

- Aggiungi nuove stringhe traducibili aggiornando entrambi i file di dizionario.
- Per usare il toggle lingua importa `useLingui`/`Trans` da `@/lib/i18n`.
- Le route Next.js mantengono il locale sincronizzato con il contesto, quindi il deploy su Vercel funziona senza passaggi extra.
- La configurazione di Lingui è in `lingui.config.js` (file JavaScript per evitare errori TypeScript durante i build su Vercel).

## Deployment su Vercel

> Nota: prima di intervenire sui deploy consulta sempre i file nella cartella `vercel/` (es. `vercel/vercel-docs.md`, `vercel/vercel-rest-api.md`). Manteniamoli sincronizzati con ogni cambiamento rilevante.

1. Collega la repo GitHub `morpheus8888/Psicologia-PWA` a Vercel.
2. Vercel esegue automaticamente `pnpm install --frozen-lockfile`, `npm run build` (che include le migrazioni) e `scripts/run-migrations.js` come post-build (workflow ufficiale documentato su <https://vercel.com/docs/deployments/configure-a-build>).
   - ⚠️ Ricordati di aggiornare sempre `pnpm-lock.yaml` con `pnpm install --lockfile-only` ogni volta che modifichi le dipendenze, altrimenti la build fallisce.
3. Configura nel progetto Vercel le environment variables (Production, Preview e Development) per `DATABASE_URL` e `JWT_SECRET`.
4. Ogni push su `main` (o branch configurato) attiva il deploy automatico; le pull request generano build di preview.

## Tipologie di account
- Alla registrazione si ottiene il ruolo `CLIENT`.
- Il primo account creato nella piattaforma viene promosso automaticamente a `ADMIN`.
- Gli amministratori possono promuovere/demansionare gli utenti tra `ADMIN`, `PROFESSIONAL` e `CLIENT` dal pannello `/admin`.
- Puoi verificare chi possiede privilegi elevati con la query: `SELECT email, role FROM "User" WHERE "role" = 'ADMIN';`.
- Gli admin accedono al pannello `/admin` per inviare messaggi broadcast, gestire gli articoli del blog, amministrare i profili, resettare password e (solo se pubblici) visionare i diari cifrati.

## Diario e privacy
- Ogni utente deve impostare una **password del diario** (sezione `Profilo → Impostazioni`). Senza quella password non è possibile leggere o scrivere nuove voci.
- Le voci vengono cifrate per-account usando `DIARY_MASTER_KEY` come chiave primaria + una chiave derivata per utente.
- La visibilità può essere `Solo io`, `Solo professionisti`, `Tutti`. Solo in modalità `Tutti` gli amministratori possono consultare i diari, sempre in versione depurata/HTML sanitizzato.
- La password del diario non viene mai salvata in chiaro: la verifica avviene tramite hash + salt dedicati (PBKDF scrypt) memorizzati nel profilo.

## Blog amministrativo
- Gli amministratori possono creare, modificare e pubblicare articoli dal pannello `/admin`.
- Gli articoli pubblicati vengono mostrati in homepage come blog, con dettaglio dedicato in `/blog/[slug]`.
- I contenuti vengono sanitizzati lato server (whitelist HTML) prima di essere salvati ed esposti.

## Notifiche e messaggistica
- Gli utenti ricevono notifiche badge per i messaggi non letti (banner in alto a sinistra e contatori nel menu profilo).
- Gli admin dispongono di un broadcast verso tutti gli account e di messaggi individuali con relativo log negli ultimi invii.
- Il conteggio dei messaggi non letti è esposto via `/api/messages/unread-count` e viene aggiornato automaticamente dopo ogni lettura.

## Flussi principali
- **Autenticazione**: registrazione/login utente, token JWT salvato in `localStorage` e condiviso via `AuthProvider`.
- **Diario**: domande giornaliere seed-based, editor WYSIWYG, mood tracker e cifratura per utente con password dedicata.
- **Messaggi**: inbox utente con badge non letti e possibilità di segnare come letto.
- **Profilo**: avatar animale, email, telefono, password account e password diario aggiornabili.
- **Blog**: articoli pubblicati dagli amministratori con gestione versioni e bozza/pubblicazione.
- **Admin**: dashboard per ruoli, broadcast, messaggi individuali, reset password, diario pubblico e gestione articoli.

## Contributi
1. Crea branch (`git checkout -b feature/...`).
2. Implementa e testa (`npm run lint` + eventuali test manuali).
3. Commit e push → apri Pull Request su GitHub.
4. Vercel esegue build di preview automaticamente.
5. Mantieni questo README aggiornato quando introduci o modifichi funzionalità.

Per domande o problemi apri una issue nella repo GitHub.
