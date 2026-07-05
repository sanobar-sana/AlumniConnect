import React, { useState } from 'react';
import Card, { CardBody, CardHeader } from '../components/common/Card';
import Button from '../components/common/Button';
import { ShieldAlert, Users, Check, X, CheckSquare, Trash, Lock, FileCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export const AdminDashboardPage = () => {
  const [usersToApprove, setUsersToApprove] = useState([
    { id: 'usr1', name: 'Frank Miller', role: 'alumni', email: 'frank.m@techcorp.com', credentials: 'CS Grad 2015, Lead Architect' },
    { id: 'usr2', name: 'Sophia Wang', role: 'alumni', email: 'sophia@fintech.co', credentials: 'MBA 2018, Venture Associate' }
  ]);

  const [oppsToMod, setOppsToMod] = useState([
    { id: 'opp1', title: 'React Developer (Remote)', poster: 'Sarah Jenkins', flagReason: 'Duplicate listing' }
  ]);

  const handleUserApproval = (userId, approved) => {
    setUsersToApprove((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleOppApproval = (oppId, approved) => {
    setOppsToMod((prev) => prev.filter((o) => o.id !== oppId));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-3xl font-bold tracking-tight font-display mb-1 flex items-center gap-2 text-slate-900 dark:text-white">
          <ShieldAlert className="w-7 h-7 text-violet-600" />
          Admin Dashboard
        </h2>
        <p className="text-slate-500 font-medium">Manage alumni verifications, moderate job posts, and monitor engagement metrics.</p>
      </div>

      {/* Admin Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Total Members', count: '1,428', detail: '1,200 Students, 228 Alumni', color: 'from-violet-600 to-indigo-650' },
          { label: 'Pending Verifications', count: usersToApprove.length.toString(), detail: 'Awaiting credential checks', color: 'from-indigo-600 to-pink-500' },
          { label: 'Flagged Listings', count: oppsToMod.length.toString(), detail: 'Requires moderation review', color: 'from-pink-500 to-rose-500' }
        ].map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.06 }}
          >
            <Card className="overflow-hidden">
              {/* Gradient strip */}
              <div className={`h-1.5 w-full bg-gradient-to-r ${item.color}`} />
              <CardBody className="p-5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
                <h3 className="text-3xl font-black mt-1.5 text-slate-900 dark:text-white tracking-tight">{item.count}</h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">{item.detail}</p>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Verification Queue */}
        <Card>
          <CardHeader>
            <h3 className="font-bold text-base font-display flex items-center gap-2 text-slate-900 dark:text-white">
              <Users className="w-4.5 h-4.5 text-violet-500" />
              Alumni Verification Queue
            </h3>
          </CardHeader>
          <CardBody className="p-0">
            {usersToApprove.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {usersToApprove.map((user) => (
                  <div key={user.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-900/10 transition-colors">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</h4>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">{user.email}</p>
                      <p className="text-xs text-slate-500 mt-1 italic font-medium">{user.credentials}</p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto shrink-0">
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Check}
                        onClick={() => handleUserApproval(user.id, true)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={X}
                        className="text-rose-600 dark:text-rose-450 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50"
                        onClick={() => handleUserApproval(user.id, false)}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center flex flex-col items-center gap-2">
                <CheckSquare className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                <p className="text-sm font-semibold text-slate-500">Verification queue is completely clear.</p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Moderation Queue */}
        <Card>
          <CardHeader>
            <h3 className="font-bold text-base font-display flex items-center gap-2 text-slate-900 dark:text-white">
              <Lock className="w-4.5 h-4.5 text-pink-500" />
              Content Moderation Queue
            </h3>
          </CardHeader>
          <CardBody className="p-0">
            {oppsToMod.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {oppsToMod.map((opp) => (
                  <div key={opp.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-900/10 transition-colors">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{opp.title}</h4>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">Posted by {opp.poster}</p>
                      <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-semibold flex items-center gap-1">
                        Reason: {opp.flagReason}
                      </p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto shrink-0">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={FileCheck}
                        onClick={() => handleOppApproval(opp.id, true)}
                      >
                        Keep Listing
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={Trash}
                        onClick={() => handleOppApproval(opp.id, false)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center flex flex-col items-center gap-2">
                <CheckSquare className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                <p className="text-sm font-semibold text-slate-500">Content moderation queue is completely clear.</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </motion.div>
  );
};

export default AdminDashboardPage;
