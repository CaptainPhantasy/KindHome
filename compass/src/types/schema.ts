/**
 * DATABASE SCHEMA TYPE DEFINITIONS
 * Phase 2, Track B: Caregiver UI
 * 
 * TypeScript interfaces matching the Supabase database schema
 */

/**
 * Profile interface matching the profiles table
 */
export interface Profile {
  id: string; // uuid
  full_name: string | null;
  avatar_url: string | null;
  role: 'elder' | 'caregiver' | null;
  created_at: string;
  updated_at: string;
}

/**
 * FamilyLink interface matching the family_links table
 */
export interface FamilyLink {
  id: string; // uuid
  caregiver_id: string; // uuid, references profiles.id
  elder_id: string; // uuid, references profiles.id
  created_at: string;
  updated_at: string;
}

/**
 * Extended FamilyLink with joined Elder profile data
 * Used when querying family_links with profile join
 */
export interface LinkedElder {
  id: string; // elder_id from family_links
  full_name: string | null;
  avatar_url: string | null;
  family_link_id: string; // id from family_links
}

/**
 * Medication interface matching the medications table
 */
export interface Medication {
  id: string; // uuid
  elder_id: string; // uuid, references profiles.id
  name: string;
  dosage: string | null;
  schedule_cron: string | null; // Cron expression for medication schedule
  created_at: string;
  updated_at: string;
}

/**
 * MedEvent interface matching the med_events table
 * History of taken/skipped medications
 */
export interface MedEvent {
  id: string; // uuid
  medication_id: string; // uuid, references medications.id
  elder_id: string; // uuid, references profiles.id
  status: 'taken' | 'skipped' | 'missed';
  event_date: string; // Date when the medication was due/taken
  created_at: string;
}
