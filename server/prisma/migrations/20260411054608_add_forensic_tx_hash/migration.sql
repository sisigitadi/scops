/*
  Warnings:

  - Added the required column `txHash` to the `AuditLog` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "txHash" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "result" TEXT NOT NULL DEFAULT 'SUCCESS',
    "metadata" TEXT,
    "changes" TEXT,
    "actorId" TEXT,
    CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_AuditLog" ("action", "actorId", "category", "changes", "details", "id", "metadata", "result", "timestamp") SELECT "action", "actorId", "category", "changes", "details", "id", "metadata", "result", "timestamp" FROM "AuditLog";
DROP TABLE "AuditLog";
ALTER TABLE "new_AuditLog" RENAME TO "AuditLog";
CREATE UNIQUE INDEX "AuditLog_txHash_key" ON "AuditLog"("txHash");
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp" DESC);
CREATE INDEX "AuditLog_txHash_idx" ON "AuditLog"("txHash");
CREATE INDEX "AuditLog_category_timestamp_idx" ON "AuditLog"("category", "timestamp" DESC);
CREATE INDEX "AuditLog_actorId_timestamp_idx" ON "AuditLog"("actorId", "timestamp" DESC);
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
