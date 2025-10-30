import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CandidateProvider, useCandidates } from '@/contexts/CandidateContext';
import { FileUpload } from '@/components/FileUpload';
import { CandidateCard } from '@/components/CandidateCard';
import { CandidateModal } from '@/components/CandidateModal';
import { FilterPanel } from '@/components/FilterPanel';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { CandidateData } from '@/types/candidate';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

const DashboardContent: React.FC = () => {
  const { candidates, filteredCandidates, schema, clearAllFilters, filters } = useCandidates();
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const searchFiltered = React.useMemo(() => {
    if (!searchQuery) return filteredCandidates;
    
    return filteredCandidates.filter(candidate => {
      return schema.some(col => {
        const value = String(candidate[col.name] || '').toLowerCase();
        return value.includes(searchQuery.toLowerCase());
      });
    });
  }, [filteredCandidates, searchQuery, schema]);

  if (candidates.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
              Candidate Evaluation Dashboard
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload your candidate data and let our intelligent system automatically detect and organize everything for you
            </p>
          </motion.div>
          
          <FileUpload />
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-12 text-center"
          >
            <h2 className="text-2xl font-semibold mb-6 text-foreground">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Smart Detection',
                  description: 'Automatically identifies field types and creates intelligent filters'
                },
                {
                  title: 'Dynamic UI',
                  description: 'Interface adapts to your data structure - no configuration needed'
                },
                {
                  title: 'Track Decisions',
                  description: 'Mark candidates, add notes, tags, and export your selections'
                }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                  className="p-6 rounded-lg bg-card border border-border"
                >
                  <h3 className="font-semibold text-lg mb-2 text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
            Candidate Dashboard
          </h1>
          <p className="text-muted-foreground">
            Managing {candidates.length} candidates across {schema.length} fields
          </p>
        </motion.div>

        <AnalyticsDashboard />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <FilterPanel />
          </motion.div>

          <div className="lg:col-span-3 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search across all fields..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card"
              />
            </div>

            <AnimatePresence mode="popLayout">
              {searchFiltered.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-16"
                >
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-foreground">No candidates found</h3>
                    <p className="text-muted-foreground">
                      {filters.length > 0 || searchQuery 
                        ? "No candidates match your current filters or search query."
                        : "Try adjusting your search or filters."}
                    </p>
                    {(filters.length > 0 || searchQuery) && (
                      <Button 
                        onClick={() => {
                          clearAllFilters();
                          setSearchQuery('');
                        }}
                        variant="outline"
                        className="mt-4"
                      >
                        Clear all filters
                      </Button>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {searchFiltered.map((candidate, index) => (
                    <motion.div
                      key={candidate.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: Math.min(index * 0.03, 0.3) }}
                    >
                      <CandidateCard
                        candidate={candidate}
                        onViewDetails={() => setSelectedCandidate(candidate)}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <CandidateModal
          candidate={selectedCandidate}
          open={!!selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <CandidateProvider>
      <DashboardContent />
    </CandidateProvider>
  );
};

export default Index;
