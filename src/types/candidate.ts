export type FieldType = 'text' | 'number' | 'date' | 'url' | 'email' | 'rating' | 'boolean';

export interface ColumnSchema {
  name: string;
  type: FieldType;
  visible: boolean;
  primary: boolean;
  uniqueValues?: number;
  options?: string[];
}

export interface CandidateStatus {
  label: string;
  color: string;
  value: string;
}

export interface CandidateNote {
  id: string;
  text: string;
  timestamp: Date;
}

export interface CandidateData {
  id: string;
  [key: string]: any;
  _status?: string;
  _notes?: CandidateNote[];
  _tags?: string[];
}

export interface FilterConfig {
  column: string;
  type: FieldType;
  value: any;
}
