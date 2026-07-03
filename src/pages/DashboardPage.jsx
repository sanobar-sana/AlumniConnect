import React from 'react';
import useAuth from '../hooks/useAuth';
import Card, { CardBody, CardHeader } from '../components/common/Card';
import Button from '../components/common/Button';
import { Users, Briefcase, Sparkles, MessageSquare, ArrowRight, TrendingUp, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage = () => {
  const { user, profile } = useAuth();

  const isAlumni = profile?.role === 'alumni';

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-indigo-200/30 dark:border-indigo-950/40 bg-linear-to-r from-violet-600/10 via-indigo-600/5 to-pink-500/5 dark:from-violet-950/20 dark:via-indigo-950/10 dark:to-pink-950/5 p-8 sm:p-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-4">
            {isAlumni ? 'Alumni Partner' : 'Student Member'}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display mb-3">
            Welcome back, {profile?.name || user?.name}!
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
            {isAlumni
              ? 'Thank you for contributing your expertise. Share opportunities, respond to connection queries, or review resume feedback requests to guide the next generation.'
              : 'Grow your network, discover internships or jobs, and talk to your AI assistant to draft connection letters or practice interview questions.'}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to={isAlumni ? "/opportunities" : "/alumni"}>
              <Button variant="primary" size="md">
                {isAlumni ? 'Post an Opportunity' : 'Browse Alumni'}
              </Button>
            </Link>
            <Link to="/ai-advisor">
              <Button variant="outline" size="md" icon={Sparkles}>
                Consult AI Advisor
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Grid of Key Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Connections', count: '12', icon: Users, change: '+2 new requests', color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/20' },
          { label: 'Opportunities', count: '28', icon: Briefcase, change: '5 posted today', color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20' },
          { label: 'AI Advisory Chats', count: '8', icon: Sparkles, change: '100% tokens left', color: 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/20' },
          { label: 'Active Mentors', count: '3', icon: MessageSquare, change: 'Next session Tue', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="transition-all duration-350 hover:shadow-md border border-zinc-200 dark:border-zinc-800">
              <CardBody className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{stat.label}</p>
                  <h3 className="text-2xl font-bold tracking-tight mt-0.5">{stat.count}</h3>
                  <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                    {stat.change}
                  </p>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Bottom Content Partition */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activities */}
        <Card className="lg:col-span-2 border border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <h3 className="font-bold text-lg font-display">Recent Network Updates</h3>
          </CardHeader>
          <CardBody className="p-0">
            <div className="divide-y divide-zinc-200/50 dark:divide-zinc-800/50">
              {[
                { title: 'Mentorship Request Accepted', desc: 'Sarah Jenkins (Senior Frontend Engineer at Google) accepted your connection request.', time: '2 hours ago' },
                { title: 'New Job Opportunity Posted', desc: 'Internship role at Stripe posted by alumnus Marcus Lin.', time: '1 day ago' },
                { title: 'Resume Review Ready', desc: 'Gemini Career Advisor updated feedback report for resume_v2.pdf.', time: '2 days ago' },
              ].map((activity, idx) => (
                <div key={idx} className="p-5 flex gap-3 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-colors">
                  <div className="h-2 w-2 rounded-full bg-indigo-500 mt-2 shrink-0" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-4">
                      <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{activity.title}</h4>
                      <span className="text-xs text-zinc-400 whitespace-nowrap">{activity.time}</span>
                    </div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{activity.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Gemini Tips */}
        <Card isGlass className="h-full flex flex-col justify-between border border-zinc-200 dark:border-zinc-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl -z-10" />
          <CardBody className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <h4 className="font-bold font-display text-sm uppercase tracking-wider">Mentoring Tip of the Day</h4>
            </div>
            <p className="text-sm text-zinc-650 dark:text-zinc-300 leading-relaxed italic">
              "When reaching out to alumni, lead with curiosity. Instead of asking for a job referral directly, ask for 15 minutes to learn about their career journey and how they transitioned from university to their current role."
            </p>
            <div className="border-t border-zinc-200 dark:border-zinc-800/80 pt-4 flex items-center justify-between">
              <span className="text-xs text-zinc-400">Curated by Gemini AI</span>
              <Link to="/ai-advisor" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5 hover:underline">
                Ask Gemini more
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
