import React, { useState } from 'react';
import aiService from '../services/aiService';
import Card, { CardBody, CardHeader } from '../components/common/Card';
import Button from '../components/common/Button';
import { Sparkles, Send, FileText, MessageSquare, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const AIAssistantPage = () => {
  const [activeMode, setActiveMode] = useState('chat'); // 'chat' or 'resume'

  // Chat State
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([
    { sender: 'assistant', text: "Hello! I am your Gemini Career Assistant. I can help you prepare for technical interviews, draft cold outreach letters, or give structural suggestions for your resume. What can I do for you today?" }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  // Resume Reviewer State
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [resumeFeedback, setResumeFeedback] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Prompt templates to assist students
  const promptTemplates = [
    "Simulate a mock interview for a Junior React Developer role",
    "Draft a LinkedIn outreach message to an alumnus in Cloud Engineering",
    "What core skills are recommended for a graduate entering Fintech?"
  ];

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || message;
    if (!text.trim()) return;

    const userMessage = { sender: 'user', text };
    setChatLog((prev) => [...prev, userMessage]);
    setMessage('');
    setChatLoading(true);

    try {
      const response = await aiService.sendMessageToAssistant(text, chatLog);
      const replyText = typeof response.text === 'function' ? response.text() : response;
      console.log('Gemini AI Assistant response:', replyText);
      setChatLog((prev) => [...prev, { sender: 'assistant', text: replyText }]);
    } catch (error) {
      console.error(error);
      // Simulate answer if Gemini key is missing
      setTimeout(() => {
        setChatLog((prev) => [
          ...prev,
          {
            sender: 'assistant',
            text: `[Simulation response] Here is some guidance for "${text}": Lead with structured steps, emphasize projects utilizing clean state managers, and verify your credentials using mock tests.`
          }
        ]);
      }, 1000);
    } finally {
      setChatLoading(false);
    }
  };

  const handleResumeReview = async (e) => {
    e.preventDefault();
    if (!resumeText.trim() || !jobDescription.trim()) return;

    setReviewLoading(true);
    setReviewError('');
    setResumeFeedback('');

    try {
      const feedback = await aiService.getResumeFeedback(resumeText, jobDescription);
      console.log('Gemini ATS Resume feedback:', feedback);
      setResumeFeedback(feedback);
    } catch (err) {
      console.error(err);
      // Mock review output if API credentials are not ready
      setTimeout(() => {
        setResumeFeedback(`### Resume Review Summary (Mock Result)
**Match Score**: 78%

**Suggestions**:
- **Strong Areas**: Your React hooks experience matches the frontend description.
- **Missing Keywords**: Add keywords like **TypeScript**, **Tailwind CSS**, and **Performance Audits**.
- **Action Items**: Rewrite bullet points under project experience using the STAR method (Situation, Task, Action, Result).
`);
      }, 1200);
    } finally {
      setReviewLoading(false);
    }
  };

  const tabClass = (mode) =>
    `flex items-center gap-2 px-6 py-3 border-b-2 text-sm font-semibold transition-all duration-150 cursor-pointer ${
      activeMode === mode
        ? 'border-violet-600 text-violet-700 dark:border-violet-400 dark:text-violet-400'
        : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
    }`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight font-display mb-1 text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-violet-600" />
          AI Career Advisor
        </h2>
        <p className="text-slate-500 font-medium">Connect with Gemini-powered intelligence to optimize your career path and network impact.</p>
      </div>

      {/* Mode Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button onClick={() => setActiveMode('chat')} className={tabClass('chat')}>
          <MessageSquare className="w-4 h-4" />
          Interactive Coach Chat
        </button>
        <button onClick={() => setActiveMode('resume')} className={tabClass('resume')}>
          <FileText className="w-4 h-4" />
          Resume Optimizer
        </button>
      </div>

      {/* ── Chat Workspace ── */}
      {activeMode === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Main Chat Panel */}
          <div className="lg:col-span-3">
            <Card className="flex flex-col" style={{ height: '500px' }}>
              {/* Messages area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {chatLog.map((chat, index) => (
                  <div
                    key={index}
                    className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {chat.sender === 'assistant' && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shrink-0 mr-2 mt-1">
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        chat.sender === 'user'
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-tr-none shadow-md shadow-violet-500/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/60 dark:border-slate-700/60'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{chat.text}</p>
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start items-end gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shrink-0">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-none px-4 py-3 border border-slate-200/60 dark:border-slate-700/60 flex gap-1 items-center">
                      {[0, 0.2, 0.4].map((d, i) => (
                        <div key={i} className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${d}s` }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Input area */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 rounded-b-2xl flex gap-3">
                <input
                  type="text"
                  placeholder="Ask anything (e.g. mock interview, networking suggestions)..."
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 text-sm px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/15 focus:border-violet-500 dark:focus:border-violet-400 transition-all"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button variant="primary" onClick={() => handleSendMessage()} icon={Send} isLoading={chatLoading}>
                  Send
                </Button>
              </div>
            </Card>
          </div>

          {/* Quick Suggestions Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider">Quick Suggestions</h4>
            <div className="flex flex-col gap-3">
              {promptTemplates.map((tmpl, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(tmpl)}
                  className="w-full text-left p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-violet-50 dark:hover:bg-violet-950/20 hover:border-violet-200 dark:hover:border-violet-900/40 text-xs text-slate-600 dark:text-slate-400 font-medium transition-all shadow-sm flex items-center justify-between gap-2 group cursor-pointer"
                >
                  <span className="line-clamp-2 leading-relaxed">{tmpl}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-violet-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Resume Analyzer Workspace ── */}
      {activeMode === 'resume' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Input Panel */}
          <Card>
            <CardHeader>
              <h3 className="font-bold text-base font-display flex items-center gap-2 text-slate-900 dark:text-white">
                <FileText className="w-4.5 h-4.5 text-violet-500" />
                ATS Parser &amp; Optimization
              </h3>
            </CardHeader>
            <form onSubmit={handleResumeReview}>
              <CardBody className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="resume" className="text-xs font-semibold text-slate-600 dark:text-slate-400 tracking-wide">
                    Paste Resume Content
                  </label>
                  <textarea
                    id="resume"
                    rows={6}
                    placeholder="Paste the text from your resume (education, work experience, skills)..."
                    required
                    className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 text-sm p-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/15 focus:border-violet-500 dark:focus:border-violet-400 transition-all font-medium leading-relaxed"
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="job-desc" className="text-xs font-semibold text-slate-600 dark:text-slate-400 tracking-wide">
                    Paste Job Description
                  </label>
                  <textarea
                    id="job-desc"
                    rows={4}
                    placeholder="Paste the description of the role you are applying for..."
                    required
                    className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 text-sm p-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/15 focus:border-violet-500 dark:focus:border-violet-400 transition-all font-medium leading-relaxed"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>
              </CardBody>
              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 rounded-b-2xl flex justify-end">
                <Button type="submit" variant="primary" isLoading={reviewLoading} icon={Sparkles}>
                  Analyze Resume
                </Button>
              </div>
            </form>
          </Card>

          {/* Feedback Panel */}
          <Card className="min-h-96">
            <CardHeader>
              <h3 className="font-bold text-base font-display text-slate-900 dark:text-white">Advisor Feedback Report</h3>
            </CardHeader>
            <CardBody>
              {reviewLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm text-slate-500 font-medium">Gemini is auditing keywords and matching scores...</p>
                </div>
              ) : resumeFeedback ? (
                <div className="prose prose-sm dark:prose-invert max-w-none text-sm text-slate-700 dark:text-slate-300 space-y-4 whitespace-pre-wrap leading-relaxed">
                  {resumeFeedback}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  <FileText className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                  <p className="text-sm text-slate-500 font-medium">Submit your resume and target description to get an immediate feedback analysis.</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}
    </motion.div>
  );
};

export default AIAssistantPage;
