import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, '../dev.db')

const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('[RECONSTRUCT] Initiating Global Identity Purge...')

  // 1. Wipe all identity-resident data
  const tables = ['Presence', 'ActiveTeam', 'AuditLog', 'Case', 'User']
  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`DELETE FROM "${table}"`)
      console.log(`[RECONSTRUCT] Purged: ${table}`)
    } catch (e) {
      console.warn(`[RECONSTRUCT] Skip ${table}: ${e.message}`)
    }
  }

  // 2. Provision Sanctioned Crew
  const sanctionedUsers = [
    { email: 'arsitek.keamanan@socops.com', name: 'SIGIT ADI', role: 'admin', userId: 'AN-001' },
    { email: 'manager@socops.com', name: 'ERWIN', role: 'manager', userId: 'AN-002' },
    { email: 'suyadi@socops.com', name: 'SUYADI', role: 'l2_analyst', userId: 'AN-003' },
    { email: 'bani@socops.com', name: 'BANI', role: 'l1_analyst', userId: 'AN-004' },
    { email: 'budi.hartono@socops.com', name: 'BUDI HARTONO', role: 'auditor', userId: 'AN-005' }
  ]

  console.log('[RECONSTRUCT] Provisioning sanctioned personnel...')
  for (const u of sanctionedUsers) {
    const newUser = await prisma.user.create({
      data: { 
        ...u, 
        password: '$2b$10$EPV9WvS.3l1H5pZtZf.0.uP9hP' // default: password
      }
    })
    console.log(`[RECONSTRUCT] User Created: ${newUser.name} [${newUser.id}]`)

    // Also seed ActiveTeam for the initial visual state
    if (['admin', 'manager', 'l2_analyst'].includes(u.role)) {
       await prisma.activeTeam.create({
         data: {
           userId: u.userId,
           name: u.name,
           role: u.role,
           notes: 'Automatic presence initialized via Global Sync.'
         }
       })
       console.log(`[RECONSTRUCT] Shift Started: ${u.name}`)
    }
  }

  console.log('[RECONSTRUCT] Database reconstruction complete.')
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); })
