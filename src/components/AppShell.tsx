'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import {
  LayoutDashboard, Users, Crosshair, ClipboardList, UsersRound,
  MessageSquare, Settings, LogOut, Shield, Menu, X, ChevronLeft,
  Smartphone, Star,
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import VoterDatabase from './pages/VoterDatabase';
import FieldInterface from './pages/FieldInterface';
import TaskManagement from './pages/TaskManagement';
import TeamManagement from './pages/TeamManagement';
import Communication from './pages/Communication';
import SettingsPage from './pages/SettingsPage';

type Page = 'dashboard' | 'voters' | 'field' | 'tasks' | 'team' | 'communication' | 'settings';

const navItems: { id: Page; label: string; icon: React.ElementType; roles: string[] }[] = [
  { id: 'dashboard', label: 'Paneli', icon: LayoutDashboard, roles: ['admin', 'manager'] },
  { id: 'voters', label: 'Votuesit', icon: Users, roles: ['admin', 'manager', 'activist'] },
  { id: 'field', label: 'Terreni', icon: Smartphone, roles: ['admin', 'manager', 'activist'] },
  { id: 'tasks', label: 'Detyrat', icon: ClipboardList, roles: ['admin', 'manager', 'activist'] },
  { id: 'team', label: 'Ekipi', icon: UsersRound, roles: ['admin', 'manager'] },
  { id: 'communication', label: 'Komunikimi', icon: MessageSquare, roles: ['admin', 'manager'] },
  { id: 'settings', label: 'Cilësimet', icon: Settings, roles: ['admin'] },
];

export default function AppShell() {
  const { currentUser, logout } = useStore();
  const [currentPage, setCurrentPage] = useState<Page>(
    currentUser?.role === 'activist' ? 'field' : 'dashboard'
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const filteredNavItems = navItems.filter(item =>
    item.roles.includes(currentUser?.role || '')
  );

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'voters': return <VoterDatabase />;
      case 'field': return <FieldInterface />;
      case 'tasks': return <TaskManagement />;
      case 'team': return <TeamManagement />;
      case 'communication': return <Communication />;
      case 'settings': return <SettingsPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      {/* Mobile Overlay — Emil: backdrop enters with opacity, exits faster */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden modal-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar — Emil: use ease-out for entering, duration < 300ms */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          flex flex-col bg-white border-r border-surface-100
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${sidebarCollapsed ? 'w-[72px]' : 'w-[260px]'}
        `}
        style={{
          transition: `transform 250ms var(--ease-out), width 250ms var(--ease-out)`,
        }}
      >
        {/* Header */}
        <div className={`flex items-center h-16 border-b border-surface-100 px-4 ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2.5 animate-fade-in">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center shadow-md shadow-primary-600/20">
                <Shield className="w-5 h-5 text-gold-400" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-surface-900 tracking-tight">BDI CRM</h1>
                <p className="text-[10px] text-surface-400 font-medium">Fushata 2026</p>
              </div>
            </div>
          )}
          
          {sidebarCollapsed && (
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center">
              <Shield className="w-5 h-5 text-gold-400" />
            </div>
          )}
          
          {/* Emil: Buttons must feel responsive — pressable class gives scale(0.97) */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md hover:bg-surface-100 text-surface-400 hover:text-surface-600 pressable"
          >
            <ChevronLeft
              className="w-4 h-4"
              style={{
                transition: `transform 250ms var(--ease-out)`,
                transform: sidebarCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          </button>
          
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden flex items-center justify-center w-7 h-7 rounded-md hover:bg-surface-100 text-surface-400 pressable"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation — Emil: Stagger nav items for polished entry */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {filteredNavItems.map((item, index) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setMobileSidebarOpen(false);
                }}
                className={`
                  nav-stagger w-full flex items-center gap-3 rounded-lg pressable
                  ${sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'}
                  ${isActive
                    ? 'bg-primary-50 text-primary-700 font-medium shadow-sm shadow-primary-100'
                    : 'text-surface-500 hover:bg-surface-50 hover:text-surface-700'
                  }
                `}
                style={{
                  transition: `background var(--duration-normal) var(--ease-default), 
                               color var(--duration-normal) var(--ease-default), 
                               transform var(--duration-fast) var(--ease-out)`,
                  animationDelay: `${index * 40}ms`,
                }}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-primary-600' : ''}`} />
                {!sidebarCollapsed && (
                  <span className="text-[13px]">{item.label}</span>
                )}
                {isActive && !sidebarCollapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500 animate-scale-in" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className={`border-t border-surface-100 p-3 ${sidebarCollapsed ? 'flex flex-col items-center gap-2' : ''}`}>
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-50 mb-2"
              style={{ transition: `background var(--duration-normal) var(--ease-default)` }}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold text-white
                ${currentUser?.role === 'admin' ? 'bg-gradient-to-br from-gold-400 to-gold-500' :
                  currentUser?.role === 'manager' ? 'bg-gradient-to-br from-primary-500 to-primary-600' :
                  'bg-gradient-to-br from-surface-400 to-surface-500'}`}
              >
                {currentUser?.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-surface-800 truncate">{currentUser?.name}</div>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-gold-400" />
                  <span className="text-[11px] text-surface-400 capitalize">{currentUser?.role}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold text-white mb-2
              ${currentUser?.role === 'admin' ? 'bg-gradient-to-br from-gold-400 to-gold-500' :
                currentUser?.role === 'manager' ? 'bg-gradient-to-br from-primary-500 to-primary-600' :
                'bg-gradient-to-br from-surface-400 to-surface-500'}`}
            >
              {currentUser?.name.split(' ').map(n => n[0]).join('')}
            </div>
          )}
          
          <button
            onClick={logout}
            className={`flex items-center gap-2 text-surface-400 hover:text-red-500 text-sm pressable
              ${sidebarCollapsed ? 'justify-center p-2' : 'w-full px-2 py-1.5 rounded-lg hover:bg-red-50'}`}
            style={{ transition: `color var(--duration-normal) var(--ease-default), background var(--duration-normal) var(--ease-default), transform var(--duration-fast) var(--ease-out)` }}
            title="Dilni"
          >
            <LogOut className="w-4 h-4" />
            {!sidebarCollapsed && <span>Dilni</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between h-14 px-4 bg-white border-b border-surface-100 sticky top-0 z-30">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-surface-100 text-surface-600 pressable"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-600" />
            <span className="text-sm font-bold text-surface-900">BDI CRM</span>
          </div>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold text-white
            ${currentUser?.role === 'admin' ? 'bg-gradient-to-br from-gold-400 to-gold-500' :
              currentUser?.role === 'manager' ? 'bg-gradient-to-br from-primary-500 to-primary-600' :
              'bg-gradient-to-br from-surface-400 to-surface-500'}`}
          >
            {currentUser?.name.split(' ').map(n => n[0]).join('')}
          </div>
        </div>
        
        {/* Page content with fade-in on page switch */}
        <div key={currentPage} className="animate-fade-in">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
