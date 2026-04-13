import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, '../dev.db')

/**
 * Prisma 7 + better-sqlite3 adapter configuration for seeding
 */
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('[SEED] Provisioning master identity data...')
  
  const users = [
    {
      userId: 'AN-001',
      email: 'arsitek.keamanan@socops.com',
      name: 'SIGIT ADI',
      role: 'admin',
      password: '$2b$10$EPV9WvS.3l1H5pZtZf.0.uP9hP', // password
    },
    {
      userId: 'AN-002',
      email: 'manager@socops.com',
      name: 'ERWIN',
      role: 'manager',
      password: '$2b$10$EPV9WvS.3l1H5pZtZf.0.uP9hP',
    },
    {
      userId: 'AN-003',
      email: 'suyadi@socops.com',
      name: 'SUYADI',
      role: 'l2_analyst',
      password: '$2b$10$EPV9WvS.3l1H5pZtZf.0.uP9hP',
    },
    {
      userId: 'AN-004',
      email: 'bani@socops.com',
      name: 'BANI',
      role: 'l1_analyst',
      password: '$2b$10$EPV9WvS.3l1H5pZtZf.0.uP9hP',
    },
    {
      userId: 'AN-005',
      email: 'budi.hartono@socops.com',
      name: 'BUDI HARTONO',
      role: 'auditor',
      password: '$2b$10$EPV9WvS.3l1H5pZtZf.0.uP9hP',
    }
  ]

  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: { name: userData.name, role: userData.role },
      create: userData,
    })
    console.log(`[SEED] Identity established: ${user.name} (${user.role})`)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
    console.log('[SEED] Documentation completed.')
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
