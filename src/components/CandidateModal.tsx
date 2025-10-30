import React, { useState } from 'react';
import { X, Mail, ExternalLink, Star, Plus, Tag } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { CandidateData } from '@/types/candidate';
import { useCandidates } from '@/contexts/CandidateContext';
import { StatusBadge } from './StatusBadge';

interface CandidateModalProps {
  candidate: CandidateData | null;
  open: boolean;
  onClose: () => void;
}

export const CandidateModal: React.FC<CandidateModalProps> = ({ candidate, open, onClose }) => {
  const { schema, addCandidateNote, addCandidateTag, removeCandidateTag, updateCandidateStatus, statuses } = useCandidates();
  const [noteText, setNoteText] = useState('');
  const [tagText, setTagText] = useState('');

  if (!candidate) return null;

  const handleAddNote = () => {
    if (noteText.trim()) {
      addCandidateNote(candidate.id, noteText);
      setNoteText('');
    }
  };

  const handleAddTag = () => {
    if (tagText.trim()) {
      addCandidateTag(candidate.id, tagText);
      setTagText('');
    }
  };

  const renderFieldValue = (value: any, type: string) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-muted-foreground italic">Not provided</span>;
    }

    switch (type) {
      case 'email':
        return (
          <a 
            href={`mailto:${value}`} 
            className="text-primary hover:underline inline-flex items-center gap-1"
          >
            <Mail className="h-4 w-4" />
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
          >
            <ExternalLink className="h-4 w-4" />
            {value}
          </a>
        );
      case 'rating':
        return (
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < Number(value) ? 'fill-warning text-warning' : 'text-muted'
                }`}
              />
            ))}
            <span className="ml-2 text-sm text-muted-foreground">
              {value}/5
            </span>
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-background">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center justify-between">
            <span>Candidate Details</span>
            <StatusBadge status={candidate._status} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Selection */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Update Status</h4>
            <div className="flex flex-wrap gap-2">
              {statuses.map(status => (
                <Button
                  key={status.value}
                  variant={candidate._status === status.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateCandidateStatus(candidate.id, status.value)}
                  style={{
                    backgroundColor: candidate._status === status.value ? status.color : undefined,
                    borderColor: status.color,
                  }}
                >
                  {status.label}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* All Fields */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Candidate Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {schema.filter(col => col.visible).map(column => (
                <div key={column.name} className="space-y-1">
                  <label className="text-sm font-medium text-foreground">
                    {column.name}
                  </label>
                  <div className="text-sm">
                    {renderFieldValue(candidate[column.name], column.type)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Tags */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Tags</h4>
            <div className="flex flex-wrap gap-2 mb-2">
              {candidate._tags?.map(tag => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  onClick={() => removeCandidateTag(candidate.id, tag)}
                >
                  {tag} <X className="ml-1 h-3 w-3" />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add tag..."
                value={tagText}
                onChange={(e) => setTagText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <Button onClick={handleAddTag} size="icon">
                <Tag className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Notes */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Notes</h4>
            {candidate._notes && candidate._notes.length > 0 && (
              <div className="space-y-2 mb-3">
                {candidate._notes.map(note => (
                  <div key={note.id} className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm text-foreground">{note.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(note.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Textarea
                placeholder="Add a note..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={3}
              />
              <Button onClick={handleAddNote} size="icon" className="shrink-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
