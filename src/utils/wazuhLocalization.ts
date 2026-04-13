import { Alert } from '../domain/alerts/normalizeAlert';

/**
 * wazuhLocalization — Multilingual Forensic Assertion
 * High-fidelity utility set for localizing investigative telemetry, 
 * ensuring precise communication of threat parameters across 
 * Indonesian and English language planes.
 */

const categoryIdMap: Record<string, string> = {
  Authentication: 'Autentikasi',
  'Privilege Escalation': 'Peningkatan Hak Akses',
  'Network Anomaly': 'Anomali Jaringan',
  'File Integrity Monitoring': 'Pemantauan Integritas File'
};

interface LocalizedAlertText {
  ruleDescription?: string;
  summary?: string;
  initialAssessment?: string;
  evidence?: string;
  actionTaken?: string;
  recommendation?: string;
  notes?: string;
}

const alertIdTextMap: Record<string, LocalizedAlertText> = {
  'WZH-6001': {
    ruleDescription: 'Terdeteksi percobaan login gagal berulang',
    summary: '',
    initialAssessment: '',
    evidence: '',
    actionTaken: '',
    recommendation: '',
    notes: ''
  },
  'WZH-6002': {
    ruleDescription: 'Pola eskalasi hak akses dari modifikasi sudoers',
    summary: '',
    initialAssessment: '',
    evidence: '',
    actionTaken: '',
    recommendation: '',
    notes: ''
  },
  'WZH-6003': {
    ruleDescription: 'Koneksi keluar mencurigakan ke tujuan yang jarang',
    summary: '',
    initialAssessment: '',
    evidence: '',
    actionTaken: '',
    recommendation: '',
    notes: ''
  },
  'WZH-6004': {
    ruleDescription: 'Perubahan file integrity pada direktori terlindungi',
    summary: '',
    initialAssessment: '',
    evidence: '',
    actionTaken: '',
    recommendation: '',
    notes: ''
  },
  'WZH-6005': {
    ruleDescription: 'Anomali login berulang dari profil scanner yang dikenal',
    summary: '',
    initialAssessment: '',
    evidence: '',
    actionTaken: '',
    recommendation: '',
    notes: ''
  },
  'WZH-6006': {
    ruleDescription: 'Aktivitas admin mencurigakan: grup admin lokal dimodifikasi',
    summary: '',
    initialAssessment: '',
    evidence: '',
    actionTaken: '',
    recommendation: '',
    notes: ''
  },
  'WZH-6007': {
    ruleDescription: 'Event login gagal berulang pada aset kritikal',
    summary: '',
    initialAssessment: '',
    evidence: '',
    actionTaken: '',
    recommendation: '',
    notes: ''
  },
  'WZH-6008': {
    ruleDescription: 'Perubahan file integrity saat maintenance disetujui',
    summary: '',
    initialAssessment: '',
    evidence: '',
    actionTaken: '',
    recommendation: '',
    notes: ''
  }
};

function localizeCategory(category: string, language: string): string {
  if (language !== 'id') return category;
  return categoryIdMap[category] || category;
}

export function localizeAlert(alert: Alert | null, language: string): Alert | null {
  if (!alert) return null;
  if (language !== 'id') return alert;
  
  // We only localize structural categories for UI filtering consistency.
  // Forensic descriptive text (ruleDescription, summary, etc.) is preserved 
  // in its original technical language to maintain investigative integrity.
  return {
    ...alert,
    category: localizeCategory(alert.category, language)
  };
}

export function localizeAlerts(alerts: Alert[], language: string): Alert[] {
  return alerts.map((alert) => localizeAlert(alert, language) as Alert);
}
