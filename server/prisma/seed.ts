// Seeds the RecallOS database with the demo dataset.
// Demo login: aryan@example.com / password123
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const J = (v: unknown) => JSON.stringify(v);
const d = (s: string) => new Date(s);

const USER_ID = 'user-1';

const materials = [
  { id: 'mat-1', title: 'TCP/IP Networking Fundamentals', category: 'Computer Networks', wordCount: 87, topicCount: 4, content: 'TCP/IP is the foundational protocol suite of the internet. TCP provides reliable, ordered, error-checked delivery using a three-way handshake (SYN, SYN-ACK, ACK). IP handles addressing and routing. Key concepts: flow control, congestion control, windowing, port numbers.', createdAt: '2026-09-10T10:00:00Z' },
  { id: 'mat-2', title: 'Object-Oriented Programming Principles', category: 'OOP', wordCount: 73, topicCount: 5, content: 'OOP is based on objects. The four core principles are Encapsulation, Inheritance, Polymorphism and Abstraction. Common design patterns include Factory, Singleton, Observer and Strategy.', createdAt: '2026-09-12T14:00:00Z' },
  { id: 'mat-3', title: 'Database Normalization and ACID Properties', category: 'DBMS', wordCount: 81, topicCount: 6, content: 'Normalization organizes a relational database to reduce redundancy: 1NF, 2NF, 3NF, BCNF. ACID properties (Atomicity, Consistency, Isolation, Durability) ensure reliable transactions. B-trees are commonly used for indexing.', createdAt: '2026-09-15T09:00:00Z' },
  { id: 'mat-4', title: 'Process Scheduling in Operating Systems', category: 'Operating Systems', wordCount: 76, topicCount: 4, content: 'CPU scheduling algorithms: FCFS, SJF, Round Robin, Priority, Multilevel Queue. Context switching saves and restores process state. Deadlocks need mutual exclusion, hold and wait, no preemption, circular wait. Banker\'s algorithm detects safe states.', createdAt: '2026-09-18T11:00:00Z' },
  { id: 'mat-5', title: 'Data Structures: Trees and Graphs', category: 'DSA', wordCount: 80, topicCount: 7, content: 'Binary trees store data hierarchically. Balanced BSTs (AVL, Red-Black) give O(log n) operations. Graph traversals: BFS uses a queue, DFS uses a stack. Shortest paths: Dijkstra, Bellman-Ford, Floyd-Warshall. Spanning trees: Prim and Kruskal.', createdAt: '2026-09-20T16:00:00Z' },
  { id: 'mat-6', title: 'React Hooks and Component Lifecycle', category: 'React', wordCount: 69, topicCount: 5, content: 'React hooks add state and lifecycle to function components. useState, useEffect, useContext, useReducer, useMemo and useCallback. Custom hooks encapsulate reusable stateful logic.', createdAt: '2026-09-22T13:00:00Z' },
];

