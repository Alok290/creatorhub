import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChatMessage } from '../types';
import { chatService } from '../services/chatService';
import { X, Send, MessageSquare, CheckCheck } from 'lucide-react';

interface CollabChatModalProps {
  applicationId: number | null;
  partnerName: string;
  partnerAvatarUrl?: string;
  partnerRole?: string;
  collabTitle: string;
  collabStatus?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const CollabChatModal: React.FC<CollabChatModalProps> = ({
  applicationId,
  partnerName,
  partnerAvatarUrl,
  partnerRole,
  collabTitle,
  collabStatus,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !applicationId) return null;

  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior,
      });
    }
  };

  const fetchChatMessages = async (silent = false) => {
    if (!applicationId) return;
    if (!silent) setLoading(true);
    try {
      const data = await chatService.getMessages(applicationId);
      setMessages(data);
    } catch (err) {
      console.error('Failed to load chat messages:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && applicationId) {
      fetchChatMessages(false);
      // Auto-poll every 3.5s for real-time messaging
      const interval = setInterval(() => {
        fetchChatMessages(true);
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [isOpen, applicationId]);

  useEffect(() => {
    scrollToBottom(messages.length <= 1 ? 'auto' : 'smooth');
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = inputText.trim();
    if (!clean || !applicationId || sending) return;

    setSending(true);
    setInputText('');
    try {
      const sent = await chatService.sendMessage(applicationId, clean);
      setMessages((prev) => [...prev, sent]);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/65 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full h-[90vh] sm:h-[80vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden relative">
        {/* Chat Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between shadow-sm flex-shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <img
              src={
                partnerAvatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
              }
              alt={partnerName}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-white/20 flex-shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm sm:text-base font-bold text-white truncate">{partnerName}</h3>
                {partnerRole && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                    {partnerRole === 'MERCHANT' ? 'Brand' : 'Creator'}
                  </span>
                )}
              </div>
              <p className="text-xs text-white/70 truncate mt-0.5">
                Collab: <span className="text-indigo-300 font-semibold">{collabTitle}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Body */}
        <div
          ref={messagesContainerRef}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-3 bg-slate-50/70"
        >
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-2 text-slate-400 text-xs">
                <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p>Loading conversation...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-700">No messages yet</h4>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Start the conversation with {partnerName} to discuss guidelines, creative directions, or content draft feedback.
                </p>
              </div>
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
                          {(m.senderName || partnerName || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-[11px] font-bold text-slate-800">
                        {m.senderName || partnerName}
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
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
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
          className="p-3 sm:p-4 bg-white border-t border-slate-100 flex items-end space-x-2 flex-shrink-0"
        >
          <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-brand-500 focus-within:bg-white transition-all">
            <textarea
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${partnerName}... (Press Enter to send)`}
              className="w-full bg-transparent text-sm focus:outline-none resize-none max-h-24 px-1"
            />
          </div>

          <button
            type="submit"
            disabled={!inputText.trim() || sending}
            className="p-3 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl shadow-md shadow-brand-500/20 disabled:opacity-40 transition-all flex-shrink-0"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
