import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Scan, ScanWithDetails, DetailedReport, ThreatSummary, ScoreReport, History } from '../types/database';

export const useScans = () => {
  const { userProfile } = useAuth();
  const [scans, setScans] = useState<ScanWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's scans
  const fetchScans = async () => {
    if (!userProfile) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('Scan')
        .select(`
          *,
          detailed_report:DetailedReport(
            *,
            score_report:ScoreReport(*)
          ),
          threat_summaries:ThreatSummary(*)
        `)
        .eq('user_id', userProfile.user_id)
        .order('submitted_at', { ascending: false });

      if (error) {
        throw error;
      }

      setScans(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch scans');
    } finally {
      setLoading(false);
    }
  };

  // Submit a new scan
  const submitScan = async (url: string, scanType: string = 'full') => {
    if (!userProfile) {
      throw new Error('User not authenticated');
    }

    try {
      const { data, error } = await supabase
        .from('Scan')
        .insert({
          user_id: userProfile.user_id,
          url_scanned: url,
          scan_type: scanType,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Refresh scans list
      await fetchScans();
      return data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to submit scan');
    }
  };

  // Update scan status (for real-time updates)
  const updateScanStatus = async (scanId: number, status: string, progress?: number, errorMessage?: string) => {
    try {
      const updates: any = { status };
      
      if (progress !== undefined) updates.progress = progress;
      if (errorMessage) updates.error_message = errorMessage;
      if (status === 'processing') updates.started_at = new Date().toISOString();
      if (status === 'completed') {
        updates.analyzed_at = new Date().toISOString();
        updates.completed_at = new Date().toISOString();
        updates.progress = 100;
      }
      if (status === 'failed') {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('Scan')
        .update(updates)
        .eq('scan_id', scanId);

      if (error) {
        throw error;
      }

      // Refresh scans list
      await fetchScans();
    } catch (err) {
      console.error('Error updating scan status:', err);
    }
  };

  // Save scan to history
  const saveToHistory = async (scanId: number, notes?: string) => {
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
          is_favorite: false,
        });

      if (error) {
        throw error;
      }
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to save scan to history');
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
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to remove scan from history');
    }
  };

  // Get scan details
  const getScanDetails = async (scanId: number): Promise<ScanWithDetails | null> => {
    try {
      const { data, error } = await supabase
        .from('Scan')
        .select(`
          *,
          detailed_report:DetailedReport(
            *,
            score_report:ScoreReport(*)
          ),
          threat_summaries:ThreatSummary(*)
        `)
        .eq('scan_id', scanId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (err) {
      console.error('Error fetching scan details:', err);
      return null;
    }
  };

  // Subscribe to real-time scan updates
  useEffect(() => {
    if (!userProfile) return;

    const subscription = supabase
      .channel('scan-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Scan',
          filter: `user_id=eq.${userProfile.user_id}`,
        },
        (payload) => {
          console.log('Scan update received:', payload);
          
          // Update the scans list with the new data
          if (payload.eventType === 'INSERT') {
            setScans(prev => [payload.new as ScanWithDetails, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setScans(prev => 
              prev.map(scan => 
                scan.scan_id === payload.new.scan_id 
                  ? { ...scan, ...payload.new }
                  : scan
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setScans(prev => 
              prev.filter(scan => scan.scan_id !== payload.old.scan_id)
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
    fetchScans();
  }, [userProfile]);

  return {
    scans,
    loading,
    error,
    submitScan,
    updateScanStatus,
    saveToHistory,
    removeFromHistory,
    getScanDetails,
    fetchScans,
  };
};
