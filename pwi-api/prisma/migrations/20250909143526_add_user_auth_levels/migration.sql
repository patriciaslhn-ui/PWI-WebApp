/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - Added the required column `passwordHash` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."Level" AS ENUM ('STAFF', 'SUPERVISOR', 'MANAGER', 'DIRECTOR');

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "role",
ADD COLUMN     "level" "public"."Level" NOT NULL DEFAULT 'STAFF',
ADD COLUMN     "passwordHash" TEXT NOT NULL;

-- DropEnum
DROP TYPE "public"."Role";
