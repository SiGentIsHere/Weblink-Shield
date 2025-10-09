import React from 'react';
import { 
  Check, 
  X, 
  Shield, 
  Zap, 
  Star,
  Smartphone,
  Globe,
  Lock
} from 'lucide-react';

interface PricingPlanProps {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  limitations: string[];
  popular?: boolean;
  icon: React.ReactNode;
  buttonText: string;
  buttonVariant: 'primary' | 'secondary';
}

const PricingPlan: React.FC<PricingPlanProps> = ({
  name,
  price,
  period,
  description,
  features,
  limitations,
  popular = false,
  icon,
  buttonText,
  buttonVariant
}) => {
  return (
    <div className={`card relative ${popular ? 'border-accent border-2 shadow-xl scale-105' : ''} hover:shadow-lg transition-all duration-300`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-accent text-white px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
            <Star className="w-4 h-4" />
            <span>Most Popular</span>
          </div>
        </div>
      )}

      <div className="text-center mb-8">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
          popular ? 'bg-accent text-white' : 'bg-gray-100 text-accent'
        }`}>
          {icon}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{name}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="mb-6">
          <span className="text-4xl font-bold text-gray-900">{price}</span>
          <span className="text-gray-500 ml-2">{period}</span>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center space-x-3">
            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </div>
        ))}
        {limitations.map((limitation, index) => (
          <div key={index} className="flex items-center space-x-3">
            <X className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <span className="text-gray-400">{limitation}</span>
          </div>
        ))}
      </div>

      <button className={`w-full py-3 px-6 rounded-lg font-medium transition-colors duration-200 ${
        buttonVariant === 'primary' 
          ? 'bg-accent hover:bg-accent-dark text-white' 
          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
      }`}>
        {buttonText}
      </button>
    </div>
  );
};

const Pricing: React.FC = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'Perfect for casual users',
      features: [
        'Basic link scanning',
        'Up to 50 scans per day',
        'Standard threat detection',
        'Community support',
        'Basic security reports'
      ],
      limitations: [
        'No QR code scanning',
        'No advanced AI detection',
        'No priority support',
        'Limited scan history'
      ],
      icon: <Shield className="w-8 h-8" />,
      buttonText: 'Get Started Free',
      buttonVariant: 'secondary' as const
    },
    {
      name: 'Pro',
      price: '$4.99',
      period: '/month',
      description: 'Best for regular users',
      features: [
        'Unlimited link scanning',
        'QR code & camera scanning',
        'Advanced AI threat detection',
        'Priority customer support',
        'Detailed security reports',
        'Scan history & favorites',
        'Real-time threat updates',
        'Ad-free experience'
      ],
      limitations: [],
      popular: true,
      icon: <Zap className="w-8 h-8" />,
      buttonText: 'Start Pro Trial',
      buttonVariant: 'primary' as const
    },
  ];

  const features = [
    {
      icon: <Smartphone className="w-6 h-6 text-accent" />,
      title: 'Cross-Platform',
      description: 'Available on iOS, Android, and Web'
    },
    {
      icon: <Globe className="w-6 h-6 text-accent" />,
      title: 'Global Coverage',
      description: 'Protection worldwide with local servers'
    },
    {
      icon: <Lock className="w-6 h-6 text-accent" />,
      title: 'Privacy First',
      description: 'Your data never leaves your device'
    }
  ];

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Choose Your Security Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select the perfect plan for your security needs. All plans include our core protection features.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <PricingPlan
              key={index}
              name={plan.name}
              price={plan.price}
              period={plan.period}
              description={plan.description}
              features={plan.features}
              limitations={plan.limitations}
              popular={plan.popular}
              icon={plan.icon}
              buttonText={plan.buttonText}
              buttonVariant={plan.buttonVariant}
            />
          ))}
        </div>

        {/* Features */}
        <div className="bg-gray-50 rounded-2xl p-8 sm:p-12">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Why Choose WebLink Shield?
            </h3>
            <p className="text-gray-600">
              All plans include these essential security features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card">
              <h4 className="font-semibold text-gray-900 mb-2">Can I change plans anytime?</h4>
              <p className="text-gray-600 text-sm">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div className="card">
              <h4 className="font-semibold text-gray-900 mb-2">Is there a free trial?</h4>
              <p className="text-gray-600 text-sm">
                Pro plan comes with a 7-day free trial. No credit card required to start.
              </p>
            </div>
            <div className="card">
              <h4 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h4>
              <p className="text-gray-600 text-sm">
                We accept all major credit cards, PayPal, and Apple/Google Pay for mobile subscriptions.
              </p>
            </div>
            <div className="card">
              <h4 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h4>
              <p className="text-gray-600 text-sm">
                Absolutely. Cancel your subscription anytime with no cancellation fees or penalties.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
