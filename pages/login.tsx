// ...existing code...
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../lib/auth-context';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [generalError, setGeneralError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Interactive tilt effect
  const handleMouseMove = (e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = (x / rect.width) - 0.5;
    const py = (y / rect.height) - 0.5;
    const rotateX = (+py * 8).toFixed(2);
    const rotateY = (-px * 8).toFixed(2);
    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`;
  };

  const resetTilt = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)';
  };

  // Live validation helpers
  const validateField = (name: string, value: string) => {
    const fieldErrors: { [key: string]: string } = {};
    if (name === 'email') {
      if (!value.trim()) fieldErrors.email = 'Email is required';
      else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(value)) fieldErrors.email = 'Enter a valid email';
    }
    if (name === 'password') {
      if (!value) fieldErrors.password = 'Password is required';
      else if (value.length < 6) fieldErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(prev => ({ ...prev, ...fieldErrors }));
    if (!fieldErrors[name]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (generalError) setGeneralError('');
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    validateField(e.target.name, e.target.value);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(formData.email)) newErrors.email = 'Please enter a valid email address';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setGeneralError('');
    try {
      const res = await fetch('/api/auth?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        login(data.data.token, data.data.user);
        router.push('/');
      } else {
        setGeneralError(data.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setGeneralError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // small subtle entrance animation
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.opacity = '0';
    card.style.transform = 'translateY(12px)';
    requestAnimationFrame(() => {
      card.style.transition = 'opacity 420ms ease, transform 420ms cubic-bezier(.2,.9,.2,1)';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    });
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
      {/* subtle background shapes for depth */}
      <div className="absolute -top-28 -left-10 w-96 h-96 bg-gradient-to-tr from-slate-200 to-slate-300 opacity-25 rounded-full filter blur-3xl mix-blend-multiply pointer-events-none" />
      <div className="absolute -bottom-28 -right-8 w-80 h-80 bg-gradient-to-br from-indigo-50 to-slate-100 opacity-18 rounded-full filter blur-2xl mix-blend-multiply pointer-events-none" />

      <header className="relative z-10 py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-800 dark:bg-slate-200 rounded-full flex items-center justify-center text-white dark:text-slate-800 font-semibold">
              AN
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">AI Notes</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Smart note taking for professionals</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/register" className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 hover:shadow-sm transition">
              Register
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Left: Illustration + tagline */}
          <div className="hidden md:flex flex-col gap-6 pl-8">
            <div className="w-full">
              <svg viewBox="0 0 200 200" className="w-72 h-72 mx-auto" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="g" x1="0" x2="1">
                    <stop offset="0" stopColor="#334155" />
                    <stop offset="1" stopColor="#0f172a" />
                  </linearGradient>
                </defs>
                <rect x="10" y="10" width="180" height="180" rx="20" fill="url(#g)" opacity="0.06" />
                <g transform="translate(20 20)" fill="none" stroke="#334155" strokeWidth="1.6" opacity="0.9">
                  <rect x="10" y="12" width="120" height="30" rx="6" />
                  <rect x="10" y="52" width="150" height="70" rx="8" />
                  <circle cx="140" cy="28" r="5" fill="#94a3b8" stroke="none" />
                </g>
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Secure, fast and distraction-free</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Sign in to access AI summaries, fast search and your synced notes across devices.</p>
            </div>
          </div>

          {/* Right: Professional Card */}
          <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={resetTilt}
            className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8 border border-slate-100 dark:border-slate-800"
            style={{ transition: 'transform 200ms ease, box-shadow 200ms ease' }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">Welcome back</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Enter your credentials to continue</p>
              </div>

              {generalError && (
                <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800 rounded-md p-3">
                  <p className="text-sm text-rose-700 dark:text-rose-200">{generalError}</p>
                </div>
              )}

              {/* Floating label input: email */}
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`peer w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-transparent border ${errors.email ? 'border-rose-300 dark:border-rose-600' : 'border-transparent'}`}
                  placeholder="Email address"
                  autoComplete="email"
                />
                <label htmlFor="email" className="absolute left-4 top-3 text-sm text-slate-500 dark:text-slate-400 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:top-[-10px] peer-focus:text-xs peer-focus:text-slate-800 dark:peer-focus:text-slate-100">
                  Email address
                </label>
                {errors.email && <p className="mt-1 text-sm text-rose-600 dark:text-rose-400">{errors.email}</p>}
              </div>

              {/* Floating label input: password with visibility toggle */}
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`peer w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-transparent border ${errors.password ? 'border-rose-300 dark:border-rose-600' : 'border-transparent'}`}
                  placeholder="Password"
                  autoComplete="current-password"
                />
                <label htmlFor="password" className="absolute left-4 top-3 text-sm text-slate-500 dark:text-slate-400 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:top-[-10px] peer-focus:text-xs peer-focus:text-slate-800 dark:peer-focus:text-slate-100">
                  Password
                </label>

                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-3 text-sm text-slate-500 dark:text-slate-400 px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>

                {errors.password && <p className="mt-1 text-sm text-rose-600 dark:text-rose-400">{errors.password}</p>}
              </div>

              <div className="flex items-center justify-between">
                <label className="inline-flex items-center text-sm text-slate-600 dark:text-slate-400">
                  <input type="checkbox" className="form-checkbox h-4 w-4 text-slate-700" />
                  <span className="ml-2">Remember me</span>
                </label>
                <Link href="/forgot" className="text-sm text-slate-700 dark:text-slate-300">Forgot?</Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-medium rounded-lg transition disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    Signing in...
                  </>
                ) : (
                  <>Sign in</>
                )}
              </button>

              <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                Don't have an account?{' '}
                <Link href="/register" className="text-slate-800 dark:text-slate-200 font-medium">Register</Link>
              </p>
            </form>
          </div>
        </div>
      </main>

      <style jsx>{`
        .animate-blob {
          animation: blob 10s infinite;
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(20px, -16px) scale(1.03); }
          66% { transform: translate(-16px, 18px) scale(0.98); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        /* floating label visual tweak */
        input:focus + label, input:not(:placeholder-shown) + label {
          transform: translateY(-12px) scale(0.92);
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
// ...existing code...
