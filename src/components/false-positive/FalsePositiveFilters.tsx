import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * FalsePositiveFilters — Signal-to-Noise Optimization Matrix
 * Orchestration module for refining the false positive register 
 * and tuning policies through multi-vector operational parameters.
 */

interface FalsePositiveFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedTool: string;
  onToolChange: (value: string) => void;
  selectedSeverity: string;
  onSeverityChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  toolOptions: string[];
  severityOptions: string[];
  statusOptions: string[];
}

export default function FalsePositiveFilters({
  searchTerm,
  onSearchChange,
  selectedTool,
  onToolChange,
  selectedSeverity,
  onSeverityChange,
  selectedStatus,
  onStatusChange,
  toolOptions,
  severityOptions,
  statusOptions
}: FalsePositiveFiltersProps) {
  const { language } = useLanguage();
  const tx = (id: string, en: string) => (language === 'id' ? id : en);

  return (
    <section className="interactive-panel !p-6 font-bold">
      <div className="grid gap-6 lg:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-foreground-tertiary pl-1">{tx('Pencarian', 'INVESTIGATIVE SEARCH')}</span>
          <input
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={tx('Cari signature, asset, analyst, tuning, reason...', 'SEARCH SIGNATURE, ASSET, ANALYST...')}
            className="premium-input w-full font-black uppercase tracking-widest h-11"
          />
        </label>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <FilterSelect label={tx('Tool', 'TOOLCHAIN')} value={selectedTool} onChange={onToolChange} options={toolOptions} language={language} />
        <FilterSelect label={tx('Severity', 'SEVERITY')} value={selectedSeverity} onChange={onSeverityChange} options={severityOptions} language={language} />
        <FilterSelect label={tx('Status', 'STATUS PROPENSITY')} value={selectedStatus} onChange={onStatusChange} options={statusOptions} language={language} />
      </div>
    </section>
  );
}

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  language: string;
}

function FilterSelect({ label, value, onChange, options, language }: FilterSelectProps) {
  const tx = (id: string, en: string) => (language === 'id' ? id : en);
  const mappedLabel = (option: string) => {
    const optionMap: Record<string, string> = {
      critical: tx('Kritis', 'CRITICAL'),
      high: tx('Tinggi', 'HIGH'),
      medium: tx('Sedang', 'MEDIUM'),
      low: tx('Rendah', 'LOW'),
      open: tx('Terbuka', 'OPEN'),
      reviewed: tx('Ditinjau', 'REVIEWED'),
      tuned: tx('Dituning', 'TUNED'),
      closed: tx('Ditutup', 'CLOSED'),
      pending: tx('Menunggu', 'PENDING'),
      in_review: tx('Ditinjau', 'IN REVIEW'),
      applied: tx('Diterapkan', 'APPLIED'),
      monitoring: tx('Monitoring', 'MONITORING'),
      rejected: tx('Ditolak', 'REJECTED')
    };
    return optionMap[option] || option.toUpperCase();
  };

  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-foreground-tertiary pl-1">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="premium-input w-full font-black uppercase tracking-widest h-11 appearance-none cursor-pointer text-[11px]"
      >
        <option value="" className="bg-bg-card">{tx(`Semua ${label}`, `ALL ${label}`)}</option>
        {options.map((option) => (
          <option key={option} value={option} className="bg-bg-card">{mappedLabel(option)}</option>
        ))}
      </select>
    </label>
  );
}
