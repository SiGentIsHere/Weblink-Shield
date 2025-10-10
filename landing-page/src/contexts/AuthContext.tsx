import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// Simplified types to avoid complex database typing issues
interface SimpleUserProfile {
  user_id: number;
  email: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  status: string;
  role?: {
    name: string;
  };
  subscription?: {
    plan?: {
      name: string;
    };
    end_date?: string;
  };
  usage_stats?: {
    scans_used_today: number;
    daily_scan_limit: number;
    remaining_scans: number;
    limit_reached: boolean;
  };
}

interface AuthContextType {
  // Auth state
  user: SupabaseUser | null;
  userProfile: SimpleUserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isEmailVerified: boolean;

  // Auth actions
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, userData: {
    firstName: string;
    lastName: string;
    username: string;
  }) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  sendEmailVerification: () => Promise<{ success: boolean; error?: string }>;

  // User profile actions
  updateProfile: (updates: Partial<SimpleUserProfile>) => Promise<{ success: boolean; error?: string }>;
  refreshUserProfile: () => Promise<void>;

  // Usage and limits
  canPerformScan: () => boolean;
  getRemainingScans: () => number;
  getUsageStats: () => SimpleUserProfile['usage_stats'] | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<SimpleUserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user && !!userProfile;
  const isEmailVerified = user?.email_confirmed_at !== null;

  // Fetch user profile from database
  const fetchUserProfile = async (authUser: SupabaseUser): Promise<SimpleUserProfile | null> => {
    try {
      console.log('📝 Fetching user profile for:', authUser.email);
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          role:role(*),
          subscription:subscription(
            *,
            plan:plan(*)
          )
        `)
        .eq('auth_user_id', authUser.id)
        .single();

      if (userError) {
        console.error('❌ Error fetching user profile:', userError);
        // If user profile doesn't exist, try to create it from auth metadata
        if (userError.code === 'PGRST116') { // No rows found
          console.log('⚠️ User profile not found, creating one from auth data...');
          return await createUserProfileFromAuth(authUser);
        }
        return null;
      }

      console.log('✅ User profile fetched successfully');

      // Fetch usage stats
      const { data: usageStats, error: statsError } = await supabase
        .from('daily_usage_stats')
        .select('*')
        .eq('user_id', (userData as any).user_id)
        .single();

      if (statsError) {
        console.warn('⚠️ Could not fetch usage stats:', statsError.message);
      }

      return {
        ...(userData as any),
        usage_stats: usageStats || undefined,
      };
    } catch (error) {
      console.error('❌ Exception fetching user profile:', error);
      return null;
    }
  };

  // Create user profile from auth user data (when profile doesn't exist)
  const createUserProfileFromAuth = async (authUser: SupabaseUser): Promise<SimpleUserProfile | null> => {
    try {
      console.log('🔨 Creating user profile from auth data...');
      
      // Get the Free role ID (role_id = 1)
      const { data: freeRole, error: roleError } = await supabase
        .from('role')
        .select('role_id')
        .eq('name', 'Free')
        .single();

      if (roleError) {
        console.error('❌ Error fetching Free role:', roleError);
        console.error('💡 Make sure your Supabase database has the Role table with a "Free" role');
        return null;
      }

      if (!freeRole) {
        console.error('❌ Free role not found in database');
        return null;
      }
      
      console.log('✅ Found Free role:', freeRole);

      // Extract user data from auth metadata
      const userMetadata = authUser.user_metadata || {};
      const firstName = userMetadata.first_name || 'User';
      const lastName = userMetadata.last_name || '';
      const username = userMetadata.username || authUser.email?.split('@')[0] || 'user';

      // Create user profile
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          auth_user_id: authUser.id,
          email: authUser.email!,
          username: username,
          first_name: firstName,
          last_name: lastName,
          role_id: (freeRole as any).role_id,
          status: 'active',
        } as any)
        .select()
        .single();

      if (userError) {
        console.error('Error creating user profile:', userError);
        return null;
      }

      // Create free subscription
      const { data: freePlan } = await supabase
        .from('plan')
        .select('plan_id')
        .eq('name', 'Free')
        .single();

      if (freePlan && newUser) {
        const startDate = new Date().toISOString().split('T')[0];
        const endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 1 year

        await supabase
          .from('subscription')
          .insert({
            user_id: (newUser as any).user_id,
            plan_id: (freePlan as any).plan_id,
            start_date: startDate,
            end_date: endDate,
            status: 'active',
            auto_renew: false,
          } as any);
      }

      return newUser as SimpleUserProfile;
    } catch (error) {
      console.error('Error creating user profile from auth:', error);
      return null;
    }
  };

  // Create user profile in database after signup
  const createUserProfile = async (authUser: SupabaseUser, userData: {
    firstName: string;
    lastName: string;
    username: string;
  }) => {
    try {
      // Get the Free role ID (role_id = 1)
      const { data: freeRole } = await supabase
        .from('role')
        .select('role_id')
        .eq('name', 'Free')
        .single();

      if (!freeRole) {
        throw new Error('Free role not found');
      }

      // Create user profile
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          auth_user_id: authUser.id,
          email: authUser.email!,
          username: userData.username,
          first_name: userData.firstName,
          last_name: userData.lastName,
          role_id: (freeRole as any).role_id,
          status: 'active',
        } as any)
        .select()
        .single();

      if (userError) {
        throw userError;
      }

      // Create free subscription
      const { data: freePlan } = await supabase
        .from('plan')
        .select('plan_id')
        .eq('name', 'Free')
        .single();

      if (freePlan && newUser) {
        const startDate = new Date().toISOString().split('T')[0];
        const endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 1 year

        await supabase
          .from('subscription')
          .insert({
            user_id: (newUser as any).user_id,
            plan_id: (freePlan as any).plan_id,
            start_date: startDate,
            end_date: endDate,
            status: 'active',
            auto_renew: false,
          } as any);
      }

      return newUser;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  };

  // Sign in with timeout protection
  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Starting sign in...');
      console.log('📧 Email:', email);
      console.log('🔑 Password length:', password.length);
      
      // First, test if we can reach Supabase at all
      console.log('🌐 Testing network connectivity to Supabase...');
      const startTime = Date.now();
      
      // Add timeout protection (10 seconds)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout after 10 seconds - Please check your internet connection and Supabase credentials')), 10000)
      );

      const signInPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('⏳ Waiting for auth response from Supabase...');
      const result = await Promise.race([signInPromise, timeoutPromise]) as any;
      
      const elapsed = Date.now() - startTime;
      console.log(`⏱️ Request completed in ${elapsed}ms`);

      if (result.error) {
        console.error('❌ Sign in error:', result.error);
        console.error('Error code:', result.error.code);
        console.error('Error status:', result.error.status);
        
        // Check if it's a configuration error
        if (result.error.message?.includes('fetch') || result.error.message?.includes('network')) {
          return { 
            success: false, 
            error: 'Unable to connect to authentication service. Please check your configuration.' 
          };
        }
        return { success: false, error: result.error.message };
      }

      console.log('✅ Sign in successful, session created');
      console.log('User ID:', result.data?.user?.id);
      console.log('Session exists:', !!result.data?.session);
      
      // The auth state change listener will handle fetching the user profile
      return { success: true };
    } catch (error: any) {
      console.error('❌ Sign in exception:', error);
      console.error('Exception type:', error.constructor.name);
      console.error('Stack trace:', error.stack);
      return { 
        success: false, 
        error: error.message || 'An unexpected error occurred. Please check your connection.' 
      };
    }
  };

  // Sign up with timeout protection
  const signUp = async (email: string, password: string, userData: {
    firstName: string;
    lastName: string;
    username: string;
  }) => {
    try {
      console.log('📝 Starting sign up for:', email);
      
      // Add timeout protection (15 seconds for signup)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout - Please check your internet connection')), 15000)
      );

      const signUpPromise = supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            username: userData.username,
          },
          emailRedirectTo: undefined, // Disable email verification
        },
      });

      console.log('⏳ Waiting for signup response...');
      const { data, error } = await Promise.race([signUpPromise, timeoutPromise]) as any;

      if (error) {
        console.error('❌ Sign up error:', error);
        // Check if it's a configuration error
        if (error.message?.includes('fetch') || error.message?.includes('network')) {
          return { 
            success: false, 
            error: 'Unable to connect to authentication service. Please check your configuration.' 
          };
        }
        return { success: false, error: error.message };
      }

      console.log('✅ Auth signup successful');
      console.log('📧 Email confirmation required:', !data.session);

      // Create user profile immediately after successful signup
      if (data.user) {
        try {
          console.log('🔨 Creating user profile in database...');
          // Add timeout for profile creation too
          const profileTimeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Profile creation timeout - This is likely a Row Level Security (RLS) issue')), 10000)
          );
          
          await Promise.race([
            createUserProfile(data.user, userData),
            profileTimeoutPromise
          ]);
          console.log('✅ User profile created successfully');
        } catch (profileError: any) {
          console.error('❌ Error creating user profile:', profileError);
          console.error('💡 Hint: Check if Row Level Security policies allow INSERT on User table');
          // Don't fail the signup if profile creation fails
          // The user can still sign in and we'll handle it later
        }
      }

      // If user has a session (no email verification required), sign them in automatically
      if (data.session) {
        console.log('🔐 User automatically signed in');
        // The auth state change will be handled by the auth listener
      }

      return { success: true };
    } catch (error: any) {
      console.error('❌ Sign up exception:', error);
      return { 
        success: false, 
        error: error.message || 'An unexpected error occurred. Please check your connection.' 
      };
    }
  };

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  // Update profile
  const updateProfile = async (updates: Partial<SimpleUserProfile>) => {
    try {
      if (!userProfile) {
        return { success: false, error: 'No user profile found' };
      }

      const { error } = await (supabase as any)
        .from('users')
        .update(updates)
        .eq('user_id', userProfile.user_id);

      if (error) {
        return { success: false, error: error.message };
      }

      // Refresh profile
      await refreshUserProfile();
      return { success: true };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  // Refresh user profile
  const refreshUserProfile = async () => {
    if (user) {
      const profile = await fetchUserProfile(user);
      setUserProfile(profile);
    }
  };

  // Check if user can perform scan
  const canPerformScan = (): boolean => {
    // Require email verification for scanning
    if (!isEmailVerified) return false;
    if (!userProfile?.usage_stats) return false;
    return !userProfile.usage_stats.limit_reached;
  };

  // Get remaining scans
  const getRemainingScans = (): number => {
    if (!userProfile?.usage_stats) return 0;
    return Math.max(0, userProfile.usage_stats.remaining_scans);
  };

  // Get usage stats
  const getUsageStats = (): SimpleUserProfile['usage_stats'] | null => {
    return userProfile?.usage_stats || null;
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          const profile = await fetchUserProfile(session.user);
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        const profile = await fetchUserProfile(session.user);
        setUserProfile(profile);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Send email verification
  const sendEmailVerification = async () => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user?.email || '',
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to send verification email' };
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    isAuthenticated,
    isEmailVerified,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    refreshUserProfile,
    canPerformScan,
    getRemainingScans,
    getUsageStats,
    sendEmailVerification,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};