import React, { useState } from 'react';
import { Shield, User as UserIcon, ChevronRight, Trash2, Star, LogOut, Scan, History, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUsage } from '../hooks/useUsage';
import { useScans } from '../hooks/useScans';
import { useHistory } from '../hooks/useHistory';

interface AccountPageProps {
  onNavigate: (page: 'home' | 'auth' | 'account') => void;
}

const StatCard: React.FC<{ title: string; children?: React.ReactNode; actionLabel?: string; onAction?: () => void }>
  = ({ title, children, actionLabel, onAction }) => {
  return (
    <div className="card rounded-2xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {actionLabel && (
          <button onClick={onAction} className="text-xs text-accent hover:text-accent-dark font-medium inline-flex items-center">
            {actionLabel}
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        )}
      </div>
      {children}
    </div>
  );
};

const AccountPage: React.FC<AccountPageProps> = ({ onNavigate }) => {
  const { userProfile, signOut, loading } = useAuth();
  const { usageStats, getUsagePercentage, getPlanLimits, canPerformScan } = useUsage();
  const { scans } = useScans();
  const { history } = useHistory();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'scans' | 'history'>('dashboard');

  const handleSignOut = async () => {
    await signOut();
    onNavigate('home');
  };

  const handleEditProfile = () => {
    // Placeholder - could open a drawer/modal later
    alert('Edit profile coming soon');
  };

  const handleNewScan = () => {
    // This would open a scan modal or navigate to scan page
    alert('New scan feature coming soon!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please sign in to access your account.</p>
          <button
            onClick={() => onNavigate('auth')}
            className="btn-primary"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header / Brand */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">WebLink Shield</h1>
              <p className="text-xs text-gray-500 -mt-0.5">Security Analysis Platform</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigate('home')}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              Back to Home
            </button>
            <button
              onClick={handleSignOut}
              className="btn-secondary text-sm flex items-center"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Profile Row */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-gray-200 flex items-center justify-center mr-4">
              <UserIcon className="w-8 h-8 text-gray-500" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">
                {userProfile.first_name && userProfile.last_name 
                  ? `${userProfile.first_name} ${userProfile.last_name}`
                  : userProfile.username
                }
              </div>
              <div className="text-xs text-gray-600 truncate max-w-[200px] sm:max-w-xs">
                {userProfile.email}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {userProfile.role?.name} Plan
              </div>
            </div>
          </div>
          <button onClick={handleEditProfile} className="btn-secondary text-sm whitespace-nowrap">
            Edit Profile
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('scans')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'scans'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Scans ({scans.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            History ({history.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <>
            {/* Plan Card */}
            <StatCard 
              title={`Plan: ${userProfile.subscription?.plan?.name || 'Free'}`} 
              actionLabel="Upgrade" 
              onAction={() => alert('Plans coming soon')}
            >
              <p className="text-sm text-gray-500 mt-2">
                {userProfile.subscription?.end_date 
                  ? `Expires: ${new Date(userProfile.subscription.end_date).toLocaleDateString()}`
                  : 'No expiration date'
                }
              </p>
            </StatCard>

            {/* Usage Card */}
            <div className="mt-6">
              <StatCard title={`Scan Usage: ${usageStats?.scans_used_today || 0} / ${usageStats?.daily_scan_limit === -1 ? '∞' : usageStats?.daily_scan_limit || 0} used`}>
                <div className="mt-3">
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        usageStats?.limit_reached ? 'bg-red-500' : 'bg-accent'
                      }`}
                      style={{ 
                        width: usageStats?.daily_scan_limit === -1 
                          ? '0%' 
                          : `${getUsagePercentage()}%` 
                      }} 
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {usageStats?.limit_reached 
                      ? 'Daily limit reached. Upgrade for more scans.'
                      : `${usageStats?.remaining_scans || 0} scans remaining today`
                    }
                  </p>
                </div>
              </StatCard>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <button
                onClick={handleNewScan}
                disabled={!canPerformScan()}
                className={`btn-primary ${!canPerformScan() ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Scan className="w-4 h-4 inline mr-2" />
                New Scan
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className="btn-secondary"
              >
                <History className="w-4 h-4 inline mr-2" />
                View History
              </button>
            </div>

            {/* Recent Scans */}
            <div className="mt-6">
              <StatCard title="Recent Scans">
                {scans.length > 0 ? (
                  <div className="space-y-3 mt-3">
                    {scans.slice(0, 3).map((scan) => (
                      <div key={scan.scan_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {scan.url_scanned}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(scan.submitted_at).toLocaleDateString()} - {scan.status}
                          </p>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          scan.status === 'completed' ? 'bg-green-100 text-green-800' :
                          scan.status === 'failed' ? 'bg-red-100 text-red-800' :
                          scan.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {scan.status}
                        </div>
                      </div>
                    ))}
                    {scans.length > 3 && (
                      <button 
                        onClick={() => setActiveTab('scans')}
                        className="text-sm text-accent hover:text-accent-dark font-medium"
                      >
                        View all {scans.length} scans →
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mt-3">No scans yet. Start by scanning a URL!</p>
                )}
              </StatCard>
            </div>
          </>
        )}

        {activeTab === 'scans' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">All Scans</h3>
              <button
                onClick={handleNewScan}
                disabled={!canPerformScan()}
                className={`btn-primary ${!canPerformScan() ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Scan className="w-4 h-4 mr-2" />
                New Scan
              </button>
            </div>
            
            {scans.length > 0 ? (
              <div className="space-y-3">
                {scans.map((scan) => (
                  <div key={scan.scan_id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {scan.url_scanned}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(scan.submitted_at).toLocaleDateString()} at {new Date(scan.submitted_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          scan.status === 'completed' ? 'bg-green-100 text-green-800' :
                          scan.status === 'failed' ? 'bg-red-100 text-red-800' :
                          scan.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {scan.status}
                        </div>
                        {scan.status === 'processing' && scan.progress !== undefined && (
                          <div className="text-xs text-gray-500">
                            {scan.progress}%
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Scan className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No scans yet</p>
                <p className="text-sm text-gray-400 mt-1">Start by scanning a URL to see results here</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Saved Scans</h3>
            </div>
            
            {history.length > 0 ? (
              <div className="space-y-3">
                {history.map((entry) => (
                  <div key={entry.history_id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {entry.scan.url_scanned}
                        </p>
                        <p className="text-xs text-gray-500">
                          Saved on {new Date(entry.saved_at).toLocaleDateString()}
                        </p>
                        {entry.notes && (
                          <p className="text-xs text-gray-600 mt-1 italic">
                            "{entry.notes}"
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {entry.is_favorite && (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        )}
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          entry.scan.status === 'completed' ? 'bg-green-100 text-green-800' :
                          entry.scan.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {entry.scan.status}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No saved scans yet</p>
                <p className="text-sm text-gray-400 mt-1">Save completed scans to view them here</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default AccountPage;
