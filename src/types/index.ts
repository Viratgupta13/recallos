// ─── Core Entity Types ──────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  dailyRevisionTarget: number;
  preferredSessionLength: number; // minutes
  notificationsEnabled: boolean;
}

export interface LearningMaterial {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: string;
  wordCount: number;
  topicCount: number;
  extractionStatus: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface Topic {
  id: string;
  userId: string;
  name: string;
  category: string;
  keywords: string[];
  description: string;
  sourceMaterialId: string;
  parentTopic?: string;
  relatedTopics: string[];
  prerequisiteTopics: string[];
  createdAt: string;
}

export interface Question {
  id: string;
  topicId: string;
  materialId: string;
  type: QuestionType;
  questionText: string;
  options?: string[]; // for MCQ
  expectedAnswer: string;
  concepts: string[];
  difficulty: Difficulty;
  createdAt: string;
}

export type QuestionType =
  | 'conceptual'
  | 'mcq'
  | 'comparison'
  | 'debugging'
  | 'coding'
  | 'explain-back';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface RevisionSession {
  id: string;
  userId: string;
  topicIds: string[];
  questionIds: string[];
  startedAt: string;
  completedAt?: string;
  averageRecall: number;
  questionsCompleted: number;
  durationMinutes?: number;
}

export interface RecallAttempt {
  id: string;
  sessionId: string;
  questionId: string;
  topicId: string;
  userAnswer: string;
  recallScore: number;
  rememberedConcepts: string[];
  missingConcepts: string[];
  feedback: string;
  createdAt: string;
}

export interface MemoryState {
  id: string;
  userId: string;
  topicId: string;
  topicName: string;
  topicCategory: string;
  memoryStrength: number; // 0–100
  confidence: number; // 0–100
  difficulty: Difficulty;
  reviewCount: number;
  lastReviewed: string;
  nextReview: string;
}

export interface RiskAssessment {
  topicId: string;
  topicName: string;
  topicCategory: string;
  riskLevel: RiskLevel;
  riskScore: number; // 0–100
  priority: number; // 1 = highest
  recommendedAction: string;
  memoryStrength: number;
  lastReviewed: string;
  recallScore: number;
}

export type RiskLevel = 'high' | 'medium' | 'low';

export interface AnalyticsOverview {
  knowledgeHealth: number;
  dueToday: number;
  averageRecall: number;
  currentStreak: number;
  totalTopics: number;
  totalMaterials: number;
  strongAreas: string[];
  weakAreas: string[];
  categoryPerformance: CategoryPerformance[];
  recallTrend: RecallTrendPoint[];
}

export interface CategoryPerformance {
  category: string;
  topicCount: number;
  averageRecall: number;
  averageMemoryStrength: number;
}

export interface RecallTrendPoint {
  date: string;
  recall: number;
  questionsAnswered: number;
}

export interface TodayRevision {
  topicCount: number;
  questionCount: number;
  estimatedMinutes: number;
  dueTopics: TopicSummary[];
  atRiskTopics: TopicSummary[];
}

export interface TopicSummary {
  id: string;
  name: string;
  category: string;
  memoryStrength: number;
  riskLevel: RiskLevel;
  questionCount: number;
}

export interface PlacementTest {
  id: string;
  title: string;
  category: PlacementCategory;
  subCategory: string;
  questionCount: number;
  duration: number; // minutes
  difficulty: Difficulty;
  lastAttempted?: string;
  bestScore?: number;
  status: 'not-started' | 'in-progress' | 'completed';
}

export type PlacementCategory =
  | 'aptitude'
  | 'technical'
  | 'coding';

export interface InterviewQuestion {
  id: string;
  category: string;
  questionText: string;
  stage: InterviewStage;
  difficulty: Difficulty;
  topicId?: string;
}

export type InterviewStage =
  | 'remember'
  | 'explain'
  | 'debug'
  | 'implement'
  | 'interview';

// ─── API Response Wrapper ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RevisionQuestion {
  question: Question;
  topic: Topic;
  attempt?: RecallAttempt;
}
