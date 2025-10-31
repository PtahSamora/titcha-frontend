'use client';

import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import ButtonGradient from '@/components/ui/ButtonGradient';
import Link from 'next/link';

const plans = [
  {
    name: 'Free Tier',
    price: 'R0',
    period: '',
    description: 'Perfect for individual students exploring AI-powered learning',
    features: [
      'AI Chat Tutor (10 questions/day)',
      'Basic progress tracking',
      'OCR text extraction (5 pages/day)',
      'Access to CAPS curriculum',
      'Community support',
      'Mobile app access',
    ],
    cta: 'Start Free',
    href: '/register?plan=free',
    popular: false,
  },
  {
    name: 'Family Tier',
    price: 'R149',
    period: '/month',
    description: 'Perfect for parents with 2-5 kids learning together',
    features: [
      'Up to 5 student accounts',
      'Unlimited AI tutoring',
      'Full progress tracking & reports',
      'Unlimited OCR (100 pages/day)',
      'Parent dashboard & insights',
      'Homework tracking',
      'Email support',
      'Cancel anytime',
    ],
    cta: 'Get Started',
    href: '/register?plan=family',
    popular: true,
  },
  {
    name: 'School Tier',
    price: 'R2,499',
    period: '/month',
    description: 'Comprehensive solution for schools (up to 100 students)',
    features: [
      'Up to 100 student accounts',
      'Unlimited AI tutoring for all',
      'Teacher dashboard & analytics',
      'Unlimited OCR & documents',
      'Class management tools',
      'Progress reports & insights',
      'Priority email & phone support',
      'Training & onboarding included',
    ],
    cta: 'Contact Sales',
    href: '/contact?plan=school',
    popular: false,
  },
];

export default function PricingCards() {
  return (
    <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
      {plans.map((plan, index) => (
        <motion.div
          key={plan.name}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className={`relative bg-white rounded-2xl shadow-xl p-8 ${
            plan.popular ? 'ring-2 ring-purple-500 scale-105' : ''
          }`}
        >
          {plan.popular && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </span>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
            <p className="text-gray-600 text-sm">{plan.description}</p>
          </div>

          <div className="mb-6">
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
              {plan.period && <span className="text-gray-600">{plan.period}</span>}
            </div>
          </div>

          <ul className="space-y-4 mb-8">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>

          <Link href={plan.href}>
            <ButtonGradient
              variant={plan.popular ? 'primary' : 'outline'}
              className="w-full"
            >
              {plan.cta}
              <ArrowRight className="w-4 h-4" />
            </ButtonGradient>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