const topics = [
  { id: 'topic-1', name: 'TCP vs UDP', category: 'Computer Networks', keywords: ['TCP', 'UDP', 'transport layer', 'reliability', 'connection'], description: 'Comparison of TCP and UDP protocols at the transport layer', sourceMaterialId: 'mat-1', relatedTopics: ['topic-2', 'topic-3'], prerequisiteTopics: [], createdAt: '2026-09-10T10:05:00Z' },
  { id: 'topic-2', name: 'Three-Way Handshake', category: 'Computer Networks', keywords: ['SYN', 'SYN-ACK', 'ACK', 'connection establishment', 'TCP'], description: 'TCP connection establishment process', sourceMaterialId: 'mat-1', relatedTopics: ['topic-1'], prerequisiteTopics: ['topic-1'], createdAt: '2026-09-10T10:05:00Z' },
  { id: 'topic-3', name: 'OOP Pillars', category: 'OOP', keywords: ['encapsulation', 'inheritance', 'polymorphism', 'abstraction'], description: 'The four fundamental principles of OOP', sourceMaterialId: 'mat-2', relatedTopics: ['topic-4'], prerequisiteTopics: [], createdAt: '2026-09-12T14:10:00Z' },
  { id: 'topic-4', name: 'Design Patterns', category: 'OOP', keywords: ['factory', 'singleton', 'observer', 'strategy', 'pattern'], description: 'Common software design patterns', sourceMaterialId: 'mat-2', relatedTopics: ['topic-3'], prerequisiteTopics: ['topic-3'], createdAt: '2026-09-12T14:10:00Z' },
  { id: 'topic-5', name: 'Database Normalization', category: 'DBMS', keywords: ['1NF', '2NF', '3NF', 'BCNF', 'normal forms', 'redundancy'], description: 'Normal forms and normalization process', sourceMaterialId: 'mat-3', relatedTopics: ['topic-6'], prerequisiteTopics: [], createdAt: '2026-09-15T09:08:00Z' },
  { id: 'topic-6', name: 'ACID Properties', category: 'DBMS', keywords: ['atomicity', 'consistency', 'isolation', 'durability', 'transaction'], description: 'ACID properties of database transactions', sourceMaterialId: 'mat-3', relatedTopics: ['topic-5'], prerequisiteTopics: ['topic-5'], createdAt: '2026-09-15T09:08:00Z' },
  { id: 'topic-7', name: 'CPU Scheduling Algorithms', category: 'Operating Systems', keywords: ['FCFS', 'SJF', 'Round Robin', 'Priority', 'scheduling'], description: 'CPU scheduling algorithms and characteristics', sourceMaterialId: 'mat-4', relatedTopics: ['topic-8'], prerequisiteTopics: [], createdAt: '2026-09-18T11:06:00Z' },
  { id: 'topic-8', name: 'Deadlock Prevention', category: 'Operating Systems', keywords: ['deadlock', 'mutual exclusion', 'banker algorithm', 'circular wait'], description: 'Deadlock conditions and prevention strategies', sourceMaterialId: 'mat-4', relatedTopics: ['topic-7'], prerequisiteTopics: ['topic-7'], createdAt: '2026-09-18T11:06:00Z' },
  { id: 'topic-9', name: 'Graph Algorithms', category: 'DSA', keywords: ['BFS', 'DFS', 'Dijkstra', 'Bellman-Ford', 'spanning tree'], description: 'Graph traversal and shortest path algorithms', sourceMaterialId: 'mat-5', relatedTopics: ['topic-10'], prerequisiteTopics: [], createdAt: '2026-09-20T16:09:00Z' },
  { id: 'topic-10', name: 'Binary Search Tree', category: 'DSA', keywords: ['BST', 'AVL', 'Red-Black', 'balanced', 'O(log n)'], description: 'Binary search trees, balancing and complexity', sourceMaterialId: 'mat-5', relatedTopics: ['topic-9'], prerequisiteTopics: [], createdAt: '2026-09-20T16:09:00Z' },
  { id: 'topic-11', name: 'React Hooks', category: 'React', keywords: ['useState', 'useEffect', 'useContext', 'useMemo', 'custom hooks'], description: 'React hooks for state and side effects', sourceMaterialId: 'mat-6', relatedTopics: [], prerequisiteTopics: [], createdAt: '2026-09-22T13:07:00Z' },
];

