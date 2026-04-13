import React, { ReactNode } from 'react';

/**
 * EmptyState — Nil-Value Protocol Visualizer
 * Standardized interface for displaying operational status when data streams are non-existent.
 */

interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action,
  compact = false 
}: EmptyStateProps) {
  return (
    <div className={`empty-state ${compact ? 'py-8' : 'py-12'}`}>
      {/* Icon */}
      {icon && (
        <div className="empty-state-icon">
          {typeof icon === 'string' ? (
            <span className="text-5xl">{icon}</span>
          ) : (
            icon
          )}
        </div>
      )}
      
      {/* Title */}
      {title && (
        <h3 className="empty-state-title">
          {title}
        </h3>
      )}
      
      {/* Description */}
      {description && (
        <p className="empty-state-description">
          {description}
        </p>
      )}
      
      {/* Action CTA */}
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  );
}

/**
 * EmptyStateTable — Specialized Nil-Value Table Row
 */
export function EmptyStateTable({ 
  colSpan, 
  icon = '📋',
  title,
  description,
  action 
}: { 
  colSpan: number; 
  icon?: ReactNode; 
  title?: string; 
  description?: string; 
  action?: ReactNode; 
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="p-0">
        <EmptyState 
          icon={icon}
          title={title}
          description={description}
          action={action}
        />
      </td>
    </tr>
  );
}

export default EmptyState;
