'use client';

import { motion } from 'framer-motion';
import { Target, Heart, Zap, Users, Globe, Shield } from 'lucide-react';
import SectionTitle from '@/components/ui/SectionTitle';

const values = [
  {
    icon: Target,
    title: 'Student-Centered',
    description: 'Every decision we make puts the learner first, ensuring personalized and effective education.',
  },
  {
    icon: Heart,
    title: 'Inclusive Access',
    description: 'Education is a right, not a privilege. We make AI-powered learning accessible to all.',
  },
  {
    icon: Zap,
    title: 'Innovation',
    description: 'We constantly push boundaries with cutting-edge AI to transform how students learn.',
  },
  {
    icon: Users,
    title: 'Collaboration',
    description: 'We believe in the power of community, connecting students, parents, and educators.',
  },
  {
    icon: Globe,
    title: 'Global Impact',
    description: 'Supporting 50+ languages, we empower learners across cultures and continents.',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'Student data security is paramount. We exceed FERPA and GDPR compliance standards.',
  },
];

const team = [
  {
    name: 'Vuyile Sixaba',
    role: 'Founder',
    bio: 'AI Engineer passionate about making learning a shared journey between home and school.',
    image: '/team/vuyile.jpg',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-brand">
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold font-heading mb-6">
              Empowering Every Learner, Everywhere
            </h1>
            <p className="text-xl md:text-2xl text-purple-100">
              We're on a mission to democratize education through AI, making personalized learning accessible to students worldwide.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <SectionTitle title="Our Story" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-12">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Titcha began with a simple belief — that learning works best when parents, teachers, and technology come together to guide each child's journey.
                Built by educators and technologists, Titcha was created to help parents stay truly involved in their child's education — not just as observers, but as active partners.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                On Titcha, parents don't just watch their children learn — they guide the journey. They can set challenges, choose what to focus on, and track how their children progress,
                all within the structure teachers have already laid out. Every activity follows the school's curriculum, so parents can trust that what happens at home strengthens what's taught in class.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                With Titcha's AI tutor offering gentle guidance and instant feedback, learning becomes a shared experience — one where children grow in confidence, teachers stay supported,
                and parents feel truly connected.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 shadow-lg"
            >
              <h3 className="text-3xl font-bold font-heading text-gray-900 mb-4">Our Mission</h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                To revolutionize education by providing every student with a personalized AI-powered learning experience
                that adapts to their unique pace, style, and goals—empowering them to reach their full potential.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 shadow-lg"
            >
              <h3 className="text-3xl font-bold font-heading text-gray-900 mb-4">Our Vision</h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                A world where quality education is accessible to all, where AI amplifies human teachers rather than replacing them,
                and where every student has the tools to succeed in an ever-changing world.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <SectionTitle
            title="Our Core Values"
            subtitle="The principles that guide everything we do"
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h4>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <SectionTitle
            title="Meet the Founder"
            subtitle="Building technology that brings families and schools closer together"
          />
          <div className="flex justify-center max-w-6xl mx-auto">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center max-w-md"
              >
                <div className="mb-6 relative group">
                  <div className="w-56 h-56 mx-auto rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-6xl font-bold group-hover:scale-105 transition-transform shadow-2xl">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-2">{member.name}</h4>
                <p className="text-purple-600 font-semibold mb-3 text-lg">{member.role}</p>
                <p className="text-gray-600 text-base leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto text-center">
            {[
              { number: '500+', label: 'Schools' },
              { number: '100K+', label: 'Students' },
              { number: '30', label: 'Countries' },
              { number: '50+', label: 'Languages' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-5xl md:text-6xl font-bold font-heading mb-2">{stat.number}</div>
                <div className="text-purple-100 text-lg">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
