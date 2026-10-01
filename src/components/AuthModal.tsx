import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Phone, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useLMS } from '../context/LMSContext';
import { BrandLogo } from './BrandLogo';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register' | 'reset';
  returnCourseTitle?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  returnCourseTitle,
  onClose,
  onSuccess,
}) => {
  const {
    settings,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    resetPassword,
  } = useLMS();

  const [mode, setMode] = useState<'login' | 'register' | 'reset'>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  if (!isOpen) return null;

  const evaluatePasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = evaluatePasswordStrength(password);

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setInfoMsg('');
    setLoading(true);
    try {
      await loginWithGoogle();
      onSuccess();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Google sign-in could not complete.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (mode === 'reset') {
      if (!email.trim()) {
        setErrorMsg('Please enter your registered email address.');
        return;
      }
      setLoading(true);
      try {
        await resetPassword(email);
        setInfoMsg('Password reset instructions have been sent to your email address.');
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Failed to send reset email.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (mode === 'register') {
      if (!fullName.trim()) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      if (password.length < 8) {
        setErrorMsg('Password must be at least 8 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }
      if (!acceptedTerms) {
        setErrorMsg('Please accept the Terms of Service and Privacy Policy to register.');
        return;
      }

      setLoading(true);
      try {
        await registerWithEmail(fullName, email, password, phone);
        setInfoMsg(
          'Account created! A verification link has been sent to your email. Please verify your email or sign in with Google for instant verified access.'
        );
        onSuccess();
      } catch (err) {
        const raw = err instanceof Error ? err.message : String(err);
        if (raw.includes('operation-not-allowed')) {
          setErrorMsg(
            'Email/Password registration requires enabling the Email/Password provider in your Firebase Console (Authentication → Sign-in method). You can sign in immediately using "Continue with Google" above.'
          );
        } else {
          setErrorMsg(raw);
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    // Login mode
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      onSuccess();
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err);
      if (raw.includes('operation-not-allowed')) {
        setErrorMsg(
          'Email/Password sign-in requires enabling the Email/Password provider in your Firebase Console. Please use "Continue with Google" above for immediate verified access.'
        );
      } else {
        setErrorMsg('Invalid email or password. Please try again or use Google Sign-In.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/60 p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 shadow-sm my-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close authentication modal"
          className="absolute top-4 right-4 w-9 h-9 rounded-lg flex items-center justify-center text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <BrandLogo brandName={settings.brandName} logoUrl={settings.logoUrl} />
          <h2 className="text-xl font-bold text-[#0F172A] mt-4">
            {mode === 'login'
              ? 'Sign in to your account'
              : mode === 'register'
              ? 'Create your student account'
              : 'Reset your password'}
          </h2>
          {returnCourseTitle ? (
            <p className="text-xs text-[#2563EB] font-medium mt-1">
              Continue to enroll in: {returnCourseTitle}
            </p>
          ) : (
            <p className="text-sm text-[#475569] mt-1">
              Access your courses, track progress, and earn verifiable certificates.
            </p>
          )}
        </div>

        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-lg bg-[#DC2626]/5 border border-[#DC2626]/20 flex items-start gap-2.5 text-xs text-[#DC2626]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {infoMsg && (
          <div className="mb-4 p-3.5 rounded-lg bg-[#16A34A]/5 border border-[#16A34A]/20 flex items-start gap-2.5 text-xs text-[#16A34A]">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{infoMsg}</span>
          </div>
        )}

        {mode !== 'reset' && (
          <div className="mb-5">
            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleSignIn}
              className="w-full py-2.5 px-4 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0F172A] font-semibold text-sm rounded-lg flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continue with Google (Instant Verified)</span>
            </button>

            <div className="relative my-5 flex items-center justify-center">
              <div className="border-t border-[#E2E8F0] w-full" />
              <span className="bg-white px-3 text-xs text-[#475569] whitespace-nowrap">
                or continue with email
              </span>
              <div className="border-t border-[#E2E8F0] w-full" />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-[#0F172A] mb-1">
                Full Name (as it will appear on your Certificate) *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#475569] absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Daniel Owino"
                  className="w-full pl-9 pr-3.5 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#0F172A] mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#475569] absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-3.5 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-[#0F172A] mb-1">
                Phone / WhatsApp Number (Optional)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#475569] absolute left-3 top-3" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0708083643"
                  className="w-full pl-9 pr-3.5 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>
          )}

          {mode !== 'reset' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-[#0F172A]">Password *</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('reset')}
                    className="text-xs text-[#2563EB] hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#475569] absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full pl-9 pr-3.5 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB]"
                />
              </div>
              {mode === 'register' && password.length > 0 && (
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        strength <= 1
                          ? 'w-1/4 bg-[#DC2626]'
                          : strength === 2
                          ? 'w-2/4 bg-[#D97706]'
                          : strength === 3
                          ? 'w-3/4 bg-[#2563EB]'
                          : 'w-full bg-[#16A34A]'
                      }`}
                    />
                  </div>
                  <span className="text-[11px] text-[#475569]">
                    {strength <= 1 ? 'Weak' : strength === 2 ? 'Fair' : strength === 3 ? 'Good' : 'Strong'}
                  </span>
                </div>
              )}
            </div>
          )}

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-medium text-[#0F172A] mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#475569] absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full pl-9 pr-3.5 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <label className="flex items-start gap-2.5 text-xs text-[#475569] cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 rounded border-[#E2E8F0] text-[#2563EB]"
                />
                <span>
                  I agree to the {settings.brandName} Terms of Service and Privacy Policy.
                </span>
              </label>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white font-semibold text-sm rounded-lg transition-colors cursor-pointer"
          >
            {loading
              ? 'Processing...'
              : mode === 'login'
              ? 'Sign In'
              : mode === 'register'
              ? 'Create Account & Continue'
              : 'Send Password Reset Link'}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-[#E2E8F0] text-center text-xs text-[#475569]">
          {mode === 'login' ? (
            <>
              New to {settings.brandName}?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg('');
                }}
                className="font-semibold text-[#2563EB] hover:underline"
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                }}
                className="font-semibold text-[#2563EB] hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
