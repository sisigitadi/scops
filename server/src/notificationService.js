import { sendTelegramMessage, resolveTelegramConfig } from './services/telegram.js'
import { fetchAlerts, resolveIndexerConfig } from './services/wazuh.js'

let lastProcessedAlertId = null

export async function startNotificationService() {
  console.log('[NOTIFICATION] Service started. Monitoring for critical alerts...')
  
  setInterval(async () => {
    try {
      const indexerConfig = resolveIndexerConfig()
      const telegramConfig = resolveTelegramConfig()
      
      if (!indexerConfig.host || !telegramConfig.token || !telegramConfig.chatId) return

      // Fetch 5 latest alerts
      const response = await fetchAlerts(indexerConfig, { limit: 5 })
      const alerts = response || []
      
      if (alerts.length === 0) return

      // Get the latest one
      const latestAlert = alerts[0]
      const alertId = latestAlert._id || latestAlert.id

      if (alertId !== lastProcessedAlertId) {
        // If this is a high level alert (Level >= 7)
        const level = latestAlert.ruleLevel || 0
        if (level >= 7) {
          const description = latestAlert.ruleDescription || 'Unknown Attack'
          const srcIp = latestAlert.sourceIp || 'Unknown'
          const agent = latestAlert.agentName || 'Unknown Agent'
          
          const message = `🔥 *CRITICAL ALERT DETECTED* 🔥\n\n` +
                          `📍 *Source:* ${srcIp}\n` +
                          `🤖 *Agent:* ${agent}\n` +
                          `🛡️ *Rule:* ${description}\n` +
                          `📊 *Level:* ${level}\n\n` +
                          `🔗 [Open Dashboard](http://localhost:5173)`

          console.log(`[NOTIFICATION] Sending alert to Telegram: ${description}`)
          await sendTelegramMessage(telegramConfig, message, 'Markdown')
        }
        lastProcessedAlertId = alertId
      }
    } catch (e) {
      // Slient fail for background service
    }
  }, 10000) // Check every 10 seconds
}
