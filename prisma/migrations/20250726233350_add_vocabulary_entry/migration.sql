CREATE TABLE IF NOT EXISTS "VocabularyEntry" (
  "id" TEXT NOT NULL,
  "term" TEXT NOT NULL,
  "definition" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "VocabularyEntry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "VocabularyEntry_term_key" ON "VocabularyEntry"("term");
