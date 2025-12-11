export interface MedicationData {
  medication_name: string;
  dosage: string;
  frequency: string;
  time_of_day: string;
  purpose: string;
  confidence_score?: number;
  is_medication?: boolean;
}

export enum CameraState {
  IDLE = 'IDLE',
  REQUESTING = 'REQUESTING',
  ACTIVE = 'ACTIVE',
  DENIED = 'DENIED',
  ERROR = 'ERROR'
}

export enum ScannerState {
  IDLE = 'IDLE',
  SCANNING = 'SCANNING',
  ANALYZING = 'ANALYZING',
  REVIEW = 'REVIEW',
  COMPLETED = 'COMPLETED'
}

export enum ScannerMode {
  MEDICATION = 'MEDICATION',
  IDENTIFY = 'IDENTIFY'
}

export interface IdentificationData {
  description: string;
  is_hazardous: boolean;
}

// Voice Coach types
export enum AgentState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  LISTENING = 'LISTENING',
  SPEAKING = 'SPEAKING',
}

export interface VoiceAgentConfig {
  systemInstruction: string;
  voiceName: string;
}

export interface TranscriptionUpdate {
  text: string;
  isFinal: boolean;
  sender: 'user' | 'agent';
}

// Memory Vault types
export enum MemoryCategory {
  OBJECT = 'object',
  PERSON = 'person',
  EVENT = 'event',
  OTHER = 'other',
}

export interface MemoryRecord {
  id?: string;
  timestamp?: number;
  title: string;
  memory_text: string;
  location: string | null;
  tags: string[];
  category: MemoryCategory;
}

export type ProcessingStatus = 'idle' | 'processing' | 'review' | 'saved' | 'error';
