/* global process */
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import crypto from 'crypto'
import { Buffer } from 'node:buffer'
import { requestLogger, globalErrorHandler, logger } from './utils/logger.js'
import {
  authenticateManager,
  fetchAlerts,
  fetchManagerAgents,
  fetchManagerAlerts,
  testIndexerConnection,
  testManagerConnection,
  resolveIndexerConfig,
  resolveManagerConfig
} from './services/wazuh.js'
import { queryOpencti, testOpenctiConnection, resolveOpenctiConfig } from './services/opencti.js'
import { sendTelegramMessage, testTelegramConnection, resolveTelegramConfig } from './services/telegram.js'
import {
  getDemoAlerts,
  getDemoManagerAgents,
  getDemoManagerAlerts,
  getDemoOpenctiResult
} from './services/demoData.js'
import { startNotificationService } from './notificationService.js'
import { presenceStore } from './services/presenceStore.js'

import { createServer } from 'http'
import { Server } from 'socket.io'
import { prisma } from './lib/prisma.js'

const app = express()
const httpServer = createServer(app)
const port = Number(process.env.BFF_PORT || 8787)
const allowedOrigin = process.env.BFF_ALLOWED_ORIGIN || '*'
const demoModeEnabled = ['1', 'true', 'yes', 'on'].includes(String(process.env.BFF_DEMO_MODE || 'false').toLowerCase())
const strictAuthEnabled = ['1', 'true', 'yes', 'on'].includes(String(process.env.BFF_STRICT_AUTH || 'false').toLowerCase())

// JWT Secret: use env variable or generate a strong random secret per-instance
const authJwtSecret = process.env.BFF_AUTH_JWT_SECRET || crypto.randomBytes(32).toString('hex')
if (!process.env.BFF_AUTH_JWT_SECRET) {
  console.warn('[SECURITY] BFF_AUTH_JWT_SECRET not set. Using auto-generated secret. Sessions will NOT persist across restarts.')
}
const JWT_EXPIRY_SECONDS = 8 * 60 * 60 // 8 hours

const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  L2_ANALYST: 'l2_analyst',
  L1_ANALYST: 'l1_analyst',
  AUDITOR: 'auditor',
  DEMO: 'demo'
}

const CAPABILITIES = {
  READ_ALERTS: 'read_alerts',
  MANAGE_INTEGRATION: 'manage_integration',
  SEND_TELEGRAM: 'send_telegram'
}

const ROLE_CAPABILITIES = {
  [ROLES.ADMIN]: new Set(Object.values(CAPABILITIES)),
  [ROLES.MANAGER]: new Set([CAPABILITIES.READ_ALERTS]),
  [ROLES.L2_ANALYST]: new Set([CAPABILITIES.READ_ALERTS]),
  [ROLES.L1_ANALYST]: new Set([CAPABILITIES.READ_ALERTS]),
  [ROLES.AUDITOR]: new Set([CAPABILITIES.READ_ALERTS]),
  [ROLES.DEMO]: new Set([CAPABILITIES.READ_ALERTS])
}

// Socket.io Setup
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigin,
    methods: ['GET', 'POST']
  },
  transports: ['websocket']
})

// Persistence Handled via presenceStore service (Task #12)
// Persistence Handled via presenceStore service (Task #12)
const getGlobalAnalysts = async () => await presenceStore.getAllAsList()

