'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Voter, User, Task, ActivityLog, DashboardStats, RegionStats } from './types';
import { getInitialData } from './seed-data';

const STORAGE_KEY = 'voter-crm-data-v3';
const USER_KEY = 'voter-crm-user-v3';

// Simple UUID generator that works on all browsers including mobile
function generateId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return 'xxxx-xxxx-4xxx-yxxx-xxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    }) + '-' + Date.now().toString(36);
  }
}

interface StoreContextType {
  // Data
  voters: Voter[];
  users: User[];
  tasks: Task[];
  activityLogs: ActivityLog[];
  currentUser: User | null;
  isLoading: boolean;
  
  // Voter operations
  addVoter: (voter: Omit<Voter, 'id' | 'createdAt' | 'updatedAt' | 'interactionCount' | 'notes'>) => void;
  updateVoter: (id: string, updates: Partial<Voter>) => void;
  deleteVoter: (id: string) => void;
  addVoterNote: (voterId: string, text: string) => void;
  updateVoterStatus: (voterId: string, status: Voter['politicalStatus']) => void;
  
  // Task operations
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  // User management (admin)
  addUser: (user: Omit<User, 'id' | 'createdAt' | 'totalContacts' | 'totalConversions' | 'isActive'>) => { ok: boolean; error?: string };
  updateUser: (id: string, updates: Partial<User>) => { ok: boolean; error?: string };
  deleteUser: (id: string) => void;

  // Auth
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  changeOwnPassword: (currentPassword: string, newPassword: string) => { ok: boolean; error?: string };
  
  // Stats
  getDashboardStats: () => DashboardStats;
  getRegionStats: () => RegionStats[];
  
