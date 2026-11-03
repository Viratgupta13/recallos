import React from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: { value: number; label: string };
  color?: string;
  className?: string;
}

export function StatCard({ title, value, subtitle, icon, trend, color, className }: StatCardProps) {
  return (
    <div className={cn('stat-card animate-fade-in', className)}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title}
        </span>
        {icon && (
          <div style={{
            width: 36, height: 36,
            borderRadius: 'var(--radius-md)',
            background: color ? `${color}15` : 'var(--color-primary-soft)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: color || 'var(--color-primary)',
            flexShrink: 0,
          }}>
            {icon}
          </div>
        )}
      </div>
      <div style={{ fontSize: '1.625rem', fontWeight: 800, color: color || 'var(--color-text)', lineHeight: 1, marginBottom: 4 }}>
        {value}
      </div>
      {subtitle && (
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: 6 }}>
          {subtitle}
        </div>
      )}
      {trend && (
        <div style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          color: trend.value >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
          marginTop: 6,
        }}>
          {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
        </div>
      )}
    </div>
  );
}
