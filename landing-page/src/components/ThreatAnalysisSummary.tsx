import React from 'react';
import { 
  Fish, 
  Bug, 
  ArrowRightLeft, 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle 
} from 'lucide-react';

interface ThreatCardProps {
  icon: React.ReactNode;
  title: string;
  status: 'safe' | 'warning' | 'danger';
  description: string;
}

const ThreatCard: React.FC<ThreatCardProps> = ({ icon, title, status, description }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'safe':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'danger':
        return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'safe':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'danger':
        return 'border-red-200 bg-red-50';
    }
  };

  return (
    <div className={`card border-2 ${getStatusColor()}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            {icon}
          </div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
        {getStatusIcon()}
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
};

const ThreatAnalysisSummary: React.FC = () => {
  const threatCards = [
    {
      icon: <Fish className="w-6 h-6 text-blue-600" />,
      title: 'Phishing Signals',
      status: 'safe' as const,
      description: 'No suspicious patterns detected in URL structure or content.'
    },
    {
      icon: <Bug className="w-6 h-6 text-red-600" />,
      title: 'Malware Indicators',
      status: 'warning' as const,
      description: 'Potential suspicious scripts detected. Further analysis recommended.'
    },
    {
      icon: <ArrowRightLeft className="w-6 h-6 text-orange-600" />,
      title: 'Suspicious Redirects',
      status: 'safe' as const,
      description: 'No unexpected redirects or URL shorteners found.'
    },
    {
      icon: <Shield className="w-6 h-6 text-green-600" />,
      title: 'Certificate & Mixed Content',
      status: 'safe' as const,
      description: 'Valid SSL certificate with no mixed content issues detected.'
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Threat Analysis Summary
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive security analysis covering multiple threat vectors and attack patterns
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {threatCards.map((card, index) => (
            <ThreatCard
              key={index}
              icon={card.icon}
              title={card.title}
              status={card.status}
              description={card.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ThreatAnalysisSummary;
