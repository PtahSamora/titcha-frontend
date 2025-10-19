'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, School, AlertCircle, Check } from 'lucide-react';
import Link from 'next/link';
import ButtonGradient from '@/components/ui/ButtonGradient';

const roles = [
  { id: 'student', label: 'Student', icon: User, description: 'Individual learner' },
  { id: 'parent', label: 'Parent', icon: User, description: 'Monitor child progress' },
  { id: 'teacher', label: 'Teacher', icon: School, description: 'Manage classes' },
  { id: 'school', label: 'School Admin', icon: School, description: 'School-wide management' },
];

// Loading fallback component
function RegisterLoading() {
  return (
    <div className="min-h-screen bg-gradient-brand flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-heading bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
            Titcha
          </h1>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planFromUrl = searchParams.get('plan') || 'free';

  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState('student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Map old register API to new role-specific endpoints
      const roleEndpoints: Record<string, string> = {
        student: '/api/register/student',
        parent: '/api/register/parent',
        teacher: '/api/register/teacher',
        school: '/api/register/school',
      };

      const endpoint = roleEndpoints[selectedRole];
      if (!endpoint) {
        setError('Invalid role selected');
        setLoading(false);
        return;
      }

      // Build request payload based on role
      const payload: any = {
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        fullName: formData.name,
      };

      // Add role-specific fields (simplified - using defaults)
      if (selectedRole === 'student') {
        payload.schoolId = 'school-1'; // Use first seed school
        payload.grade = 'Grade 10'; // Default grade
      } else if (selectedRole === 'teacher') {
        payload.schoolId = 'school-1';
        payload.subjects = ['General']; // Default subject
      } else if (selectedRole === 'school') {
        payload.schoolName = formData.name;
        payload.adminName = formData.name;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.user) {
        // Auto sign in after successful registration
        const { signIn } = await import('next-auth/react');
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.ok) {
          // Redirect to role-based dashboard
          const { redirectByRole } = await import('@/lib/redirectByRole');
          const redirectUrl = redirectByRole(data.user.role);
          router.push(redirectUrl);
        } else {
          // Registration succeeded but auto-login failed - redirect to login
          router.push('/login?registered=true');
        }
      } else {
        // Show exact server error message
        setError(data.error || data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h2>
          <p className="text-gray-600">Join thousands of learners transforming education with AI</p>
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
              <span className="ml-2 text-sm font-medium text-gray-700">Account Details</span>
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
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

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

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="w-4 h-4 mt-1 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                    I agree to the{' '}
                    <Link href="/terms" className="text-purple-600 hover:text-purple-700">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-purple-600 hover:text-purple-700">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <ButtonGradient
                  type="submit"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                  <UserPlus className="w-4 h-4" />
                </ButtonGradient>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/login" className="text-purple-600 font-semibold hover:text-purple-700">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// Wrapper component with Suspense boundary
export default function RegisterPageWrapper() {
  return (
    <Suspense fallback={<RegisterLoading />}>
      <RegisterPage />
    </Suspense>
  );
}
