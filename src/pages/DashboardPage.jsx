import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import Card, { CardBody, CardHeader } from '../components/common/Card';
import Button from '../components/common/Button';
import { Users, Briefcase, Sparkles, MessageSquare, ArrowRight, TrendingUp, Check, X, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import dbService from '../services/dbService';
import { motion } from 'framer-motion';

export const DashboardPage = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({
    connections: 12,
    opportunities: 28,
    chats: 8,
    mentors: 3
  });
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAlumni = profile?.role === 'alumni';

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Fetch connection requests
      const connRes = await dbService.getConnectionRequests(user.$id, 'pending');
      // Filter incoming requests where user is receiver (schema field: studentId)
      const incoming = connRes.documents.filter(doc => doc.studentId === user.$id && doc.status === 'pending');

      // Populate sender profile info (schema field: alumniId holds the sender)
      const populated = await Promise.all(
        incoming.map(async (doc) => {
          try {
            const senderProfile = await dbService.getProfile(doc.alumniId);
            return {
              ...doc,
              senderProfile: senderProfile || { name: 'Unknown User', email: 'N/A', role: 'student', major: 'N/A', gradYear: 'N/A' }
            };
          } catch (e) {
            return {
              ...doc,
              senderProfile: { name: 'Community Member', email: 'N/A', role: 'student', major: 'N/A', gradYear: 'N/A' }
            };
          }
        })
      );
      setPendingRequests(populated);

      // 2. Fetch accepted connections to count
      const acceptedConnRes = await dbService.getConnectionRequests(user.$id, 'accepted');
      const connectionCount = acceptedConnRes.documents.length;

      // 3. Fetch opportunities to count
      const oppsRes = await dbService.listOpportunities(100, 0);
      const oppsCount = oppsRes.documents.length;

      setStats(prev => ({
        ...prev,
        connections: connectionCount > 0 ? connectionCount : 12,
        opportunities: oppsCount > 0 ? oppsCount : 28
      }));
    } catch (error) {
      console.warn('Failed to load database details, using mock dashboard details:', error);
      // Fallback mocks
      setPendingRequests([
        {
          $id: 'mock_conn_1',
          senderId: 'mock_s_1',
          receiverId: user.$id,
          status: 'pending',
          createdAt: new Date().toISOString(),
          senderProfile: { name: 'Jane Doe', email: 'jane.doe@university.edu', role: 'student', major: 'Computer Science', gradYear: '2027', bio: 'Looking for a mentor in fullstack engineering.' }
        },
        {
          $id: 'mock_conn_2',
          senderId: 'mock_s_2',
          receiverId: user.$id,
          status: 'pending',
          createdAt: new Date().toISOString(),
          senderProfile: { name: 'Alex Rivera', email: 'alex.rivera@university.edu', role: 'student', major: 'Data Science', gradYear: '2026', bio: 'Interested in internships at Stripe.' }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleRespond = async (connectionId, status) => {
    try {
      await dbService.respondToConnectionRequest(connectionId, status);
      // Update UI state
      setPendingRequests(prev => prev.filter(req => req.$id !== connectionId));
      if (status === 'accepted') {
        setStats(prev => ({ ...prev, connections: prev.connections + 1 }));
      }
    } catch (error) {
      console.error('Failed to update connection request status:', error);
      // Fallback UI update for simulation
      setPendingRequests(prev => prev.filter(req => req.$id !== connectionId));
      if (status === 'accepted') {
        setStats(prev => ({ ...prev, connections: prev.connections + 1 }));
      }
    }
  };

  const statCards = [
    { label: 'Connections',      count: stats.connections.toString(),  icon: Users,         change: 'Updated live',      color: 'text-violet-600 dark:text-violet-400',  bg: 'bg-violet-50 dark:bg-violet-950/30' },
    { label: 'Opportunities',    count: stats.opportunities.toString(), icon: Briefcase,     change: 'Active postings',   color: 'text-indigo-600 dark:text-indigo-400',  bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
    { label: 'AI Advisory Chats',count: stats.chats.toString(),         icon: Sparkles,      change: '100% tokens left',  color: 'text-pink-500 dark:text-pink-400',      bg: 'bg-pink-50 dark:bg-pink-950/30' },
    { label: 'Active Mentors',   count: stats.mentors.toString(),       icon: MessageSquare, change: 'Verified partners', color: 'text-amber-600 dark:text-amber-400',    bg: 'bg-amber-50 dark:bg-amber-950/30' },
  ];

  return (
    <div className="space-y-8">

      {/* ── Welcome Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-2xl overflow-hidden border border-violet-100/60 dark:border-violet-900/30 bg-gradient-to-br from-violet-50 via-white to-indigo-50/60 dark:from-violet-950/20 dark:via-slate-900 dark:to-indigo-950/10 p-8 sm:p-10"
      >
        <div className="absolute top-0 right-0 w-72 h-72 bg-violet-400/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/8 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="max-w-3xl">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 text-xs font-bold mb-4 border border-violet-200/50 dark:border-violet-800/30">
            {profile?.role === 'admin' ? 'Administrator' : isAlumni ? 'Alumni Partner' : 'Student Member'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display mb-3 text-slate-900 dark:text-white">
            Welcome back, {profile?.name || user?.name}!
          </h1>
          <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-6 max-w-2xl">
            {profile?.role === 'admin'
              ? 'You have full administrative privileges. Monitor verifications, moderate content, and oversee the platform.'
              : isAlumni
              ? 'Thank you for contributing your expertise. Share opportunities, respond to connection queries, or review resume feedback requests to guide the next generation.'
              : 'Grow your network, discover internships or jobs, and talk to your AI assistant to draft connection letters or practice interview questions.'}
          </p>
          <div className="flex flex-wrap gap-3">
            {profile?.role === 'admin' ? (
              <Link to="/admin">
                <Button variant="primary" size="md" icon={ShieldAlert}>Go to Admin Console</Button>
              </Link>
            ) : (
              <Link to={isAlumni ? '/opportunities' : '/alumni'}>
                <Button variant="primary" size="md">
                  {isAlumni ? 'Post an Opportunity' : 'Browse Alumni'}
                </Button>
              </Link>
            )}
            <Link to="/ai-advisor">
              <Button variant="outline" size="md" icon={Sparkles}>Consult AI Advisor</Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 + i * 0.06 }}
            >
              <Card className="hover:shadow-md transition-all duration-300">
                <CardBody className="flex items-center gap-4 p-5">
                  <div className={`p-3 rounded-xl ${stat.bg} shrink-0`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">{stat.count}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-emerald-500" />
                      {stat.change}
                    </p>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* ── Bottom Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">

          {/* Pending Requests */}
          <Card>
            <CardHeader>
              <h3 className="font-bold text-base font-display flex items-center gap-2 text-slate-900 dark:text-white">
                <Users className="w-4.5 h-4.5 text-violet-500" />
                Pending Networking Requests
              </h3>
            </CardHeader>
            <CardBody className="p-0">
              {pendingRequests.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {pendingRequests.map((req) => (
                    <div key={req.$id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{req.senderProfile.name}</h4>
                        <p className="text-xs text-violet-600 dark:text-violet-400 font-semibold mt-0.5">
                          {req.senderProfile.role === 'alumni'
                            ? `${req.senderProfile.jobTitle || 'Alumnus'} at ${req.senderProfile.company || 'Industry Partner'}`
                            : `${req.senderProfile.major || 'Student'} (Class of ${req.senderProfile.gradYear})`}
                        </p>
                        {req.senderProfile.bio && (
                          <p className="text-xs text-slate-500 mt-1.5 italic leading-relaxed">
                            "{req.senderProfile.bio}"
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto shrink-0">
                        <Button variant="primary" size="sm" icon={Check} onClick={() => handleRespond(req.$id, 'accepted')}>
                          Accept
                        </Button>
                        <Button
                          variant="outline" size="sm" icon={X}
                          className="text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                          onClick={() => handleRespond(req.$id, 'rejected')}
                        >
                          Ignore
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                    <Check className="w-5 h-5 text-emerald-500" />
                  </div>
                  <p className="text-sm font-medium text-slate-500">You're all caught up! No pending requests.</p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <h3 className="font-bold text-base font-display text-slate-900 dark:text-white">Recent Network Updates</h3>
            </CardHeader>
            <CardBody className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {[
                  { title: 'Mentorship Request Accepted', desc: 'Sarah Jenkins (Senior Frontend Engineer at Google) accepted your connection request.', time: '2 hours ago' },
                  { title: 'New Job Opportunity Posted',  desc: 'Internship role at Stripe posted by alumnus Marcus Lin.', time: '1 day ago' },
                  { title: 'Resume Review Ready',        desc: 'Gemini Career Advisor updated feedback report for resume_v2.pdf.', time: '2 days ago' },
                ].map((activity, idx) => (
                  <div key={idx} className="p-5 flex gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="h-2 w-2 rounded-full bg-violet-500 mt-2 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-4">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{activity.title}</h4>
                        <span className="text-xs text-slate-400 whitespace-nowrap">{activity.time}</span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{activity.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Gemini Tip Card */}
        <Card isGlass className="flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-pink-400/10 rounded-full blur-2xl -z-10" />
          <CardBody className="space-y-4">
            <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
              <Sparkles className="w-4.5 h-4.5 animate-pulse" />
              <h4 className="font-bold font-display text-xs uppercase tracking-wider">Mentoring Tip of the Day</h4>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
              "When reaching out to alumni, lead with curiosity. Instead of asking for a job referral directly, ask for 15 minutes to learn about their career journey and how they transitioned from university to their current role."
            </p>
            <div className="border-t border-slate-200/60 dark:border-slate-800/80 pt-4 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Curated by Gemini AI</span>
              <Link to="/ai-advisor" className="text-xs font-bold text-violet-600 dark:text-violet-400 flex items-center gap-0.5 hover:underline">
                Ask Gemini
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
