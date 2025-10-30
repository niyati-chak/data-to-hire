import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, ExternalLink, Star, MoreVertical, Briefcase } from 'lucide-react';
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
      return <span className="text-muted-foreground italic text-xs">Not provided</span>;
    }

    const columnName = column.name.toLowerCase();

    switch (column.type) {
      case 'email':
        return (
          <a 
            href={`mailto:${value}`} 
            className="text-primary hover:underline inline-flex items-center gap-1.5 text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <Mail className="h-3.5 w-3.5" />
            <span className="truncate">{value}</span>
          </a>
        );
      case 'url':
        return (
          <a 
            href={value.startsWith('http') ? value : `https://${value}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="h-3 w-3" />
            {columnName.includes('portfolio') ? 'Portfolio' : 
             columnName.includes('github') ? 'GitHub' : 'View Link'}
          </a>
        );
      case 'rating':
        return (
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < Number(value) ? 'fill-warning text-warning' : 'text-muted-foreground/30'
                }`}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-1">({value}/5)</span>
          </div>
        );
      case 'boolean':
        return (
          <Badge variant={value === 'true' || value === true ? 'default' : 'outline'} className="text-xs">
            {value === 'true' || value === true ? 'Yes' : 'No'}
          </Badge>
        );
      case 'date':
        return <span className="text-sm">{new Date(value).toLocaleDateString()}</span>;
      default:
        // Format phone numbers
        if (columnName.includes('phone') || columnName.includes('mobile')) {
          return (
            <span className="inline-flex items-center gap-1.5 text-sm">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              {String(value)}
            </span>
          );
        }
        // Show text truncated
        return <span className="text-sm line-clamp-2">{String(value)}</span>;
    }
  };

  const primaryFields = schema.filter(col => col.primary && col.visible);
  const nameField = primaryFields[0];
  const mainFields = primaryFields.slice(1, 5);
  
  // Determine team/domain field for header badge
  const teamField = schema.find(col => 
    col.name.toLowerCase().includes('team') || 
    col.name.toLowerCase().includes('domain')
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -2, boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.2)' }}
    >
      <Card 
        className="h-full cursor-pointer transition-all bg-card hover:border-primary/30 border-border"
        onClick={onViewDetails}
      >
        <CardHeader className="pb-3 space-y-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base text-foreground truncate mb-1">
                {candidate[nameField?.name] || 'Unnamed Candidate'}
              </h3>
              {teamField && candidate[teamField.name] && (
                <Badge variant="secondary" className="text-xs font-normal">
                  <Briefcase className="h-3 w-3 mr-1" />
                  {candidate[teamField.name]}
                </Badge>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                  <MoreVertical className="h-3.5 w-3.5" />
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
          </div>
          
          {candidate._tags && candidate._tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {candidate._tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0">
                  {tag}
                </Badge>
              ))}
              {candidate._tags.length > 3 && (
                <Badge variant="outline" className="text-xs px-1.5 py-0">
                  +{candidate._tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-2.5 py-3">
          {mainFields.map(column => {
            const value = candidate[column.name];
            if (!value) return null;
            
            return (
              <div key={column.name} className="flex flex-col gap-0.5">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {column.name}
                </span>
                <div className="text-sm">
                  {renderFieldValue(value, column)}
                </div>
              </div>
            );
          })}
        </CardContent>
        
        <CardFooter className="flex justify-between items-center pt-3 border-t border-border/50">
          <StatusBadge status={candidate._status} />
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 text-xs"
            onClick={onViewDetails}
          >
            View Details
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
