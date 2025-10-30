import React, { createContext, useContext, useState, useCallback } from 'react';
import { CandidateData, ColumnSchema, FilterConfig, CandidateStatus } from '@/types/candidate';

interface CandidateContextType {
  candidates: CandidateData[];
  filteredCandidates: CandidateData[];
  schema: ColumnSchema[];
  filters: FilterConfig[];
  statuses: CandidateStatus[];
  setCandidates: (candidates: CandidateData[]) => void;
  setSchema: (schema: ColumnSchema[]) => void;
  addFilter: (filter: FilterConfig) => void;
  removeFilter: (column: string) => void;
  updateFilter: (column: string, value: any) => void;
  updateCandidateStatus: (id: string, status: string) => void;
  addCandidateNote: (id: string, note: string) => void;
  addCandidateTag: (id: string, tag: string) => void;
  removeCandidateTag: (id: string, tag: string) => void;
  updateColumnSchema: (columnName: string, updates: Partial<ColumnSchema>) => void;
  exportData: () => void;
}

const CandidateContext = createContext<CandidateContextType | undefined>(undefined);

const DEFAULT_STATUSES: CandidateStatus[] = [
  { label: 'Hired', color: 'hsl(var(--status-hired))', value: 'hired' },
  { label: 'Not Hired', color: 'hsl(var(--status-not-hired))', value: 'not-hired' },
  { label: 'Consideration', color: 'hsl(var(--status-consideration))', value: 'consideration' },
  { label: 'Pending', color: 'hsl(var(--status-pending))', value: 'pending' },
];

export const CandidateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [candidates, setCandidates] = useState<CandidateData[]>([]);
  const [schema, setSchema] = useState<ColumnSchema[]>([]);
  const [filters, setFilters] = useState<FilterConfig[]>([]);
  const [statuses] = useState<CandidateStatus[]>(DEFAULT_STATUSES);

  const applyFilters = useCallback((data: CandidateData[]) => {
    if (filters.length === 0) return data;

    return data.filter(candidate => {
      return filters.every(filter => {
        const value = candidate[filter.column];
        const filterValue = filter.value;

        if (!filterValue || (Array.isArray(filterValue) && filterValue.length === 0)) {
          return true;
        }

        switch (filter.type) {
          case 'text':
          case 'email':
          case 'url':
            return String(value || '').toLowerCase().includes(String(filterValue).toLowerCase());
          case 'number':
            if (Array.isArray(filterValue)) {
              const numValue = Number(value);
              return numValue >= filterValue[0] && numValue <= filterValue[1];
            }
            return Number(value) === Number(filterValue);
          case 'date':
            if (Array.isArray(filterValue) && filterValue.length === 2) {
              const dateValue = new Date(value);
              return dateValue >= filterValue[0] && dateValue <= filterValue[1];
            }
            return true;
          case 'boolean':
            return value === filterValue;
          case 'rating':
            return Number(value) >= Number(filterValue);
          default:
            return true;
        }
      });
    });
  }, [filters]);

  const filteredCandidates = applyFilters(candidates);

  const addFilter = useCallback((filter: FilterConfig) => {
    setFilters(prev => {
      const existing = prev.find(f => f.column === filter.column);
      if (existing) {
        return prev.map(f => f.column === filter.column ? filter : f);
      }
      return [...prev, filter];
    });
  }, []);

  const removeFilter = useCallback((column: string) => {
    setFilters(prev => prev.filter(f => f.column !== column));
  }, []);

  const updateFilter = useCallback((column: string, value: any) => {
    setFilters(prev => prev.map(f => 
      f.column === column ? { ...f, value } : f
    ));
  }, []);

  const updateCandidateStatus = useCallback((id: string, status: string) => {
    setCandidates(prev => prev.map(c => 
      c.id === id ? { ...c, _status: status } : c
    ));
  }, []);

  const addCandidateNote = useCallback((id: string, note: string) => {
    setCandidates(prev => prev.map(c => {
      if (c.id === id) {
        const notes = c._notes || [];
        return {
          ...c,
          _notes: [...notes, { id: Date.now().toString(), text: note, timestamp: new Date() }]
        };
      }
      return c;
    }));
  }, []);

  const addCandidateTag = useCallback((id: string, tag: string) => {
    setCandidates(prev => prev.map(c => {
      if (c.id === id) {
        const tags = c._tags || [];
        if (!tags.includes(tag)) {
          return { ...c, _tags: [...tags, tag] };
        }
      }
      return c;
    }));
  }, []);

  const removeCandidateTag = useCallback((id: string, tag: string) => {
    setCandidates(prev => prev.map(c => {
      if (c.id === id && c._tags) {
        return { ...c, _tags: c._tags.filter(t => t !== tag) };
      }
      return c;
    }));
  }, []);

  const updateColumnSchema = useCallback((columnName: string, updates: Partial<ColumnSchema>) => {
    setSchema(prev => prev.map(col => 
      col.name === columnName ? { ...col, ...updates } : col
    ));
  }, []);

  const exportData = useCallback(() => {
    const dataToExport = filteredCandidates.map(candidate => {
      const exported: any = {};
      schema.forEach(col => {
        if (col.visible) {
          exported[col.name] = candidate[col.name];
        }
      });
      if (candidate._status) exported.Status = candidate._status;
      if (candidate._tags && candidate._tags.length > 0) exported.Tags = candidate._tags.join(', ');
      return exported;
    });

    const csv = [
      Object.keys(dataToExport[0]).join(','),
      ...dataToExport.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidates-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredCandidates, schema]);

  return (
    <CandidateContext.Provider
      value={{
        candidates,
        filteredCandidates,
        schema,
        filters,
        statuses,
        setCandidates,
        setSchema,
        addFilter,
        removeFilter,
        updateFilter,
        updateCandidateStatus,
        addCandidateNote,
        addCandidateTag,
        removeCandidateTag,
        updateColumnSchema,
        exportData,
      }}
    >
      {children}
    </CandidateContext.Provider>
  );
};

export const useCandidates = () => {
  const context = useContext(CandidateContext);
  if (!context) {
    throw new Error('useCandidates must be used within CandidateProvider');
  }
  return context;
};