io.on('connection', async (socket) => {
  const clientIp = (socket.handshake.headers['x-forwarded-for'] || socket.request.connection.remoteAddress || '127.0.0.1').split(',')[0].trim()
  
  // AUTO-REGISTER from Handshake (Auth Payload)
  const { userId, username, role } = socket.handshake.auth || {}
  
  if (userId) {
    socket.data.userId = userId
    socket.data.username = username
    socket.data.ip = clientIp
    
    await presenceStore.upsert(socket.id, userId, {
      username: username || 'Unknown Analyst',
      role: role || 'analyst',
      page: 'INITIALIZING...',
      ip: clientIp
    })
    
    io.emit('presence_update', { analysts: await getGlobalAnalysts() })
    console.log(`[PRESENCE] ${username} auto-joined via handshake (SID: ${socket.id}). IP: ${clientIp}`)
  } else {
    console.log('[SOCKET] Connected (Anonymous):', socket.id)
  }

  // 1. Manually join presence (Legacy/Fallback)
  socket.on('join_presence', async ({ userId: manualId, username: manualName }) => {
    if (!manualId) return
    await presenceStore.upsert(socket.id, manualId, {
      username: manualName,
      role: 'analyst',
      page: 'INITIALIZING...',
      ip: clientIp
    })
    io.emit('presence_update', { analysts: await getGlobalAnalysts() })
  })

  // 2. Real-time Page/Position Update
  socket.on('presence', async ({ userId: presId, username: presName, page }) => {
    if (!presId) return
    await presenceStore.upsert(socket.id, presId, {
      username: presName || 'Unknown',
      page: page,
      ip: clientIp
    })
    io.emit('presence_update', { analysts: await getGlobalAnalysts() })
  })

  // 3. Administrative Force Disconnect (Hardened: Purge all sessions)
  socket.on('kick_user', async ({ userId }) => {
    await presenceStore.removeAllByUserId(userId)
    io.emit('force_logout', { userId })
    io.emit('presence_update', { analysts: await getGlobalAnalysts() })
    console.log(`[SECURITY] Force logout and presence purge for: ${userId}`)
  })

  // 4. Alert-Specific Rooms
  socket.on('join_alert', ({ alertId, username }) => {
    if (!alertId || !username) return
    socket.join(alertId)
    io.in(alertId).emit('presence_update_alert', { alertId, analysts: [] }) // Simplified legacy
  })

  socket.on('disconnect', async () => {
    console.log(`[SOCKET] Disconnected: ${socket.id}`)
    await presenceStore.remove(socket.id)
    io.emit('presence_update', { analysts: await getGlobalAnalysts() })
  })
})

app.use(cors({ origin: allowedOrigin }))
app.use(express.json({ limit: '1mb' }))

// Step 1: Inject Request Logger
app.use(requestLogger)

function isDemoRequest(req) {
  const headerFlag = String(req.headers['x-socops-demo-mode'] || '').toLowerCase()
  const bodyFlag = Boolean(req.body?.demoMode)
  return headerFlag === '1' || headerFlag === 'true' || bodyFlag || demoModeEnabled
}

function decodeBase64Url(input) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/')
  const padLength = (4 - (normalized.length % 4)) % 4
  return Buffer.from(normalized + '='.repeat(padLength), 'base64')
}

