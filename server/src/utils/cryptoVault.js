/* global process */
import crypto from 'crypto'

/**
 * CryptoVault — AES-256-GCM Cryptographic Storage Engine
 * Provides authenticated encryption for sensitive integration secrets (Wazuh, OpenCTI, Telegram)
 * and system settings stored in persistent databases.
 */

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12 // 96-bit recommended for GCM
const SALT_LENGTH = 16
const TAG_LENGTH = 16

function getMasterKey(salt) {
  const masterSecret = process.env.BFF_ENCRYPTION_KEY || process.env.BFF_AUTH_JWT_SECRET || 'soc-ops-default-secure-vault-key-32b'
  return crypto.pbkdf2Sync(masterSecret, salt, 100000, 32, 'sha256')
}

/**
 * Encrypts plaintext string using AES-256-GCM.
 * Output format: $gcm$1$<salt_b64>$<iv_b64>$<tag_b64>$<ciphertext_b64>
 */
export function encryptSecret(plainText) {
  if (plainText === null || plainText === undefined) return plainText
  const text = String(plainText)
  if (!text) return ''

  const salt = crypto.randomBytes(SALT_LENGTH)
  const iv = crypto.randomBytes(IV_LENGTH)
  const key = getMasterKey(salt)

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH })
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()

  return `$gcm$1$${salt.toString('base64')}$${iv.toString('base64')}$${tag.toString('base64')}$${encrypted.toString('base64')}`
}

/**
 * Decrypts encrypted secret string. If not matching format, returns as-is for backward compatibility.
 */
export function decryptSecret(cipherText) {
  if (!cipherText || typeof cipherText !== 'string') return cipherText
  if (!cipherText.startsWith('$gcm$1$')) {
    // Unencrypted legacy value
    return cipherText
  }

  try {
    const parts = cipherText.split('$')
    if (parts.length !== 7) return cipherText
    const [, , , saltB64, ivB64, tagB64, encB64] = parts

    const salt = Buffer.from(saltB64, 'base64')
    const iv = Buffer.from(ivB64, 'base64')
    const tag = Buffer.from(tagB64, 'base64')
    const encrypted = Buffer.from(encB64, 'base64')

    const key = getMasterKey(salt)
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH })
    decipher.setAuthTag(tag)

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
    return decrypted.toString('utf8')
  } catch (err) {
    console.error('[CryptoVault] Decryption failed:', err.message)
    return cipherText
  }
}

/**
 * Helper to recursively encrypt sensitive fields in a config object
 */
export function encryptConfigObject(obj, sensitiveKeys = ['password', 'token', 'apiKey', 'secret', 'key']) {
  if (!obj || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) {
    return obj.map(item => encryptConfigObject(item, sensitiveKeys))
  }
  const result = { ...obj }
  for (const [k, v] of Object.entries(result)) {
    if (sensitiveKeys.some(sk => k.toLowerCase().includes(sk.toLowerCase())) && typeof v === 'string') {
      result[k] = encryptSecret(v)
    } else if (v && typeof v === 'object') {
      result[k] = encryptConfigObject(v, sensitiveKeys)
    }
  }
  return result
}

/**
 * Helper to recursively decrypt sensitive fields in a config object
 */
export function decryptConfigObject(obj) {
  if (!obj || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) {
    return obj.map(item => decryptConfigObject(item))
  }
  const result = { ...obj }
  for (const [k, v] of Object.entries(result)) {
    if (typeof v === 'string' && v.startsWith('$gcm$1$')) {
      result[k] = decryptSecret(v)
    } else if (v && typeof v === 'object') {
      result[k] = decryptConfigObject(v)
    }
  }
  return result
}
