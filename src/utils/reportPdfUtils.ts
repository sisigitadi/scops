import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Alert } from '../domain/alerts/normalizeAlert';
import { SOCSettings } from '../context/SettingsContext';
import { pulse } from './datePulse';

/**
 * reportPdfUtils — Forensic Report Generation
 * High-fidelity utility set for composing and authorizing professional 
 * forensic reports in PDF format, ensuring absolute data portability and auditing.
 */

interface ReportSection {
  key: string;
  cards: { key: string; value: string | number }[];
  metrics: { metric: string; value: string | number }[];
}

interface PDFOptions {
  dutyAnalystName?: string;
  selectionLabel?: string;
  filters?: string[];
}

function safeDateTime(value: string | undefined): string {
  return pulse(value, { includeTime: true, style: 'dmy' });
}

function humanizeKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export const generateDataDrivenPDF = (
  alerts: Alert[], 
  reportData: ReportSection[], 
  settings: SOCSettings, 
  t: (key: string) => string | any, 
  language: string = 'id', 
  options: PDFOptions = {}
): void => {
  const dutyAnalystName = options.dutyAnalystName || 'SOC SYSTEM';
  const MAX_ALERT_ROWS = 1500;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const locale = language === 'id' ? 'id-ID' : 'en-US';
  const selectionLabel = options.selectionLabel || 'All Data';
  const filters = options.filters || [];

  // Header Context
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(`${(settings.appName || 'SOC OPS').toUpperCase()} OPERATIONS TECHNICAL REPORT`, 15, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`${settings.appName || 'SOC OPS'} | ${settings.orgName || 'ORGANIZATION CONFIDENTIAL'}`, 15, 27);
  doc.text(`EXTRACTED: ${safeDateTime(new Date().toISOString())}`, pageWidth - 15, 27, { align: 'right' });
  doc.text(`SCOPE: ${selectionLabel}`, 15, 33);
  doc.text(`RECORDS: ${alerts.length}`, pageWidth - 15, 33, { align: 'right' });

  // Section I: EXECUTIVE SUMMARY
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('I. EXECUTIVE SUMMARY', 15, 50);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const summaryText = (t('reports.executiveSummary') as string);
  const splitSummary = doc.splitTextToSize(summaryText, pageWidth - 30);
  doc.text(splitSummary, 15, 58);

  let currentY = 58 + (splitSummary.length * 5) + 5;
  if (filters.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('Applied Filters:', 15, currentY);
    doc.setFont('helvetica', 'normal');
    const splitFilter = doc.splitTextToSize(filters.join(' | '), pageWidth - 30);
    doc.text(splitFilter, 15, currentY + 6);
    currentY += 10 + (splitFilter.length * 5);
  } else {
    currentY += 6;
  }

  // Section II: KPI MATRIX
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('II. OPERATIONAL KEY PERFORMANCE INDICATORS', 15, currentY);
  currentY += 8;

  const metricRows: any[] = [];
  reportData.forEach((section) => {
    section.cards.forEach((card) => {
      metricRows.push([`${section.key.toUpperCase()} - ${humanizeKey(card.key)}`, String(card.value)]);
    });
    section.metrics.forEach((metric) => {
      metricRows.push([`${section.key.toUpperCase()} - ${metric.metric}`, String(metric.value)]);
    });
  });

  autoTable(doc, {
    startY: currentY,
    head: [['Strategic Metric', 'Operational Value']],
    body: metricRows,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [79, 70, 229], textColor: 255 },
    theme: 'striped'
  });

  currentY = ((doc as any).lastAutoTable?.finalY || currentY) + 10;

  // Section III: EVENT REGISTER
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('III. CRITICAL SECURITY EVENT REGISTER', 15, currentY);
  currentY += 8;

  const alertRows = alerts.slice(0, MAX_ALERT_ROWS).map((alert) => [
    safeDateTime(alert.timestamp),
    alert.ruleId || '-',
    alert.hostname || '-',
    (alert.severity || '-').toUpperCase(),
    alert.status || '-',
    alert.category || '-'
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Timestamp', 'Rule', 'Hostname', 'Severity', 'Status', 'Category']],
    body: alertRows,
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [15, 23, 42] },
    columnStyles: {
      3: { fontStyle: 'bold' }
    }
  });

  // Authorization Footer
  const finalY = ((doc as any).lastAutoTable?.finalY || currentY) + 14;
  if (finalY < pageHeight - 40) {
    doc.setDrawColor(203, 213, 225);
    doc.line(15, finalY, pageWidth - 15, finalY);
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`VERIFIED BY COMMANDER-IN-CHARGE: ${dutyAnalystName.toUpperCase()}`, 15, finalY + 10);
    doc.text('--- END OF OFFICIAL SECURITY REPORT ---', pageWidth / 2, finalY + 10, { align: 'center' });
  }

  // Page Numbers
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`CONFIDENTIAL - ${settings.appName} V2.0 | Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  const safeFileName = (settings.appName || 'SOC').replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`${safeFileName}_Technical_Report_${new Date().getTime()}.pdf`);
};
