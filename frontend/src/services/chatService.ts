import { api } from './api';
import { ChatMessage, ChatThread } from '../types';

export const chatService = {
  async getMessages(applicationId: number): Promise<ChatMessage[]> {
    return api.get<ChatMessage[]>(`/chat/applications/${applicationId}/messages`);
  },

  async sendMessage(applicationId: number, content: string): Promise<ChatMessage> {
    return api.post<ChatMessage>(`/chat/applications/${applicationId}/messages`, { content });
  },

  async getThreads(): Promise<ChatThread[]> {
    return api.get<ChatThread[]>('/chat/threads');
  },
};
