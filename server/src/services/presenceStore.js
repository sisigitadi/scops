import { prisma } from '../lib/prisma.js';

/**
 * PresenceStore - Database-Backed Analyst Presence (Task #12)
 * Migrated from file-based to Prisma/DB for production-grade persistence.
 * Leverages TTL logic for session cleanliness.
 */
class PresenceStore {
  constructor() {
    // Initialize with a cleanup pulse
    this.cleanupStatus();
  }

  async cleanupStatus() {
    try {
      const now = new Date();
      const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
      const { count } = await prisma.presence.deleteMany({
        where: {
          lastSeen: { lt: thirtyMinutesAgo }
        }
      });
      if (count > 0) console.log(`[PRESENCE] TTL Pulse: Purged ${count} stale records.`);
    } catch (err) {
      console.error('[PRESENCE] TTL Error:', err.message);
    }
  }

  async upsert(socketId, userId, data) {
    if (!socketId || !userId) {
      console.warn('[PRESENCE] Skip Upsert: Missing socketId or userId');
      return;
    }
    try {
      await prisma.presence.upsert({
        where: { socketId },
        update: {
          userId,
          username: data.username,
          role: data.role,
          page: data.page,
          ip: data.ip,
          lastSeen: new Date()
        },
        create: {
          socketId,
          userId,
          username: data.username || 'System',
          role: data.role || 'analyst',
          page: data.page || 'OPERATIONAL GATE',
          ip: data.ip || 'INTERNAL',
          lastSeen: new Date()
        }
      });
    } catch (err) {
      console.error(`[PRESENCE] DB Error (Upsert) for User ${userId}:`, err.message);
    }
  }

  async remove(socketId) {
    if (!socketId) return;
    try {
      await prisma.presence.delete({ where: { socketId } });
    } catch (err) {
      // Silent fail if already gone
    }
  }

  async removeAllByUserId(userId) {
     if (!userId) return;
     try {
       await prisma.presence.deleteMany({ where: { userId } });
     } catch (err) {
       console.error('[PRESENCE] DB Error (DeleteAll):', err.message);
     }
  }

  async get(socketId) {
    if (!socketId) return null;
    try {
      return await prisma.presence.findUnique({ where: { socketId } });
    } catch (err) {
      return null;
    }
  }

  async getAllAsList() {
    try {
      const records = await prisma.presence.findMany();
      return records.map(p => ({
        userId: p.userId,
        username: p.username,
        page: p.page,
        ip: p.ip,
        role: p.role,
        lastSeen: p.lastSeen.toISOString()
      }));
    } catch (err) {
      console.error('[PRESENCE] DB Error (Fetch):', err.message);
      return [];
    }
  }
}

export const presenceStore = new PresenceStore();
