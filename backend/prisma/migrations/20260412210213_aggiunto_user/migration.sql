-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nascita" DATETIME,
    "peso" REAL,
    "altezza" REAL,
    "avatarUrl" TEXT,
    "genere" TEXT
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_workout_plan" (
    "userId" INTEGER NOT NULL,
    "workoutId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    CONSTRAINT "workout_plan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_workout_plan" ("name", "userId", "workoutId") SELECT "name", "userId", "workoutId" FROM "workout_plan";
DROP TABLE "workout_plan";
ALTER TABLE "new_workout_plan" RENAME TO "workout_plan";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
