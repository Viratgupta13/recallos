import type { Topic } from '@/types';
import { mockTopics } from '@/data/mockData';
import { api } from './api';

const USE_MOCK = !import.meta.env.VITE_API_BASE_URL;
const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

export const topicService = {
  async getAll(): Promise<Topic[]> {
    if (USE_MOCK) { await delay(); return mockTopics; }
    return api.get<Topic[]>('/topics');
  },

  async getById(id: string): Promise<Topic> {
    if (USE_MOCK) {
      await delay(300);
      const t = mockTopics.find(t => t.id === id);
      if (!t) throw new Error('Topic not found');
      return t;
    }
    return api.get<Topic>(`/topics/${id}`);
  },
};
