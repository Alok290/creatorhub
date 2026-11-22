import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChatMessage, ChatThread } from '../types';
import { chatService } from '../services/chatService';
import {
  MessageSquare,
  Send,
  Search,
  CheckCheck,
  ArrowLeft,
  Sparkles
} from 'lucide-react';

export const CollabMessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileChatView, setMobileChatView] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior,
      });
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const loadThreads = async () => {
    try {
      const data = await chatService.getThreads();
      setThreads(data);
      if (data.length > 0 && !selectedThread) {
        setSelectedThread(data[0]);
      }
    } catch (err) {
      console.error('Failed to load threads:', err);
    } finally {
      setLoadingThreads(false);
    }
  };

  const loadMessages = async (appId: number, silent = false) => {
    if (!silent) setLoadingMessages(true);
    try {
      const data = await chatService.getMessages(appId);
      setMessages(data);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  };

  useEffect(() => {
    loadThreads();
    const interval = setInterval(() => {
      loadThreads();
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedThread) {
      loadMessages(selectedThread.applicationId, false);
      const interval = setInterval(() => {
        loadMessages(selectedThread.applicationId, true);
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [selectedThread?.applicationId]);

  useEffect(() => {
    scrollToBottom(messages.length <= 1 ? 'auto' : 'smooth');
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = inputText.trim();
    if (!clean || !selectedThread || sending) return;

    setSending(true);
    setInputText('');
    try {
      const sent = await chatService.sendMessage(selectedThread.applicationId, clean);
      setMessages((prev) => [...prev, sent]);
      // Update thread last message in list
      setThreads((prev) =>
        prev.map((t) =>
          t.applicationId === selectedThread.applicationId
            ? { ...t, lastMessage: clean, lastMessageAt: new Date().toISOString() }
            : t
        )
      );
    } catch (err) {
      console.error('Failed to send message:', err);
      setInputText(clean);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filteredThreads = threads.filter(
    (t) =>
      t.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.campaignTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const isCurrentUser = (senderId: number | string | undefined | null) => {
    if (!user || senderId == null) return false;
    return String(senderId) === String(user.id);
  };

  return (
    <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 flex-1 flex flex-col min-h-0 space-y-3">
      {/* Page Header */}
      <div className="flex-shrink-0 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-brand-500 inline" />
            <span>Collaboration Chat</span>
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Direct Messages</h1>
        </div>
      </div>

      {/* Main Chat Box - Fits Viewport Seamlessly Without Window Scrolling */}
      <div className="flex-1 min-h-0 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex">
        {/* Left Panel: Thread List */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col bg-white ${
            mobileChatView ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Thread Search */}
          <div className="p-3 sm:p-4 border-b border-slate-100 flex-shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Threads Scroll */}
          <div className="flex-1 overflow-y-auto overscroll-contain divide-y divide-slate-100">
            {loadingThreads ? (
              <div className="p-6 text-center text-xs text-slate-400 animate-pulse">
                Loading conversations...
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-600">No conversations found</p>
                <p className="text-[11px] text-slate-400">Apply to a collab or invite creators to start chatting.</p>
              </div>
            ) : (
              filteredThreads.map((t) => {
                const isSelected = selectedThread?.applicationId === t.applicationId;
                return (
                  <button
                    key={t.applicationId}
                    type="button"
                    onClick={() => {
                      setSelectedThread(t);
                      setMobileChatView(true);
                    }}
                    className={`w-full text-left p-3.5 sm:p-4 flex items-start space-x-3 transition-colors ${
                      isSelected ? 'bg-indigo-50/70 border-l-4 border-brand-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <img
                      src={
                        t.partnerAvatarUrl ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                      }
                      alt={t.partnerName}
                      className="w-11 h-11 rounded-full object-cover border border-slate-200 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{t.partnerName}</h4>
                        {t.lastMessageAt && (
                          <span className="text-[10px] text-slate-400 flex-shrink-0">
                            {formatTime(t.lastMessageAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-brand-600 truncate font-semibold mt-0.5">
                        {t.campaignTitle}
                      </p>
                      <p className="text-xs text-slate-500 truncate mt-1">{t.lastMessage}</p>
                    </div>

                    {t.unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-600 text-white flex-shrink-0">
                        {t.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel: Active Chat Window */}
        <div
          className={`flex-1 flex flex-col bg-slate-50/60 min-w-0 ${
            !mobileChatView ? 'hidden md:flex' : 'flex'
          }`}
        >
          {selectedThread ? (
            <>
              {/* Active Chat Header */}
              <div className="p-3.5 sm:p-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-2xs flex-shrink-0">
                <div className="flex items-center space-x-3 min-w-0">
                  <button
                    onClick={() => setMobileChatView(false)}
                    className="md:hidden p-1 text-slate-500 hover:text-slate-800"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <img
                    src={
                      selectedThread.partnerAvatarUrl ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                    }
                    alt={selectedThread.partnerName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0"
                  />

                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {selectedThread.partnerName}
                    </h3>
                    <p className="text-xs text-slate-500 truncate">
                      Collab: <span className="text-slate-800 font-semibold">{selectedThread.campaignTitle}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    {selectedThread.status}
                  </span>
                </div>
              </div>

              {/* Messages Body */}
              <div
                ref={messagesContainerRef}
                className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-3"
              >
                {loadingMessages ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                    <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-semibold text-slate-700">No messages yet</p>
                    <p className="text-xs text-slate-500 max-w-xs">
                      Send a message to discuss deliverables, mood boards, or campaign updates.
                    </p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMine = Boolean(
                      m.isMine === true ||
                      (m as any).mine === true ||
                      isCurrentUser(m.senderId)
                    );
                    const isRead = Boolean(m.isRead === true || (m as any).read === true);

                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} my-2`}
                      >
                        {/* Sender Name & Role Badge for Received Messages */}
                        {!isMine && (
                          <div className="flex items-center space-x-1.5 mb-1 pl-1">
                            {m.senderAvatarUrl ? (
                              <img
                                src={m.senderAvatarUrl}
                                alt={m.senderName || 'Sender'}
                                className="w-4 h-4 rounded-full object-cover border border-slate-200"
                              />
                            ) : (
                              <div className="w-4 h-4 rounded-full bg-slate-200 text-[9px] font-bold text-slate-600 flex items-center justify-center">
                                {(m.senderName || selectedThread.partnerName || 'U').charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="text-[11px] font-bold text-slate-800">
                              {m.senderName || selectedThread.partnerName}
                            </span>
                            <span
                              className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md ${
                                m.senderRole === 'MERCHANT'
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-indigo-100 text-indigo-700'
                              }`}
                            >
                              {m.senderRole === 'MERCHANT' ? 'Brand' : 'Creator'}
                            </span>
                          </div>
                        )}

                        {/* Message Bubble */}
                        <div
                          className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                            isMine
                              ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-tr-xs shadow-sm shadow-brand-500/10'
                              : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs shadow-2xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{m.content}</p>
                        </div>

                        {/* Timestamp & Delivery/Seen Status */}
                        <div
                          className={`flex items-center space-x-1 mt-1 px-1 text-[10px] text-slate-400 ${
                            isMine ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <span>{formatTime(m.createdAt)}</span>
                          {isMine && (
                            <span className="inline-flex items-center ml-0.5">
                              {isRead ? (
                                <span
                                  className="inline-flex items-center text-sky-500 font-bold"
                                  title="Seen by other (Blue Tick)"
                                >
                                  <CheckCheck className="w-3.5 h-3.5 text-sky-500 stroke-[2.5]" />
                                </span>
                              ) : (
                                <span
                                  className="inline-flex items-center text-slate-400"
                                  title="Delivered (Double Tick)"
                                >
                                  <CheckCheck className="w-3.5 h-3.5 text-slate-400" />
                                </span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input Bar */}
              <form
                onSubmit={handleSend}
                className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-end space-x-2 flex-shrink-0"
              >
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-brand-500 focus-within:bg-white transition-all">
                  <textarea
                    rows={1}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Message ${selectedThread.partnerName}... (Press Enter to send)`}
                    className="w-full bg-transparent text-sm focus:outline-none resize-none max-h-24 px-1"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!inputText.trim() || sending}
                  className="p-3 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl shadow-md shadow-brand-500/20 disabled:opacity-40 transition-all flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-700">Select a conversation</h3>
              <p className="text-xs text-slate-500 max-w-xs">
                Pick a collaboration thread from the left to start messaging in real time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
