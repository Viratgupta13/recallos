import type { RiskAssessment } from '@/types';
import { mockRiskAssessments } from '@/data/mockData';
import { api } from './api';

const USE_MOCK = !import.meta.env.VITE_API_BASE_URL;
const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

export const forgettingService = {
  async getRadar(): Promise<RiskAssessment[]> {
    if (USE_MOCK) { await delay(); return mockRiskAssessments; }
    return api.get<RiskAssessment[]>('/forgetting-radar');
  },
};
