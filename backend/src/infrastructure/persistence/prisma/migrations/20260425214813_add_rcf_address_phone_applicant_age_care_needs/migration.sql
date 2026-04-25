/*
  Warnings:

  - Added the required column `age` to the `Applicant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `careNeeds` to the `Applicant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address` to the `Rcf` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Rcf` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Applicant" ADD COLUMN     "age" INTEGER NOT NULL,
ADD COLUMN     "careNeeds" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Rcf" ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL;
