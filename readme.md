# Psicologia PWA

Prototipo di applicazione web a tema psicologico realizzata con Next.js e Prisma. Il progetto nasce dal template "Next PWA Template" ma include una serie di funzioni pensate per offrire un percorso di self‑help con la possibilità di interazione con una psicologa.

## Funzioni attualmente implementate

- **Registrazione e login**: gli utenti possono creare un account tramite email e password (non è ancora prevista la conferma tramite email).
- **Profilo personale**: ogni utente può scegliere il proprio avatar tra dieci animali disponibili e impostare un nickname. Dal profilo è possibile modificare telefono, email e password.
- **Diario guidato**: ogni giorno vengono proposte dieci domande casuali prese da `lib/diary-questions.ts`. È possibile rispondere o saltare una domanda. Alla fine l’utente seleziona il proprio umore (emoji) e salva l’entrata.
  - Le voci del diario sono modificabili solo nel giorno di creazione.
  - Le entrate salvate sono consultabili da un calendario.
  - È disponibile anche un editor di testo ricco per modificare liberamente il contenuto.
- **Pannello admin**: gli account con permesso `isAdmin` possono inviare messaggi a tutti gli utenti e vedere alcune statistiche.
- **Messaggi**: ogni utente ha una pagina dedicata dove leggere le comunicazioni ricevute dall’amministratore.
- **PWA e tema scuro/chiaro**: l’app è ottimizzata per dispositivi mobili ed è installabile come Progressive Web App.

## Funzioni ancora da sviluppare

- **Blog e vocabolario psicologico** scritti dalla psicologa con editor integrato e parola casuale del giorno.
- **Pagina curriculum** con le informazioni professionali.
- **Pagina contatti** con prenotazione di appuntamenti a pagamento.
- Migliorie grafiche e navigazione dedicata alle sezioni sopra indicate.

## Avvio del progetto

1. Installare le dipendenze:
   ```bash
   npm install
   ```
2. Generare il client Prisma:
   ```bash
   npx prisma generate
   ```
3. Applicare le migrazioni:
   ```bash
   npx prisma migrate dev --name init
   ```
4. Avviare l’ambiente di sviluppo:
   ```bash
   npm run dev
   ```

Compilare un file `.env` partendo da `.env.example` e impostare la variabile `DATABASE_URL` per la propria istanza Postgres.

## Deploy su Vercel

1. Effettuare il push su GitHub e importare il progetto su Vercel.
2. Impostare `DATABASE_URL` (e le eventuali variabili per i binari Prisma).
3. Vercel eseguirà lo script `vercel-build` che genera il client Prisma ed applica le migrazioni.