const questions = [
  { id: 'q-1', topicId: 'topic-1', materialId: 'mat-1', type: 'comparison', questionText: 'What is the difference between TCP and UDP? When would you use each?', expectedAnswer: 'TCP is connection-oriented, reliable, ordered, slower. UDP is connectionless, unreliable, faster. TCP for file transfer, email, HTTP. UDP for video streaming, DNS, gaming.', concepts: ['connection-oriented', 'reliability', 'ordering', 'flow control', 'use cases'], difficulty: 'medium', createdAt: '2026-09-10T10:10:00Z' },
  { id: 'q-2', topicId: 'topic-2', materialId: 'mat-1', type: 'conceptual', questionText: 'Explain the TCP three-way handshake process step by step.', expectedAnswer: 'SYN: client sends sync request. SYN-ACK: server acknowledges and sends its own SYN. ACK: client acknowledges. Connection established.', concepts: ['SYN', 'SYN-ACK', 'ACK', 'connection establishment', 'sequence numbers'], difficulty: 'easy', createdAt: '2026-09-10T10:10:00Z' },
  { id: 'q-3', topicId: 'topic-3', materialId: 'mat-2', type: 'conceptual', questionText: 'Explain the four pillars of Object-Oriented Programming with examples.', expectedAnswer: 'Encapsulation: bundling data in a class. Inheritance: extending classes. Polymorphism: method overriding/overloading. Abstraction: abstract classes and interfaces.', concepts: ['encapsulation', 'inheritance', 'polymorphism', 'abstraction'], difficulty: 'medium', createdAt: '2026-09-12T14:15:00Z' },
  { id: 'q-4', topicId: 'topic-5', materialId: 'mat-3', type: 'explain-back', questionText: 'What is database normalization? Explain up to 3NF.', expectedAnswer: '1NF: atomic values. 2NF: no partial dependencies. 3NF: no transitive dependencies.', concepts: ['1NF', '2NF', '3NF', 'partial dependency', 'transitive dependency'], difficulty: 'hard', createdAt: '2026-09-15T09:10:00Z' },
  { id: 'q-5', topicId: 'topic-6', materialId: 'mat-3', type: 'conceptual', questionText: 'What are ACID properties in database transactions?', expectedAnswer: 'Atomicity: all or nothing. Consistency: valid state. Isolation: concurrent transactions. Durability: committed data persists.', concepts: ['atomicity', 'consistency', 'isolation', 'durability'], difficulty: 'medium', createdAt: '2026-09-15T09:10:00Z' },
  { id: 'q-6', topicId: 'topic-7', materialId: 'mat-4', type: 'comparison', questionText: 'Compare FCFS, SJF, and Round Robin scheduling algorithms.', expectedAnswer: 'FCFS: non-preemptive, convoy effect. SJF: optimal average wait, starvation. Round Robin: preemptive, fair, quantum-based.', concepts: ['FCFS', 'SJF', 'Round Robin', 'preemption', 'starvation', 'convoy effect'], difficulty: 'hard', createdAt: '2026-09-18T11:10:00Z' },
  { id: 'q-7', topicId: 'topic-9', materialId: 'mat-5', type: 'conceptual', questionText: "Explain Dijkstra's shortest path algorithm. What is its time complexity?", expectedAnswer: 'Greedy single-source shortest path for non-negative weights. Uses a priority queue. O((V+E) log V) with a binary heap.', concepts: ['greedy', 'priority queue', 'relaxation', 'non-negative weights', 'O(E log V)'], difficulty: 'hard', createdAt: '2026-09-20T16:15:00Z' },
  { id: 'q-8', topicId: 'topic-11', materialId: 'mat-6', type: 'conceptual', questionText: 'What is the difference between useState and useReducer in React?', expectedAnswer: 'useState for simple state. useReducer for complex state or when next state depends on previous, similar to Redux.', concepts: ['useState', 'useReducer', 'state management', 'dispatch', 'reducer function'], difficulty: 'medium', createdAt: '2026-09-22T13:10:00Z' },
  { id: 'q-9', topicId: 'topic-4', materialId: 'mat-2', type: 'explain-back', questionText: 'Explain the Singleton design pattern and when to use it.', expectedAnswer: 'Ensures one instance. Private constructor, static instance, lazy init. Use for DB connections, loggers, configuration.', concepts: ['single instance', 'private constructor', 'static method', 'global access', 'lazy initialization'], difficulty: 'medium', createdAt: '2026-09-12T14:15:00Z' },
  { id: 'q-10', topicId: 'topic-8', materialId: 'mat-4', type: 'conceptual', questionText: 'What are the four necessary conditions for a deadlock to occur?', expectedAnswer: 'Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait.', concepts: ['mutual exclusion', 'hold and wait', 'no preemption', 'circular wait'], difficulty: 'medium', createdAt: '2026-09-18T11:10:00Z' },
];

