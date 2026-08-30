import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, '../../dev.db')

/**
 * Prisma Singleton – Ensuring only one database connection in development.
 * Compatible with Prisma 7 + better-sqlite3 adapter.
 */
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
export const prisma = new PrismaClient({ adapter })

console.log(`[DATABASE] Prisma 7 initialized with SQLite adapter at: ${dbPath}`)
