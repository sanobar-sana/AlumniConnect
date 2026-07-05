import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Users, Briefcase, MessageSquareCode } from 'lucide-react';
import Button from '../components/common/Button';
import Card, { CardBody } from '../components/common/Card';
import { motion } from 'framer-motion';

export const LandingPage = () => {
  const features = [
    {
      icon: Users,
      title: 'Alumni Directory',
      desc: 'Connect with graduates in your field, search by industry, company, or location, and request mentorship sessions.',
      iconBg: 'bg-violet-50 dark:bg-violet-950/30',
      iconColor: 'text-violet-600 dark:text-violet-400',
    },
    {
      icon: MessageSquareCode,
      title: 'AI Career Advisor',
      desc: 'Receive smart career roadmap planning, resume check-ups, and interactive mock interviews with Gemini AI.',
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/30',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      icon: Briefcase,
      title: 'Opportunity Board',
      desc: 'Discover job posts, internships, and mentoring roles shared directly by alumni working in the industry.',
      iconBg: 'bg-pink-50 dark:bg-pink-950/30',
      iconColor: 'text-pink-500 dark:text-pink-400',
    },
  ];

  return (
    <div className="relative overflow-hidden py-16 sm:py-20 lg:py-28">
      {/* Soft background blobs */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-r from-violet-400/10 to-indigo-400/10 dark:from-violet-500/10 dark:to-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-pink-400/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="flex flex-col items-center text-center">

        {/* Announcement pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-violet-200/60 dark:border-violet-800/40 bg-violet-50/80 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400 text-xs font-bold mb-8 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Powered by Gemini 2.5 &amp; Appwrite
        </motion.div>

        {/* Hero headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="text-4xl font-extrabold tracking-tight sm:text-6xl max-w-4xl font-display leading-[1.1] mb-6 text-slate-900 dark:text-white"
        >
          Bridge the Gap Between{' '}
          <span className="text-gradient">Students</span>{' '}
          &amp;{' '}
          <span className="text-gradient">Alumni</span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16 }}
          className="max-w-2xl text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed font-medium"
        >
          Welcome to{' '}
          <span className="font-bold text-slate-900 dark:text-white">AlumniConnect</span>
          , a premium networking ecosystem providing AI-guided mentorship, career advice, direct messaging, and curated career opportunities.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.24 }}
          className="flex flex-col sm:flex-row gap-3 mb-24"
        >
          <Link to="/register">
            <Button variant="primary" size="lg" icon={ArrowRight} className="w-full sm:w-auto">
              Join the Network
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Sign In
            </Button>
          </Link>
        </motion.div>

        {/* Feature cards */}
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6 text-left px-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.32 + i * 0.1 }}
              >
                <Card isHoverable className="h-full">
                  <CardBody className="p-7">
                    <div className={`w-11 h-11 rounded-xl ${f.iconBg} flex items-center justify-center ${f.iconColor} mb-5`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium">{f.desc}</p>
                  </CardBody>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
