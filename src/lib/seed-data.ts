import { Voter, User, Task, ActivityLog } from './types';

// Single bootstrap admin so the system is usable on first run.
// Replace with the real admin's details (or create more users via the UI),
// then this account can be deleted from Settings → Users.
const BOOTSTRAP_ADMIN: User = {
  id: 'admin-1',
  name: 'Administrator',
  email: 'admin@bdi.mk',
  role: 'admin',
  region: 'All',
  assignedRegions: [],
  totalContacts: 0,
  totalConversions: 0,
  createdAt: new Date().toISOString(),
  isActive: true,
  phone: '',
};

export function getInitialData(): {
  voters: Voter[];
  users: User[];
  tasks: Task[];
  activityLogs: ActivityLog[];
} {
  return {
    voters: [],
    users: [BOOTSTRAP_ADMIN],
    tasks: [],
    activityLogs: [],
  };
}
