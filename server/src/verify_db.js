import { prisma } from './lib/prisma.js'

async function verify() {
  const users = await prisma.user.findMany()
  console.log(`[VERIFY] Users Count: ${users.length}`)
  users.forEach(u => console.log(` - ${u.name} (${u.role}): ${u.email}`))

  const settings = await prisma.systemSetting.findFirst({ where: { key: 'global_config' } })
  console.log(`[VERIFY] Global Config: ${settings ? 'EXISTS' : 'MISSING'}`)
}

verify()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
