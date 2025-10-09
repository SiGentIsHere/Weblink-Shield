import React from 'react';
import { Star, Quote, Shield, ThumbsUp } from 'lucide-react';

interface TestimonialProps {
  name: string;
  avatar: string;
  rating: number;
  text: string;
  highlight?: boolean;
}

const Testimonial: React.FC<TestimonialProps> = ({ 
  name, 
  avatar, 
  rating, 
  text, 
  highlight = false 
}) => {
  return (
    <div className={`card ${highlight ? 'border-accent border-2 bg-accent/5' : ''} hover:shadow-lg transition-all duration-300`}>
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent-light rounded-full flex items-center justify-center text-white font-semibold">
            {avatar}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Rating */}
          <div className="flex items-center space-x-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Quote */}
          <div className="relative mb-4">
            <Quote className="absolute -top-2 -left-2 w-6 h-6 text-accent/30" />
            <p className="text-gray-700 leading-relaxed pl-4">{text}</p>
          </div>

          {/* Author */}
          <div>
            <h4 className="font-semibold text-gray-900">{name}</h4>
          </div>
        </div>
      </div>
    </div>
  );
};

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      avatar: 'SJ',
      rating: 5,
      text: 'WebLink Shield has saved me from multiple phishing attempts. The real-time scanning is incredibly fast and accurate. I feel much safer browsing on my phone now.',
      highlight: true
    },
    {
      name: 'Michael Chen',
      avatar: 'MC',
      rating: 5,
      text: 'As someone who works in tech, I appreciate the technical depth of the security analysis. The AI detection is impressive and the app is beautifully designed.'
    },
    {
      name: 'Emily Rodriguez',
      avatar: 'ER',
      rating: 5,
      text: 'I was skeptical at first, but this app has prevented me from clicking on several malicious links. The QR scanner feature is especially useful for my business.'
    },
    {
      name: 'David Thompson',
      avatar: 'DT',
      rating: 4,
      text: 'Great app for staying safe online. The interface is intuitive and the scanning is super quick. Would definitely recommend to friends and family.'
    },
    {
      name: 'Lisa Wang',
      avatar: 'LW',
      rating: 5,
      text: 'The privacy-first approach really sold me on this app. I love that it doesn\'t store my browsing data while still providing excellent protection.'
    },
    {
      name: 'James Wilson',
      avatar: 'JW',
      rating: 5,
      text: 'At my age, I\'m not always sure about online safety. WebLink Shield gives me confidence to browse and shop online without worry. Simple and effective!'
    }
  ];

  const stats = [
    {
      icon: <Star className="w-6 h-6 text-yellow-500" />,
      number: '4.9',
      label: 'App Store Rating',
      description: 'Based on 50,000+ reviews'
    },
    {
      icon: <ThumbsUp className="w-6 h-6 text-green-500" />,
      number: '98%',
      label: 'User Satisfaction',
      description: 'Would recommend to others'
    },
    {
      icon: <Shield className="w-6 h-6 text-accent" />,
      number: '2M+',
      label: 'Threats Blocked',
      description: 'Protected users daily'
    }
  ];

  return (
    <section id="reviews" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Quote className="w-8 h-8 text-accent" />
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              What Our Users Say
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join millions of satisfied users who trust WebLink Shield to protect their digital lives
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="flex items-center justify-center mb-4">
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
              <div className="text-lg font-semibold text-gray-700 mb-1">{stat.label}</div>
              <div className="text-sm text-gray-500">{stat.description}</div>
            </div>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Testimonial
              key={index}
              name={testimonial.name}
              avatar={testimonial.avatar}
              rating={testimonial.rating}
              text={testimonial.text}
              highlight={testimonial.highlight}
            />
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Join Our Community?
            </h3>
            <p className="text-gray-600 mb-6">
              Download WebLink Shield today and experience the peace of mind that comes with advanced mobile security.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary">
                Download Now
              </button>
              <button className="btn-secondary">
                Read More Reviews
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
