import React from 'react';

/**
 * ChartCard — Tactical Data Visualizer
 * High-density horizontal bar chart for categorical data mapping and performance tracking.
 */

interface ChartCardItem {
  label: string;
  value: string | number;
  percent: number;
}

interface ChartCardProps {
  title: string;
  items: ChartCardItem[];
  barClassName?: string;
}

export default function ChartCard({ title, items, barClassName = 'bg-accent-cyan' }: ChartCardProps) {
  return (
    <article className="interactive-panel p-5 h-full">
      <h2 className="text-lg font-semibold text-foreground-primary mb-4">
        {title}
      </h2>
      
      <div className="space-y-3">
        {items?.map((item, idx) => (
          <div key={idx} className="group">
            <div className="flex items-center justify-between mb-1">
              <p className="truncate text-sm text-foreground-secondary group-hover:text-foreground-primary transition-colors">
                {item.label}
              </p>
              <span className="text-sm font-medium text-foreground-tertiary">
                {item.value}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-background-hover overflow-hidden">
              <div 
                className={`h-full rounded-full ${barClassName} transition-all duration-500`}
                style={{ width: `${item.percent}%` }}
              />
            </div>
          </div>
        ))}
        
        {(!items || items.length === 0) && (
          <div className="py-8 text-center">
            <p className="text-sm text-foreground-muted">Tidak ada data tersedia</p>
          </div>
        )}
      </div>
    </article>
  );
}
