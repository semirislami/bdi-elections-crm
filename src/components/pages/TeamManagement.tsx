'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import {
  UsersRound, Trophy, MapPin, Phone, Mail, CheckCircle2,
  TrendingUp, Star, Crown, Medal, Award, Target,
  BarChart3,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function TeamManagement() {
  const { users, tasks, voters } = useStore();
  const activists = users.filter(u => u.role === 'activist');
  const managers = users.filter(u => u.role === 'manager');
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  // Leaderboard data
  const leaderboard = useMemo(() => {
    return activists
      .map(activist => {
        const activistTasks = tasks.filter(t => t.assignedTo === activist.id);
        const completedTasks = activistTasks.filter(t => t.status === 'completed').length;
        const regionVoters = voters.filter(v => v.city === activist.region);
        const contactedVoters = regionVoters.filter(v => v.lastContactedDate).length;

        return {
          ...activist,
          completedTasks,
          totalTasks: activistTasks.length,
          pendingTasks: activistTasks.filter(t => t.status === 'pending').length,
          contactedVoters,
          regionVoters: regionVoters.length,
          conversionRate: activist.totalContacts > 0
            ? Math.round((activist.totalConversions / activist.totalContacts) * 100)
            : 0,
          score: activist.totalContacts + (activist.totalConversions * 3) + (completedTasks * 5),
        };
      })
      .sort((a, b) => b.score - a.score);
  }, [activists, tasks, voters]);

  const chartData = leaderboard.map(a => ({
    name: a.name.split(' ')[0],
    kontakte: a.totalContacts,
    konvertime: a.totalConversions,
  }));

  const COLORS = ['#D4AF37', '#9CA3AF', '#CD7F32', '#1E3A8A', '#3B82F6', '#6366F1'];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900">Menaxhimi i Ekipit</h1>
        <p className="text-surface-500 text-sm mt-1">
          {activists.length} aktivistë • {managers.length} menaxherë
        </p>
      </div>

      {/* Leaderboard */}
      <div className="stat-card mb-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-gold-400" />
            <h2 className="text-lg font-bold text-surface-900">Renditja e Aktivistëve</h2>
          </div>
          <span className="text-xs text-surface-400">Bazuar në kontakte & konvertime</span>
        </div>

        <div className="space-y-3">
          {leaderboard.map((activist, index) => (
            <div
              key={activist.id}
              className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer pressable ${
                selectedMember === activist.id
                  ? 'border-primary-200 bg-primary-50/50 shadow-sm'
                  : 'border-surface-100 hover:border-surface-200 hover:bg-surface-50'
              } ${index === 0 ? 'ring-2 ring-gold-200 border-gold-200 bg-gold-50/30' : ''}`}
              style={{
                transition: `border-color var(--duration-normal) var(--ease-default), background var(--duration-normal) var(--ease-default), box-shadow var(--duration-normal) var(--ease-out), transform var(--duration-fast) var(--ease-out)`,
              }}
              onClick={() => setSelectedMember(selectedMember === activist.id ? null : activist.id)}
            >
              {/* Rank */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                index === 0 ? 'bg-gradient-to-br from-gold-400 to-gold-500 text-white shadow-lg shadow-gold-400/20' :
                index === 1 ? 'bg-surface-200 text-surface-600' :
                index === 2 ? 'bg-amber-100 text-amber-700' :
                'bg-surface-100 text-surface-500'
              }`}>
                {index === 0 ? <Crown className="w-5 h-5" /> :
                 index === 1 ? <Medal className="w-5 h-5" /> :
                 index === 2 ? <Award className="w-5 h-5" /> :
                 <span className="text-sm font-bold">{index + 1}</span>}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-surface-800">{activist.name}</h3>
                  {index === 0 && (
                    <span className="badge bg-gold-100 text-gold-700 text-[10px]">
                      <Star className="w-3 h-3 mr-0.5" />
                      MVP
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-surface-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {activist.region}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {activist.email}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="hidden sm:flex items-center gap-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-primary-700">{activist.totalContacts}</div>
                  <div className="text-[10px] text-surface-400">Kontakte</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{activist.totalConversions}</div>
                  <div className="text-[10px] text-surface-400">Konvertime</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gold-600">{activist.conversionRate}%</div>
                  <div className="text-[10px] text-surface-400">Norma</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-surface-600">{activist.completedTasks}</div>
                  <div className="text-[10px] text-surface-400">Detyra</div>
                </div>
              </div>

              {/* Score */}
              <div className="flex items-center gap-1 bg-primary-100 text-primary-700 px-3 py-1.5 rounded-lg">
                <Target className="w-3.5 h-3.5" />
                <span className="text-sm font-bold">{activist.score}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        {/* Performance Chart */}
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-surface-400" />
            <h3 className="text-sm font-semibold text-surface-800">Krahasimi i Performancës</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} barSize={20}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9aa5b8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9aa5b8' }} />
              <Tooltip
                contentStyle={{
                  background: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  padding: '8px 14px',
                  fontSize: '13px',
                }}
              />
              <Bar dataKey="kontakte" fill="#1E3A8A" radius={[4, 4, 0, 0]} name="Kontakte" />
              <Bar dataKey="konvertime" fill="#D4AF37" radius={[4, 4, 0, 0]} name="Konvertime" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Region Assignment */}
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-surface-400" />
            <h3 className="text-sm font-semibold text-surface-800">Caktimi sipas Rajonit</h3>
          </div>
          <div className="space-y-3">
            {leaderboard.map((activist, i) => (
              <div key={activist.id} className="flex items-center gap-3 p-3 bg-surface-50 rounded-xl">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white`}
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                >
                  {activist.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-surface-800">{activist.name}</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {activist.assignedRegions.map(region => (
                      <span key={region} className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-md">
                        {region}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-surface-400">
                  <UsersRound className="w-3 h-3" />
                  {activist.regionVoters}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Managers Section */}
      <div className="stat-card">
        <div className="flex items-center gap-2 mb-4">
          <UsersRound className="w-5 h-5 text-primary-600" />
          <h2 className="text-sm font-semibold text-surface-800">Menaxherët</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {managers.map(manager => (
            <div key={manager.id} className="flex items-center gap-3 p-4 bg-surface-50 rounded-xl border border-surface-100">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-sm font-bold">
                {manager.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-surface-800">{manager.name}</h3>
                <p className="text-xs text-surface-400 mt-0.5">{manager.email}</p>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-surface-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {manager.assignedRegions.join(', ')}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-primary-700">{manager.totalContacts}</div>
                <div className="text-[10px] text-surface-400">kontakte</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
