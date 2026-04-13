import api from './api';

/**
 * telegramService — Command Channel Orchestration
 * High-fidelity service for dispatching operational alerts and 
 * technical telemetry to Telegram endpoints via the BFF gateway.
 */

const BFF_BASE = (import.meta as any).env.VITE_SOCOPS_BFF_URL || '';

function withBffBase(path: string): string {
  if (!BFF_BASE) return path;
  return `${BFF_BASE}${path}`;
}

export const telegramService = {
  sendMessage: async (token: string, chatId: string, text: string, parseMode: string = 'Markdown') => {
    return api.post(withBffBase('/api/telegram/send'), {
      config: { token, chatId },
      text,
      parseMode
    });
  },

  sendAlert: async (token: string, chatId: string, alert: any, appName: string = 'SOC OPS') => {
    const severity = (alert.severity || 'unknown').toUpperCase();
    const alertId = alert.id || alert.alertId || 'N/A';
    const message = `
*${appName} ALERT*
-------------------
*ID:* ${alertId}
*Severity:* ${severity}
*Description:* ${alert.ruleDescription}
*Host:* ${alert.hostname}
*Category:* ${alert.category}
-------------------
    `;
    return telegramService.sendMessage(token, chatId, message, 'Markdown');
  }
};
