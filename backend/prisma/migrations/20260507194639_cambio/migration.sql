-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_workout_template" (
    "templateId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "note" TEXT,
    "livello" TEXT
);
INSERT INTO "new_workout_template" ("livello", "name", "note", "templateId", "tipo") SELECT "livello", "name", "note", "templateId", "tipo" FROM "workout_template";
DROP TABLE "workout_template";
ALTER TABLE "new_workout_template" RENAME TO "workout_template";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
