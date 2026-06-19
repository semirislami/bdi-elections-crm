'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { Task, PriorityLevel } from '@/lib/types';
import {
  ClipboardList, Plus, CheckCircle2, Clock, AlertCircle,
  ChevronRight, Calendar, MapPin, Users, Filter,
  X, User, Trash2, Play, Check,
} from 'lucide-react';

type TaskFilter = 'all' | 'pending' | 'in_progress' | 'completed';

export default function TaskManagement() {
  const { tasks, updateTask, deleteTask, addTask, users, currentUser } = useStore();
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const filteredTasks = useMemo(() => {
    let result = tasks;
    
    // Activists only see their own tasks
    if (currentUser?.role === 'activist') {
      result = result.filter(t => t.assignedTo === currentUser.id);
    }
    
    if (filter !== 'all') {
      result = result.filter(t => t.status === filter);
    }
    
    return result.sort((a, b) => {
      const prio = { high: 3, medium: 2, low: 1 };
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      return prio[b.priority] - prio[a.priority];
    });
  }, [tasks, filter, currentUser]);

  const stats = useMemo(() => ({
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  }), [tasks]);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Menaxhimi i Detyrave</h1>
          <p className="text-surface-500 text-sm mt-1">{stats.total} detyra gjithsej</p>
        </div>
        {currentUser?.role !== 'activist' && (
          <button onClick={() => setShowCreateModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            Detyrë e Re
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-surface-500" />
            </div>
          </div>
          <div className="text-xl font-bold text-surface-900">{stats.total}</div>
          <div className="text-xs text-surface-400">Gjithsej</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <div className="text-xl font-bold text-amber-600">{stats.pending}</div>
          <div className="text-xs text-surface-400">Në pritje</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-blue-500" />
            </div>
          </div>
          <div className="text-xl font-bold text-blue-600">{stats.inProgress}</div>
          <div className="text-xs text-surface-400">Në progres</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </div>
          </div>
          <div className="text-xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-xs text-surface-400">Përfunduar</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-white p-1 rounded-xl border border-surface-100 mb-4">
        {[
          { id: 'all' as TaskFilter, label: 'Të gjitha' },
          { id: 'pending' as TaskFilter, label: 'Në pritje' },
          { id: 'in_progress' as TaskFilter, label: 'Në progres' },
          { id: 'completed' as TaskFilter, label: 'Përfunduar' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium pressable ${
              filter === tab.id
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-surface-500 hover:bg-surface-50'
            }`}
            style={{
              transition: `background var(--duration-normal) var(--ease-default), color var(--duration-normal) var(--ease-default), transform var(--duration-fast) var(--ease-out)`,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16 text-surface-400">
            <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Nuk ka detyra {filter !== 'all' ? 'me këtë status' : ''}</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={(status) => {
                updateTask(task.id, {
                  status,
                  completedAt: status === 'completed' ? new Date().toISOString() : undefined,
                });
              }}
              onDelete={() => {
                if (confirm('A jeni i sigurt?')) deleteTask(task.id);
              }}
              onClick={() => setSelectedTask(task)}
              canManage={currentUser?.role !== 'activist'}
            />
          ))
        )}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <CreateTaskModal
          onClose={() => setShowCreateModal(false)}
          onCreate={(taskData) => {
            addTask(taskData);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}

function TaskCard({
  task, onStatusChange, onDelete, onClick, canManage,
}: {
  task: Task;
  onStatusChange: (status: Task['status']) => void;
  onDelete: () => void;
  onClick: () => void;
  canManage: boolean;
}) {
  const statusConfig = {
    pending: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Në pritje' },
    in_progress: { icon: AlertCircle, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Në progres' },
    completed: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50', label: 'Përfunduar' },
  };

  const config = statusConfig[task.status];
  const StatusIcon = config.icon;

  return (
    <div className={`bg-white rounded-xl border border-surface-100 p-4 group ${
      task.status === 'completed' ? 'opacity-70' : ''
    }`}
    style={{ transition: `box-shadow var(--duration-normal) var(--ease-out)` }}
    >
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
          <StatusIcon className={`w-4 h-4 ${config.color}`} />
        </div>
        
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`text-sm font-semibold ${task.status === 'completed' ? 'text-surface-400 line-through' : 'text-surface-800'}`}>
              {task.title}
            </h3>
            <span className={`badge ${
              task.priority === 'high' ? 'badge-high' :
              task.priority === 'medium' ? 'badge-medium' : 'badge-low'
            }`}>
              {task.priority === 'high' ? 'Urgjent' :
               task.priority === 'medium' ? 'Normal' : 'Ulët'}
            </span>
          </div>
          <p className="text-xs text-surface-500 mb-2">{task.description}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-surface-400">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {task.assignedToName}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {task.region}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {task.voterIds.length} votues
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(task.dueDate).toLocaleDateString('sq', { day: 'numeric', month: 'short' })}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100" style={{ transition: `opacity var(--duration-normal) var(--ease-default)` }}>
          {task.status === 'pending' && (
            <button
              onClick={() => onStatusChange('in_progress')}
              className="p-1.5 rounded-lg hover:bg-blue-50 text-surface-400 hover:text-blue-600 pressable"
              style={{ transition: `background var(--duration-normal) var(--ease-default), color var(--duration-normal) var(--ease-default), transform var(--duration-fast) var(--ease-out)` }}
              title="Fillo"
            >
              <Play className="w-4 h-4" />
            </button>
          )}
          {task.status === 'in_progress' && (
            <button
              onClick={() => onStatusChange('completed')}
              className="p-1.5 rounded-lg hover:bg-green-50 text-surface-400 hover:text-green-600 pressable"
              style={{ transition: `background var(--duration-normal) var(--ease-default), color var(--duration-normal) var(--ease-default), transform var(--duration-fast) var(--ease-out)` }}
              title="Përfundo"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
          {canManage && (
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg hover:bg-red-50 text-surface-400 hover:text-red-500 pressable"
              style={{ transition: `background var(--duration-normal) var(--ease-default), color var(--duration-normal) var(--ease-default), transform var(--duration-fast) var(--ease-out)` }}
              title="Fshi"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CreateTaskModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (task: Omit<Task, 'id' | 'createdAt'>) => void;
}) {
  const { users } = useStore();
  const activists = users.filter(u => u.role === 'activist');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: activists[0]?.id || '',
    region: activists[0]?.region || '',
    priority: 'medium' as PriorityLevel,
    dueDate: new Date().toISOString().split('T')[0],
  });

  const selectedActivist = users.find(u => u.id === formData.assignedTo);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      ...formData,
      assignedToName: selectedActivist?.name || '',
      region: selectedActivist?.region || formData.region,
      voterIds: [],
      status: 'pending',
      dueDate: new Date(formData.dueDate).toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm modal-backdrop" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl animate-modal-enter">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
          <h2 className="text-lg font-bold text-surface-900">Detyrë e Re</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-surface-100 flex items-center justify-center text-surface-400 pressable"
            style={{ transition: `background var(--duration-normal) var(--ease-default), transform var(--duration-fast) var(--ease-out)` }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Titulli</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="input-field"
              placeholder="p.sh. Vizitë derë-më-derë"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Përshkrimi</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="input-field min-h-[80px] resize-none"
              placeholder="Përshkruani detyrën..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Cakto te</label>
              <select
                value={formData.assignedTo}
                onChange={e => {
                  const activist = users.find(u => u.id === e.target.value);
                  setFormData({
                    ...formData,
                    assignedTo: e.target.value,
                    region: activist?.region || '',
                  });
                }}
                className="input-field"
              >
                {activists.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Data e duhur</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                className="input-field"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">Prioriteti</label>
            <div className="flex gap-2">
              {[
                { value: 'high', label: 'Urgjent' },
                { value: 'medium', label: 'Normal' },
                { value: 'low', label: 'Ulët' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority: opt.value as PriorityLevel })}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium pressable ${
                    formData.priority === opt.value
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-surface-100 text-surface-500'
                  }`}
                  style={{
                    transition: `background var(--duration-normal) var(--ease-default), color var(--duration-normal) var(--ease-default), box-shadow var(--duration-normal) var(--ease-out), transform var(--duration-fast) var(--ease-out)`,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Anulo</button>
            <button type="submit" className="btn-primary flex-1">
              <Plus className="w-4 h-4" />
              Krijo Detyrën
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
