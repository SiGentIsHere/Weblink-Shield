import React from 'react';
import { 
  Shield, 
  Smartphone, 
  Camera, 
  Brain, 
  Zap, 
  Globe, 
  Lock
} from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight?: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, highlight = false }) => {
  return (
    <div className={`card ${highlight ? 'border-accent border-2 bg-accent/5' : ''} hover:shadow-lg hover:scale-105 transition-all duration-300`}>
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-xl ${highlight ? 'bg-accent text-white' : 'bg-gray-100 text-accent'}`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
};

interface MilestoneProps {
  number: string;
  title: string;
  description: string;
}

const Milestone: React.FC<MilestoneProps> = ({ number, title, description }) => {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl font-bold text-white">{number}</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
};

const AppShowcase: React.FC = () => {
  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Real-time Link Scanning',
      description: 'Instantly analyze any URL for threats, malware, and phishing attempts with our advanced security engine.',
      highlight: true
    },
    {
      icon: <Camera className="w-6 h-6" />,
      title: 'QR Code & Camera Scanner',
      description: 'Scan QR codes and capture links from images using your device camera for comprehensive protection.'
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: 'AI-Powered Detection',
      description: 'Machine learning algorithms continuously improve threat detection and adapt to new attack patterns.'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Lightning Fast Results',
      description: 'Get security analysis results in under 2 seconds with our optimized scanning infrastructure.'
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'Global Threat Database',
      description: 'Access to the world\'s largest database of known malicious URLs and threat intelligence.'
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: 'Privacy First',
      description: 'Your data stays private. We never store personal information or browsing history.'
    }
  ];

  const milestones = [
    {
      number: '1M+',
      title: 'Downloads',
      description: 'Trusted by over 1 million users worldwide'
    },
    {
      number: '99%',
      title: 'Accuracy',
      description: 'Industry-leading threat detection accuracy'
    },
    {
      number: '24/7',
      title: 'Protection',
      description: 'Continuous monitoring and real-time updates'
    },
    {
      number: '50+',
      title: 'Languages',
      description: 'Available in over 50 languages globally'
    }
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Smartphone className="w-8 h-8 text-accent" />
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Powerful Mobile Security
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            WebLink Shield is the most advanced mobile security app, protecting millions of users 
            from online threats with cutting-edge technology and intuitive design.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              highlight={feature.highlight}
            />
          ))}
        </div>

        {/* Milestones */}
        <div className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-2xl p-8 sm:p-12">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Trusted by Millions Worldwide
            </h3>
            <p className="text-lg text-gray-600">
              Join the growing community of security-conscious users
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {milestones.map((milestone, index) => (
              <Milestone
                key={index}
                number={milestone.number}
                title={milestone.title}
                description={milestone.description}
              />
            ))}
          </div>
        </div>

        {/* App Store Badges */}
        <div className="text-center mt-16">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Download WebLink Shield Today
          </h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="flex items-center space-x-3 bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors duration-200">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">📱</span>
              </div>
              <div className="text-left">
                <div className="text-xs">Download on the</div>
                <div className="text-sm font-semibold">App Store</div>
              </div>
            </button>
            
            <button className="flex items-center space-x-3 bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors duration-200">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">🤖</span>
              </div>
              <div className="text-left">
                <div className="text-xs">Get it on</div>
                <div className="text-sm font-semibold">Google Play</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppShowcase;
