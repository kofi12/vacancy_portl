-- Add dob to Applicant (backfill existing rows with empty string, then drop default)
ALTER TABLE "Applicant" ADD COLUMN "dob" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Applicant" ALTER COLUMN "dob" DROP DEFAULT;

-- Add declineReason to Application (nullable)
ALTER TABLE "Application" ADD COLUMN "declineReason" TEXT;

-- Add profile fields to User (all nullable)
ALTER TABLE "User" ADD COLUMN "title" TEXT;
ALTER TABLE "User" ADD COLUMN "organization" TEXT;

-- Migrate Status enum: PENDING -> SUBMITTED, then replace enum
UPDATE "Application" SET "status" = 'SUBMITTED' WHERE "status" = 'PENDING';

CREATE TYPE "Status_new" AS ENUM ('SUBMITTED', 'IN_REVIEW', 'ACCEPTED', 'DECLINED');
ALTER TABLE "Application" ALTER COLUMN "status" TYPE "Status_new" USING ("status"::text::"Status_new");
DROP TYPE "Status";
ALTER TYPE "Status_new" RENAME TO "Status";