const memory = [
  { topicId: 'topic-1', memoryStrength: 42, confidence: 45, difficulty: 'medium', reviewCount: 3, intervalDays: 6, lastReviewed: '2026-09-15T10:00:00Z', nextReview: '2026-09-26T10:00:00Z' },
  { topicId: 'topic-2', memoryStrength: 38, confidence: 40, difficulty: 'easy', reviewCount: 2, intervalDays: 6, lastReviewed: '2026-09-17T10:00:00Z', nextReview: '2026-09-27T10:00:00Z' },
  { topicId: 'topic-3', memoryStrength: 78, confidence: 80, difficulty: 'medium', reviewCount: 7, intervalDays: 6, lastReviewed: '2026-09-24T10:00:00Z', nextReview: '2026-09-30T10:00:00Z' },
  { topicId: 'topic-4', memoryStrength: 65, confidence: 62, difficulty: 'hard', reviewCount: 4, intervalDays: 6, lastReviewed: '2026-09-22T10:00:00Z', nextReview: '2026-09-28T10:00:00Z' },
  { topicId: 'topic-5', memoryStrength: 55, confidence: 52, difficulty: 'hard', reviewCount: 5, intervalDays: 7, lastReviewed: '2026-09-19T10:00:00Z', nextReview: '2026-09-26T10:00:00Z' },
  { topicId: 'topic-6', memoryStrength: 83, confidence: 85, difficulty: 'medium', reviewCount: 8, intervalDays: 6, lastReviewed: '2026-09-25T10:00:00Z', nextReview: '2026-10-01T10:00:00Z' },
  { topicId: 'topic-7', memoryStrength: 48, confidence: 50, difficulty: 'medium', reviewCount: 3, intervalDays: 10, lastReviewed: '2026-09-16T10:00:00Z', nextReview: '2026-09-26T10:00:00Z' },
  { topicId: 'topic-8', memoryStrength: 35, confidence: 38, difficulty: 'hard', reviewCount: 2, intervalDays: 12, lastReviewed: '2026-09-14T10:00:00Z', nextReview: '2026-09-26T10:00:00Z' },
  { topicId: 'topic-9', memoryStrength: 72, confidence: 70, difficulty: 'hard', reviewCount: 6, intervalDays: 6, lastReviewed: '2026-09-23T10:00:00Z', nextReview: '2026-09-29T10:00:00Z' },
  { topicId: 'topic-10', memoryStrength: 88, confidence: 90, difficulty: 'medium', reviewCount: 9, intervalDays: 7, lastReviewed: '2026-09-25T10:00:00Z', nextReview: '2026-10-02T10:00:00Z' },
  { topicId: 'topic-11', memoryStrength: 91, confidence: 93, difficulty: 'medium', reviewCount: 10, intervalDays: 8, lastReviewed: '2026-09-25T10:00:00Z', nextReview: '2026-10-03T10:00:00Z' },
];

const placementTests = [
  { title: 'Quantitative Aptitude — Basic', category: 'aptitude', subCategory: 'Quantitative Aptitude', questionCount: 25, duration: 30, difficulty: 'easy', lastAttempted: '2026-09-20T10:00:00Z', bestScore: 72, status: 'completed' },
  { title: 'Logical Reasoning — Advanced', category: 'aptitude', subCategory: 'Logical Reasoning', questionCount: 20, duration: 25, difficulty: 'hard', status: 'not-started' },
  { title: 'Verbal Ability — Comprehension', category: 'aptitude', subCategory: 'Verbal Ability', questionCount: 30, duration: 35, difficulty: 'medium', lastAttempted: '2026-09-22T14:00:00Z', bestScore: 68, status: 'completed' },
  { title: 'DSA Fundamentals', category: 'technical', subCategory: 'DSA', questionCount: 30, duration: 40, difficulty: 'medium', lastAttempted: '2026-09-24T16:00:00Z', bestScore: 80, status: 'completed' },
  { title: 'OOP & Design Patterns', category: 'technical', subCategory: 'OOP', questionCount: 25, duration: 30, difficulty: 'medium', status: 'not-started' },
  { title: 'DBMS & SQL', category: 'technical', subCategory: 'DBMS', questionCount: 25, duration: 30, difficulty: 'medium', lastAttempted: '2026-09-21T11:00:00Z', bestScore: 74, status: 'completed' },
  { title: 'Operating Systems', category: 'technical', subCategory: 'OS', questionCount: 25, duration: 30, difficulty: 'hard', status: 'not-started' },
  { title: 'Computer Networks', category: 'technical', subCategory: 'Computer Networks', questionCount: 25, duration: 30, difficulty: 'medium', status: 'in-progress' },
  { title: 'Coding — Arrays & Strings', category: 'coding', subCategory: 'Programming Problems', questionCount: 5, duration: 60, difficulty: 'medium', status: 'not-started' },
  { title: 'Coding — Trees & Graphs', category: 'coding', subCategory: 'DSA Problems', questionCount: 5, duration: 60, difficulty: 'hard', status: 'not-started' },
];