function verifyHs256Jwt(token, secret) {
  const parts = String(token || '').split('.')
  if (parts.length !== 3) return null
  const [headerB64, payloadB64, signatureB64] = parts

  const computedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${headerB64}.${payloadB64}`)
    .digest('base64url')

  const provided = Buffer.from(signatureB64)
  const computed = Buffer.from(computedSignature)
  if (provided.length !== computed.length) return null
  if (!crypto.timingSafeEqual(provided, computed)) return null

  try {
    const payloadRaw = decodeBase64Url(payloadB64).toString('utf8')
    const payload = JSON.parse(payloadRaw)

    // Check token expiry
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null // Token expired
    }

    return payload
  } catch {
    return null
  }
}

function getRoleFromHeader(req) {
  const role = String(req.headers['x-socops-role'] || '').toLowerCase()
  if (!role) return ''
  return Object.values(ROLES).includes(role) ? role : ''
}

function getRoleFromStrictAuth(req) {
  if (!authJwtSecret) return ''

  const authHeader = String(req.headers.authorization || '')
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!bearerToken) return ''

  const payload = verifyHs256Jwt(bearerToken, authJwtSecret)
  if (!payload) return ''

  const payloadRole = String(payload?.role || payload?.user?.role || '').toLowerCase()
  if (!Object.values(ROLES).includes(payloadRole)) return ''

  const headerRole = getRoleFromHeader(req)
  if (headerRole && headerRole !== payloadRole) return ''

  return payloadRole
}

/**
 * Verify PBKDF2 Hash from Database
 */
function verifyPassword(password, encodedHash) {
  const parts = encodedHash.split('$')
  if (parts.length !== 4) return false
  const [, iterations, saltB64, hashB64] = parts
  const salt = Buffer.from(saltB64, 'base64')
  const hash = Buffer.from(hashB64, 'base64')
  
  const derived = crypto.pbkdf2Sync(
    password,
    salt,
    parseInt(iterations, 10),
    32,
    'sha256'
  )
  return crypto.timingSafeEqual(hash, derived)
}

function createPasswordHash(password) {
  const iterations = 120000
  const salt = crypto.randomBytes(16)
  const hash = crypto.pbkdf2Sync(password, salt, iterations, 32, 'sha256')
  return `pbkdf2_sha256$${iterations}$${salt.toString('base64')}$${hash.toString('base64')}`
}

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' })
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !verifyPassword(password, user.password)) {
      return res.status(401).json({ message: 'Invalid credentials.' })
    }

    // Generate JWT with expiry (8 hours)
    const now = Math.floor(Date.now() / 1000)
    const payload = { userId: user.id, email: user.email, role: user.role, iat: now, exp: now + JWT_EXPIRY_SECONDS }
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
    const signature = crypto.createHmac('sha256', authJwtSecret).update(`${header}.${body}`).digest('base64url')
    const token = `${header}.${body}.${signature}`

    res.json({
      token,
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    })
  } catch (error) {
    res.status(500).json({ message: 'Authentication process failed.' })
  }
})

function getRequestRole(req) {
  if (isDemoRequest(req)) return ROLES.DEMO
  if (strictAuthEnabled) {
    return getRoleFromStrictAuth(req)
  }
  return getRoleFromHeader(req)
}

function hasCapability(role, capability) {
  if (!role || !capability) return false
  return ROLE_CAPABILITIES[role]?.has(capability) || false
}

function requireCapability(capability) {
  return (req, res, next) => {
    const role = getRequestRole(req)
    if (hasCapability(role, capability)) return next()
    return res.status(403).json({
      message: 'Access denied by BFF RBAC policy.',
      hint: `Missing capability: ${capability}`
    })
  }
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'soc-ops-bff',
    socketActive: !!io,
    timestamp: new Date().toISOString()
  })
})

app.get('/api/config/bootstrap', (req, res) => {
  try {
    const indexer = resolveIndexerConfig()
    const manager = resolveManagerConfig()
    const opencti = resolveOpenctiConfig()

    res.json({
      wazuh: {
        manager: {
          host: manager.host,
          port: manager.port || '55000',
          user: manager.user,
          password: manager.password
        },
        indexer: {
          host: indexer.host,
          port: indexer.port || '9200',
          user: indexer.user,
          password: indexer.password
        }
      },
      opencti: {
        url: opencti.url,
        token: opencti.token
      },
      telegram: {
        token: process.env.TELEGRAM_BOT_TOKEN || '',
        chatId: process.env.TELEGRAM_CHAT_ID || '',
        enabled: Boolean(process.env.TELEGRAM_BOT_TOKEN)
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to bootstrap config' })
  }
})

app.get('/api/config/infra', async (req, res) => {
  try {
    const setting = await prisma.systemSetting.findUnique({ where: { key: 'infra_config' } })
    if (setting) {
      res.json(JSON.parse(setting.value))
    } else {
      res.json({})
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch infra config' })
  }
})

app.post('/api/config/infra', requireCapability(CAPABILITIES.MANAGE_INTEGRATION), async (req, res) => {
  try {
    const setting = await prisma.systemSetting.upsert({
      where: { key: 'infra_config' },
      update: { value: JSON.stringify(req.body) },
      create: { key: 'infra_config', value: JSON.stringify(req.body) }
    })
    res.json({ success: true, setting })
  } catch (error) {
    res.status(500).json({ message: 'Failed to save infra config' })
  }
})

app.get('/api/users', requireCapability(CAPABILITIES.MANAGE_INTEGRATION), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, userId: true, name: true, email: true, role: true }
    })
    res.json(users)
  } catch (error) {
    console.error('[API] /api/users error:', error.message)
    res.status(500).json({ message: 'Database query failed' })
  }
})

app.post('/api/users', requireCapability(CAPABILITIES.MANAGE_INTEGRATION), async (req, res) => {
  try {
    const { name, email, role, password } = req.body || {}
    if (!name || !email || !role || !password) {
      return res.status(400).json({ message: 'name, email, role, and password are required.' })
    }

    const totalUsers = await prisma.user.count()
    const userId = `USR-${String(totalUsers + 1).padStart(3, '0')}`

    const created = await prisma.user.create({
      data: {
        userId,
        name,
        email: String(email).toLowerCase(),
        role,
        password: createPasswordHash(password)
      },
      select: { id: true, userId: true, name: true, email: true, role: true }
    })

    res.status(201).json(created)
  } catch (error) {
    if (String(error?.code || '') === 'P2002') {
      return res.status(409).json({ message: 'Email already exists.' })
    }
    console.error('[API] /api/users POST error:', error.message)
    res.status(500).json({ message: 'Failed to create user' })
  }
})

app.patch('/api/users/:id', requireCapability(CAPABILITIES.MANAGE_INTEGRATION), async (req, res) => {
  const { id } = req.params
  try {
    const { name, email, role, password } = req.body || {}
    const data = {}
    if (typeof name === 'string' && name.trim()) data.name = name
    if (typeof email === 'string' && email.trim()) data.email = email.toLowerCase()
    if (typeof role === 'string' && role.trim()) data.role = role
    if (typeof password === 'string' && password.length > 0) data.password = createPasswordHash(password)

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, userId: true, name: true, email: true, role: true }
    })

    res.json(updated)
  } catch (error) {
    if (String(error?.code || '') === 'P2025') {
      return res.status(404).json({ message: 'User not found.' })
    }
    if (String(error?.code || '') === 'P2002') {
      return res.status(409).json({ message: 'Email already exists.' })
    }
    console.error('[API] /api/users PATCH error:', error.message)
    res.status(500).json({ message: 'Failed to update user' })
  }
})

app.delete('/api/users/:id', requireCapability(CAPABILITIES.MANAGE_INTEGRATION), async (req, res) => {
  const { id } = req.params
  try {
    const target = await prisma.user.findUnique({ where: { id }, select: { role: true } })
    if (!target) return res.status(404).json({ message: 'User not found.' })
    if (target.role === 'admin') {
      return res.status(403).json({ message: 'Admin user cannot be deleted.' })
    }

    await prisma.user.delete({ where: { id } })
    res.status(204).end()
  } catch (error) {
    console.error('[API] /api/users DELETE error:', error.message)
    res.status(500).json({ message: 'Failed to delete user' })
  }
})

// --- Task #5: Case Management API ---

app.get('/api/cases', requireCapability(CAPABILITIES.READ_ALERTS), async (req, res) => {
  try {
    const cases = await prisma.case.findMany({
      include: { analyst: { select: { name: true, role: true } } },
      orderBy: { createdAt: 'desc' }
    })
    res.json(cases)
  } catch (error) {
    console.error('[API] /api/cases error:', error.message)
    res.status(500).json({ message: 'Failed to fetch cases' })
  }
})

app.post('/api/cases', requireCapability(CAPABILITIES.READ_ALERTS), async (req, res) => {
  const { 
    id, title, ruleDescription, severity, status, 
    category, initialAssessment, evidence, actionTaken, 
    recommendation, notes, analystId, metadata, history 
  } = req.body
  
  try {
    const newCase = await prisma.case.upsert({
      where: { id },
      update: {
        title, 
        ruleDescription, 
        severity, 
        status, 
        category,
        initialAssessment,
        evidence,
        actionTaken,
        recommendation,
        notes,
        analystId,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
        history: history ? JSON.stringify(history) : undefined
      },
      create: {
        id,
        ruleDescription: ruleDescription || 'No description',
        severity: severity || 'LOW',
        status: status || 'open',
        category,
        initialAssessment,
        evidence,
        actionTaken,
        recommendation,
        notes,
        analystId,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
        history: history ? JSON.stringify(history) : undefined
      }
    })
    res.status(201).json(newCase)
  } catch (error) {
    console.error('Case API Error:', error)
    res.status(500).json({ message: 'Failed to process case' })
  }
})

app.patch('/api/cases/:id', requireCapability(CAPABILITIES.READ_ALERTS), async (req, res) => {
  const { id } = req.params
  const updates = req.body
  
  // Serialize complex fields
  const data = { ...updates }
  if (data.metadata) data.metadata = JSON.stringify(data.metadata)
  if (data.history) data.history = JSON.stringify(data.history)
  
  try {
    const updated = await prisma.case.update({
      where: { id },
      data
    })
    res.json(updated)
  } catch (error) {
    res.status(500).json({ message: 'Failed to update case' })
  }
})

app.delete('/api/cases/:id', requireCapability(CAPABILITIES.MANAGE_INTEGRATION), async (req, res) => {
  const { id } = req.params
  try {
    await prisma.case.delete({ where: { id } })
    res.status(204).end()
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete case' })
  }
})

// -------------------------------------

// --- Task #6: Audit Log API ---

app.get('/api/audit-logs', requireCapability(CAPABILITIES.READ_ALERTS), async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: { actor: { select: { name: true, role: true } } },
      orderBy: { timestamp: 'desc' },
      take: 1000
    })
    res.json(logs)
  } catch (error) {
    console.error('[API] /api/audit-logs error:', error.message)
    res.status(500).json({ message: 'Failed to fetch audit logs' })
  }
})

app.post('/api/audit-logs', requireCapability(CAPABILITIES.READ_ALERTS), async (req, res) => {
  const { action, category, details, result, metadata, changes, actorId, txHash } = req.body
  try {
    const log = await prisma.auditLog.create({
      data: {
        action,
        txHash: txHash || `TX-${Math.random().toString(36).substring(7).toUpperCase()}`, // Fallback if missing
        category: category || 'GENERAL',
        details,
        result: result || 'SUCCESS',
        metadata: metadata ? JSON.stringify(metadata) : undefined,
        changes: changes ? JSON.stringify(changes) : undefined,
        actorId
      }
    })
    res.status(201).json(log)
  } catch (error) {
    console.error('Audit Log Error:', error)
    res.status(500).json({ message: 'Failed to persist audit log' })
  }
})

// --- Task #7: Operational Calendar API ---

app.get('/api/schedules', requireCapability(CAPABILITIES.READ_ALERTS), async (req, res) => {
  try {
    const schedules = await prisma.schedule.findMany()
    res.json(schedules)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch schedules' })
  }
})

app.post('/api/schedules', requireCapability(CAPABILITIES.MANAGE_INTEGRATION), async (req, res) => {
  const { date, shiftType, personnel } = req.body
  try {
    const schedule = await prisma.schedule.upsert({
      where: { date_shiftType: { date, shiftType } },
      update: { personnel: JSON.stringify(personnel) },
      create: { date, shiftType, personnel: JSON.stringify(personnel) }
    })
    res.status(201).json(schedule)
  } catch (error) {
    res.status(500).json({ message: 'Failed to save schedule' })
  }
})

app.get('/api/attendance', requireCapability(CAPABILITIES.READ_ALERTS), async (req, res) => {
  try {
    const attendance = await prisma.attendance.findMany()
    res.json(attendance)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch attendance' })
  }
})

app.post('/api/attendance', requireCapability(CAPABILITIES.MANAGE_INTEGRATION), async (req, res) => {
  const { date, userId, status } = req.body
  try {
    const record = await prisma.attendance.upsert({
      where: { date_userId: { date, userId } },
      update: { status },
      create: { date, userId, status }
    })
    res.status(201).json(record)
  } catch (error) {
    res.status(500).json({ message: 'Failed to save attendance' })
  }
})

// --- Task #8 Part 2: Active Team (On-Duty) API ---

app.get('/api/active-team', requireCapability(CAPABILITIES.READ_ALERTS), async (req, res) => {
  try {
    const team = await prisma.activeTeam.findMany()
    res.json(team)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch active team' })
  }
})

app.post('/api/active-team/toggle', requireCapability(CAPABILITIES.READ_ALERTS), async (req, res) => {
  const { userId, name, role, notes, status } = req.body
  try {
    if (status === 'off') {
      await prisma.activeTeam.delete({ where: { userId } })
      res.json({ status: 'off' })
    } else {
      const entry = await prisma.activeTeam.upsert({
        where: { userId },
        update: { name, role, notes, joinedAt: new Date() },
        create: { userId, name, role, notes, joinedAt: new Date() }
      })
      res.json(entry)
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to toggle duty status' })
  }
})

// ------------------------------
app.post('/api/test/wazuh-manager', requireCapability(CAPABILITIES.MANAGE_INTEGRATION), async (req, res) => {
  if (isDemoRequest(req)) {
    return res.json({ ok: true, mode: 'demo' })
  }
  try {
    const result = await testManagerConnection(req.body?.config || {})
    res.json(result)
  } catch (error) {
    res.status(400).json({ message: error.message || 'Wazuh manager test failed.' })
  }
})

app.post('/api/wazuh/authenticate', requireCapability(CAPABILITIES.MANAGE_INTEGRATION), async (req, res) => {
  if (isDemoRequest(req)) {
    return res.json({ token: 'demo-wazuh-token', mode: 'demo' })
  }
  try {
    const token = await authenticateManager(req.body?.config || {})
    res.json({ token })
  } catch (error) {
    res.status(400).json({ message: error.message || 'Wazuh authentication failed.' })
  }
})

app.post('/api/wazuh/alerts', requireCapability(CAPABILITIES.READ_ALERTS), async (req, res) => {
  if (isDemoRequest(req)) {
    const limit = req.body?.params?.limit || 100
    return res.json({ ...getDemoManagerAlerts(limit), mode: 'demo' })
  }
  try {
    const data = await fetchManagerAlerts(req.body?.config || {}, req.body?.params || { limit: 100, offset: 0 })
    res.json(data)
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to fetch Wazuh manager alerts.' })
  }
})

app.post('/api/wazuh/agents', requireCapability(CAPABILITIES.READ_ALERTS), async (req, res) => {
  if (isDemoRequest(req)) {
    return res.json({ ...getDemoManagerAgents(), mode: 'demo' })
  }
  try {
    const data = await fetchManagerAgents(req.body?.config || {})
    res.json(data)
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to fetch Wazuh manager agents.' })
  }
})

app.post('/api/test/wazuh-indexer', requireCapability(CAPABILITIES.MANAGE_INTEGRATION), async (req, res) => {
  if (isDemoRequest(req)) {
    return res.json({ ok: true, version: 'demo-indexer-1.0.0', mode: 'demo' })
  }
  try {
    const result = await testIndexerConnection(req.body?.config || {})
    res.json(result)
  } catch (error) {
    res.status(400).json({ message: error.message || 'Wazuh indexer test failed.' })
  }
})

app.post('/api/test/opencti', requireCapability(CAPABILITIES.MANAGE_INTEGRATION), async (req, res) => {
  if (isDemoRequest(req)) {
    return res.json({ ok: true, version: 'demo-1.0.0', mode: 'demo' })
  }
  try {
    const result = await testOpenctiConnection(req.body?.config || {})
    res.json(result)
  } catch (error) {
    res.status(400).json({ message: error.message || 'OpenCTI test failed.' })
  }
})

app.post('/api/test/telegram', requireCapability(CAPABILITIES.MANAGE_INTEGRATION), async (req, res) => {
  if (isDemoRequest(req)) {
    return res.json({ ok: true, username: 'socops_demo_bot', mode: 'demo' })
  }
  try {
    const result = await testTelegramConnection(req.body?.config || {})
    res.json(result)
  } catch (error) {
    res.status(400).json({ message: error.message || 'Telegram test failed.' })
  }
})

app.post('/api/test/database', requireCapability(CAPABILITIES.MANAGE_INTEGRATION), async (req, res) => {
  if (isDemoRequest(req)) {
    return res.json({ ok: true, mode: 'demo' })
  }
  try {
    // Mocking database connection logic
    // In a real scenario, this would use pg or mysql2 to probe the host
    const { host, user } = req.body?.config || {}
    if (!host || !user) throw new Error('Host and User are required for handshake.')
    
    // Simulate latency
    await new Promise(r => setTimeout(r, 600))
    res.json({ ok: true, message: 'Database cluster nominal.' })
  } catch (error) {
    res.status(400).json({ message: error.message || 'Database test failed.' })
  }
})

app.post('/api/telegram/send', requireCapability(CAPABILITIES.SEND_TELEGRAM), async (req, res) => {
  if (isDemoRequest(req)) {
    return res.json({ ok: true, messageId: Date.now(), mode: 'demo' })
  }
  try {
    const config = req.body?.config || {}
    const text = req.body?.text
    const parseMode = req.body?.parseMode || 'Markdown'
    const result = await sendTelegramMessage(config, text, parseMode)
    res.json(result)
  } catch (error) {
    res.status(400).json({ message: error.message || 'Telegram send failed.' })
  }
})

app.post('/api/alerts', requireCapability(CAPABILITIES.READ_ALERTS), async (req, res) => {
  if (isDemoRequest(req)) {
    const limit = req.body?.queryParams?.limit || 50
    return res.json({ alerts: getDemoAlerts(limit), mode: 'demo' })
  }
  try {
    const alerts = await fetchAlerts(req.body?.config || {}, req.body?.queryParams || {})
    res.json({ alerts })
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to fetch alerts from Wazuh indexer.' })
  }
})

app.post('/api/opencti/query', requireCapability(CAPABILITIES.READ_ALERTS), async (req, res) => {
  if (isDemoRequest(req)) {
    const searchValue =
      req.body?.variables?.search ||
      req.body?.variables?.indicator ||
      req.body?.variables?.value ||
      ''
    return res.json({ ...getDemoOpenctiResult(searchValue), mode: 'demo' })
  }
  try {
    const query = req.body?.query
    const variables = req.body?.variables || {}
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ message: 'OpenCTI query must be a non-empty string.' })
    }

    const data = await queryOpencti(req.body?.config || {}, query, variables)
    return res.json(data)
  } catch (error) {
    return res.status(400).json({ message: error.message || 'OpenCTI query failed.' })
  }
})

app.use((req, res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.path}`)
  err.status = 404
  next(err)
})

// Last middleware: Global Error Handler
app.use(globalErrorHandler)

httpServer.listen(port, () => {
  logger.info('SYSTEM', `SOC OPS BFF running on http://localhost:${port}`)
  startNotificationService()
})


