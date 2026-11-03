import type { PlacementTest, InterviewQuestion } from '@/types';
import { mockPlacementTests, mockInterviewQuestions } from '@/data/mockData';
import { api } from './api';

const USE_MOCK = !import.meta.env.VITE_API_BASE_URL;
const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

export const placementService = {
  async getTests(): Promise<PlacementTest[]> {
    if (USE_MOCK) { await delay(); return mockPlacementTests; }
    return api.get<PlacementTest[]>('/placement/tests');
  },

  async getTestById(id: string): Promise<PlacementTest> {
    if (USE_MOCK) {
      await delay(300);
      const t = mockPlacementTests.find(t => t.id === id);
      if (!t) throw new Error('Test not found');
      return t;
    }
    return api.get<PlacementTest>(`/placement/tests/${id}`);
  },
};

export const interviewService = {
  async getQuestions(): Promise<InterviewQuestion[]> {
    if (USE_MOCK) { await delay(); return mockInterviewQuestions; }
    return api.get<InterviewQuestion[]>('/interview/questions');
  },
};