  // Activity
  addActivityLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [voters, setVoters] = useState<Voter[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize data
  useEffect(() => {
    try {
      // Purge any pre-v2 demo data left in the browser
      localStorage.removeItem('voter-crm-data');
      localStorage.removeItem('voter-crm-user');

      const stored = localStorage.getItem(STORAGE_KEY);
      let loaded = false;
      if (stored) {
        try {
          const data = JSON.parse(stored);
          setVoters(data.voters || []);
          setUsers(data.users && data.users.length > 0 ? data.users : getInitialData().users);
          setTasks(data.tasks || []);
          setActivityLogs(data.activityLogs || []);
          loaded = true;
        } catch { /* fall through to init */ }
      }
      if (!loaded) {
        const init = getInitialData();
        setVoters(init.voters);
        setUsers(init.users);
        setTasks(init.tasks);
        setActivityLogs(init.activityLogs);
      }

      const storedUser = localStorage.getItem(USER_KEY);
      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch { /* ignore */ }
      }
    } catch (err) {
      console.error('Store init error:', err);
      const init = getInitialData();
      setUsers(init.users);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Persist data
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        voters, users, tasks, activityLogs,
      }));
    }
  }, [voters, users, tasks, activityLogs, isLoading]);

  const addVoter = useCallback((voterData: Omit<Voter, 'id' | 'createdAt' | 'updatedAt' | 'interactionCount' | 'notes'>) => {
    const newVoter: Voter = {
      ...voterData,
      id: generateId(),
      notes: [],
      interactionCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setVoters(prev => [newVoter, ...prev]);
  }, []);

  const updateVoter = useCallback((id: string, updates: Partial<Voter>) => {
    setVoters(prev => prev.map(v =>
      v.id === id ? { ...v, ...updates, updatedAt: new Date().toISOString() } : v
    ));
  }, []);

  const deleteVoter = useCallback((id: string) => {
    setVoters(prev => prev.filter(v => v.id !== id));
  }, []);

  const addVoterNote = useCallback((voterId: string, text: string) => {
    setVoters(prev => prev.map(v => {
      if (v.id !== voterId) return v;
      return {
        ...v,
        notes: [{
          id: generateId(),
          text,
          createdAt: new Date().toISOString(),
          authorId: currentUser?.id || 'unknown',
          authorName: currentUser?.name || 'Unknown',
        }, ...v.notes],
        interactionCount: v.interactionCount + 1,
        lastContactedDate: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }));
  }, [currentUser]);

  const updateVoterStatus = useCallback((voterId: string, status: Voter['politicalStatus']) => {
    setVoters(prev => prev.map(v =>
      v.id === voterId ? { ...v, politicalStatus: status, updatedAt: new Date().toISOString() } : v
    ));
  }, []);

  const addTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, ...updates } : t
    ));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const login = useCallback((email: string, password: string) => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return { ok: false, error: 'Email nuk ekziston' };
    if (!user.isActive) return { ok: false, error: 'Llogaria është çaktivizuar' };
    if (user.password !== password) return { ok: false, error: 'Fjalëkalimi nuk është i saktë' };
    setCurrentUser(user);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return { ok: true };
  }, [users]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem(USER_KEY);
  }, []);

  const addUser = useCallback((userData: Omit<User, 'id' | 'createdAt' | 'totalContacts' | 'totalConversions' | 'isActive'>) => {
    const email = userData.email.trim().toLowerCase();
    if (!email || !userData.password || !userData.name.trim()) {
      return { ok: false, error: 'Emri, email dhe fjalëkalimi janë të detyrueshëm' };
    }
    if (users.some(u => u.email.toLowerCase() === email)) {
      return { ok: false, error: 'Ky email është tashmë i regjistruar' };
    }
    const newUser: User = {
      ...userData,
      email,
      id: generateId(),
      isActive: true,
      totalContacts: 0,
      totalConversions: 0,
      createdAt: new Date().toISOString(),
    };
    setUsers(prev => [...prev, newUser]);
    return { ok: true };
  }, [users]);

  const updateUser = useCallback((id: string, updates: Partial<User>) => {
    if (updates.email) {
      const email = updates.email.trim().toLowerCase();
      if (users.some(u => u.id !== id && u.email.toLowerCase() === email)) {
        return { ok: false, error: 'Ky email është tashmë i regjistruar' };
      }
      updates = { ...updates, email };
    }
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    if (currentUser?.id === id) {
      const updated = { ...currentUser, ...updates };
      setCurrentUser(updated);
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
    }
    return { ok: true };
  }, [users, currentUser]);

  const deleteUser = useCallback((id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  }, []);

  const changeOwnPassword = useCallback((currentPassword: string, newPassword: string) => {
    if (!currentUser) return { ok: false, error: 'Nuk jeni i identifikuar' };
    if (currentUser.password !== currentPassword) return { ok: false, error: 'Fjalëkalimi aktual nuk është i saktë' };
    if (!newPassword || newPassword.length < 6) return { ok: false, error: 'Fjalëkalimi i ri duhet të ketë të paktën 6 karaktere' };
    const updated = { ...currentUser, password: newPassword };
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));
    setCurrentUser(updated);
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    return { ok: true };
  }, [currentUser]);

  const getDashboardStats = useCallback((): DashboardStats => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekStart = todayStart - 7 * 24 * 60 * 60 * 1000;
    
    const supporters = voters.filter(v => v.politicalStatus === 'supporter').length;
    const opponents = voters.filter(v => v.politicalStatus === 'opponent').length;
    const undecided = voters.filter(v => v.politicalStatus === 'undecided').length;
    
    const contactsToday = activityLogs.filter(l => 
      l.action === 'contacted_voter' && new Date(l.timestamp).getTime() >= todayStart
    ).length;
    
    const contactsThisWeek = activityLogs.filter(l =>
      l.action === 'contacted_voter' && new Date(l.timestamp).getTime() >= weekStart
    ).length;

    return {
      totalVoters: voters.length,
      supporters,
      opponents,
      undecided,
      conversionRate: voters.length > 0 ? Math.round((supporters / voters.length) * 100) : 0,
      contactsToday,
      contactsThisWeek,
      activeTasks: tasks.filter(t => t.status !== 'completed').length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      activeActivists: users.filter(u => u.role === 'activist' && u.isActive).length,
    };
  }, [voters, tasks, activityLogs, users]);

  const getRegionStats = useCallback((): RegionStats[] => {
    const regionMap = new Map<string, { total: number; supporters: number; opponents: number; undecided: number; contacted: number }>();
    
    voters.forEach(v => {
      const current = regionMap.get(v.city) || { total: 0, supporters: 0, opponents: 0, undecided: 0, contacted: 0 };
      current.total++;
      if (v.politicalStatus === 'supporter') current.supporters++;
      else if (v.politicalStatus === 'opponent') current.opponents++;
      else current.undecided++;
      if (v.lastContactedDate) current.contacted++;
      regionMap.set(v.city, current);
    });

    return Array.from(regionMap.entries()).map(([region, data]) => ({
      region,
      totalVoters: data.total,
      supporters: data.supporters,
      opponents: data.opponents,
      undecided: data.undecided,
      contactRate: data.total > 0 ? Math.round((data.contacted / data.total) * 100) : 0,
    })).sort((a, b) => b.totalVoters - a.totalVoters);
  }, [voters]);

  const addActivityLog = useCallback((logData: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const newLog: ActivityLog = {
      ...logData,
      id: generateId(),
      timestamp: new Date().toISOString(),
    };
    setActivityLogs(prev => [newLog, ...prev]);
  }, []);

  return (
    <StoreContext.Provider value={{
      voters, users, tasks, activityLogs, currentUser, isLoading,
      addVoter, updateVoter, deleteVoter, addVoterNote, updateVoterStatus,
      addTask, updateTask, deleteTask,
      addUser, updateUser, deleteUser,
      login, logout, changeOwnPassword,
      getDashboardStats, getRegionStats,
      addActivityLog,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
}

