/*
  Warnings:

  - You are about to alter the column `eta` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Int` to `DateTime`.

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
    "eta" DATETIME,
    "peso" REAL,
    "altezza" REAL,
    "avatarUrl" TEXT,
    "genere" TEXT,
    "obiettivo" TEXT NOT NULL,
    "livello" INTEGER NOT NULL
);
INSERT INTO "new_User" ("altezza", "avatarUrl", "cognome", "email", "eta", "genere", "id", "livello", "nome", "obiettivo", "password", "peso") SELECT "altezza", "avatarUrl", "cognome", "email", "eta", "genere", "id", "livello", "nome", "obiettivo", "password", "peso" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
