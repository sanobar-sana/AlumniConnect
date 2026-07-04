import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

/**
 * VerifyEmailPage
 * 
 * Appwrite sends users to this page after they click the verification link.
 * The URL will contain: ?userId=...&secret=...
 * 
 * We extract those params, call verifyEmail(), and show success / error feedback.
 */
export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const userId = searchParams.get('userId');
    const secret = searchParams.get('secret');

    if (!userId || !secret) {
      setStatus('error');
      setErrorMessage('Invalid verification link. The URL is missing required parameters.');
      return;
    }

    const confirm = async () => {
      try {
        await verifyEmail(userId, secret);
        setStatus('success');
        // Redirect to dashboard after 3 seconds
        setTimeout(() => navigate('/dashboard'), 3000);
      } catch (err) {
        console.error('Email verification failed:', err);
        setStatus('error');
        setErrorMessage(
          err.message || 'Verification failed. The link may have expired. Please request a new one.'
        );
      }
    };

    confirm();
  }, []); // run once on mount

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-md text-center space-y-6">
        {status === 'verifying' && (
          <>
            <div className="flex justify-center">
              <Loader className="w-16 h-16 text-indigo-500 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold font-display tracking-tight">
              Verifying your email…
            </h2>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              Please wait while we confirm your email address.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="flex justify-center">
              <CheckCircle className="w-16 h-16 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold font-display tracking-tight text-emerald-600 dark:text-emerald-400">
              Email Verified!
            </h2>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              Your email address has been successfully verified. Redirecting you to the dashboard…
            </p>
            <Link
              to="/dashboard"
              className="inline-block mt-2 px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
            >
              Go to Dashboard
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="flex justify-center">
              <XCircle className="w-16 h-16 text-rose-500" />
            </div>
            <h2 className="text-2xl font-bold font-display tracking-tight text-rose-600 dark:text-rose-400">
              Verification Failed
            </h2>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              {errorMessage}
            </p>
            <div className="flex justify-center gap-4 pt-2">
              <Link
                to="/dashboard"
                className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
              >
                Go to Dashboard
              </Link>
              <Link
                to="/login"
                className="px-5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-sm font-semibold transition-colors"
              >
                Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
