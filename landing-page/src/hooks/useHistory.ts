import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { History, ScanWithDetails } from '../types/database';

export const useHistory = () => {
  const { userProfile } = useAuth();
  const [history, setHistory] = useState<(History & { scan: ScanWithDetails })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's scan history
  const fetchHistory = async () => {
    if (!userProfile) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('History')
        .select(`
          *,
          scan:Scan(
            *,
            detailed_report:DetailedReport(
              *,
              score_report:ScoreReport(*)
            ),
            threat_summaries:ThreatSummary(*)
          )
        `)
        .eq('user_id', userProfile.user_id)
        .order('saved_at', { ascending: false });

      if (error) {
        throw error;
      }

      setHistory(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  };

  // Add scan to history
  const addToHistory = async (scanId: number, notes?: string, isFavorite: boolean = false) => {
    if (!userProfile) {
      throw new Error('User not authenticated');
    }

    try {
      const { error } = await supabase
        .from('History')
        .insert({
          user_id: userProfile.user_id,
          scan_id: scanId,
          notes: notes || null,
          is_favorite: isFavorite,
        });

      if (error) {
        throw error;
      }

      // Refresh history
      await fetchHistory();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to add to history');
    }
  };

  // Remove scan from history
  const removeFromHistory = async (scanId: number) => {
    if (!userProfile) {
      throw new Error('User not authenticated');
    }

    try {
      const { error } = await supabase
        .from('History')
        .delete()
        .eq('user_id', userProfile.user_id)
        .eq('scan_id', scanId);

      if (error) {
        throw error;
      }

      // Refresh history
      await fetchHistory();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to remove from history');
    }
  };

  // Update history entry
  const updateHistoryEntry = async (scanId: number, updates: { notes?: string; is_favorite?: boolean }) => {
    if (!userProfile) {
      throw new Error('User not authenticated');
    }

    try {
      const { error } = await supabase
        .from('History')
        .update(updates)
        .eq('user_id', userProfile.user_id)
        .eq('scan_id', scanId);

      if (error) {
        throw error;
      }

      // Refresh history
      await fetchHistory();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update history entry');
    }
  };

  // Toggle favorite status
  const toggleFavorite = async (scanId: number) => {
    const entry = history.find(h => h.scan_id === scanId);
    if (!entry) return;

    await updateHistoryEntry(scanId, { is_favorite: !entry.is_favorite });
  };

  // Get favorites only
  const getFavorites = () => {
    return history.filter(entry => entry.is_favorite);
  };

  // Subscribe to real-time history updates
  useEffect(() => {
    if (!userProfile) return;

    const subscription = supabase
      .channel('history-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'History',
          filter: `user_id=eq.${userProfile.user_id}`,
        },
        (payload) => {
          console.log('History update received:', payload);
          
          if (payload.eventType === 'INSERT') {
            // Fetch the new entry with scan details
            fetchHistory();
          } else if (payload.eventType === 'UPDATE') {
            setHistory(prev => 
              prev.map(entry => 
                entry.history_id === payload.new.history_id 
                  ? { ...entry, ...payload.new }
                  : entry
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setHistory(prev => 
              prev.filter(entry => entry.history_id !== payload.old.history_id)
            );
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
    fetchHistory();
  }, [userProfile]);

  return {
    history,
    loading,
    error,
    addToHistory,
    removeFromHistory,
    updateHistoryEntry,
    toggleFavorite,
    getFavorites,
    fetchHistory,
  };
};
