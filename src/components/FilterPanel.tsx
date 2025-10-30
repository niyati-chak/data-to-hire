import React, { useState } from 'react';
import { Filter, X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useCandidates } from '@/contexts/CandidateContext';

export const FilterPanel: React.FC = () => {
  const { schema, filters, addFilter, removeFilter, updateFilter, statuses } = useCandidates();
  const [showAddFilter, setShowAddFilter] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<string>('');

  const handleAddFilter = () => {
    if (selectedColumn) {
      const column = schema.find(col => col.name === selectedColumn);
      if (column) {
        addFilter({
          column: selectedColumn,
          type: column.type,
          value: column.type === 'number' ? [0, 100] : '',
        });
        setSelectedColumn('');
        setShowAddFilter(false);
      }
    }
  };

  const availableColumns = schema.filter(
    col => !filters.find(f => f.column === col.name) && col.visible
  );

  return (
    <Card className="bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Filters
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAddFilter(!showAddFilter)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Filter
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence>
          {showAddFilter && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 pb-4 border-b"
            >
              <Select value={selectedColumn} onValueChange={setSelectedColumn}>
                <SelectTrigger>
                  <SelectValue placeholder="Select column to filter" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {availableColumns.map(col => (
                    <SelectItem key={col.name} value={col.name}>
                      {col.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAddFilter} className="w-full" size="sm">
                Add Filter
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Status</Label>
          <Select
            value={filters.find(f => f.column === '_status')?.value || 'all'}
            onValueChange={(value) => {
              if (value === 'all') {
                removeFilter('_status');
              } else {
                addFilter({ column: '_status', type: 'text', value });
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="all">All Statuses</SelectItem>
              {statuses.map(status => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Dynamic Filters */}
        <AnimatePresence>
          {filters.filter(f => f.column !== '_status').map(filter => {
            const column = schema.find(col => col.name === filter.column);
            if (!column) return null;

            return (
              <motion.div
                key={filter.column}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">{filter.column}</Label>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => removeFilter(filter.column)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {filter.type === 'text' || filter.type === 'email' ? (
                  <Input
                    placeholder={`Search ${filter.column}...`}
                    value={filter.value}
                    onChange={(e) => updateFilter(filter.column, e.target.value)}
                  />
                ) : filter.type === 'number' || filter.type === 'rating' ? (
                  <div className="space-y-2">
                    <Slider
                      min={0}
                      max={filter.type === 'rating' ? 5 : 100}
                      step={1}
                      value={Array.isArray(filter.value) ? filter.value : [0, 100]}
                      onValueChange={(value) => updateFilter(filter.column, value)}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{Array.isArray(filter.value) ? filter.value[0] : 0}</span>
                      <span>{Array.isArray(filter.value) ? filter.value[1] : 100}</span>
                    </div>
                  </div>
                ) : null}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
