'use client';

import { motion } from 'framer-motion';
import {
  MessageSquare,
  ScanText,
  FileText,
  BarChart3,
  BookOpen,
  Users,
  Shield,
  Globe,
  Sparkles,
  Target,
  TrendingUp,
  Clock
} from 'lucide-react';
import SectionTitle from '@/components/ui/SectionTitle';
import ButtonGradient from '@/components/ui/ButtonGradient';
import Link from 'next/link';

const features = [
  {
    icon: MessageSquare,
    title: 'AI Chat Tutor',
    description: 'Get instant help from your personal AI tutor, available 24/7 to answer questions and explain concepts.',
    benefits: [
      'Adaptive learning that adjusts to your pace',
      'Unlimited questions across all subjects',
      'Step-by-step explanations',
      'Multi-language support',
    ],
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: ScanText,
    title: 'OCR-Powered Grading',
    description: 'Upload handwritten assignments and get instant AI-powered feedback with detailed explanations.',
    benefits: [
      'Supports handwritten and typed text',
      'Instant feedback on assignments',
      'Detailed error explanations',
      'Progress tracking over time',
    ],
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: FileText,
    title: 'Personalized Notes',
    description: 'AI generates customized study notes tailored to your learning style and curriculum.',
    benefits: [
      'Auto-generated from lessons',
      'Highlights key concepts',
      'Exportable to PDF',
      'Searchable knowledge base',
    ],
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: BarChart3,
    title: 'School Insights',
    description: 'Comprehensive analytics dashboard for educators to track student progress and identify learning gaps.',
    benefits: [
      'Real-time performance metrics',
      'Class-wide trend analysis',
      'Individual student reports',
      'Predictive analytics',
    ],
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: BookOpen,
    title: 'Adaptive Learning Paths',
    description: 'Curriculum dynamically adjusts based on student performance and learning preferences.',
    benefits: [
      'Personalized lesson sequences',
      'Difficulty auto-adjustment',
      'Knowledge gap identification',
      'Mastery-based progression',
    ],
    color: 'from-purple-500 to-indigo-500',
  },
  {
    icon: Users,
    title: 'Parent Portal',
    description: 'Parents get real-time visibility into their children\'s academic progress and engagement.',
    benefits: [
      'Live progress updates',
      'Assignment notifications',
      'Direct teacher communication',
      'Weekly summary reports',
    ],
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-level encryption and full FERPA/GDPR compliance to protect student data.',
    benefits: [
      'End-to-end encryption',
      'Role-based access control',
      'Audit logging',
      'SOC 2 Type II certified',
    ],
    color: 'from-gray-700 to-gray-900',
  },
  {
    icon: Globe,
    title: 'Multi-Language Support',
    description: 'Learn in your native language with support for 50+ languages worldwide.',
    benefits: [
      'Auto-translation of content',
      'Localized UI',
      'Culturally adapted examples',
      'Native speaker AI tutors',
    ],
    color: 'from-teal-500 to-cyan-500',
  },
  {
    icon: Sparkles,
    title: 'AI Essay Assistant',
    description: 'Get writing suggestions, grammar corrections, and structural feedback on essays.',
    benefits: [
      'Real-time grammar checking',
      'Style improvements',
      'Plagiarism detection',
      'Citation assistance',
    ],
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Target,
    title: 'Goal Setting & Tracking',
    description: 'Set academic goals and track progress with AI-powered recommendations.',
    benefits: [
      'SMART goal templates',
      'Progress milestones',
      'Achievement badges',
      'Motivational insights',
    ],
    color: 'from-indigo-500 to-purple-500',
  },
  {
    icon: TrendingUp,
    title: 'Predictive Analytics',
    description: 'AI forecasts student performance and recommends interventions before students fall behind.',
    benefits: [
      'Early warning system',
      'At-risk student identification',
      'Intervention recommendations',
      'Success probability modeling',
    ],
    color: 'from-green-500 to-teal-500',
  },
  {
    icon: Clock,
    title: 'Study Time Optimizer',
    description: 'AI analyzes your schedule and suggests optimal study times for maximum retention.',
    benefits: [
      'Personalized study schedules',
      'Break reminders',
      'Focus time tracking',
      'Productivity insights',
    ],
    color: 'from-blue-500 to-purple-500',
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-brand">
      {/* Hero */}
      <section className="py-24 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold font-heading mb-6">
              Powerful Features for Modern Education
            </h1>
            <p className="text-xl md:text-2xl text-purple-100 mb-8">
              Everything you need to transform learning, teaching, and school administration—all in one platform.
            </p>
            <Link href="/register">
              <ButtonGradient variant="secondary" size="lg">
                Start Free Trial
              </ButtonGradient>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <SectionTitle
            title="All-in-One Education Platform"
            subtitle="Comprehensive tools for students, teachers, parents, and administrators"
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all group"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-6">{feature.description}</p>

                <ul className="space-y-2">
                  {feature.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center text-white"
          >
            <h2 className="text-4xl md:text-5xl font-bold font-heading mb-6">
              Ready to transform your learning experience?
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              Join thousands of students and schools already using Titcha to achieve better outcomes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <ButtonGradient variant="secondary" size="lg">
                  Get Started Free
                </ButtonGradient>
              </Link>
              <Link href="/pricing">
                <button className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-semibold text-lg hover:bg-white hover:text-purple-600 transition-all">
                  View Pricing
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
