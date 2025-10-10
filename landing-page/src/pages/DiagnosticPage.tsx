import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Activity, CheckCircle, XCircle, Loader } from 'lucide-react';

/**
 * Diagnostic page to test Supabase connection and authentication
 * Use this to isolate issues before testing the full app
 */
const DiagnosticPage: React.FC = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testPassword, setTestPassword] = useState('');

  const addResult = (test: string, status: 'success' | 'error' | 'info', message: string, details?: any) => {
    setTestResults(prev => [...prev, { test, status, message, details, timestamp: new Date() }]);
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setTestResults([]);

    // Test 1: Environment Variables
    addResult('Environment Check', 'info', 'Checking environment variables...');
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      addResult('Environment Check', 'error', 'Missing environment variables!', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey
      });
    } else {
      addResult('Environment Check', 'success', 'Environment variables found', {
        url: supabaseUrl.substring(0, 30) + '...',
        keyLength: supabaseKey.length
      });
    }

    // Test 2: Network Connection
    addResult('Network Test', 'info', 'Testing connection to Supabase...');
    try {
      const startTime = Date.now();
      const { data, error } = await supabase.auth.getSession();
      const elapsed = Date.now() - startTime;
      
      if (error) {
        addResult('Network Test', 'error', `Connection failed: ${error.message}`, { elapsed, error });
      } else {
        addResult('Network Test', 'success', `Connected successfully in ${elapsed}ms`, { elapsed, hasSession: !!data.session });
      }
    } catch (err: any) {
      addResult('Network Test', 'error', `Exception: ${err.message}`, { error: err });
    }

    // Test 3: Database Tables
    addResult('Database Test', 'info', 'Checking database tables...');
    try {
      const { data: roles, error: roleError } = await supabase.from('role').select('*').limit(1);
      if (roleError) {
        addResult('Database Test', 'error', `Role table error: ${roleError.message}`, roleError);
      } else {
        addResult('Database Test', 'success', 'Role table accessible', { roles });
      }

      const { data: plans, error: planError } = await supabase.from('plan').select('*').limit(1);
      if (planError) {
        addResult('Database Test', 'error', `Plan table error: ${planError.message}`, planError);
      } else {
        addResult('Database Test', 'success', 'Plan table accessible', { plans });
      }
    } catch (err: any) {
      addResult('Database Test', 'error', `Exception: ${err.message}`, { error: err });
    }

    setIsRunning(false);
  };

  const testRawAuth = async () => {
    if (!testEmail || !testPassword) {
      addResult('Auth Test', 'error', 'Please enter email and password');
      return;
    }

    setIsRunning(true);
    addResult('Auth Test', 'info', `Attempting to sign in as ${testEmail}...`);

    try {
      const startTime = Date.now();
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth timeout after 10 seconds')), 10000)
      );

      const authPromise = supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      const result = await Promise.race([authPromise, timeoutPromise]) as any;
      const elapsed = Date.now() - startTime;

      if (result.error) {
        addResult('Auth Test', 'error', `Sign in failed: ${result.error.message}`, {
          elapsed,
          error: result.error,
          code: result.error.code,
          status: result.error.status
        });
      } else {
        addResult('Auth Test', 'success', `Sign in successful in ${elapsed}ms`, {
          elapsed,
          userId: result.data?.user?.id,
          email: result.data?.user?.email,
          hasSession: !!result.data?.session
        });

        // Sign out after test
        await supabase.auth.signOut();
        addResult('Auth Test', 'info', 'Signed out after test');
      }
    } catch (err: any) {
      addResult('Auth Test', 'error', `Exception: ${err.message}`, { error: err });
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Activity className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Supabase Diagnostics</h1>
          <p className="text-gray-600 mb-6">Test your Supabase connection and authentication setup</p>

          <div className="space-y-4">
            <button
              onClick={runDiagnostics}
              disabled={isRunning}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isRunning ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Running Diagnostics...
                </>
              ) : (
                'Run Full Diagnostics'
              )}
            </button>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Test Sign In</h3>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={testRawAuth}
                  disabled={isRunning || !testEmail || !testPassword}
                  className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Test Authentication
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Test Results</h2>
          
          {testResults.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No tests run yet. Click "Run Full Diagnostics" to start.</p>
          ) : (
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className="border-l-4 border-gray-300 pl-4 py-2">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(result.status)}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="font-semibold text-gray-900">{result.test}</p>
                      <p className={`text-sm ${
                        result.status === 'error' ? 'text-red-600' : 
                        result.status === 'success' ? 'text-green-600' : 
                        'text-gray-600'
                      }`}>
                        {result.message}
                      </p>
                      {result.details && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                            View details
                          </summary>
                          <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {result.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 mb-2">💡 Troubleshooting Tips</h3>
          <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
            <li>Make sure your .env file exists and has the correct values</li>
            <li>Restart your dev server after changing .env</li>
            <li>Check the browser console (F12) for additional errors</li>
            <li>Verify your Supabase project is active (not paused)</li>
            <li>Test sign in uses an account you created manually in Supabase</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticPage;

