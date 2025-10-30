import React from 'react';
import { Users, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCandidates } from '@/contexts/CandidateContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const AnalyticsDashboard: React.FC = () => {
  const { candidates, filteredCandidates, statuses, exportData } = useCandidates();

  const stats = React.useMemo(() => {
    const total = candidates.length;
    const filtered = filteredCandidates.length;
    
    const statusCounts = statuses.map(status => ({
      label: status.label,
      count: candidates.filter(c => c._status === status.value).length,
      color: status.color,
      value: status.value,
    }));

    return { total, filtered, statusCounts };
  }, [candidates, filteredCandidates, statuses]);

  const getStatusIcon = (value: string) => {
    switch (value) {
      case 'hired':
        return CheckCircle;
      case 'not-hired':
        return XCircle;
      case 'consideration':
        return AlertCircle;
      default:
        return Clock;
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Candidates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-8 w-8 text-primary" />
                <span className="text-3xl font-bold text-foreground">{stats.total}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {stats.statusCounts.map((status, index) => {
          const Icon = getStatusIcon(status.value);
          return (
            <motion.div
              key={status.value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {status.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Icon className="h-8 w-8" style={{ color: status.color }} />
                    <span className="text-3xl font-bold text-foreground">{status.count}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Chart and Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.statusCounts}>
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {stats.statusCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-muted-foreground mb-4">
              Viewing {stats.filtered} of {stats.total} candidates
            </div>
            <Button 
              onClick={exportData} 
              className="w-full bg-primary hover:bg-primary-hover"
              disabled={stats.filtered === 0}
            >
              Export Filtered Data
            </Button>
            <Button variant="outline" className="w-full">
              Configure Layout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
