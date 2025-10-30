import React, { useState } from 'react';
import { Filter, X, Plus, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
  const { schema, filters, addFilter, removeFilter, updateFilter, clearAllFilters, statuses, candidates } = useCandidates();
  const [showAddFilter, setShowAddFilter] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [expandedFilters, setExpandedFilters] = useState<Set<string>>(new Set(['_status']));

  const handleAddFilter = () => {
    if (selectedColumn) {
      const column = schema.find(col => col.name === selectedColumn);
      if (column) {
        addFilter({
          column: selectedColumn,
          type: column.type,
          value: column.type === 'number' ? [0, 100] : column.options ? [] : '',
        });
        setSelectedColumn('');
        setShowAddFilter(false);
        setExpandedFilters(prev => new Set([...prev, selectedColumn]));
      }
    }
  };

  const toggleFilterExpand = (column: string) => {
    setExpandedFilters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(column)) {
        newSet.delete(column);
      } else {
        newSet.add(column);
      }
      return newSet;
    });
  };

  const availableColumns = schema.filter(
    col => !filters.find(f => f.column === col.name) && col.visible && col.name !== '_status'
  );

  const activeFilterCount = filters.filter(f => {
    if (f.column === '_status') return false;
    if (Array.isArray(f.value)) return f.value.length > 0;
    return f.value !== '' && f.value !== null && f.value !== undefined;
  }).length;

  // Get actual min/max values for numeric columns
  const getNumericRange = (columnName: string) => {
    const values = candidates
      .map(c => Number(c[columnName]))
      .filter(v => !isNaN(v));
    return {
      min: Math.min(...values),
      max: Math.max(...values),
    };
  };

  // Get unique values for categorical columns
  const getColumnOptions = (columnName: string) => {
    const column = schema.find(col => col.name === columnName);
    if (column?.options) return column.options;
    
    const uniqueValues = [...new Set(candidates.map(c => c[columnName]))]
      .filter(v => v !== null && v !== undefined && v !== '')
      .map(String)
      .sort();
    return uniqueValues;
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFilterCount}
              </Badge>
            )}
          </span>
          <div className="flex gap-1">
            {filters.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-8 px-2 text-xs"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddFilter(!showAddFilter)}
              className="h-8 px-2 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <AnimatePresence>
          {showAddFilter && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 pb-3 border-b border-border"
            >
              <Select value={selectedColumn} onValueChange={setSelectedColumn}>
                <SelectTrigger className="h-9">
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
              <Button onClick={handleAddFilter} className="w-full h-9" size="sm">
                Add Filter
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status Filter */}
        <div className="space-y-2">
          <div 
            className="flex items-center justify-between cursor-pointer py-1"
            onClick={() => toggleFilterExpand('_status')}
          >
            <Label className="text-sm font-medium cursor-pointer">Status</Label>
            <motion.div
              animate={{ rotate: expandedFilters.has('_status') ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </motion.div>
          </div>
          <AnimatePresence>
            {expandedFilters.has('_status') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
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
                  <SelectTrigger className="h-9">
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dynamic Filters */}
        <AnimatePresence>
          {filters.filter(f => f.column !== '_status').map(filter => {
            const column = schema.find(col => col.name === filter.column);
            if (!column) return null;

            const isExpanded = expandedFilters.has(filter.column);
            const shouldShowCategorical = column.uniqueValues && column.uniqueValues <= 15;

            return (
              <motion.div
                key={filter.column}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 p-3 bg-muted/30 rounded-lg border border-border/50"
              >
                <div className="flex items-center justify-between">
                  <Label 
                    className="text-sm font-medium cursor-pointer"
                    onClick={() => toggleFilterExpand(filter.column)}
                  >
                    {filter.column}
                  </Label>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => removeFilter(filter.column)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      {/* Categorical filters (multi-select) */}
                      {shouldShowCategorical ? (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {getColumnOptions(filter.column).map(option => {
                            const isChecked = Array.isArray(filter.value) 
                              ? filter.value.includes(option)
                              : filter.value === option;
                            
                            return (
                              <div key={option} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`${filter.column}-${option}`}
                                  checked={isChecked}
                                  onCheckedChange={(checked) => {
                                    if (!Array.isArray(filter.value)) {
                                      updateFilter(filter.column, checked ? [option] : []);
                                    } else {
                                      const newValue = checked
                                        ? [...filter.value, option]
                                        : filter.value.filter(v => v !== option);
                                      updateFilter(filter.column, newValue);
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={`${filter.column}-${option}`}
                                  className="text-sm cursor-pointer"
                                >
                                  {option}
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      ) : filter.type === 'text' || filter.type === 'email' ? (
                        <Input
                          placeholder={`Search ${filter.column}...`}
                          value={filter.value}
                          onChange={(e) => updateFilter(filter.column, e.target.value)}
                          className="h-9"
                        />
                      ) : filter.type === 'number' || filter.type === 'rating' ? (
                        <div className="space-y-2">
                          <Slider
                            min={filter.type === 'rating' ? 0 : getNumericRange(filter.column).min}
                            max={filter.type === 'rating' ? 5 : getNumericRange(filter.column).max}
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
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
