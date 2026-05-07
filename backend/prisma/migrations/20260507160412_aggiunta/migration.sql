-- CreateTable
CREATE TABLE "workout_template" (
    "templateId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "note" TEXT,
    "livello" INTEGER
);

-- CreateTable
CREATE TABLE "workout_template_exercise" (
    "templateId" INTEGER NOT NULL,
    "exerciseId" INTEGER NOT NULL,
    "nSet" INTEGER NOT NULL,
    "nRep" INTEGER,

    PRIMARY KEY ("templateId", "exerciseId"),
    CONSTRAINT "workout_template_exercise_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "workout_template" ("templateId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "workout_template_exercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
