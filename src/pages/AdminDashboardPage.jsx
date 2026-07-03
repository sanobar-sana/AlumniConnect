import React, { useState } from 'react';
import Card, { CardBody, CardHeader } from '../components/common/Card';
import Button from '../components/common/Button';
import { ShieldAlert, Users, Check, X, CheckSquare, Trash, Lock, FileCheck } from 'lucide-react';

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
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight font-display mb-1 flex items-center gap-2">
          <ShieldAlert className="w-8 h-8 text-indigo-500" />
          Admin Dashboard
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400">Manage alumni verifications, moderate job posts, and monitor engagement metrics.</p>
      </div>

      {/* Admin Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Total Members', count: '1,428', detail: '1,200 Students, 228 Alumni', color: 'border-l-4 border-l-violet-600' },
          { label: 'Pending Verifications', count: usersToApprove.length.toString(), detail: 'Awaiting credential checks', color: 'border-l-4 border-l-indigo-650' },
          { label: 'Flagged Listings', count: oppsToMod.length.toString(), detail: 'Requires moderation review', color: 'border-l-4 border-l-pink-600' }
        ].map((item, idx) => (
          <Card key={idx} className={`border border-zinc-200 dark:border-zinc-800 ${item.color}`}>
            <CardBody className="p-5">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{item.label}</p>
              <h3 className="text-2xl font-bold mt-1">{item.count}</h3>
              <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-1">{item.detail}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Verification Queue */}
        <Card className="border border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <h3 className="font-bold text-lg font-display flex items-center gap-2">
              <Users className="w-5 h-5 text-violet-500" />
              Alumni Verification Queue
            </h3>
          </CardHeader>
          <CardBody className="p-0">
            {usersToApprove.length > 0 ? (
              <div className="divide-y divide-zinc-200/50 dark:divide-zinc-800/50">
                {usersToApprove.map((user) => (
                  <div key={user.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-colors">
                    <div>
                      <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{user.name}</h4>
                      <p className="text-xs text-zinc-400 mt-0.5">{user.email}</p>
                      <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-1 italic">{user.credentials}</p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
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
                        className="text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50"
                        onClick={() => handleUserApproval(user.id, false)}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center text-zinc-450 dark:text-zinc-500 flex flex-col items-center gap-2">
                <CheckSquare className="w-8 h-8 text-zinc-300 dark:text-zinc-700" />
                <p className="text-sm">Verification queue is completely clear.</p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Moderation Queue */}
        <Card className="border border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <h3 className="font-bold text-lg font-display flex items-center gap-2">
              <Lock className="w-5 h-5 text-pink-500" />
              Content Moderation Queue
            </h3>
          </CardHeader>
          <CardBody className="p-0">
            {oppsToMod.length > 0 ? (
              <div className="divide-y divide-zinc-200/50 dark:divide-zinc-800/50">
                {oppsToMod.map((opp) => (
                  <div key={opp.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-colors">
                    <div>
                      <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{opp.title}</h4>
                      <p className="text-xs text-zinc-455 dark:text-zinc-400 mt-0.5">Posted by {opp.poster}</p>
                      <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-semibold flex items-center gap-1">
                        Reason: {opp.flagReason}
                      </p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
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
              <div className="p-10 text-center text-zinc-455 dark:text-zinc-500 flex flex-col items-center gap-2">
                <CheckSquare className="w-8 h-8 text-zinc-300 dark:text-zinc-700" />
                <p className="text-sm">Content moderation queue is completely clear.</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
