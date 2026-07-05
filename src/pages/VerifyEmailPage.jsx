import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import Card, { CardBody } from '../components/common/Card';
import { motion } from 'framer-motion';

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
      <div className="w-full max-w-md">
        <Card className="shadow-lg border border-slate-200/80 dark:border-slate-800 overflow-hidden">
          {/* Top gradient strip */}
          <div className="h-1.5 w-full bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-500" />
          <CardBody className="p-8 text-center space-y-6">
            {status === 'verifying' && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-4"
              >
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center">
                    <Loader className="w-8 h-8 text-violet-600 animate-spin" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold font-display tracking-tight text-slate-900 dark:text-white">
                  Verifying your email…
                </h2>
                <p className="text-slate-500 font-medium text-sm leading-relaxed">
                  Please wait while we confirm your email address.
                </p>
              </motion.div>
            )}

            {status === 'success' && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-4"
              >
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold font-display tracking-tight text-emerald-600 dark:text-emerald-400">
                  Email Verified!
                </h2>
                <p className="text-slate-500 font-medium text-sm leading-relaxed">
                  Your email address has been successfully verified. Redirecting you to the dashboard…
                </p>
                <div className="pt-2">
                  <Link
                    to="/dashboard"
                    className="inline-block px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-bold shadow-md shadow-violet-500/25 transition-all hover:-translate-y-px"
                  >
                    Go to Dashboard
                  </Link>
                </div>
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-4"
              >
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center">
                    <XCircle className="w-8 h-8 text-rose-500" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold font-display tracking-tight text-rose-600 dark:text-rose-450">
                  Verification Failed
                </h2>
                <p className="text-slate-500 font-medium text-sm leading-relaxed">
                  {errorMessage}
                </p>
                <div className="flex justify-center gap-3 pt-4">
                  <Link
                    to="/dashboard"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-bold shadow-md shadow-violet-500/25 transition-all hover:-translate-y-px"
                  >
                    Go to Dashboard
                  </Link>
                  <Link
                    to="/login"
                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 text-sm font-bold transition-all"
                  >
                    Sign In
                  </Link>
                </div>
              </motion.div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
