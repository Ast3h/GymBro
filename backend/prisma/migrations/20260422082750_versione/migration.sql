/*
  Warnings:

  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.
  - Added the required column `cognome` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nome` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `livello` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `obiettivo` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "cognome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nascita" DATETIME,
    "peso" REAL,
    "altezza" REAL,
    "avatarUrl" TEXT,
    "genere" TEXT,
    "obiettivo" TEXT NOT NULL,
    "livello" INTEGER NOT NULL
);
INSERT INTO "new_User" ("altezza", "avatarUrl", "email", "genere", "id", "livello", "nascita", "obiettivo", "password", "peso") SELECT "altezza", "avatarUrl", "email", "genere", "id", "livello", "nascita", "obiettivo", "password", "peso" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
