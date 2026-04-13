import { prisma } from './lib/prisma.js'
import crypto from 'node:crypto'

const HASH_ALGORITHM = 'pbkdf2_sha256'
const HASH_ITERATIONS = 120000
const SALT_LENGTH_BYTES = 16

function createPasswordHash(password) {
  const salt = crypto.randomBytes(SALT_LENGTH_BYTES)
  const hash = crypto.pbkdf2Sync(password, salt, HASH_ITERATIONS, 32, 'sha256')
  return `${HASH_ALGORITHM}$${HASH_ITERATIONS}$${salt.toString('base64')}$${hash.toString('base64')}`
}

async function seed() {
  console.log('[SEED] Clearing existing data...')
  await prisma.user.deleteMany()
  await prisma.systemSetting.deleteMany()

  const defaultUsers = [
    { userId: 'AN-001', name: 'SIGIT ADI', email: 'arsitek.keamanan@socops.com', role: 'admin', password: 'Admin123' },
    { userId: 'MG-002', name: 'Security Manager', email: 'manager@socops.com', role: 'manager', password: 'Admin123' },
    { userId: 'AN-003', name: 'L2 Analyst', email: 'l2@socops.com', role: 'l2_analyst', password: 'Admin123' },
    { userId: 'AN-004', name: 'L1 Analyst', email: 'l1@socops.com', role: 'l1_analyst', password: 'Admin123' },
    { userId: 'AU-005', name: 'Executive Auditor', email: 'auditor@socops.com', role: 'auditor', password: 'Admin123' },
    { userId: 'DE-006', name: 'Public Demo', email: 'demo@socops.com', role: 'demo', password: 'Admin123' }
  ]

  for (const user of defaultUsers) {
    const passwordHash = createPasswordHash(user.password)
    await prisma.user.create({
      data: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        password: passwordHash
      }
    })
    console.log(`[SEED] Created user: ${user.name} (${user.role})`)
  }

  await prisma.systemSetting.create({
    data: { key: 'global_config', value: JSON.stringify({ refreshInterval: 30, wazuhStatus: 'disconnected' }) }
  })
  console.log('[SEED] Seeding Completed.')
}

seed().catch(console.error).finally(() => prisma.$disconnect())
