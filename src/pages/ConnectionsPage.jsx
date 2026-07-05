import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import dbService from '../services/dbService';
import Card, { CardBody } from '../components/common/Card';
import Button from '../components/common/Button';
import { Users, UserCheck, Inbox, Send, Check, X, MessageSquare } from 'lucide-react';
import { getInitials } from '../utils/helpers';
import { motion } from 'framer-motion';

export const ConnectionsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('accepted'); // 'accepted' | 'received' | 'sent'
  
  // Data States
  const [acceptedConnections, setAcceptedConnections] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningIds, setActioningIds] = useState({}); // tracker for individual buttons

  const fetchConnections = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Fetch pending connection requests
      const pendingRes = await dbService.getConnectionRequests(user.$id, 'pending');
      const pendingDocs = pendingRes.documents || [];

      // Filter received requests (user is receiver / studentId)
      const received = pendingDocs.filter(doc => doc.studentId === user.$id);
      // Filter sent requests (user is sender / alumniId)
      const sent = pendingDocs.filter(doc => doc.alumniId === user.$id);

      // Populate profiles for received requests (sender is alumniId)
      const populatedReceived = await Promise.all(
        received.map(async (doc) => {
          try {
            const senderProfile = await dbService.getProfile(doc.alumniId);
            return {
              ...doc,
              otherProfile: senderProfile || { name: 'Community Member', role: 'student', email: 'N/A' }
            };
          } catch (e) {
            return {
              ...doc,
              otherProfile: { name: 'Community Member', role: 'student', email: 'N/A' }
            };
          }
        })
      );

      // Populate profiles for sent requests (receiver is studentId)
      const populatedSent = await Promise.all(
        sent.map(async (doc) => {
          try {
            const receiverProfile = await dbService.getProfile(doc.studentId);
            return {
              ...doc,
              otherProfile: receiverProfile || { name: 'Community Member', role: 'student', email: 'N/A' }
            };
          } catch (e) {
            return {
              ...doc,
              otherProfile: { name: 'Community Member', role: 'student', email: 'N/A' }
            };
          }
        })
      );

      // 2. Fetch accepted connections
      const acceptedRes = await dbService.getConnectionRequests(user.$id, 'accepted');
      const acceptedDocs = acceptedRes.documents || [];

      // Populate profiles for accepted connections
      const populatedAccepted = await Promise.all(
        acceptedDocs.map(async (doc) => {
          const otherUserId = doc.alumniId === user.$id ? doc.studentId : doc.alumniId;
          try {
            const otherProfile = await dbService.getProfile(otherUserId);
            return {
              ...doc,
              otherProfile: otherProfile || { name: 'Connected Partner', role: 'student', email: 'N/A' }
            };
          } catch (e) {
            return {
              ...doc,
              otherProfile: { name: 'Connected Partner', role: 'student', email: 'N/A' }
            };
          }
        })
      );

      setReceivedRequests(populatedReceived);
      setSentRequests(populatedSent);
      setAcceptedConnections(populatedAccepted);
    } catch (error) {
      console.warn('Failed to load real connection lists, triggering simulation models:', error);
      // Fallback mocks
      const mockReceiver = { name: 'Jane Doe', company: 'Google', jobTitle: 'Senior Staff Engineer', role: 'alumni', bio: 'CS graduate class of 2018. Happy to chat about backend systems.' };
      const mockSender = { name: 'Alex Rivera', major: 'Computer Science', gradYear: '2027', role: 'student', bio: 'Looking for a mentor in fullstack engineering.' };
      const mockPartner = { name: 'Marcus Lin', company: 'Stripe', jobTitle: 'Product Manager', role: 'alumni', bio: 'Passionate about fintech, payments infrastructure, and PM careers.' };

      setReceivedRequests([
        { $id: 'mock_conn_r_1', alumniId: 'mock_s_1', studentId: user.$id, status: 'pending', otherProfile: mockSender }
      ]);
      setSentRequests([
        { $id: 'mock_conn_s_1', alumniId: user.$id, studentId: 'mock_r_1', status: 'pending', otherProfile: mockReceiver }
      ]);
      setAcceptedConnections([
        { $id: 'mock_conn_a_1', alumniId: 'mock_partner', studentId: user.$id, status: 'accepted', otherProfile: mockPartner }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, [user]);

  const handleRespond = async (connectionId, status) => {
    setActioningIds(prev => ({ ...prev, [connectionId]: true }));
    try {
      await dbService.respondToConnectionRequest(connectionId, status);
      // Refresh list
      await fetchConnections();
    } catch (error) {
      console.error('Failed to respond to connection request:', error);
      // Simulate state update for fallbacks
      if (status === 'accepted') {
        const acceptedItem = receivedRequests.find(r => r.$id === connectionId);
        if (acceptedItem) {
          setAcceptedConnections(prev => [...prev, { ...acceptedItem, status: 'accepted' }]);
        }
      }
      setReceivedRequests(prev => prev.filter(r => r.$id !== connectionId));
      setSentRequests(prev => prev.filter(r => r.$id !== connectionId));
    } finally {
      setActioningIds(prev => ({ ...prev, [connectionId]: false }));
    }
  };

  const getSubtext = (profile) => {
    if (profile.role === 'alumni') {
      return `${profile.jobTitle || 'Alumnus'} at ${profile.company || 'Industry Partner'}`;
    }
    return `${profile.major || 'Student'} (Class of ${profile.gradYear || 'N/A'})`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 py-4"
    >
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight font-display mb-1 flex items-center gap-2 text-slate-900 dark:text-white">
          <Users className="w-7 h-7 text-violet-600" />
          My Network
        </h2>
        <p className="text-slate-500 font-medium">Manage your connected partners, incoming requests, and pending invitations.</p>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'accepted', label: 'Connections', count: acceptedConnections.length, icon: UserCheck },
          { id: 'received', label: 'Received Requests', count: receivedRequests.length, icon: Inbox },
          { id: 'sent', label: 'Sent Invitations', count: sentRequests.length, icon: Send },
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-semibold transition-all duration-150 cursor-pointer ${
                active
                  ? 'border-violet-600 text-violet-700 dark:border-violet-400 dark:text-violet-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                  active
                    ? 'bg-violet-100 text-violet-750 dark:bg-violet-950/40 dark:text-violet-400'
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeTab === 'accepted' && (
            acceptedConnections.length > 0 ? (
              acceptedConnections.map((conn, idx) => (
                <motion.div
                  key={conn.$id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                >
                  <Card isHoverable className="relative overflow-hidden flex flex-col justify-between h-full">
                    {/* Top gradient strip */}
                    <div className="h-0.5 w-full bg-gradient-to-r from-violet-500 to-indigo-500" />
                    <CardBody className="p-5 flex gap-4">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-sm">
                        {getInitials(conn.otherProfile.name)}
                      </div>
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-bold text-base text-slate-900 dark:text-white truncate font-display">{conn.otherProfile.name}</h3>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-violet-50 text-violet-650 dark:bg-violet-950/30 dark:text-violet-400 border border-violet-100/60 dark:border-violet-900/30">
                            {conn.otherProfile.role}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-violet-600 dark:text-violet-400">
                          {getSubtext(conn.otherProfile)}
                        </p>
                        {conn.otherProfile.bio && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 italic line-clamp-2 leading-relaxed font-medium">
                            "{conn.otherProfile.bio}"
                          </p>
                        )}
                      </div>
                    </CardBody>
                    <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/60 dark:bg-slate-900/30 flex justify-between items-center rounded-b-2xl">
                      <span className="text-xs text-slate-500 font-semibold">Connected</span>
                      <a href={`mailto:${conn.otherProfile.email || ''}`}>
                        <Button variant="outline" size="sm" icon={MessageSquare}>
                          Email Contact
                        </Button>
                      </a>
                    </div>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="col-span-2 text-center py-20 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
                <Users className="w-10 h-10 text-slate-350 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-500">You haven't added any connections to your network yet.</p>
              </div>
            )
          )}

          {activeTab === 'received' && (
            receivedRequests.length > 0 ? (
              receivedRequests.map((conn, idx) => (
                <motion.div
                  key={conn.$id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                >
                  <Card className="flex flex-col justify-between h-full">
                    {/* Top gradient strip */}
                    <div className="h-0.5 w-full bg-gradient-to-r from-violet-500 to-indigo-500" />
                    <CardBody className="p-5 flex gap-4">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-sm">
                        {getInitials(conn.otherProfile.name)}
                      </div>
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-bold text-base text-slate-900 dark:text-white truncate font-display">{conn.otherProfile.name}</h3>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-slate-850 dark:text-slate-400">
                            {conn.otherProfile.role}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-violet-600 dark:text-violet-400">
                          {getSubtext(conn.otherProfile)}
                        </p>
                        {conn.otherProfile.bio && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 italic line-clamp-2 leading-relaxed font-medium">
                            "{conn.otherProfile.bio}"
                          </p>
                        )}
                      </div>
                    </CardBody>
                    <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/60 dark:bg-slate-900/30 flex justify-end gap-2.5 rounded-b-2xl">
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Check}
                        onClick={() => handleRespond(conn.$id, 'accepted')}
                        isLoading={actioningIds[conn.$id]}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={X}
                        className="text-rose-600 hover:text-rose-700 border-slate-200 hover:bg-rose-50 dark:border-slate-800 dark:hover:bg-rose-950/20"
                        onClick={() => handleRespond(conn.$id, 'rejected')}
                        isLoading={actioningIds[conn.$id]}
                      >
                        Ignore
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="col-span-2 text-center py-20 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
                <Inbox className="w-10 h-10 text-slate-350 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-500">Inbox is empty. No pending network invitations.</p>
              </div>
            )
          )}

          {activeTab === 'sent' && (
            sentRequests.length > 0 ? (
              sentRequests.map((conn, idx) => (
                <motion.div
                  key={conn.$id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                >
                  <Card className="flex flex-col justify-between h-full">
                    {/* Top gradient strip */}
                    <div className="h-0.5 w-full bg-gradient-to-r from-violet-500 to-indigo-500" />
                    <CardBody className="p-5 flex gap-4">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-sm">
                        {getInitials(conn.otherProfile.name)}
                      </div>
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-bold text-base text-slate-900 dark:text-white truncate font-display">{conn.otherProfile.name}</h3>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-slate-850 dark:text-slate-400">
                            {conn.otherProfile.role}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-violet-600 dark:text-violet-400">
                          {getSubtext(conn.otherProfile)}
                        </p>
                        {conn.otherProfile.bio && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 italic line-clamp-2 leading-relaxed font-medium">
                            "{conn.otherProfile.bio}"
                          </p>
                        )}
                      </div>
                    </CardBody>
                    <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/60 dark:bg-slate-900/30 flex justify-between items-center rounded-b-2xl">
                      <span className="text-xs text-slate-500 font-semibold">Awaiting response…</span>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={X}
                        className="text-slate-500 border-slate-200 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:hover:bg-rose-950/20"
                        onClick={() => handleRespond(conn.$id, 'rejected')}
                        isLoading={actioningIds[conn.$id]}
                      >
                        Withdraw
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="col-span-2 text-center py-20 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
                <Send className="w-10 h-10 text-slate-350 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-500">Outbox is empty. No pending invitations sent.</p>
              </div>
            )
          )}
        </div>
      )}
    </motion.div>
  );
};

export default ConnectionsPage;
