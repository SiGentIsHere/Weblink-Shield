import React, { useState } from 'react';
import { Clock, Globe, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface ScanHistoryItem {
  id: string;
  url: string;
  score: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  timestamp: Date;
  favicon?: string;
}

const RecentScans: React.FC = () => {
  // Mock data for recent scans
  const [recentScans] = useState<ScanHistoryItem[]>([
    {
      id: '1',
      url: 'https://example.com/secure-page',
      score: 85,
      riskLevel: 'Low',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    },
    {
      id: '2',
      url: 'https://suspicious-site.net/download',
      score: 25,
      riskLevel: 'High',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    {
      id: '3',
      url: 'https://banking-app.com/login',
      score: 92,
      riskLevel: 'Low',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    },
    {
      id: '4',
      url: 'https://unknown-domain.org/offer',
      score: 45,
      riskLevel: 'Medium',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    },
    {
      id: '5',
      url: 'https://news-website.com/article',
      score: 78,
      riskLevel: 'Low',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    }
  ]);

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Low':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Medium':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'High':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Shield className="w-4 h-4 text-gray-600" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  const truncateUrl = (url: string, maxLength: number = 50) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Clock className="w-8 h-8 text-accent" />
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Recent Scans
            </h2>
          </div>
          <p className="text-lg text-gray-600">
            Your recent security analysis history
          </p>
        </div>

        <div className="space-y-4">
          {recentScans.map((scan) => (
            <div key={scan.id} className="card hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center space-x-4">
                {/* Favicon placeholder */}
                <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-gray-400" />
                </div>

                {/* URL and details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {truncateUrl(scan.url)}
                  </p>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center space-x-1">
                      {getRiskIcon(scan.riskLevel)}
                      <span className="text-xs text-gray-500 capitalize">
                        {scan.riskLevel} Risk
                      </span>
                    </div>
                    <span className={`text-xs font-medium ${getScoreColor(scan.score)}`}>
                      Score: {scan.score}/100
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatTimeAgo(scan.timestamp)}
                    </span>
                  </div>
                </div>

                {/* Action button */}
                <button className="btn-secondary text-sm">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-8">
          <button className="btn-primary">
            View All Scans
          </button>
        </div>
      </div>
    </section>
  );
};

export default RecentScans;
