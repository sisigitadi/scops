/*
  Warnings:

  - The primary key for the `Presence` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- CreateTable
CREATE TABLE "Schedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "shiftType" TEXT NOT NULL,
    "personnel" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ActiveTeam" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "role" TEXT,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Case" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
INSERT INTO "new_Case" ("actionTaken", "analystId", "category", "evidence", "history", "id", "initialAssessment", "metadata", "notes", "recommendation", "ruleDescription", "ruleId", "severity", "status", "timestamp") SELECT "actionTaken", "analystId", "category", "evidence", "history", "id", "initialAssessment", "metadata", "notes", "recommendation", "ruleDescription", "ruleId", "severity", "status", "timestamp" FROM "Case";
DROP TABLE "Case";
ALTER TABLE "new_Case" RENAME TO "Case";
CREATE INDEX "Case_status_idx" ON "Case"("status");
CREATE INDEX "Case_analystId_idx" ON "Case"("analystId");
CREATE INDEX "Case_timestamp_idx" ON "Case"("timestamp" DESC);
CREATE TABLE "new_Presence" (
    "socketId" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "role" TEXT,
    "page" TEXT,
    "ip" TEXT,
    "lastSeen" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Presence" ("ip", "lastSeen", "page", "role", "socketId", "userId", "username") SELECT "ip", "lastSeen", "page", "role", "socketId", "userId", "username" FROM "Presence";
DROP TABLE "Presence";
ALTER TABLE "new_Presence" RENAME TO "Presence";
CREATE INDEX "Presence_userId_idx" ON "Presence"("userId");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'analyst',
    "password" TEXT NOT NULL,
    "avatar" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("avatar", "createdAt", "email", "id", "name", "password", "role", "updatedAt", "userId") SELECT "avatar", "createdAt", "email", "id", "name", "password", "role", "updatedAt", "userId" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_userId_key" ON "User"("userId");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Schedule_date_shiftType_key" ON "Schedule"("date", "shiftType");

-- CreateIndex
CREATE INDEX "Attendance_userId_idx" ON "Attendance"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_date_userId_key" ON "Attendance"("date", "userId");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp" DESC);

-- CreateIndex
CREATE INDEX "AuditLog_category_timestamp_idx" ON "AuditLog"("category", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "AuditLog_actorId_timestamp_idx" ON "AuditLog"("actorId", "timestamp" DESC);
