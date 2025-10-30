import React, { useCallback } from 'react';
import { Upload, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCandidates } from '@/contexts/CandidateContext';
import { parseFile } from '@/utils/fileParser';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';

export const FileUpload: React.FC = () => {
  const { setCandidates, setSchema } = useCandidates();
  const { toast } = useToast();
  const [isDragging, setIsDragging] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    try {
      const { data, schema } = await parseFile(file);
      setCandidates(data);
      setSchema(schema);
      toast({
        title: 'File uploaded successfully',
        description: `Loaded ${data.length} candidates with ${schema.length} fields`,
      });
    } catch (error) {
      toast({
        title: 'Error parsing file',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [setCandidates, setSchema, toast]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  return (
    <Card className="p-8 bg-gradient-to-br from-card to-muted/20 border-2 border-dashed">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`text-center transition-all ${
          isDragging ? 'scale-105 border-primary' : ''
        }`}
      >
        <input
          type="file"
          id="file-upload"
          accept=".csv,.xlsx,.xls,.json"
          onChange={onFileSelect}
          className="hidden"
          disabled={isProcessing}
        />
        
        <label
          htmlFor="file-upload"
          className="cursor-pointer block"
        >
          <motion.div
            animate={{ scale: isDragging ? 1.1 : 1 }}
            transition={{ duration: 0.2 }}
          >
            {isProcessing ? (
              <FileText className="mx-auto h-16 w-16 text-primary animate-pulse" />
            ) : (
              <Upload className="mx-auto h-16 w-16 text-primary" />
            )}
          </motion.div>
          
          <h3 className="mt-4 text-xl font-semibold text-foreground">
            {isProcessing ? 'Processing file...' : 'Upload Candidate Data'}
          </h3>
          
          <p className="mt-2 text-sm text-muted-foreground">
            Drag and drop or click to select
          </p>
          
          <p className="mt-1 text-xs text-muted-foreground">
            Supports CSV, Excel (XLSX/XLS), and JSON files
          </p>
        </label>
      </motion.div>
    </Card>
  );
};
