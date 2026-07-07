/*
  Warnings:

  - Added the required column `neighborhood` to the `establishment_address` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "establishment_address" ADD COLUMN     "complement" TEXT,
ADD COLUMN     "neighborhood" TEXT NOT NULL;
