import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const EmailVerificationBanner: React.FC = () => {
  const { isEmailVerified, sendEmailVerification } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState('');

  // Don't show banner if email is verified
  if (isEmailVerified) return null;

  const handleSendVerification = async () => {
    setIsSending(true);
    setMessage('');
    
    const result = await sendEmailVerification();
    
    if (result.success) {
      setMessage('Verification email sent! Please check your inbox.');
    } else {
      setMessage(`Failed to send verification email: ${result.error}`);
    }
    
    setIsSending(false);
  };

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Email Verification Required
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Please verify your email address to access all features including security scanning.
            </p>
            <div className="mt-3">
              <button
                onClick={handleSendVerification}
                disabled={isSending}
                className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-medium py-2 px-4 rounded-md text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? 'Sending...' : 'Send Verification Email'}
              </button>
              {message && (
                <p className={`mt-2 text-sm ${message.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
                  {message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;
