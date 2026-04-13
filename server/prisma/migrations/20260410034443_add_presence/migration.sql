-- CreateTable
CREATE TABLE "Presence" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "socketId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "role" TEXT,
    "page" TEXT,
    "ip" TEXT,
    "lastSeen" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
