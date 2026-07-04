import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Users, Briefcase, MessageSquareCode } from 'lucide-react';
import Button from '../components/common/Button';
import Card, { CardBody } from '../components/common/Card';

export const LandingPage = () => {
  return (
    <div className="relative overflow-hidden py-12 sm:py-16 lg:py-24">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -z-10 h-150 w-250 -translate-x-1/2 mask-[radial-gradient(100%_100%_at_top_center,white,transparent)]" aria-hidden="true">
        <div className="absolute inset-0 bg-linear-to-r from-violet-600/10 to-indigo-600/10 dark:from-violet-500/20 dark:to-indigo-500/20 blur-[80px]" />
      </div>

      <div className="flex flex-col items-center text-center">
        {/* Banner Announcement */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-200/50 dark:border-indigo-800/40 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-8 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          Powered by Gemini 2.5 & Appwrite
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl max-w-4xl font-display leading-[1.1] mb-6">
          Bridge the Gap Between <span className="text-gradient">Students</span> & <span className="text-gradient">Alumni</span>
        </h1>

        {/* Hero Paragraph */}
        <p className="max-w-2xl text-lg sm:text-xl text-gray-700 dark:text-gray-300 mb-10 leading-relaxed font-sans">
          Welcome to <span className="font-semibold text-zinc-900 dark:text-white">AlumniConnect</span>, a premium networking ecosystem providing AI-guided mentorship, career advice, direct messaging, and curated career opportunities.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-20">
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
        </div>

        {/* Feature Cards Grid */}
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6 text-left px-4">
          <Card isHoverable className="transition-all duration-300">
            <CardBody>
              <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center text-violet-650 dark:text-violet-400 mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-display mb-2">Alumni Directory</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                Connect with graduates in your field, search by industry, current company, or location, and requests mentorship sessions.
              </p>
            </CardBody>
          </Card>

          <Card isHoverable className="transition-all duration-300">
            <CardBody>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-650 dark:text-indigo-400 mb-6">
                <MessageSquareCode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-display mb-2">AI Career Advisor</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                Receive smart career roadmap planning, resume check-ups, and interactive mock interviews with Gemini-based assistance.
              </p>
            </CardBody>
          </Card>

          <Card isHoverable className="transition-all duration-300">
            <CardBody>
              <div className="w-12 h-12 rounded-xl bg-pink-50 dark:bg-pink-950/30 flex items-center justify-center text-pink-650 dark:text-pink-400 mb-6">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-display mb-2">Opportunity Board</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                Discover job posts, internships, and mentoring roles shared directly by alumni working in the industry.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
