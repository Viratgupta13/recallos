import { create } from 'zustand';
import type { RevisionSession, RecallAttempt } from '@/types';

interface RevisionState {
  currentSession: RevisionSession | null;
  currentQuestionIndex: number;
  attempts: RecallAttempt[];
  isEvaluating: boolean;
  sessionComplete: boolean;

  setSession: (session: RevisionSession) => void;
  nextQuestion: () => void;
  addAttempt: (attempt: RecallAttempt) => void;
  setEvaluating: (v: boolean) => void;
  completeSession: () => void;
  resetSession: () => void;
}

export const useRevisionStore = create<RevisionState>((set) => ({
  currentSession: null,
  currentQuestionIndex: 0,
  attempts: [],
  isEvaluating: false,
  sessionComplete: false,

  setSession: (session) => set({ currentSession: session, currentQuestionIndex: 0, attempts: [], sessionComplete: false }),
  nextQuestion: () => set((s) => ({ currentQuestionIndex: s.currentQuestionIndex + 1 })),
  addAttempt: (attempt) => set((s) => ({ attempts: [...s.attempts, attempt] })),
  setEvaluating: (v) => set({ isEvaluating: v }),
  completeSession: () => set({ sessionComplete: true }),
  resetSession: () => set({ currentSession: null, currentQuestionIndex: 0, attempts: [], isEvaluating: false, sessionComplete: false }),
}));
