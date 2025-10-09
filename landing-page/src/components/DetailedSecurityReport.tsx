import React from 'react';
import { 
  Globe, 
  Brain, 
  Search, 
  Shield, 
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';

interface ReportCardProps {
  icon: React.ReactNode;
  title: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  description: string;
  details: string;
}

const ReportCard: React.FC<ReportCardProps> = ({ icon, title, riskLevel, description, details }) => {
  const getRiskBadge = () => {
    switch (riskLevel) {
      case 'Low':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Low Risk
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Medium Risk
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            High Risk
          </span>
        );
    }
  };

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
        {getRiskBadge()}
      </div>
      <p className="text-sm text-gray-700">{details}</p>
    </div>
  );
};

const DetailedSecurityReport: React.FC = () => {
  const currentTime = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  const reportCards = [
    {
      icon: <Brain className="w-6 h-6 text-purple-600" />,
      title: 'Threat Analysis Engine',
      riskLevel: 'Low' as const,
      description: 'Advanced pattern recognition',
      details: 'No known threat signatures detected. URL structure appears legitimate with standard domain patterns.'
    },
    {
      icon: <Brain className="w-6 h-6 text-blue-600" />,
      title: 'AI Threat Detection',
      riskLevel: 'Low' as const,
      description: 'Machine learning analysis',
      details: 'AI models indicate low probability of malicious intent. Content analysis shows normal website characteristics.'
    },
    {
      icon: <Search className="w-6 h-6 text-green-600" />,
      title: 'Content Analysis',
      riskLevel: 'Medium' as const,
      description: 'Website content scanning',
      details: 'Some suspicious JavaScript patterns detected. Recommend further investigation before proceeding.'
    },
    {
      icon: <Shield className="w-6 h-6 text-orange-600" />,
      title: 'Domain Reputation',
      riskLevel: 'Low' as const,
      description: 'Domain history and reputation',
      details: 'Domain has good reputation score with no previous security incidents reported.'
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Detailed Security Report
            </h2>
            <p className="text-lg text-gray-600">
              Comprehensive analysis of security threats and vulnerabilities
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 mt-4 sm:mt-0">
            <Clock className="w-4 h-4" />
            <span>Last updated: {currentTime}</span>
          </div>
        </div>

        {/* Scanned URL Card */}
        <div className="card mb-8">
          <div className="flex items-center space-x-3">
            <Globe className="w-6 h-6 text-accent" />
            <div>
              <h3 className="font-semibold text-gray-900">Scanned URL</h3>
              <p className="text-sm text-gray-600 break-all">
                https://example-website.com/path/to/page?param=value
              </p>
            </div>
          </div>
        </div>

        {/* Report Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportCards.map((card, index) => (
            <ReportCard
              key={index}
              icon={card.icon}
              title={card.title}
              riskLevel={card.riskLevel}
              description={card.description}
              details={card.details}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default DetailedSecurityReport;
