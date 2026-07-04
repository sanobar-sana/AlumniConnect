import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import dbService from '../services/dbService';
import Card, { CardBody } from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { getInitials, formatDate, truncateText } from '../utils/helpers';
import {
  MessageSquare,
  Search,
  Send,
  ArrowLeft,
  Users,
  Plus,
  X,
  CheckCheck,
  Check,
  Circle,
  GraduationCap,
  Briefcase,
  Sparkles
} from 'lucide-react';

export const MessagesPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const { userId } = useParams();

  // Selected state and conversations
  const [conversations, setConversations] = useState([]);
  const [selectedConvo, setSelectedConvo] = useState(null); // { conversationId, otherUser }
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');

  // Profiles cache to avoid re-fetching the same profile
  const [profilesCache, setProfilesCache] = useState({});

  // Loading states
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  // New Chat Modal state
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [connections, setConnections] = useState([]);
  const [loadingConnections, setLoadingConnections] = useState(false);

  // Search filter for sidebar conversations
  const [searchQuery, setSearchQuery] = useState('');

  // Mobile layout view toggler ('list' | 'chat')
  const [mobileView, setMobileView] = useState('list');

  // Ref for auto-scrolling message list to bottom
  const messageEndRef = useRef(null);

  // Load conversations on component mount or user change
  useEffect(() => {
    if (user?.$id) {
      loadConversations();
    }
  }, [user?.$id]);

  // Handle location state navigation (e.g. when direct messaging from connections/profile page)
  useEffect(() => {
    if (user?.$id && location.state?.recipientId) {
      initiateConversationWithUser(location.state.recipientId);
      // Clear location state so it doesn't re-trigger on reload
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state?.recipientId, user?.$id]);

  // Handle URL path parameter (e.g. /messages/:userId)
  useEffect(() => {
    if (user?.$id && userId) {
      initiateConversationWithUser(userId);
    }
  }, [userId, user?.$id]);

  // Setup real-time listener for any messages involving the user
  useEffect(() => {
    if (!user?.$id) return;

    const unsubscribe = dbService.subscribeToUserMessages(
      user.$id,
      (event) => {
        const payload = event.payload;

        // If message is created
        if (event.events.some(e => e.includes('.create'))) {
          // 1. If it belongs to the active conversation, append it
          if (selectedConvo && payload.conversationId === selectedConvo.conversationId) {
            setMessages((prev) => {
              if (prev.some((m) => m.$id === payload.$id)) return prev;
              return [...prev, payload];
            });

            // Mark as read if the recipient of the new message is the current user
            if (payload.receiverId === user.$id && !payload.read) {
              dbService.markMessageRead(payload.$id).catch(() => {});
            }
          }

          // 2. Automatically update/re-order the sidebar conversation list
          updateSidebarWithNewMessage(payload);
        }
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user?.$id, selectedConvo?.conversationId]);

  // Scroll to bottom whenever messages list updates or selected conversation changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedConvo]);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /**
   * Helper to update the conversation item in the sidebar on receiving or sending a message
   */
  const updateSidebarWithNewMessage = (msg) => {
    setConversations((prev) => {
      const idx = prev.findIndex((c) => c.conversationId === msg.conversationId);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          lastMessage: msg,
        };
        // Re-sort: put most recent chat on top
        return updated.sort(
          (a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp)
        );
      } else {
        // If it's a completely new conversation thread not yet loaded, reload list
        loadConversations();
        return prev;
      }
    });
  };

  /**
   * Fetches and caches user profiles.
   */
  const getCachedProfile = async (userId) => {
    if (profilesCache[userId]) {
      return profilesCache[userId];
    }
    try {
      const profile = await dbService.getProfile(userId);
      const finalProfile = profile || {
        $id: userId,
        name: 'Community Member',
        role: 'student',
        email: 'N/A'
      };
      setProfilesCache((prev) => ({ ...prev, [userId]: finalProfile }));
      return finalProfile;
    } catch (e) {
      const fallback = {
        $id: userId,
        name: 'Community Member',
        role: 'student',
        email: 'N/A'
      };
      setProfilesCache((prev) => ({ ...prev, [userId]: fallback }));
      return fallback;
    }
  };

  /**
   * Loads the inbox conversation list
   */
  const loadConversations = async () => {
    setLoadingConvos(true);
    try {
      const convoList = await dbService.listConversations(user.$id);
      
      // Populate profile data for each conversation
      const populated = await Promise.all(
        convoList.map(async (convo) => {
          const profile = await getCachedProfile(convo.otherUserId);
          return {
            ...convo,
            otherUser: profile,
          };
        })
      );

      setConversations(populated);
    } catch (error) {
      console.warn('Failed to load conversations from database, loading simulation data:', error);
      // Fallback Simulation Data
      const mockProfiles = {
        'mock_pm_1': { $id: 'mock_pm_1', name: 'Marcus Lin', company: 'Stripe', jobTitle: 'Product Manager', role: 'alumni' },
        'mock_alumni_2': { $id: 'mock_alumni_2', name: 'Jane Doe', company: 'Google', jobTitle: 'Senior Tech Lead', role: 'alumni' },
      };

      setConversations([
        {
          conversationId: dbService.buildConversationId(user.$id, 'mock_pm_1'),
          otherUserId: 'mock_pm_1',
          otherUser: mockProfiles['mock_pm_1'],
          lastMessage: {
            $id: 'm1',
            senderId: 'mock_pm_1',
            receiverId: user.$id,
            text: 'I reviewed your PM portfolio and left some comments! Let me know when you have time for a review.',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            read: false,
          }
        },
        {
          conversationId: dbService.buildConversationId(user.$id, 'mock_alumni_2'),
          otherUserId: 'mock_alumni_2',
          otherUser: mockProfiles['mock_alumni_2'],
          lastMessage: {
            $id: 'm2',
            senderId: user.$id,
            receiverId: 'mock_alumni_2',
            text: 'Thank you so much for the mentorship advice last week!',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            read: true,
          }
        }
      ]);
    } finally {
      setLoadingConvos(false);
    }
  };

  /**
   * Triggered when a conversation is selected
   */
  const handleSelectConvo = async (convo) => {
    setSelectedConvo(convo);
    setMobileView('chat');
    setLoadingMessages(true);
    try {
      const response = await dbService.getMessages(convo.conversationId);
      const docs = response.documents || [];
      setMessages(docs);

      // Mark unread messages as read
      const unreadList = docs.filter(m => m.receiverId === user.$id && !m.read);
      for (const msg of unreadList) {
        dbService.markMessageRead(msg.$id).catch(() => {});
      }

      // Update sidebar counts locally
      setConversations((prev) =>
        prev.map((c) =>
          c.conversationId === convo.conversationId && c.lastMessage
            ? { ...c, lastMessage: { ...c.lastMessage, read: true } }
            : c
        )
      );
    } catch (error) {
      console.warn('Failed to fetch messages, simulating current thread:', error);
      // Simulating Thread Messages
      if (convo.otherUserId === 'mock_pm_1') {
        setMessages([
          {
            $id: 'mock_m_1',
            senderId: user.$id,
            receiverId: 'mock_pm_1',
            text: 'Hi Marcus, would you mind taking a look at my mock startup strategy docs?',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            read: true,
            conversationId: convo.conversationId
          },
          {
            $id: 'mock_m_2',
            senderId: 'mock_pm_1',
            receiverId: user.$id,
            text: 'I reviewed your PM portfolio and left some comments! Let me know when you have time for a review.',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            read: false,
            conversationId: convo.conversationId
          }
        ]);
      } else {
        setMessages([
          {
            $id: 'mock_m_3',
            senderId: 'mock_alumni_2',
            receiverId: user.$id,
            text: 'Let me know if you have any questions about the software architecture!',
            timestamp: new Date(Date.now() - 172800000).toISOString(),
            read: true,
            conversationId: convo.conversationId
          },
          {
            $id: 'mock_m_4',
            senderId: user.$id,
            receiverId: 'mock_alumni_2',
            text: 'Thank you so much for the mentorship advice last week!',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            read: true,
            conversationId: convo.conversationId
          }
        ]);
      }
    } finally {
      setLoadingMessages(false);
    }
  };

  /**
   * Action to initiate chat with a user from an external navigation state (like a profile redirect)
   */
  const initiateConversationWithUser = async (otherUserId) => {
    const convoId = dbService.buildConversationId(user.$id, otherUserId);
    
    // Check if conversation already exists in active sidebar conversations
    const existing = conversations.find(c => c.conversationId === convoId);
    if (existing) {
      handleSelectConvo(existing);
      return;
    }

    // Otherwise, construct a temporary virtual conversation item
    setLoadingMessages(true);
    try {
      const otherProfile = await getCachedProfile(otherUserId);
      const newConvo = {
        conversationId: convoId,
        otherUserId,
        otherUser: otherProfile,
        lastMessage: null
      };

      // Add to start of conversation list temporarily
      setConversations(prev => [newConvo, ...prev]);
      handleSelectConvo(newConvo);
    } catch (e) {
      console.error('Failed to initiate conversation:', e);
    } finally {
      setLoadingMessages(false);
    }
  };

  /**
   * Sends a message in the active thread
   */
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim() || !selectedConvo || sendingMessage) return;

    const textToSend = newMessageText.trim();
    setNewMessageText('');
    setSendingMessage(true);

    try {
      const sentDoc = await dbService.sendMessage(
        user.$id,
        selectedConvo.otherUserId,
        textToSend
      );

      // Append new message directly to list
      setMessages((prev) => [...prev, sentDoc]);

      // Update sidebar summary list
      updateSidebarWithNewMessage(sentDoc);
    } catch (error) {
      console.warn('Failed to write message to database, simulating send locally:', error);
      // Local simulation append
      const mockDoc = {
        $id: `temp_msg_${Date.now()}`,
        senderId: user.$id,
        receiverId: selectedConvo.otherUserId,
        text: textToSend,
        timestamp: new Date().toISOString(),
        read: true,
        conversationId: selectedConvo.conversationId
      };
      setMessages((prev) => [...prev, mockDoc]);
      updateSidebarWithNewMessage(mockDoc);
    } finally {
      setSendingMessage(false);
    }
  };

  /**
   * Loads accepted connection list to initiate new chats
   */
  const openNewChatModal = async () => {
    setIsNewChatModalOpen(true);
    setLoadingConnections(true);
    try {
      const res = await dbService.getConnectionRequests(user.$id, 'accepted');
      const docs = res.documents || [];

      const populated = await Promise.all(
        docs.map(async (doc) => {
          const otherUserId = doc.alumniId === user.$id ? doc.studentId : doc.alumniId;
          const otherProfile = await getCachedProfile(otherUserId);
          return otherProfile;
        })
      );
      setConnections(populated);
    } catch (error) {
      console.warn('Could not load connections from DB, using mock connection list:', error);
      setConnections([
        { $id: 'mock_pm_1', name: 'Marcus Lin', company: 'Stripe', jobTitle: 'Product Manager', role: 'alumni' },
        { $id: 'mock_alumni_2', name: 'Jane Doe', company: 'Google', jobTitle: 'Senior Tech Lead', role: 'alumni' },
        { $id: 'mock_student_3', name: 'Alex Rivera', major: 'Computer Science', gradYear: '2027', role: 'student' }
      ]);
    } finally {
      setLoadingConnections(false);
    }
  };

  // Filter conversations in sidebar based on user search
  const filteredConversations = conversations.filter((convo) => {
    const name = convo.otherUser?.name?.toLowerCase() || '';
    const lastMsgText = convo.lastMessage?.text?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return name.includes(query) || lastMsgText.includes(query);
  });

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-h-187.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden relative">
      <div className="flex flex-1 h-full min-h-0">
        
        {/* ================= LEFT SIDEBAR ================= */}
        <div
          className={`flex-col md:flex border-r border-zinc-200 dark:border-zinc-800 w-full md:w-80 lg:w-96 shrink-0 bg-white dark:bg-zinc-900 ${
            mobileView === 'list' ? 'flex' : 'hidden'
          }`}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-zinc-150 dark:border-zinc-800 flex justify-between items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight font-display text-gradient">Messages</h1>
            <Button
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={openNewChatModal}
              className="rounded-full p-2! shrink-0"
              title="New Conversation"
            />
          </div>

          {/* Search Bar */}
          <div className="p-3 border-b border-zinc-100 dark:border-zinc-800/40">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-zinc-900 dark:text-zinc-50 transition-all"
              />
            </div>
          </div>

          {/* Conversations Scroll List */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {loadingConvos ? (
              <div className="space-y-3 p-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex items-center gap-3 animate-pulse">
                    <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3" />
                      <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center h-full">
                <MessageSquare className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mb-3" />
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No conversations found</p>
                <button
                  onClick={openNewChatModal}
                  className="mt-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Start a chat with network
                </button>
              </div>
            ) : (
              filteredConversations.map((convo) => {
                const isActive = selectedConvo?.conversationId === convo.conversationId;
                const lastMsg = convo.lastMessage;
                const isUnread = lastMsg && lastMsg.receiverId === user.$id && !lastMsg.read;

                return (
                  <div
                    key={convo.conversationId}
                    onClick={() => handleSelectConvo(convo)}
                    className={`flex items-center gap-3.5 p-4 border-b border-zinc-100 dark:border-zinc-800/40 cursor-pointer transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800/25 ${
                      isActive ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-l-4 border-l-indigo-600 dark:border-l-indigo-500' : ''
                    }`}
                  >
                    {/* Avatar Badge */}
                    <div className="relative shrink-0">
                      <div className="h-12 w-12 rounded-full bg-linear-to-tr from-violet-650 to-indigo-650 text-white font-bold flex items-center justify-center shadow-md">
                        {getInitials(convo.otherUser.name)}
                      </div>
                      {isUnread && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                        </span>
                      )}
                    </div>

                    {/* Meta Detail Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h2 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                          {convo.otherUser.name}
                        </h2>
                        {lastMsg && (
                          <span className="text-[10px] text-gray-600 dark:text-gray-300 shrink-0 font-medium ml-2">
                            {formatDate(lastMsg.timestamp, true)}
                          </span>
                        )}
                      </div>

                      <p className={`text-xs truncate ${
                        isUnread ? 'text-zinc-950 dark:text-white font-bold' : 'text-gray-700 dark:text-gray-300 font-medium'
                      }`}>
                        {lastMsg ? truncateText(lastMsg.text, 65) : <span className="italic text-gray-600 dark:text-gray-300">Draft session created...</span>}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ================= RIGHT MESSAGE PANEL ================= */}
        <div
          className={`flex-1 flex-col bg-zinc-50 dark:bg-zinc-950/40 relative ${
            mobileView === 'chat' && selectedConvo ? 'flex' : 'hidden md:flex'
          }`}
        >
          {selectedConvo ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mobile Back Nav Icon */}
                  <button
                    onClick={() => setMobileView('list')}
                    className="md:hidden p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-650 dark:text-zinc-350 cursor-pointer"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="h-10 w-10 rounded-full bg-linear-to-tr from-violet-650 to-indigo-650 text-white font-bold text-sm flex items-center justify-center shadow">
                    {getInitials(selectedConvo.otherUser.name)}
                  </div>
                  
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-white truncate">
                      {selectedConvo.otherUser.name}
                    </h3>
                    <p className="text-[11px] text-indigo-650 dark:text-indigo-400 font-bold truncate flex items-center gap-1">
                      {selectedConvo.otherUser.role === 'alumni' ? (
                        <>
                          <Briefcase className="w-3 h-3" />
                          <span>{selectedConvo.otherUser.jobTitle || 'Alumni'} at {selectedConvo.otherUser.company || 'Global Partner'}</span>
                        </>
                      ) : (
                        <>
                          <GraduationCap className="w-3.5 h-3.5" />
                          <span>CS Student (Class of {selectedConvo.otherUser.gradYear || 'N/A'})</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Message List Scroll View */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 bg-zinc-50 dark:bg-zinc-950/20">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, index) => {
                      const isMe = msg.senderId === user.$id;
                      const msgDate = new Date(msg.timestamp);
                      const showDateDivider =
                        index === 0 ||
                        new Date(messages[index - 1].timestamp).toDateString() !== msgDate.toDateString();

                      return (
                        <div key={msg.$id || index} className="space-y-2">
                          {showDateDivider && (
                            <div className="flex justify-center my-3">
                              <span className="text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 bg-zinc-200/60 dark:bg-zinc-800 text-zinc-550 dark:text-zinc-400 rounded-full">
                                {msgDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          )}
                          <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div
                              className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm text-sm leading-relaxed relative wrap-break-words ${
                                isMe
                                  ? 'bg-indigo-600 dark:bg-indigo-500 text-white rounded-tr-none'
                                  : 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tl-none border border-zinc-200/50 dark:border-zinc-800/40'
                              }`}
                            >
                              <p className="whitespace-pre-wrap wrap-break-words">{msg.text}</p>
                              
                              <div className="flex items-center justify-end gap-1 mt-1 text-[9px] opacity-70">
                                <span>
                                  {msgDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })}
                                </span>
                                {isMe && (
                                  msg.read ? (
                                    <CheckCheck className="w-3.5 h-3.5 text-indigo-200" />
                                  ) : (
                                    <Check className="w-3.5 h-3.5 text-white/70" />
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messageEndRef} />
                  </>
                )}
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex gap-3 items-center sticky bottom-0"
              >
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  disabled={sendingMessage}
                  className="flex-1 px-4 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-zinc-900 dark:text-zinc-50 transition-all"
                />
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={sendingMessage}
                  isDisabled={!newMessageText.trim()}
                  className="rounded-xl! p-3 shrink-0 h-10.5 w-10.5 flex items-center justify-center"
                >
                  {!sendingMessage && <Send className="w-4.5 h-4.5" />}
                </Button>
              </form>
            </>
          ) : (
            /* Empty Chat State Display */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-zinc-50 dark:bg-zinc-950/20">
              <div className="w-16 h-16 rounded-2xl bg-linear-to-tr from-indigo-500/10 to-violet-500/10 flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-xl font-bold tracking-tight mb-2 text-slate-900">Your Conversations</h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 max-w-sm">
                Select a conversation thread from the list or start a new discussion to chat with your alumni network.
              </p>
              <Button
                variant="outline"
                size="sm"
                icon={Plus}
                onClick={openNewChatModal}
                className="mt-4 shadow-sm"
              >
                New Conversation
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ================= NEW CHAT SELECTION MODAL ================= */}
      {isNewChatModalOpen && (
        <div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[85%]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-150 dark:border-zinc-800">
              <h3 className="font-bold text-gradient text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" />
                Start a Conversation
              </h3>
              <button
                onClick={() => setIsNewChatModalOpen(false)}
                className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Connection List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-0">
              {loadingConnections ? (
                <div className="flex justify-center items-center py-12">
                  <div className="w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : connections.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Sparkles className="w-10 h-10 text-indigo-400 dark:text-indigo-600/60 mb-2 animate-pulse" />
                  <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No active connections</p>
                  <p className="text-xs text-gray-700 dark:text-gray-300 max-w-70 mt-1">
                    You can only message members of the network who have accepted your connection request.
                  </p>
                </div>
              ) : (
                connections.map((person) => (
                  <div
                    key={person.$id}
                    onClick={() => {
                      setIsNewChatModalOpen(false);
                      initiateConversationWithUser(person.$id);
                    }}
                    className="flex items-center gap-3.5 p-3 rounded-xl border border-zinc-150 dark:border-zinc-800/60 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 cursor-pointer transition-all hover:border-indigo-500/30"
                  >
                    <div className="h-10 w-10 rounded-full bg-linear-to-tr from-violet-650 to-indigo-650 text-white font-bold flex items-center justify-center shrink-0 shadow-sm">
                      {getInitials(person.name)}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {person.name}
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                        {person.role === 'alumni'
                          ? `${person.jobTitle || 'Alumni'} at ${person.company || 'Industry Partner'}`
                          : `Student (Class of ${person.gradYear || 'N/A'})`}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 border-t border-zinc-150 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsNewChatModalOpen(false)}
              >
                Cancel
              </Button>
            </div>
            
          </div>
        </div>
      )}
      
    </div>
  );
};

export default MessagesPage;
