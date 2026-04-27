/*
  Warnings:

  - Added the required column `tipo` to the `workout_plan` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_workout_plan" (
    "userId" INTEGER NOT NULL,
    "workoutId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "dataCreazione" DATETIME,
    "tipo" TEXT NOT NULL,
    "livello" INTEGER,
    CONSTRAINT "workout_plan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_workout_plan" ("name", "userId", "workoutId") SELECT "name", "userId", "workoutId" FROM "workout_plan";
DROP TABLE "workout_plan";
ALTER TABLE "new_workout_plan" RENAME TO "workout_plan";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
