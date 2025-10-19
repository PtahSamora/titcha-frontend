'use client';

import { motion } from 'framer-motion';
import SectionTitle from '@/components/ui/SectionTitle';
import PricingCards from '@/components/marketing/PricingCards';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-brand">
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold font-heading mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-purple-100">
              Choose the perfect plan for your needs. All plans include a 30-day free trial.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <PricingCards />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <SectionTitle
            title="Frequently Asked Questions"
            subtitle="Everything you need to know about our pricing"
          />

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                q: 'Can I switch plans later?',
                a: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and billing is prorated.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards, PayPal, and wire transfers for annual subscriptions.',
              },
              {
                q: 'Is there a setup fee?',
                a: 'No setup fees, ever. What you see is what you pay.',
              },
              {
                q: 'What happens after my free trial?',
                a: 'Your trial automatically converts to the plan you selected. You can cancel anytime before the trial ends without being charged.',
              },
              {
                q: 'Do you offer discounts for non-profits?',
                a: 'Yes! We offer special pricing for non-profit organizations and educational institutions. Contact our sales team for details.',
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