const interviewQuestions = [
  { category: 'DSA', questionText: 'How does a HashMap work internally in Java?', stage: 'explain', difficulty: 'medium', topicId: 'topic-10' },
  { category: 'OOP', questionText: 'What is the difference between abstract class and interface?', stage: 'remember', difficulty: 'easy', topicId: 'topic-3' },
  { category: 'DBMS', questionText: 'Write a SQL query to find the second highest salary.', stage: 'implement', difficulty: 'medium', topicId: 'topic-5' },
  { category: 'OS', questionText: 'Explain virtual memory and paging.', stage: 'explain', difficulty: 'hard', topicId: 'topic-7' },
  { category: 'CN', questionText: 'What happens when you type google.com in a browser?', stage: 'interview', difficulty: 'medium', topicId: 'topic-1' },
  { category: 'DSA', questionText: 'Implement binary search and explain its complexity.', stage: 'implement', difficulty: 'easy', topicId: 'topic-10' },
  { category: 'System Design', questionText: 'Design a URL shortener like bit.ly.', stage: 'interview', difficulty: 'hard', topicId: null },
];

// A few historical completed sessions so history + analytics trend are populated.
const sessions = [
  { id: 'session-1', topicIds: ['topic-3', 'topic-6', 'topic-11'], questionIds: ['q-3', 'q-5', 'q-8'], startedAt: '2026-09-25T09:00:00Z', completedAt: '2026-09-25T09:18:00Z', averageRecall: 82, questionsCompleted: 3, durationMinutes: 18 },
  { id: 'session-2', topicIds: ['topic-9', 'topic-10', 'topic-4'], questionIds: ['q-7', 'q-9'], startedAt: '2026-09-24T20:00:00Z', completedAt: '2026-09-24T20:15:00Z', averageRecall: 71, questionsCompleted: 2, durationMinutes: 15 },
  { id: 'session-3', topicIds: ['topic-1', 'topic-2', 'topic-7'], questionIds: ['q-1', 'q-2', 'q-6'], startedAt: '2026-09-23T18:30:00Z', completedAt: '2026-09-23T18:52:00Z', averageRecall: 52, questionsCompleted: 3, durationMinutes: 22 },
  { id: 'session-4', topicIds: ['topic-5', 'topic-6'], questionIds: ['q-4', 'q-5'], startedAt: '2026-09-22T10:00:00Z', completedAt: '2026-09-22T10:14:00Z', averageRecall: 65, questionsCompleted: 2, durationMinutes: 14 },
  { id: 'session-5', topicIds: ['topic-8', 'topic-7'], questionIds: ['q-10', 'q-6'], startedAt: '2026-09-21T19:00:00Z', completedAt: '2026-09-21T19:20:00Z', averageRecall: 44, questionsCompleted: 2, durationMinutes: 20 },
];

const attempts = [
  { sessionId: 'session-3', questionId: 'q-1', topicId: 'topic-1', userAnswer: 'TCP is connection-based and reliable while UDP is faster but unreliable.', recallScore: 48, rememberedConcepts: ['connection-oriented', 'reliability'], missingConcepts: ['flow control', 'ordering', 'use cases'], feedback: 'Partial recall. You captured the core difference but missed flow control, ordering and use cases.', createdAt: '2026-09-23T18:35:00Z' },
  { sessionId: 'session-1', questionId: 'q-3', topicId: 'topic-3', userAnswer: 'OOP has four pillars: Encapsulation hides data, Inheritance reuses code, Polymorphism means same method behaves differently, Abstraction hides implementation.', recallScore: 88, rememberedConcepts: ['encapsulation', 'inheritance', 'polymorphism', 'abstraction'], missingConcepts: [], feedback: 'Excellent recall of all four pillars! Adding concrete examples would make it even stronger.', createdAt: '2026-09-25T09:05:00Z' },
];

