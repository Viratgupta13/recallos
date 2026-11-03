import type { RevisionSession, RecallAttempt, TodayRevision } from '@/types';
import { mockRevisionSessions, mockTodayRevision, mockRecallAttempts, mockQuestions, mockTopics } from '@/data/mockData';
import { api } from './api';

const USE_MOCK = !import.meta.env.VITE_API_BASE_URL;
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const revisionService = {
  async getToday(): Promise<TodayRevision> {
    if (USE_MOCK) { await delay(400); return mockTodayRevision; }
    return api.get<TodayRevision>('/revision/today');
  },

  async getHistory(): Promise<RevisionSession[]> {
    if (USE_MOCK) { await delay(); return mockRevisionSessions; }
    return api.get<RevisionSession[]>('/revision/history');
  },

  async startSession(): Promise<RevisionSession> {
    if (USE_MOCK) {
      await delay(600);
      return {
        id: 'session-' + Date.now(),
        userId: 'user-1',
        topicIds: ['topic-1', 'topic-7', 'topic-5'],
        questionIds: ['q-1', 'q-6', 'q-4', 'q-10', 'q-2'],
        startedAt: new Date().toISOString(),
        averageRecall: 0,
        questionsCompleted: 0,
      };
    }
    return api.post<RevisionSession>('/revision/session');
  },

  async getSessionQuestions(sessionId: string): Promise<{ question: typeof mockQuestions[0]; topic: typeof mockTopics[0] }[]> {
    if (USE_MOCK) {
      await delay(300);
      const questionIds = ['q-1', 'q-6', 'q-4', 'q-10', 'q-2'];
      return questionIds.map(qid => {
        const q = mockQuestions.find(q => q.id === qid)!;
        const t = mockTopics.find(t => t.id === q.topicId)!;
        return { question: q, topic: t };
      });
    }
    return api.get(`/revision/session/${sessionId}/questions`);
  },

  async submitAnswer(data: {
    sessionId: string;
    questionId: string;
    topicId: string;
    userAnswer: string;
  }): Promise<RecallAttempt> {
    if (USE_MOCK) {
      await delay(1500); // simulate evaluation time
      const score = Math.floor(Math.random() * 40) + 50; // 50-90 range
      return {
        id: 'attempt-' + Date.now(),
        sessionId: data.sessionId,
        questionId: data.questionId,
        topicId: data.topicId,
        userAnswer: data.userAnswer,
        recallScore: score,
        rememberedConcepts: ['Connection-oriented vs connectionless', 'Reliability guarantee'].slice(0, score > 70 ? 2 : 1),
        missingConcepts: score < 80 ? ['Flow control details', 'Use case examples'] : [],
        feedback: score >= 80
          ? 'Excellent recall! Your answer demonstrates strong understanding of the concepts.'
          : score >= 60
          ? 'Good effort! Your answer covers the main ideas but could be more detailed.'
          : 'Your answer shows partial understanding. Review the key concepts and try again.',
        createdAt: new Date().toISOString(),
      };
    }
    return api.post<RecallAttempt>('/recall/attempt', data);
  },

  async getAttemptById(id: string): Promise<RecallAttempt> {
    if (USE_MOCK) {
      await delay(300);
      const a = mockRecallAttempts.find(a => a.id === id);
      if (!a) throw new Error('Attempt not found');
      return a;
    }
    return api.get<RecallAttempt>(`/recall/${id}`);
  },
};
