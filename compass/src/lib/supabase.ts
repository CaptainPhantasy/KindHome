/**
 * SUPABASE CLIENT CONFIGURATION
 * Phase 1.2: Supabase Initialization
 * 
 * Environment variables required:
 * - VITE_SUPABASE_URL: Your Supabase project URL
 * - VITE_SUPABASE_ANON_KEY: Your Supabase anonymous/public key
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage = 
    '❌ CRITICAL: Supabase environment variables are missing!\n' +
    'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.\n' +
    `Current values: URL=${supabaseUrl ? 'SET' : 'MISSING'}, KEY=${supabaseAnonKey ? 'SET' : 'MISSING'}`;
  
  console.error(errorMessage);
  throw new Error(errorMessage);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

