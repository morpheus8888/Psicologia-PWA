DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'is_admin'
  ) THEN
    UPDATE "User" SET "role" = 'ADMIN' WHERE "is_admin" = true;
    ALTER TABLE "User" DROP COLUMN "is_admin";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'isAdmin'
  ) THEN
    UPDATE "User" SET "role" = 'ADMIN' WHERE "isAdmin" = true;
    ALTER TABLE "User" DROP COLUMN "isAdmin";
  END IF;
END $$;
