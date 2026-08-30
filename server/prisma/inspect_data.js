import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, '../dev.db')

const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

async function run() {
  console.log('--- DATABASE INSPECTION ---');
  console.log('DB Path:', dbPath);
  
  const users = await prisma.user.findMany({ select: { name: true, role: true, email: true } });
  console.log('Users:', JSON.stringify(users, null, 2));
  
  const presence = await prisma.presence.findMany();
  console.log('Presence:', JSON.stringify(presence, null, 2));
  
  const activeTeam = await prisma.activeTeam.findMany();
  console.log('ActiveTeam:', JSON.stringify(activeTeam, null, 2));
  
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
