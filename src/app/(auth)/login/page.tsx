'use client';

import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, AlertCircle, Loader2, User, School, Check } from 'lucide-react';
import Link from 'next/link';
import ButtonGradient from '@/components/ui/ButtonGradient';
import PasswordField from '@/components/forms/PasswordField';

const roles = [
  { id: 'student', label: 'Student', icon: User, description: 'Individual learner' },
  { id: 'parent', label: 'Parent', icon: User, description: 'Monitor child progress' },
  { id: 'teacher', label: 'Teacher', icon: School, description: 'Manage classes' },
  { id: 'school', label: 'School Admin', icon: School, description: 'School-wide management' },
];

export default function LoginPage() {
  const { status } = useSession();
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState('student');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Use redirect: false to handle errors properly
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        selectedRole: selectedRole,
        redirect: false,
      });

      if (result?.error) {
        const errorMessage = result.error || 'Authentication failed. Please try again.';
        console.error('[Login] Sign in error:', errorMessage);
        setError(errorMessage);
        setLoading(false);
      } else if (result?.ok) {
        console.log('[Login] Sign in successful, redirecting to portal');

        // Keep loading state true to prevent form re-render
        // Add a small delay to ensure session cookie is properly set
        // before navigation begins
        await new Promise(resolve => setTimeout(resolve, 100));

        // Use full page reload to ensure cookie is sent with navigation request
        window.location.href = '/portal';
      } else {
        // Handle case where result exists but is neither ok nor error
        console.error('[Login] Unexpected result:', result);
        setError('Authentication failed. Please check your credentials and try again.');
        setLoading(false);
      }
    } catch (error) {
      console.error('[Login] Sign in error:', error);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Show loading state while checking authentication
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-brand flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-sm text-gray-600">
            {loading ? 'Signing in...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-brand flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <h1 className="text-4xl font-bold font-heading bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Titcha
            </h1>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Sign in to continue your learning journey</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                {step > 1 ? <Check className="w-5 h-5" /> : '1'}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">Select Role</span>
            </div>
            <div className={`w-16 h-0.5 ${step >= 2 ? 'bg-purple-600' : 'bg-gray-200'}`} />
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">Sign In</span>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          {step === 1 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">I am a...</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {roles.map((role) => (
                  <motion.button
                    key={role.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleRoleSelect(role.id)}
                    className={`p-6 border-2 rounded-xl text-left transition-all ${
                      selectedRole === role.id
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <role.icon className="w-8 h-8 text-purple-600 mb-3" />
                    <h4 className="font-bold text-gray-900 mb-1">{role.label}</h4>
                    <p className="text-sm text-gray-600">{role.description}</p>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <button
                onClick={() => setStep(1)}
                className="mb-6 text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                ← Change Role
              </button>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <PasswordField
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-purple-600 hover:text-purple-700">
                Forgot password?
              </Link>
            </div>

            <ButtonGradient
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <LogIn className="w-4 h-4" />
                </>
              )}
            </ButtonGradient>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/register" className="text-purple-600 font-semibold hover:text-purple-700">
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-sm font-medium">Google</span>
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.137 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              <span className="text-sm font-medium">GitHub</span>
            </button>
          </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
