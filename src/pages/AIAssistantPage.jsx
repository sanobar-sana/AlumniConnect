import React, { useState } from 'react';
import aiService from '../services/aiService';
import Card, { CardBody, CardHeader } from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Sparkles, Send, FileText, MessageSquare, AlertCircle, ArrowRight } from 'lucide-react';

export const AIAssistantPage = () => {
  const [activeMode, setActiveMode] = useState('chat'); // 'chat' or 'resume'

  // Chat State
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([
    { sender: 'assistant', text: "Hello! I am your Gemini Career Assistant. I can help you prepare for technical interviews, drafts cold outreach letters, or give structural suggestions for your resume. What can I do for you today?" }
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

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight font-display mb-1 text-slate-900">AI Career Advisor</h2>
        <p className="text-gray-700 dark:text-gray-300">Connect with Gemini-powered intelligence to optimize your career path and network impact.</p>
      </div>

      {/* Mode Switches */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveMode('chat')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 text-sm font-semibold transition-all cursor-pointer ${
            activeMode === 'chat'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-bold'
              : 'border-transparent text-zinc-500 hover:text-zinc-950 dark:hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Interactive Coach Chat
        </button>
        <button
          onClick={() => setActiveMode('resume')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 text-sm font-semibold transition-all cursor-pointer ${
            activeMode === 'resume'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-bold'
              : 'border-transparent text-zinc-500 hover:text-zinc-950 dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          Resume Optimizer
        </button>
      </div>

      {/* Chat Workspace */}
      {activeMode === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Main Chat Panel */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="border border-zinc-200 dark:border-zinc-800 flex flex-col h-125">
              {/* Message Display Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-125">
                {chatLog.map((chat, index) => (
                  <div
                    key={index}
                    className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed wrap-break-word ${
                        chat.sender === 'user'
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-none border border-zinc-200/50 dark:border-zinc-800/50'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{chat.text}</p>
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl rounded-tl-none p-4 border border-zinc-200/50 dark:border-zinc-800/50 flex gap-1 items-center">
                      <div className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input Area */}
              <div className="p-4 border-t border-zinc-200/70 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10 rounded-b-xl flex gap-3">
                <input
                  type="text"
                  placeholder="Ask anything (e.g. mock interview, networking suggestions)..."
                  className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-800 text-sm px-4 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
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

          {/* Templates/Quick Actions Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <h4 className="font-bold text-sm text-gray-500 uppercase tracking-wider">Quick Suggestions</h4>
            <div className="flex flex-col gap-3">
              {promptTemplates.map((tmpl, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(tmpl)}
                  className="w-full text-left p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-xs text-gray-700 dark:text-gray-300 font-medium transition-all shadow-sm flex items-center justify-between group cursor-pointer"
                >
                  <span className="line-clamp-2 leading-relaxed">{tmpl}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Resume Analyzer Workspace */}
      {activeMode === 'resume' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Input Panel */}
          <Card className="border border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <h3 className="font-bold text-lg font-display flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                ATS Parser & Optimization
              </h3>
            </CardHeader>
            <form onSubmit={handleResumeReview}>
              <CardBody className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="resume" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Paste Resume Content
                  </label>
                  <textarea
                    id="resume"
                    rows={6}
                    placeholder="Paste the text from your resume (education, work experience, skills)..."
                    required
                    className="block w-full rounded-lg border border-zinc-200 dark:border-zinc-800 text-sm p-3 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="job-desc" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Paste Job Description
                  </label>
                  <textarea
                    id="job-desc"
                    rows={4}
                    placeholder="Paste the description of the role you are applying for..."
                    required
                    className="block w-full rounded-lg border border-zinc-200 dark:border-zinc-800 text-sm p-3 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>
              </CardBody>
              <div className="px-6 py-4 border-t border-zinc-150 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-b-xl flex justify-end">
                <Button type="submit" variant="primary" isLoading={reviewLoading} icon={Sparkles}>
                  Analyze Resume
                </Button>
              </div>
            </form>
          </Card>

          {/* Feedback Output Panel */}
          <Card className="border border-zinc-200 dark:border-zinc-800 min-h-100">
            <CardHeader>
              <h3 className="font-bold text-lg font-display">Advisor Feedback Report</h3>
            </CardHeader>
            <CardBody className="p-6">
              {reviewLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Gemini is auditing keywords and matching scores...</p>
                </div>
              ) : resumeFeedback ? (
                <div className="prose prose-sm dark:prose-invert max-w-none text-sm text-zinc-700 dark:text-zinc-300 space-y-4 whitespace-pre-wrap wrap-break-word leading-relaxed">
                  {resumeFeedback}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-2 border-2 border-dashed border-zinc-200 dark:border-zinc-800/80 rounded-xl text-gray-600 dark:text-gray-300">
                  <FileText className="w-10 h-10 text-zinc-300 dark:text-zinc-700" />
                  <p className="text-sm">Submit your resume and target description to get an immediate feedback analysis.</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AIAssistantPage;
