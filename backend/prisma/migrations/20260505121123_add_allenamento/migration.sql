-- CreateTable
CREATE TABLE "allenamento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "workoutId" INTEGER,
    "data" DATETIME NOT NULL,
    "durataSec" INTEGER,
    CONSTRAINT "allenamento_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "allenamento_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "workout_plan" ("workoutId") ON DELETE SET NULL ON UPDATE CASCADE
);
