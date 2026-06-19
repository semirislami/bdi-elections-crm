'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import {
  Settings, Shield, Palette, Bell, Database,
  Users, Trash2, RotateCcw, Download, AlertTriangle,
  CheckCircle, Globe, Lock,
} from 'lucide-react';
import { getInitialData } from '@/lib/seed-data';

export default function SettingsPage() {
  const { currentUser, voters, users, tasks } = useStore();
  const [activeSection, setActiveSection] = useState('general');
  const [saved, setSaved] = useState(false);

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const resetData = () => {
    if (confirm('A jeni i sigurt? Kjo do të fshijë të gjitha të dhënat (votues, detyra, aktivitete) dhe do të rivendosë vetëm llogarinë e administratorit.')) {
      const init = getInitialData();
      localStorage.setItem('voter-crm-data-v2', JSON.stringify(init));
      localStorage.removeItem('voter-crm-user-v2');
      window.location.reload();
    }
  };

  const exportAllData = () => {
    const data = {
      voters,
      users,
      tasks,
      exportedAt: new Date().toISOString(),
      exportedBy: currentUser?.name,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bdi-crm-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const sections = [
    { id: 'general', label: 'Të përgjithshme', icon: Settings },
    { id: 'users', label: 'Përdoruesit', icon: Users },
    { id: 'security', label: 'Siguria', icon: Shield },
    { id: 'data', label: 'Të dhënat', icon: Database },
    { id: 'appearance', label: 'Paraqitja', icon: Palette },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900">Cilësimet</h1>
        <p className="text-surface-500 text-sm mt-1">Menaxhoni sistemin dhe preferencat</p>
      </div>

      {/* Saved notification */}
      {saved && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-green-500 text-white px-4 py-2.5 rounded-xl shadow-lg shadow-green-500/20 animate-scale-in">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Ndryshimet u ruajtën!</span>
        </div>
      )}

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="bg-white rounded-xl border border-surface-100 overflow-hidden">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left pressable ${
                  activeSection === section.id
                    ? 'bg-primary-50 text-primary-700 font-medium border-l-3 border-l-primary-600'
                    : 'text-surface-600 hover:bg-surface-50 border-l-3 border-l-transparent'
                }`}
                style={{
                  transition: `background var(--duration-normal) var(--ease-default), color var(--duration-normal) var(--ease-default), border-color var(--duration-normal) var(--ease-default), transform var(--duration-fast) var(--ease-out)`,
                }}
              >
                <section.icon className="w-4 h-4" />
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-4">
          {activeSection === 'general' && (
            <div className="animate-fade-in space-y-4">
              <div className="stat-card">
                <h3 className="text-sm font-semibold text-surface-800 mb-4">Informata e Sistemit</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-surface-500 mb-1.5">Emri i organizatës</label>
                    <input type="text" defaultValue="Bashkimi Demokratik për Integrim" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-surface-500 mb-1.5">Fushata</label>
                    <input type="text" defaultValue="Zgjedhjet 2026" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-surface-500 mb-1.5">Gjuha</label>
                    <select className="input-field" defaultValue="sq">
                      <option value="sq">Shqip</option>
                      <option value="mk">Maqedonisht</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-surface-500 mb-1.5">Zona kohore</label>
                    <select className="input-field" defaultValue="CET">
                      <option value="CET">CET (UTC+1)</option>
                      <option value="CEST">CEST (UTC+2)</option>
                    </select>
                  </div>
                </div>
                <button onClick={showSaved} className="btn-primary mt-4">
                  Ruaj ndryshimet
                </button>
              </div>

              {/* System Stats */}
              <div className="stat-card">
                <h3 className="text-sm font-semibold text-surface-800 mb-4">Statistikat e Sistemit</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3 bg-surface-50 rounded-xl text-center">
                    <div className="text-xl font-bold text-primary-700">{voters.length}</div>
                    <div className="text-xs text-surface-400 mt-1">Votues</div>
                  </div>
                  <div className="p-3 bg-surface-50 rounded-xl text-center">
                    <div className="text-xl font-bold text-primary-700">{users.length}</div>
                    <div className="text-xs text-surface-400 mt-1">Përdorues</div>
                  </div>
                  <div className="p-3 bg-surface-50 rounded-xl text-center">
                    <div className="text-xl font-bold text-primary-700">{tasks.length}</div>
                    <div className="text-xs text-surface-400 mt-1">Detyra</div>
                  </div>
                  <div className="p-3 bg-surface-50 rounded-xl text-center">
                    <div className="text-xl font-bold text-gold-600">
                      {(JSON.stringify({ voters, users, tasks }).length / 1024).toFixed(0)}KB
                    </div>
                    <div className="text-xs text-surface-400 mt-1">Madhësia</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'users' && (
            <div className="animate-fade-in stat-card">
              <h3 className="text-sm font-semibold text-surface-800 mb-4">Rolet e Përdoruesve</h3>
              <div className="space-y-3">
                {[
                  { role: 'Admin', desc: 'Qasje e plotë në të gjitha modulet, cilësimet dhe menaxhimin e përdoruesve', color: 'bg-gold-100 text-gold-700' },
                  { role: 'Menaxher', desc: 'Analitikë, kontrolli i ekipit, komunikimi, menaxhimi i detyrave', color: 'bg-primary-100 text-primary-700' },
                  { role: 'Aktivist', desc: 'Qasje e kufizuar: terreni, detyrat personale, kërkim i votuesve', color: 'bg-surface-100 text-surface-600' },
                ].map(item => (
                  <div key={item.role} className="flex items-start gap-3 p-4 bg-surface-50 rounded-xl">
                    <span className={`badge ${item.color} mt-0.5`}>{item.role}</span>
                    <p className="text-sm text-surface-600">{item.desc}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-surface-800 mb-3">Përdoruesit aktualë</h4>
                <div className="space-y-2">
                  {users.map(user => (
                    <div key={user.id} className="flex items-center gap-3 p-3 bg-surface-50 rounded-xl">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white ${
                        user.role === 'admin' ? 'bg-gold-400' :
                        user.role === 'manager' ? 'bg-primary-500' : 'bg-surface-400'
                      }`}>
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-surface-800">{user.name}</div>
                        <div className="text-xs text-surface-400">{user.email}</div>
                      </div>
                      <span className={`badge ${
                        user.role === 'admin' ? 'bg-gold-100 text-gold-700' :
                        user.role === 'manager' ? 'bg-primary-100 text-primary-700' :
                        'bg-surface-100 text-surface-600'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="animate-fade-in space-y-4">
              <div className="stat-card">
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="w-4 h-4 text-primary-600" />
                  <h3 className="text-sm font-semibold text-surface-800">Siguria e Sistemit</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-surface-50 rounded-xl">
                    <div>
                      <div className="text-sm font-medium text-surface-800">Autentifikimi me JWT</div>
                      <div className="text-xs text-surface-400">Tokenët e qasjes skadojnë pas 24 orëve</div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-surface-50 rounded-xl">
                    <div>
                      <div className="text-sm font-medium text-surface-800">Enkriptimi i të dhënave</div>
                      <div className="text-xs text-surface-400">AES-256 enkriptimi në tranzit dhe rehatim</div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-surface-50 rounded-xl">
                    <div>
                      <div className="text-sm font-medium text-surface-800">Logjet e aktivitetit</div>
                      <div className="text-xs text-surface-400">Të gjitha veprimet regjistrohen dhe ruhen</div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-surface-50 rounded-xl">
                    <div>
                      <div className="text-sm font-medium text-surface-800">Rolet e përdoruesve (RBAC)</div>
                      <div className="text-xs text-surface-400">Kontrolli i qasjes sipas roleve</div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'data' && (
            <div className="animate-fade-in space-y-4">
              <div className="stat-card">
                <h3 className="text-sm font-semibold text-surface-800 mb-4 flex items-center gap-2">
                  <Database className="w-4 h-4 text-primary-600" />
                  Menaxhimi i të Dhënave
                </h3>
                <div className="space-y-3">
                  <button onClick={exportAllData} className="w-full flex items-center gap-3 p-4 bg-surface-50 rounded-xl hover:bg-primary-50 text-left group pressable"
                    style={{ transition: `background var(--duration-normal) var(--ease-default), transform var(--duration-fast) var(--ease-out)` }}>
                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center group-hover:bg-primary-200"
                      style={{ transition: `background var(--duration-normal) var(--ease-default)` }}>
                      <Download className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-surface-800">Eksporto backup</div>
                      <div className="text-xs text-surface-400">Shkarkoni të gjitha të dhënat si JSON</div>
                    </div>
                  </button>

                  <button onClick={resetData} className="w-full flex items-center gap-3 p-4 bg-surface-50 rounded-xl hover:bg-red-50 text-left group pressable"
                    style={{ transition: `background var(--duration-normal) var(--ease-default), transform var(--duration-fast) var(--ease-out)` }}>
                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                      <RotateCcw className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-red-700">Rivendos të gjitha të dhënat</div>
                      <div className="text-xs text-surface-400">Fshini çdo gjë dhe filloni nga e para (mbahet vetëm llogaria admin)</div>
                    </div>
                  </button>

                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-amber-800">Kujdes</div>
                      <div className="text-xs text-amber-700 mt-1">
                        Kjo aplikacion përdor localStorage për ruajtjen e të dhënave. 
                        Për prodhim, përdorni PostgreSQL ose Supabase.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'appearance' && (
            <div className="animate-fade-in stat-card">
              <h3 className="text-sm font-semibold text-surface-800 mb-4 flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary-600" />
                Paraqitja
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-surface-500 mb-2">Ngjyra kryesore</label>
                  <div className="flex gap-3">
                    {['#1E3A8A', '#1D4ED8', '#7C3AED', '#059669', '#DC2626'].map(color => (
                      <button
                        key={color}
                        className={`w-10 h-10 rounded-xl border-2 pressable ${
                          color === '#1E3A8A' ? 'border-primary-300 scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                        }`}
                        style={{
                          backgroundColor: color,
                          transition: `transform var(--duration-normal) var(--ease-out), box-shadow var(--duration-normal) var(--ease-out)`,
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-surface-500 mb-2">Ngjyra theksore</label>
                  <div className="flex gap-3">
                    {['#D4AF37', '#F59E0B', '#EF4444', '#10B981', '#8B5CF6'].map(color => (
                      <button
                        key={color}
                        className={`w-10 h-10 rounded-xl border-2 pressable ${
                          color === '#D4AF37' ? 'border-gold-300 scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                        }`}
                        style={{
                          backgroundColor: color,
                          transition: `transform var(--duration-normal) var(--ease-out), box-shadow var(--duration-normal) var(--ease-out)`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
