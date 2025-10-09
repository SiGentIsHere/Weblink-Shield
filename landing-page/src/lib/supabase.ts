import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Debug: Log what we're getting (safely)
console.log('🔍 Checking Supabase configuration...');
console.log('URL exists:', !!supabaseUrl);
console.log('URL full value:', supabaseUrl);
console.log('Key exists:', !!supabaseAnonKey);
console.log('Key length:', supabaseAnonKey?.length || 0);
console.log('Key starts with:', supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'MISSING');

if (!supabaseUrl || !supabaseAnonKey) {
  // This helps during development if envs are missing
  // eslint-disable-next-line no-console
  console.error('❌ Supabase configuration is missing!');
  console.error('Please create a .env file with:');
  console.error('VITE_SUPABASE_URL=your_project_url');
  console.error('VITE_SUPABASE_ANON_KEY=your_anon_key');
  console.error('Then RESTART your dev server (npm run dev)');
}

// Check if values are placeholders
if (supabaseUrl?.includes('your_supabase') || supabaseUrl?.includes('your_project') || 
    supabaseAnonKey?.includes('your_supabase') || supabaseAnonKey?.includes('your_anon')) {
  console.error('❌ Please replace placeholder values in your .env file with actual Supabase credentials!');
}

// Create typed Supabase client
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

// Test connection on load with timeout
const testConnection = async () => {
  console.log('🧪 Testing Supabase connection...');
  
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Connection test timeout after 5 seconds')), 5000)
  );
  
  try {
    const result = await Promise.race([
      supabase.auth.getSession(),
      timeoutPromise
    ]) as any;
    
    if (result.error) {
      console.error('❌ Supabase connection test failed:', result.error);
      console.error('Error details:', JSON.stringify(result.error, null, 2));
    } else {
      console.log('✅ Supabase connected successfully!');
      console.log('Session exists:', !!result.data?.session);
    }
  } catch (err: any) {
    console.error('❌ Supabase connection error:', err.message);
    console.error('This usually means:');
    console.error('  1. Wrong Supabase URL or API key');
    console.error('  2. Network/Firewall blocking connection');
    console.error('  3. CORS issues');
    console.error('  4. Supabase project is paused/deleted');
  }
};

testConnection();
