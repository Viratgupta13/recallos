import type { LearningMaterial } from '@/types';
import { mockMaterials } from '@/data/mockData';
import { api } from './api';

const USE_MOCK = !import.meta.env.VITE_API_BASE_URL;
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

let _materials = [...mockMaterials];

export const materialService = {
  async getAll(): Promise<LearningMaterial[]> {
    if (USE_MOCK) { await delay(); return [..._materials]; }
    return api.get<LearningMaterial[]>('/materials');
  },

  async getById(id: string): Promise<LearningMaterial> {
    if (USE_MOCK) {
      await delay(300);
      const m = _materials.find(m => m.id === id);
      if (!m) throw new Error('Material not found');
      return m;
    }
    return api.get<LearningMaterial>(`/materials/${id}`);
  },

  async create(data: Pick<LearningMaterial, 'title' | 'content' | 'category'>): Promise<LearningMaterial> {
    if (USE_MOCK) {
      await delay(700);
      const newMat: LearningMaterial = {
        ...data,
        id: 'mat-' + Date.now(),
        userId: 'user-1',
        wordCount: data.content.split(/\s+/).length,
        topicCount: 0,
        extractionStatus: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      _materials = [newMat, ..._materials];
      return newMat;
    }
    return api.post<LearningMaterial>('/materials', data);
  },

  async update(id: string, data: Partial<LearningMaterial>): Promise<LearningMaterial> {
    if (USE_MOCK) {
      await delay(500);
      const idx = _materials.findIndex(m => m.id === id);
      if (idx === -1) throw new Error('Material not found');
      _materials[idx] = { ..._materials[idx], ...data, updatedAt: new Date().toISOString() };
      return _materials[idx];
    }
    return api.put<LearningMaterial>(`/materials/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    if (USE_MOCK) {
      await delay(400);
      _materials = _materials.filter(m => m.id !== id);
      return;
    }
    return api.delete(`/materials/${id}`);
  },

  async extractTopics(id: string): Promise<{ topicCount: number }> {
    if (USE_MOCK) {
      await delay(2000);
      const idx = _materials.findIndex(m => m.id === id);
      if (idx !== -1) {
        _materials[idx] = {
          ..._materials[idx],
          extractionStatus: 'completed',
          topicCount: Math.floor(Math.random() * 4) + 2,
          updatedAt: new Date().toISOString(),
        };
        return { topicCount: _materials[idx].topicCount };
      }
      throw new Error('Material not found');
    }
    return api.post<{ topicCount: number }>(`/materials/${id}/extract-topics`);
  },
};
