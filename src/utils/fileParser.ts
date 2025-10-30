import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { ColumnSchema, FieldType, CandidateData } from '@/types/candidate';

const inferFieldType = (value: any, columnName: string): FieldType => {
  if (value === null || value === undefined || value === '') return 'text';

  const str = String(value).toLowerCase();
  const lowerColumnName = columnName.toLowerCase();

  // Email detection
  if (lowerColumnName.includes('email') || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)) {
    return 'email';
  }

  // URL detection
  if (lowerColumnName.includes('url') || lowerColumnName.includes('link') || 
      /^https?:\/\//.test(str) || /^www\./.test(str)) {
    return 'url';
  }

  // Rating detection
  if (lowerColumnName.includes('rating') || lowerColumnName.includes('score')) {
    const num = Number(value);
    if (!isNaN(num) && num >= 0 && num <= 5) {
      return 'rating';
    }
  }

  // Boolean detection
  if (['true', 'false', 'yes', 'no', '1', '0'].includes(str)) {
    return 'boolean';
  }

  // Date detection
  if (lowerColumnName.includes('date') || lowerColumnName.includes('time')) {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return 'date';
    }
  }

  // Number detection
  const num = Number(value);
  if (!isNaN(num) && value !== '') {
    return 'number';
  }

  return 'text';
};

const detectSchema = (data: any[]): ColumnSchema[] => {
  if (data.length === 0) return [];

  const firstRow = data[0];
  const columns = Object.keys(firstRow);

  return columns.map(col => {
    // Sample multiple rows to better infer type
    const samples = data.slice(0, Math.min(10, data.length))
      .map(row => row[col])
      .filter(val => val !== null && val !== undefined && val !== '');

    const types = samples.map(val => inferFieldType(val, col));
    const typeCount: Record<string, number> = {};
    types.forEach(type => {
      typeCount[type] = (typeCount[type] || 0) + 1;
    });

    // Get most common type
    const detectedType = Object.entries(typeCount)
      .sort((a, b) => b[1] - a[1])[0]?.[0] as FieldType || 'text';

    return {
      name: col,
      type: detectedType,
      visible: true,
      primary: true, // First few columns are primary by default
    };
  });
};

export const parseCSV = (file: File): Promise<{ data: CandidateData[], schema: ColumnSchema[] }> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: false,
      skipEmptyLines: true,
      complete: (results) => {
        const rawData = results.data as any[];
        const schema = detectSchema(rawData);
        
        const data = rawData.map((row, index) => ({
          ...row,
          id: `candidate-${index + 1}`,
          _status: 'pending',
          _notes: [],
          _tags: [],
        }));

        resolve({ data, schema });
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

export const parseExcel = (file: File): Promise<{ data: CandidateData[], schema: ColumnSchema[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(firstSheet);
        
        const schema = detectSchema(rawData);
        
        const processedData = rawData.map((row: any, index: number) => ({
          ...(typeof row === 'object' ? row : {}),
          id: `candidate-${index + 1}`,
          _status: 'pending',
          _notes: [],
          _tags: [],
        }));

        resolve({ data: processedData, schema });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
};

export const parseJSON = (file: File): Promise<{ data: CandidateData[], schema: ColumnSchema[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const rawData = JSON.parse(e.target?.result as string);
        const dataArray = Array.isArray(rawData) ? rawData : [rawData];
        
        const schema = detectSchema(dataArray);
        
        const data = dataArray.map((row: any, index: number) => ({
          ...(typeof row === 'object' ? row : {}),
          id: `candidate-${index + 1}`,
          _status: 'pending',
          _notes: [],
          _tags: [],
        }));

        resolve({ data, schema });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
};

export const parseFile = async (file: File): Promise<{ data: CandidateData[], schema: ColumnSchema[] }> => {
  const extension = file.name.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'csv':
      return parseCSV(file);
    case 'xlsx':
    case 'xls':
      return parseExcel(file);
    case 'json':
      return parseJSON(file);
    default:
      throw new Error(`Unsupported file type: ${extension}`);
  }
};
