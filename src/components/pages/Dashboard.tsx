'use client';

import { useMemo } from 'react';
import { useStore } from '@/lib/store';
import {
  Users, TrendingUp, Phone, Target, CheckCircle2, UserCheck,
  ArrowUpRight, ArrowDownRight, Activity, Clock, MapPin, Zap,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend, Area, AreaChart,
} from 'recharts';
import { getTopPriorityVoters } from '@/lib/scoring';

const CHART_COLORS = {
  supporter: '#22c55e',
  opponent: '#ef4444',
  undecided: '#f59e0b',
  primary: '#1E3A8A',
  gold: '#D4AF37',
};

export default function Dashboard() {
  const { getDashboardStats, getRegionStats, voters, activityLogs, tasks, users } = useStore();
  const stats = getDashboardStats();
  const regionStats = getRegionStats();
  const topVoters = useMemo(() => getTopPriorityVoters(voters, 5), [voters]);

  const pieData = [
    { name: 'Mbështetës', value: stats.supporters, color: CHART_COLORS.supporter },
    { name: 'Kundërshtarë', value: stats.opponents, color: CHART_COLORS.opponent },
    { name: 'Të pavendosur', value: stats.undecided, color: CHART_COLORS.undecided },
  ];

  const weeklyData = useMemo(() => {
    const days = ['Hën', 'Mar', 'Mër', 'Enj', 'Pre', 'Sht', 'Diel'];
    return days.map((day, i) => ({
      day,
      kontakte: Math.floor(Math.random() * 30) + 10,
      konvertime: Math.floor(Math.random() * 10) + 2,
    }));
  }, []);

  const monthlyTrend = useMemo(() => {
    return ['Jan', 'Shk', 'Mar', 'Pri', 'Maj', 'Qer'].map(month => ({
      month,
      mbeshtetës: Math.floor(Math.random() * 50) + 100,
      pavendosur: Math.floor(Math.random() * 30) + 80,
      kundërshtarë: Math.floor(Math.random() * 30) + 40,
    }));
  }, []);

  const recentActivities = activityLogs.slice(0, 8);
  const activistPerformance = users.filter(u => u.role === 'activist').sort((a, b) => b.totalContacts - a.totalContacts);

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900">Paneli Kryesor</h1>
        <p className="text-surface-500 text-sm mt-1">Përmbledhje e përgjithshme e fushatës</p>
      </div>

      {/* Stats Grid — Emil: stagger these cards for polished entry */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
        <StatCard label="Gjithsej Votues" value={stats.totalVoters} icon={Users} color="primary" trend={+12} delay={0} />
        <StatCard label="Mbështetës" value={stats.supporters} icon={UserCheck} color="green" trend={+8} delay={1} />
        <StatCard label="Të Pavendosur" value={stats.undecided} icon={Target} color="amber" trend={-3} delay={2} />
        <StatCard label="Norma Konvertimit" value={`${stats.conversionRate}%`} icon={TrendingUp} color="blue" trend={+2} delay={3} />
        <StatCard label="Kontakte Sot" value={stats.contactsToday} icon={Phone} color="purple" delay={4} />
        <StatCard label="Detyra Aktive" value={stats.activeTasks} icon={CheckCircle2} color="gold" delay={5} />
      </div>

      {/* Charts Row — Emil: stagger chart cards */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        {/* Voter Distribution Pie */}
        <div className="stat-card stagger-item" style={{ animationDelay: '100ms' }}>
          <h3 className="text-sm font-semibold text-surface-800 mb-4">Shpërndarja e Votuesve</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
                strokeWidth={0}
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  padding: '8px 14px',
                  fontSize: '13px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 -mt-2">
            {pieData.map(item => (
              <div key={item.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-surface-500">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="stat-card stagger-item" style={{ animationDelay: '170ms' }}>
          <h3 className="text-sm font-semibold text-surface-800 mb-4">Aktiviteti Javor</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weeklyData} barSize={20}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9aa5b8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9aa5b8' }} />
              <Tooltip
                contentStyle={{
                  background: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  padding: '8px 14px',
                  fontSize: '13px',
                }}
              />
              <Bar dataKey="kontakte" fill={CHART_COLORS.primary} radius={[6, 6, 0, 0]} name="Kontakte" />
              <Bar dataKey="konvertime" fill={CHART_COLORS.gold} radius={[6, 6, 0, 0]} name="Konvertime" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Trend */}
        <div className="stat-card stagger-item" style={{ animationDelay: '240ms' }}>
          <h3 className="text-sm font-semibold text-surface-800 mb-4">Trendi Mujor</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthlyTrend}>
              <defs>
                <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradAmber" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ebeef3" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9aa5b8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9aa5b8' }} />
              <Tooltip
                contentStyle={{
                  background: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  padding: '8px 14px',
                  fontSize: '13px',
                }}
              />
              <Area type="monotone" dataKey="mbeshtetës" stroke="#22c55e" fill="url(#gradGreen)" strokeWidth={2} name="Mbështetës" />
              <Area type="monotone" dataKey="pavendosur" stroke="#f59e0b" fill="url(#gradAmber)" strokeWidth={2} name="Pavendosur" />
              <Line type="monotone" dataKey="kundërshtarë" stroke="#ef4444" strokeWidth={2} dot={false} name="Kundërshtarë" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Region Stats */}
        <div className="stat-card lg:col-span-1 stagger-item" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-surface-800">Statistikat sipas Rajonit</h3>
            <MapPin className="w-4 h-4 text-surface-400" />
          </div>
          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {regionStats.slice(0, 10).map((region, i) => (
              <div
                key={region.region}
                className="p-3 rounded-lg bg-surface-50 hover:bg-primary-50/50"
                style={{ transition: `background var(--duration-normal) var(--ease-default)` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-surface-800">{region.region}</span>
                  <span className="text-xs text-surface-400">{region.totalVoters} votues</span>
                </div>
                <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-surface-200">
                  <div
                    className="bg-green-500 rounded-full"
                    style={{
                      width: `${(region.supporters / region.totalVoters) * 100}%`,
                      transition: `width 500ms var(--ease-out)`,
                    }}
                  />
                  <div
                    className="bg-amber-400 rounded-full"
                    style={{
                      width: `${(region.undecided / region.totalVoters) * 100}%`,
                      transition: `width 500ms var(--ease-out)`,
                    }}
                  />
                  <div
                    className="bg-red-400 rounded-full"
                    style={{
                      width: `${(region.opponents / region.totalVoters) * 100}%`,
                      transition: `width 500ms var(--ease-out)`,
                    }}
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[10px] text-green-600">{region.supporters} mbësh.</span>
                  <span className="text-[10px] text-amber-600">{region.undecided} pavend.</span>
                  <span className="text-[10px] text-red-500">{region.opponents} kund.</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activist Performance */}
        <div className="stat-card stagger-item" style={{ animationDelay: '370ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-surface-800">Performanca e Aktivistëve</h3>
            <Zap className="w-4 h-4 text-gold-400" />
          </div>
          <div className="space-y-3">
            {activistPerformance.map((activist, index) => (
              <div
                key={activist.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-50"
                style={{ transition: `background var(--duration-normal) var(--ease-default)` }}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                  ${index === 0 ? 'bg-gold-100 text-gold-700' :
                    index === 1 ? 'bg-surface-200 text-surface-600' :
                    index === 2 ? 'bg-amber-100 text-amber-700' :
                    'bg-surface-100 text-surface-500'}`}
                >
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-surface-800 truncate">{activist.name}</div>
                  <div className="text-xs text-surface-400">{activist.region}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-primary-700">{activist.totalContacts}</div>
                  <div className="text-[10px] text-green-600">{activist.totalConversions} konv.</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="stat-card stagger-item" style={{ animationDelay: '440ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-surface-800">Aktiviteti i Fundit</h3>
            <Activity className="w-4 h-4 text-surface-400" />
          </div>
          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
            {recentActivities.map(activity => (
              <div key={activity.id} className="flex gap-3 group">
                <div className="flex flex-col items-center">
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${
                    activity.action === 'contacted_voter' ? 'bg-primary-500' :
                    activity.action === 'updated_status' ? 'bg-green-500' :
                    activity.action === 'completed_task' ? 'bg-gold-400' :
                    'bg-surface-300'
                  }`} />
                  <div className="w-px h-full bg-surface-200 mt-1" />
                </div>
                <div className="pb-4 flex-1 min-w-0">
                  <p className="text-sm text-surface-700">
                    <span className="font-medium">{activity.userName}</span>
                    {' — '}
                    <span className="text-surface-500">{activity.details}</span>
                  </p>
                  {activity.voterName && (
                    <p className="text-xs text-primary-600 mt-0.5">{activity.voterName}</p>
                  )}
                  <p className="text-[10px] text-surface-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(activity.timestamp).toLocaleDateString('sq', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Priority Voters */}
      <div className="mt-6 stat-card stagger-item" style={{ animationDelay: '500ms' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-surface-800">Votuesit me Prioritet të Lartë</h3>
            <p className="text-xs text-surface-400 mt-0.5">Të sugjeruar për kontakt sot</p>
          </div>
          <Target className="w-4 h-4 text-gold-400" />
        </div>
        <div className="overflow-x-auto -mx-1">
          <div className="flex gap-3 pb-2 px-1">
            {topVoters.map((voter, i) => (
              <div
                key={voter.id}
                className="min-w-[200px] p-3 bg-surface-50 rounded-xl border border-surface-100 hover:border-primary-200 pressable"
                style={{
                  transition: `border-color var(--duration-normal) var(--ease-default), transform var(--duration-fast) var(--ease-out)`,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`badge ${voter.politicalStatus === 'undecided' ? 'badge-undecided' : voter.politicalStatus === 'supporter' ? 'badge-supporter' : 'badge-opponent'}`}>
                    {voter.politicalStatus === 'undecided' ? 'Pavendosur' :
                     voter.politicalStatus === 'supporter' ? 'Mbështetës' : 'Kundërshtar'}
                  </span>
                  <div className="flex items-center gap-1 bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                    <Zap className="w-3 h-3" />
                    <span className="text-xs font-semibold">{voter.score}</span>
                  </div>
                </div>
                <h4 className="text-sm font-medium text-surface-800 truncate">{voter.fullName}</h4>
                <p className="text-xs text-surface-400 mt-0.5">{voter.city}</p>
                <p className="text-[10px] text-surface-400 mt-2 italic truncate">{voter.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, trend, delay }: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  trend?: number;
  delay: number;
}) {
  const colorMap: Record<string, { bg: string; text: string; icon: string }> = {
    primary: { bg: 'bg-primary-50', text: 'text-primary-700', icon: 'text-primary-500' },
    green: { bg: 'bg-green-50', text: 'text-green-700', icon: 'text-green-500' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', icon: 'text-amber-500' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'text-blue-500' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', icon: 'text-purple-500' },
    gold: { bg: 'bg-gold-50', text: 'text-gold-700', icon: 'text-gold-500' },
  };

  const c = colorMap[color] || colorMap.primary;

  return (
    /* Emil: stagger stat cards — 50ms between each */
    <div
      className="stat-card stagger-item"
      style={{ animationDelay: `${delay * 50}ms` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center`}>
          <Icon className={`w-[18px] h-[18px] ${c.icon}`} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-0.5 text-xs font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="text-xl font-bold text-surface-900">{value}</div>
      <div className="text-xs text-surface-400 mt-0.5">{label}</div>
    </div>
  );
}