async function main() {
  // Clean slate (order respects FK constraints).
  await prisma.recallAttempt.deleteMany();
  await prisma.revisionSession.deleteMany();
  await prisma.memoryState.deleteMany();
  await prisma.question.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.learningMaterial.deleteMany();
  await prisma.placementTest.deleteMany();
  await prisma.interviewQuestion.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);
  await prisma.user.create({
    data: {
      id: USER_ID,
      name: 'Aryan Sharma',
      email: 'aryan@example.com',
      passwordHash,
      theme: 'system',
      dailyRevisionTarget: 10,
      preferredSessionLength: 20,
      notificationsEnabled: true,
      createdAt: d('2026-08-01T08:00:00Z'),
    },
  });

  for (const m of materials) {
    await prisma.learningMaterial.create({
      data: { ...m, userId: USER_ID, extractionStatus: 'completed', createdAt: d(m.createdAt), updatedAt: d(m.createdAt) },
    });
  }

  for (const t of topics) {
    await prisma.topic.create({
      data: {
        id: t.id, userId: USER_ID, name: t.name, category: t.category,
        keywords: J(t.keywords), description: t.description, sourceMaterialId: t.sourceMaterialId,
        relatedTopics: J(t.relatedTopics), prerequisiteTopics: J(t.prerequisiteTopics), createdAt: d(t.createdAt),
      },
    });
  }

  for (const q of questions) {
    await prisma.question.create({
      data: {
        id: q.id, topicId: q.topicId, materialId: q.materialId, type: q.type, questionText: q.questionText,
        expectedAnswer: q.expectedAnswer, concepts: J(q.concepts), difficulty: q.difficulty, createdAt: d(q.createdAt),
      },
    });
  }

  for (const m of memory) {
    await prisma.memoryState.create({
      data: {
        userId: USER_ID, topicId: m.topicId, memoryStrength: m.memoryStrength, confidence: m.confidence,
        difficulty: m.difficulty, reviewCount: m.reviewCount, easeFactor: 2.5, intervalDays: m.intervalDays,
        lastReviewed: d(m.lastReviewed), nextReview: d(m.nextReview),
      },
    });
  }

  for (const s of sessions) {
    await prisma.revisionSession.create({
      data: {
        id: s.id, userId: USER_ID, topicIds: J(s.topicIds), questionIds: J(s.questionIds),
        startedAt: d(s.startedAt), completedAt: d(s.completedAt), averageRecall: s.averageRecall,
        questionsCompleted: s.questionsCompleted, durationMinutes: s.durationMinutes,
      },
    });
  }

  for (const a of attempts) {
    await prisma.recallAttempt.create({
      data: {
        sessionId: a.sessionId, questionId: a.questionId, topicId: a.topicId, userAnswer: a.userAnswer,
        recallScore: a.recallScore, rememberedConcepts: J(a.rememberedConcepts), missingConcepts: J(a.missingConcepts),
        feedback: a.feedback, createdAt: d(a.createdAt),
      },
    });
  }

  await prisma.placementTest.createMany({
    data: placementTests.map((p, i) => ({
      title: p.title, category: p.category, subCategory: p.subCategory, questionCount: p.questionCount,
      duration: p.duration, difficulty: p.difficulty, lastAttempted: p.lastAttempted ? d(p.lastAttempted) : null,
      bestScore: p.bestScore ?? null, status: p.status, order: i,
    })),
  });

  await prisma.interviewQuestion.createMany({
    data: interviewQuestions.map((q, i) => ({
      category: q.category, questionText: q.questionText, stage: q.stage, difficulty: q.difficulty,
      topicId: q.topicId ?? null, order: i,
    })),
  });

  console.log('Seed complete: demo user aryan@example.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
