import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import AccountPage from './pages/AccountPage';
import DiagnosticPage from './pages/DiagnosticPage';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'auth' | 'account' | 'diagnostic'>('home');

  // Check URL for diagnostic page
  useEffect(() => {
    if (window.location.hash === '#diagnostic') {
      setCurrentPage('diagnostic');
    }
  }, []);

  const navigateToPage = (page: 'home' | 'auth' | 'account' | 'diagnostic') => {
    setCurrentPage(page);
    if (page === 'diagnostic') {
      window.location.hash = 'diagnostic';
    } else {
      window.location.hash = '';
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        {currentPage !== 'diagnostic' && <Header onNavigate={navigateToPage} />}
        <main>
          {currentPage === 'home' && <HomePage />}
          {currentPage === 'auth' && <AuthPage onNavigate={navigateToPage} />}
          {currentPage === 'account' && <AccountPage onNavigate={navigateToPage} />}
          {currentPage === 'diagnostic' && <DiagnosticPage />}
        </main>
        {currentPage !== 'diagnostic' && <Footer />}
      </div>
    </AuthProvider>
  );
}

export default App;
