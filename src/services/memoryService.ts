import type { MemoryState } from '@/types';
import { mockMemoryStates } from '@/data/mockData';
import { api } from './api';

const USE_MOCK = !import.meta.env.VITE_API_BASE_URL;
const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

export const memoryService = {
  async getAll(): Promise<MemoryState[]> {
    if (USE_MOCK) { await delay(); return mockMemoryStates; }
    return api.get<MemoryState[]>('/memory');
  },

  async getByTopicId(topicId: string): Promise<MemoryState> {
    if (USE_MOCK) {
      await delay(300);
      const m = mockMemoryStates.find(m => m.topicId === topicId);
      if (!m) throw new Error('Memory state not found');
      return m;
    }
    return api.get<MemoryState>(`/memory/${topicId}`);
  },
};
