import type { RiskLevel } from '@/types';
import { getRiskBgClass, capitalize } from '@/lib/utils';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface RiskBadgeProps {
  risk: RiskLevel;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

const icons = {
  high: AlertTriangle,
  medium: Clock,
  low: CheckCircle,
};

export function RiskBadge({ risk, showIcon = true, size = 'md' }: RiskBadgeProps) {
  const Icon = icons[risk];
  return (
    <span
      className={`badge ${getRiskBgClass(risk)}`}
      style={{ fontSize: size === 'sm' ? '0.625rem' : undefined }}
      aria-label={`Risk level: ${risk}`}
    >
      {showIcon && <Icon size={size === 'sm' ? 10 : 12} />}
      {capitalize(risk)} Risk
    </span>
  );
}
