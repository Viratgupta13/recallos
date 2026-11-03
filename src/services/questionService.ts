import type { Question } from '@/types';
import { mockQuestions } from '@/data/mockData';
import { api } from './api';

const USE_MOCK = !import.meta.env.VITE_API_BASE_URL;
const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

export const questionService = {
  async getAll(): Promise<Question[]> {
    if (USE_MOCK) { await delay(); return mockQuestions; }
    return api.get<Question[]>('/questions');
  },

  async getById(id: string): Promise<Question> {
    if (USE_MOCK) {
      await delay(300);
      const q = mockQuestions.find(q => q.id === id);
      if (!q) throw new Error('Question not found');
      return q;
    }
    return api.get<Question>(`/questions/${id}`);
  },

  async getByTopic(topicId: string): Promise<Question[]> {
    if (USE_MOCK) {
      await delay(300);
      return mockQuestions.filter(q => q.topicId === topicId);
    }
    return api.get<Question[]>(`/questions?topicId=${topicId}`);
  },
};
