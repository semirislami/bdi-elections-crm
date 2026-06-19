// Core types for the Voter CRM system

export type PoliticalStatus = 'supporter' | 'opponent' | 'undecided';
export type PriorityLevel = 'high' | 'medium' | 'low';
export type UserRole = 'admin' | 'manager' | 'activist';

export const PREDEFINED_TAGS = [
  'Employment',
  'Education',
  'Diaspora',
  'Youth',
  'Economy',
  'Healthcare',
  'Infrastructure',
  'Agriculture',
  'Security',
  'Environment',
] as const;

export interface Note {
  id: string;
  text: string;
  createdAt: string;
  authorId: string;
  authorName: string;
}

export interface Voter {
  id: string;
  fullName: string;
  phone: string;
  city: string;
  neighborhood: string;
  age?: number;
  politicalStatus: PoliticalStatus;
  priority: PriorityLevel;
  tags: string[];
  notes: Note[];
  lastContactedDate: string | null;
  interactionCount: number;
  createdAt: string;
  updatedAt: string;
  assignedActivistId?: string;
  score?: number;
  latitude?: number;
  longitude?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  region: string;
  avatar?: string;
  phone?: string;
  assignedRegions: string[];
  totalContacts: number;
  totalConversions: number;
  createdAt: string;
  isActive: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedToName: string;
  region: string;
  voterIds: string[];
  status: 'pending' | 'in_progress' | 'completed';
  dueDate: string;
  completedAt?: string;
  createdAt: string;
  priority: PriorityLevel;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  voterId?: string;
  voterName?: string;
  timestamp: string;
}

export interface DashboardStats {
  totalVoters: number;
  supporters: number;
  opponents: number;
  undecided: number;
  conversionRate: number;
  contactsToday: number;
  contactsThisWeek: number;
  activeTasks: number;
  completedTasks: number;
  activeActivists: number;
}

export interface RegionStats {
  region: string;
  totalVoters: number;
  supporters: number;
  opponents: number;
  undecided: number;
  contactRate: number;
}
