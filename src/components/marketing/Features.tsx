'use client';

import { motion } from 'framer-motion';
import { Brain, Users, TrendingUp, Shield, Zap, Globe } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI-Assisted Study',
    description: 'Personalized learning paths powered by advanced AI that adapts to each student\'s pace and style.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Users,
    title: 'Teacher-Driven Insights',
    description: 'Empower educators with real-time analytics and AI-generated teaching recommendations.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: TrendingUp,
    title: 'Real-Time Progress Tracking',
    description: 'Parents and schools get instant updates on student progress and achievements.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Shield,
    title: 'Secure & Compliant',
    description: 'Enterprise-grade security with full FERPA and GDPR compliance for student data.',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: Zap,
    title: 'Instant AI Feedback',
    description: 'Students get immediate feedback on assignments through automated AI grading.',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Globe,
    title: 'Multi-Language Support',
    description: 'Support for 50+ languages to make education accessible globally.',
    color: 'from-indigo-500 to-purple-500',
  },
];

export default function Features() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Everything you need for modern education
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A comprehensive platform designed for students, parents, and schools to collaborate and succeed.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group p-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              <div className={`w-16 h-16 mb-6 rounded-xl bg-gradient-to-br ${feature.color} p-4 shadow-lg group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-full h-full text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
