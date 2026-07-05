import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, AlertCircle, Calendar } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card, { CardBody } from '../components/common/Card';
import PasswordStrengthBar from '../components/auth/PasswordStrengthBar';

export const SignupPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gradYear, setGradYear] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Validation States
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    setGlobalError('');

    if (!name.trim()) newErrors.name = 'Full Name is required';
    
    if (!email.trim()) {
      newErrors.email = 'College Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!gradYear.trim()) {
      newErrors.gradYear = 'Graduation Year is required';
    } else {
      const year = parseInt(gradYear, 10);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1900 || year > currentYear + 10) {
        newErrors.gradYear = 'Please enter a valid graduation year';
      }
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await register(email, password, name, gradYear);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setGlobalError(err.message || 'Registration failed. Please verify your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border border-slate-200/80 dark:border-slate-800 overflow-hidden">
          {/* Gradient top strip */}
          <div className="h-1 w-full bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-500" />
          <CardBody className="space-y-5 p-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold tracking-tight font-display bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent mb-1.5">
                Create Account
              </h2>
              <p className="text-sm text-slate-500 font-medium">
                Join the AlumniConnect professional community
              </p>
            </div>

            {globalError && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/30 text-sm font-medium">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{globalError}</span>
              </div>
            )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              id="name"
              type="text"
              placeholder="Alex Johnson"
              icon={User}
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
            />

            <Input
              label="College Email Address"
              id="email"
              type="email"
              placeholder="20xx056@nitjsr.ac.in"
              icon={Mail}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />

            <Input
              label="Graduation Year"
              id="gradYear"
              type="number"
              placeholder="e.g. 2027"
              icon={Calendar}
              required
              value={gradYear}
              onChange={(e) => setGradYear(e.target.value)}
              error={errors.gradYear}
            />

            <div>
              <Input
                label="Password"
                id="password"
                type="password"
                placeholder="••••••••"
                icon={Lock}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
              />
              <PasswordStrengthBar password={password} />
            </div>

            <Input
              label="Confirm Password"
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-4"
              isLoading={isLoading}
              icon={UserPlus}
            >
              Register Account
            </Button>
          </form>

            <p className="text-center text-sm text-slate-500 font-medium">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-violet-600 dark:text-violet-400 hover:underline"
              >
                Sign In
              </Link>
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default SignupPage;
