-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Case" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ruleId" TEXT,
    "ruleDescription" TEXT NOT NULL,
    "severity" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "category" TEXT,
    "initialAssessment" TEXT,
    "evidence" TEXT,
    "actionTaken" TEXT,
    "recommendation" TEXT,
    "notes" TEXT,
    "analystId" TEXT,
    "history" TEXT,
    "metadata" TEXT,
    CONSTRAINT "Case_analystId_fkey" FOREIGN KEY ("analystId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Case" ("analystId", "history", "id", "metadata", "ruleDescription", "ruleId", "severity", "status", "timestamp") SELECT "analystId", "history", "id", "metadata", "ruleDescription", "ruleId", "severity", "status", "timestamp" FROM "Case";
DROP TABLE "Case";
ALTER TABLE "new_Case" RENAME TO "Case";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
