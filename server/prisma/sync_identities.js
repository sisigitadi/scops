import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, '../dev.db')

const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('[SYNC] Starting Identity Synchronization (Clean Sweep)...')

  const sanctionedUsers = [
    { email: 'arsitek.keamanan@socops.com', name: 'SIGIT ADI', role: 'admin', userId: 'AN-001' },
    { email: 'manager@socops.com', name: 'ERWIN', role: 'manager', userId: 'AN-002' },
    { email: 'suyadi@socops.com', name: 'SUYADI', role: 'l2_analyst', userId: 'AN-003' },
    { email: 'bani@socops.com', name: 'BANI', role: 'l1_analyst', userId: 'AN-004' },
    { email: 'budi.hartono@socops.com', name: 'BUDI HARTONO', role: 'auditor', userId: 'AN-005' }
  ]

  // 1. Clear Existing Users Table (Mandatory for perfect sync)
  // We use executeRaw to bypass potential relation constraints if needed, but deleteMany is standard
  try {
    await prisma.user.deleteMany({})
    console.log('[SYNC] Cleared existing users table.')
  } catch (e) {
    console.warn('[SYNC] Warning: Failed to clear some user records (likely foreign key constraints). Continuing...')
  }

  // 2. Provision sanctioned personas
  for (const u of sanctionedUsers) {
    await prisma.user.create({
      data: { 
        ...u, 
        password: '$2b$10$EPV9WvS.3l1H5pZtZf.0.uP9hP' // default: password
      }
    })
    console.log(`[SYNC] Created: ${u.name} as ${u.role}`)
  }

  console.log('[SYNC] Database synchronization complete.')
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); })
