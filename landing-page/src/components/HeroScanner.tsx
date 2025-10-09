import React from 'react';
import { Shield, Smartphone, Download, ArrowRight } from 'lucide-react';

const HeroScanner: React.FC = () => {

  return (
    <section id="download" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-accent/5 to-accent/10">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Secure Your Digital Life with{' '}
              <span className="text-accent">WebLink Shield</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              The ultimate mobile security app that protects you from malicious links, 
              phishing attacks, and online threats. Download now and browse with confidence.
            </p>

            {/* Key Features */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3">
                <Shield className="w-6 h-6 text-accent" />
                <span className="text-gray-700">Real-time link scanning</span>
              </div>
              <div className="flex items-center space-x-3">
                <Smartphone className="w-6 h-6 text-accent" />
                <span className="text-gray-700">QR code and camera scanning</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="w-6 h-6 text-accent" />
                <span className="text-gray-700">AI-powered threat detection</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="btn-primary text-lg px-8 py-4">
                <Download className="w-5 h-5 mr-2" />
                Download App
              </button>
              <button className="btn-secondary text-lg px-8 py-4">
                Learn More
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>

          {/* Right Column - App Preview */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              {/* Phone Mockup */}
              <div className="w-80 h-[600px] bg-gray-900 rounded-[3rem] p-2 shadow-2xl">
                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
                  {/* Phone Screen Content */}
                  <div className="h-full bg-gradient-to-br from-accent/10 to-accent/5 p-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-accent rounded-2xl mx-auto mb-4 flex items-center justify-center">
                        <Shield className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">WebLink Shield</h3>
                      <p className="text-sm text-gray-600 mb-6">Scan & Secure</p>
                      
                      {/* Mock Scanner Interface */}
                      <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
                        <div className="w-full h-12 bg-gray-100 rounded-lg mb-3"></div>
                        <button className="w-full bg-accent text-white py-3 rounded-lg font-medium">
                          Scan Link
                        </button>
                      </div>
                      
                      {/* Mock Results */}
                      <div className="space-y-3">
                        <div className="bg-white rounded-lg p-3 shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Security Score</span>
                            <span className="text-lg font-bold text-green-600">85/100</span>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Risk Level</span>
                            <span className="text-sm font-medium text-green-600">Low Risk</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-yellow-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroScanner;
