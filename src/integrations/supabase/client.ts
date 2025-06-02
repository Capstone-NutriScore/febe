import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://hqcgeatpaftvxpsrqkhu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxY2dlYXRwYWZ0dnhwc3Jxa2h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMzA3OTgsImV4cCI6MjA2MzkwNjc5OH0.m5wuLcb12zaRANgYeAJwvp2gynkn1Fne3NNYsi7pZQ0";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);