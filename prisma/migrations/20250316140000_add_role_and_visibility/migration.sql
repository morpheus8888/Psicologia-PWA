DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') THEN
    CREATE TYPE "Role" AS ENUM ('ADMIN', 'PROFESSIONAL', 'CLIENT');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DiaryVisibility') THEN
    CREATE TYPE "DiaryVisibility" AS ENUM ('PRIVATE', 'PROFESSIONALS', 'PUBLIC');
  END IF;
END $$;

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "role" "Role" NOT NULL DEFAULT 'CLIENT',
  ADD COLUMN IF NOT EXISTS "diaryVisibility" "DiaryVisibility" NOT NULL DEFAULT 'PRIVATE';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'isAdmin'
  ) THEN
    UPDATE "User" SET "role" = 'ADMIN' WHERE "isAdmin" = true;
    ALTER TABLE "User" DROP COLUMN "isAdmin";
  END IF;
END $$;
