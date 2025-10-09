import React from 'react';
import { Shield, Menu, X, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onNavigate: (page: 'home' | 'auth' | 'account') => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const { isAuthenticated, userProfile, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const scrollToSection = (sectionId: string) => {
    // First navigate to home page if we're not already there
    onNavigate('home');
    
    // Then scroll to the section after a short delay to ensure the page has loaded
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }, 100);
    
    setIsMobileMenuOpen(false);
  };

  const navigationItems = [
    { label: 'Features', href: 'features' },
    { label: 'Reviews', href: 'reviews' },
    { label: 'Pricing', href: 'pricing' },
    { label: 'Download', href: 'download' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="flex items-center justify-center w-10 h-10 bg-accent rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">WebLink Shield</h1>
              <p className="text-xs text-gray-500 -mt-1">Security Analysis Platform</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.href)}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
              >
                {item.label}
              </button>
            ))}
            {!isAuthenticated ? (
              <button 
                onClick={() => onNavigate('auth')}
                className="btn-primary text-sm"
              >
                Sign In
              </button>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {userProfile?.first_name || userProfile?.username || 'User'}
                  </span>
                </div>
                <button 
                  onClick={() => onNavigate('account')}
                  className="btn-secondary text-sm"
                >
                  Account
                </button>
                <button 
                  onClick={() => signOut()}
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                >
                  Sign Out
                </button>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              {navigationItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => scrollToSection(item.href)}
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200 text-left"
                >
                  {item.label}
                </button>
              ))}
              {!isAuthenticated ? (
                <button 
                  onClick={() => { onNavigate('auth'); setIsMobileMenuOpen(false); }}
                  className="btn-primary text-sm w-full mt-2"
                >
                  Sign In
                </button>
              ) : (
                <div className="space-y-2 mt-2">
                  <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {userProfile?.first_name || userProfile?.username || 'User'}
                    </span>
                  </div>
                  <button 
                    onClick={() => { onNavigate('account'); setIsMobileMenuOpen(false); }}
                    className="btn-secondary text-sm w-full"
                  >
                    Account
                  </button>
                  <button 
                    onClick={() => { signOut(); setIsMobileMenuOpen(false); }}
                    className="text-sm text-gray-600 hover:text-gray-900 font-medium w-full text-left py-2"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
