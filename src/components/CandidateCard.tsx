import React from 'react';
import { motion } from 'framer-motion';
import { Mail, ExternalLink, Star, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CandidateData, ColumnSchema } from '@/types/candidate';
import { useCandidates } from '@/contexts/CandidateContext';
import { StatusBadge } from './StatusBadge';

interface CandidateCardProps {
  candidate: CandidateData;
  onViewDetails: () => void;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, onViewDetails }) => {
  const { schema, updateCandidateStatus, statuses } = useCandidates();

  const renderFieldValue = (value: any, column: ColumnSchema) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-muted-foreground italic">Not provided</span>;
    }

    switch (column.type) {
      case 'email':
        return (
          <a 
            href={`mailto:${value}`} 
            className="text-primary hover:underline inline-flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Mail className="h-3 w-3" />
            {value}
          </a>
        );
      case 'url':
        return (
          <a 
            href={value.startsWith('http') ? value : `https://${value}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="h-3 w-3" />
            View
          </a>
        );
      case 'rating':
        return (
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Number(value) ? 'fill-warning text-warning' : 'text-muted'
                }`}
              />
            ))}
          </div>
        );
      case 'boolean':
        return (
          <Badge variant={value === 'true' || value === true ? 'default' : 'outline'}>
            {value === 'true' || value === true ? 'Yes' : 'No'}
          </Badge>
        );
      case 'date':
        return new Date(value).toLocaleDateString();
      default:
        return <span className="text-foreground">{String(value)}</span>;
    }
  };

  const primaryFields = schema.filter(col => col.primary && col.visible);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -4 }}
    >
      <Card 
        className="h-full cursor-pointer hover:shadow-lg transition-all bg-gradient-to-br from-card to-card/50"
        onClick={onViewDetails}
      >
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-foreground">
              {candidate[primaryFields[0]?.name] || 'Unnamed Candidate'}
            </h3>
            {candidate._tags && candidate._tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {candidate._tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-popover z-50">
              {statuses.map(status => (
                <DropdownMenuItem
                  key={status.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateCandidateStatus(candidate.id, status.value);
                  }}
                >
                  Mark as {status.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {primaryFields.slice(1, 4).map(column => (
            <div key={column.name} className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {column.name}
              </span>
              <div className="text-sm">
                {renderFieldValue(candidate[column.name], column)}
              </div>
            </div>
          ))}
        </CardContent>
        
        <CardFooter className="flex justify-between items-center pt-3 border-t">
          <StatusBadge status={candidate._status} />
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onViewDetails}
          >
            View Details
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
