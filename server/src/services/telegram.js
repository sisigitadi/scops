/* global process */
import axios from 'axios'

export function resolveTelegramConfig(overrides = {}) {
  const token = overrides.token || process.env.TELEGRAM_BOT_TOKEN || ''
  const chatId = overrides.chatId || process.env.TELEGRAM_CHAT_ID || ''
  return { 
    token, 
    chatId,
    enabled: !!token,
    status: 'disconnected'
  }
}

function ensureToken(token) {
  if (!token) throw new Error('Missing Telegram bot token.')
}

export async function testTelegramConnection(overrides = {}) {
  const config = resolveTelegramConfig(overrides)
  ensureToken(config.token)

  const response = await axios.get(`https://api.telegram.org/bot${config.token}/getMe`, {
    timeout: 10000
  })

  if (!response.data?.ok) {
    throw new Error('Telegram bot token rejected.')
  }

  return {
    ok: true,
    username: response.data?.result?.username || ''
  }
}

export async function sendTelegramMessage(overrides = {}, text = '', parseMode = 'Markdown') {
  const config = resolveTelegramConfig(overrides)
  ensureToken(config.token)
  if (!config.chatId) {
    throw new Error('Missing Telegram chat ID.')
  }
  if (!text || typeof text !== 'string') {
    throw new Error('Telegram message text must be a non-empty string.')
  }

  const response = await axios.post(
    `https://api.telegram.org/bot${config.token}/sendMessage`,
    {
      chat_id: config.chatId,
      text,
      parse_mode: parseMode
    },
    { timeout: 10000 }
  )

  if (!response.data?.ok) {
    throw new Error('Telegram sendMessage failed.')
  }

  return {
    ok: true,
    messageId: response.data?.result?.message_id || null
  }
}

