import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useCandidates } from '@/contexts/CandidateContext';

interface StatusBadgeProps {
  status?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const { statuses } = useCandidates();
  
  if (!status) return null;

  const statusConfig = statuses.find(s => s.value === status);
  
  if (!statusConfig) return null;

  const getVariant = () => {
    switch (status) {
      case 'hired':
        return 'default';
      case 'not-hired':
        return 'destructive';
      case 'consideration':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Badge 
      variant={getVariant()}
      style={{ 
        backgroundColor: statusConfig.color,
        color: 'white',
        borderColor: statusConfig.color
      }}
      className="font-medium"
    >
      {statusConfig.label}
    </Badge>
  );
};
