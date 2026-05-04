-- CreateTable
CREATE TABLE "storico_forma" (
    "Id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "peso" REAL,
    "userId" INTEGER NOT NULL,
    "data" DATETIME NOT NULL,
    CONSTRAINT "storico_forma_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
