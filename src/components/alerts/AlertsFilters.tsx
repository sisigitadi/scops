import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * AlertsFilters — Telemetry Filtration Matrix
 * Theme-aware orchestration module for refining the forensic register 
 * through multi-vector investigative parameters.
 */

interface Filters {
  search?: string;
  severity?: string;
  status?: string;
  category?: string;
  [key: string]: string | undefined;
}

interface AlertsFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export default function AlertsFilters({ filters, onChange }: AlertsFiltersProps) {
  const { language } = useLanguage();
  const tx = (id: string, en: string) => (language === 'id' ? id : en);

  const handleChange = (key: string, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <section className="interactive-panel !p-6 font-bold">
      <div className="flex flex-col gap-6 md:flex-row md:flex-wrap">
        {/* Investigative Search */}
        <div className="flex-1 min-w-[240px]">
          <span className="mb-2 block text-[10px] font-black text-foreground-tertiary uppercase tracking-widest pl-1">
            {tx('Pencarian', 'INVESTIGATIVE SEARCH')}
          </span>
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            placeholder={tx('Cari ID, aturan, atau aset...', 'PROBE ID, RULE, OR ASSET...')}
            className="premium-input w-full font-black uppercase tracking-widest h-11"
          />
        </div>

        {/* Severity Filter */}
        <FilterSelect
          label={tx('Tingkat Bahaya', 'SEVERITY THRESHOLD')}
          value={filters.severity}
          onChange={(v) => handleChange('severity', v)}
          options={[
            { value: '', label: tx('Semua', 'ALL LEVELS') },
            { value: 'critical', label: tx('Kritis', 'CRITICAL') },
            { value: 'high', label: tx('Tinggi', 'HIGH') },
            { value: 'medium', label: tx('Sedang', 'MEDIUM') },
            { value: 'low', label: tx('Rendah', 'LOW') },
          ]}
        />

        {/* Status Filter */}
        <FilterSelect
          label={tx('Status', 'PROTOCOL STATUS')}
          value={filters.status}
          onChange={(v) => handleChange('status', v)}
          options={[
            { value: '', label: tx('Semua', 'ALL STATUS') },
            { value: 'open', label: tx('Terbuka', 'OPEN') },
            { value: 'investigating', label: tx('Investigasi', 'INVESTIGATING') },
            { value: 'closed', label: tx('Ditutup', 'CLOSED') },
          ]}
        />

        {/* Category Filter */}
        <FilterSelect
          label={tx('Kategori', 'THREAT CATEGORY')}
          value={filters.category}
          onChange={(v) => handleChange('category', v)}
          options={[
            { value: '', label: tx('Semua', 'ALL CATEGORIES') },
            { value: 'malware', label: 'MALWARE' },
            { value: 'intrusion', label: tx('Intrusi', 'INTRUSION') },
            { value: 'recon', label: tx('Rekognisi', 'RECONNAISSANCE') },
            { value: 'brute', label: tx('Brute Force', 'BRUTE FORCE') },
          ]}
        />
      </div>
    </section>
  );
}

interface FilterSelectProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

function FilterSelect({ label, value, onChange, options }: FilterSelectProps) {
  return (
    <div className="min-w-[180px]">
      <span className="mb-2 block text-[10px] font-black text-foreground-tertiary uppercase tracking-widest pl-1">
        {label}
      </span>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="premium-input w-full font-black uppercase tracking-widest h-11 cursor-pointer appearance-none text-[11px]"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-bg-card text-foreground-primary">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
