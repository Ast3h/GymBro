-- CreateTable
CREATE TABLE "workout_plan" (
    "userId" INTEGER NOT NULL,
    "workoutId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "workout_exercise" (
    "workoutId" INTEGER NOT NULL,
    "exerciseId" INTEGER NOT NULL,
    "nSet" INTEGER NOT NULL,
    "nRep" INTEGER,

    PRIMARY KEY ("workoutId", "exerciseId"),
    CONSTRAINT "workout_exercise_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "workout_plan" ("workoutId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "workout_exercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "workout_set" (
    "workoutId" INTEGER NOT NULL,
    "setId" INTEGER NOT NULL,
    "exerciseId" INTEGER NOT NULL,
    "rep" INTEGER NOT NULL,
    "pesi" INTEGER NOT NULL,

    PRIMARY KEY ("workoutId", "exerciseId", "setId"),
    CONSTRAINT "workout_set_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "workout_plan" ("workoutId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "workout_set_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
