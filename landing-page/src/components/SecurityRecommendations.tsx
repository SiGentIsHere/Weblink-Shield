import React from 'react';
import { Lightbulb, Info, Shield, Eye, Lock, AlertTriangle } from 'lucide-react';

interface RecommendationCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ 
  icon, 
  title, 
  description, 
  priority 
}) => {
  const getPriorityColor = () => {
    switch (priority) {
      case 'High':
        return 'border-red-200 bg-red-50';
      case 'Medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'Low':
        return 'border-green-200 bg-green-50';
    }
  };

  const getPriorityBadge = () => {
    switch (priority) {
      case 'High':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            High Priority
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Info className="w-3 h-3 mr-1" />
            Medium Priority
          </span>
        );
      case 'Low':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Shield className="w-3 h-3 mr-1" />
            Low Priority
          </span>
        );
    }
  };

  return (
    <div className={`card border-2 ${getPriorityColor()}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            {icon}
          </div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
        {getPriorityBadge()}
      </div>
      <p className="text-sm text-gray-700">{description}</p>
    </div>
  );
};

const SecurityRecommendations: React.FC = () => {
  const recommendations = [
    {
      icon: <Eye className="w-6 h-6 text-blue-600" />,
      title: 'Verify Website Authenticity',
      description: 'Double-check the website URL and look for any suspicious characters or misspellings. Contact the sender through a different channel to confirm the link.',
      priority: 'High' as const
    },
    {
      icon: <Lock className="w-6 h-6 text-green-600" />,
      title: 'Use HTTPS Connection',
      description: 'Ensure the website uses HTTPS encryption. Look for the lock icon in your browser\'s address bar before entering any sensitive information.',
      priority: 'Medium' as const
    },
    {
      icon: <Shield className="w-6 h-6 text-purple-600" />,
      title: 'Keep Security Software Updated',
      description: 'Maintain up-to-date antivirus and anti-malware software. Enable real-time protection and schedule regular system scans.',
      priority: 'Medium' as const
    },
    {
      icon: <AlertTriangle className="w-6 h-6 text-orange-600" />,
      title: 'Be Cautious with Downloads',
      description: 'Avoid downloading files from untrusted sources. If you must download, scan the file with your security software before opening.',
      priority: 'Low' as const
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Lightbulb className="w-8 h-8 text-accent" />
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Security Recommendations
            </h2>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Actionable security tips to help you stay protected online
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((recommendation, index) => (
            <RecommendationCard
              key={index}
              icon={recommendation.icon}
              title={recommendation.title}
              description={recommendation.description}
              priority={recommendation.priority}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SecurityRecommendations;
