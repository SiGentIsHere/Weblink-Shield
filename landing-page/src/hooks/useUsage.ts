import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Simplified types
interface UsageStats {
  user_id: number;
  username: string;
  plan_name: string;
  daily_scan_limit: number;
  scans_used_today: number;
  remaining_scans: number;
  limit_reached: boolean;
}

interface UsageCounter {
  usage_id: number;
  user_id: number;
  period_start: string;
  period_end: string;
  scans_used: number;
  api_calls_used: number;
  last_reset: string;
}

export const useUsage = () => {
  const { userProfile } = useAuth();
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [usageHistory, setUsageHistory] = useState<UsageCounter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch current usage stats
  const fetchUsageStats = async () => {
    if (!userProfile) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('daily_usage_stats')
        .select('*')
        .eq('user_id', userProfile.user_id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }

      setUsageStats((data as UsageStats) || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch usage stats');
    } finally {
      setLoading(false);
    }
  };

  // Fetch usage history
  const fetchUsageHistory = async () => {
    if (!userProfile) return;

    try {
      const { data, error } = await supabase
        .from('usagecounter')
        .select('*')
        .eq('user_id', userProfile.user_id)
        .order('period_start', { ascending: false })
        .limit(12); // Last 12 months

      if (error) {
        throw error;
      }

      setUsageHistory((data as UsageCounter[]) || []);
    } catch (err) {
      console.error('Error fetching usage history:', err);
    }
  };

  // Check if user can perform scan
  const canPerformScan = (): boolean => {
    if (!usageStats) return false;
    return !usageStats.limit_reached;
  };

  // Get remaining scans
  const getRemainingScans = (): number => {
    if (!usageStats) return 0;
    return Math.max(0, usageStats.remaining_scans);
  };

  // Get usage percentage
  const getUsagePercentage = (): number => {
    if (!usageStats || usageStats.daily_scan_limit === -1) return 0;
    return Math.min(100, (usageStats.scans_used_today / usageStats.daily_scan_limit) * 100);
  };

  // Get plan limits
  const getPlanLimits = () => {
    if (!usageStats) return null;
    
    return {
      daily: usageStats.daily_scan_limit === -1 ? 'Unlimited' : usageStats.daily_scan_limit,
      used: usageStats.scans_used_today,
      remaining: usageStats.remaining_scans,
      plan: usageStats.plan_name,
    };
  };

  // Subscribe to real-time usage updates
  useEffect(() => {
    if (!userProfile) return;

    const subscription = supabase
      .channel('usage-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'UsageCounter',
          filter: `user_id=eq.${userProfile.user_id}`,
        },
        (payload) => {
          console.log('Usage update received:', payload);
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            // Refresh usage stats when usage counter changes
            fetchUsageStats();
            fetchUsageHistory();
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userProfile]);

  // Initial fetch
  useEffect(() => {
    fetchUsageStats();
    fetchUsageHistory();
  }, [userProfile]);

  return {
    usageStats,
    usageHistory,
    loading,
    error,
    canPerformScan,
    getRemainingScans,
    getUsagePercentage,
    getPlanLimits,
    fetchUsageStats,
    fetchUsageHistory,
  };
};
