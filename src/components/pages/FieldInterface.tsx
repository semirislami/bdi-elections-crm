'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { Voter } from '@/lib/types';
import { getDailyCallList, getHighConversionPotential, ScoredVoter } from '@/lib/scoring';
import {
  Search, Phone, MapPin, MessageSquare, ChevronRight, Zap,
  Clock, Target, Users, Star, CheckCircle, ArrowRight,
  PhoneCall, PhoneOff, Navigation, Tag, X, Plus,
} from 'lucide-react';
import VoterDetailModal from '@/components/modals/VoterDetailModal';

type Tab = 'priority' | 'search' | 'recent';

export default function FieldInterface() {
  const { voters: allVoters, updateVoterStatus, addVoterNote, currentUser } = useStore();

  // Activists only see voters in their assigned region(s).
  const voters = useMemo(() => {
    if (currentUser?.role !== 'activist') return allVoters;
    const allowed = new Set(currentUser.assignedRegions);
    if (allowed.size === 0 && currentUser.region) allowed.add(currentUser.region);
    return allVoters.filter(v => allowed.has(v.city));
  }, [allVoters, currentUser]);
  const [activeTab, setActiveTab] = useState<Tab>('priority');
  const [search, setSearch] = useState('');
  const [selectedVoter, setSelectedVoter] = useState<Voter | null>(null);
  const [quickNoteVoter, setQuickNoteVoter] = useState<string | null>(null);
  const [quickNote, setQuickNote] = useState('');

  const dailyList = useMemo(() => getDailyCallList(voters, 15), [voters]);
  const highConversion = useMemo(() => getHighConversionPotential(voters), [voters]);

  const searchResults = useMemo(() => {
    if (!search || search.length < 2) return [];
    const q = search.toLowerCase();
    return voters.filter(v =>
      v.fullName.toLowerCase().includes(q) ||
      v.phone.includes(q) ||
      v.city.toLowerCase().includes(q)
    ).slice(0, 20);
  }, [voters, search]);

  const recentlyContacted = useMemo(() =>
    [...voters]
      .filter(v => v.lastContactedDate)
      .sort((a, b) => new Date(b.lastContactedDate!).getTime() - new Date(a.lastContactedDate!).getTime())
      .slice(0, 20),
    [voters]
  );

  const handleQuickNote = (voterId: string) => {
    if (!quickNote.trim()) return;
    addVoterNote(voterId, quickNote.trim());
    setQuickNote('');
    setQuickNoteVoter(null);
  };

  return (
    <div className="max-w-lg mx-auto pb-24">
      {/* Mobile Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-5 py-5 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">Interfaca e Terrenit</h1>
            <p className="text-primary-200 text-sm mt-0.5">
              {currentUser?.name} • {currentUser?.region}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
            <Navigation className="w-5 h-5 text-gold-300" />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/10">
            <div className="text-lg font-bold text-white">{dailyList.length}</div>
            <div className="text-xs text-primary-200">Për sot</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/10">
            <div className="text-lg font-bold text-gold-300">{highConversion.length}</div>
            <div className="text-xs text-primary-200">Konvertim</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/10">
            <div className="text-lg font-bold text-green-300">
              {voters.filter(v => v.politicalStatus === 'supporter').length}
            </div>
            <div className="text-xs text-primary-200">Mbështetës</div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 -mt-4 relative z-10">
        <div className="bg-white rounded-xl shadow-lg shadow-black/5 border border-surface-100 p-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                if (e.target.value.length >= 2) setActiveTab('search');
              }}
              className="w-full py-2.5 pl-10 pr-4 rounded-lg text-sm focus:outline-none bg-transparent"
              placeholder="Kërko votues (emri, telefoni, qyteti)..."
            />
            {search && (
              <button
                onClick={() => { setSearch(''); setActiveTab('priority'); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex px-4 mt-4 gap-1">
        {[
          { id: 'priority' as Tab, label: 'Prioritetet', icon: Target, count: dailyList.length },
          { id: 'search' as Tab, label: 'Kërkimi', icon: Search, count: searchResults.length },
          { id: 'recent' as Tab, label: 'Funditet', icon: Clock, count: recentlyContacted.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium pressable ${
              activeTab === tab.id
                ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20'
                : 'bg-white text-surface-500 border border-surface-100'
            }`}
            style={{
              transition: `background var(--duration-normal) var(--ease-default), color var(--duration-normal) var(--ease-default), box-shadow var(--duration-normal) var(--ease-out), transform var(--duration-fast) var(--ease-out)`,
            }}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
            {tab.id === activeTab && (
              <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-[10px]">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-4 mt-4 space-y-2">
        {activeTab === 'priority' && (
          <>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-gold-500" />
              <span className="text-sm font-semibold text-surface-800">Lista e Ditës — Kontaktoni sot</span>
            </div>
            {dailyList.map(voter => (
              <FieldVoterCard
                key={voter.id}
                voter={voter}
                onSelect={() => setSelectedVoter(voter)}
                onQuickNote={() => setQuickNoteVoter(voter.id)}
                onStatusChange={(status) => updateVoterStatus(voter.id, status)}
                scoreVisible
              />
            ))}
          </>
        )}

        {activeTab === 'search' && (
          <>
            {search.length < 2 ? (
              <div className="text-center py-12 text-surface-400">
                <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Shkruani të paktën 2 karaktere për kërkim</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-12 text-surface-400">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Nuk u gjet asnjë votues</p>
              </div>
            ) : (
              searchResults.map(voter => (
                <FieldVoterCard
                  key={voter.id}
                  voter={voter}
                  onSelect={() => setSelectedVoter(voter)}
                  onQuickNote={() => setQuickNoteVoter(voter.id)}
                  onStatusChange={(status) => updateVoterStatus(voter.id, status)}
                />
              ))
            )}
          </>
        )}

        {activeTab === 'recent' && (
          <>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-surface-400" />
              <span className="text-sm font-semibold text-surface-800">Kontakte të Fundit</span>
            </div>
            {recentlyContacted.map(voter => (
              <FieldVoterCard
                key={voter.id}
                voter={voter}
                onSelect={() => setSelectedVoter(voter)}
                onQuickNote={() => setQuickNoteVoter(voter.id)}
                onStatusChange={(status) => updateVoterStatus(voter.id, status)}
              />
            ))}
          </>
        )}
      </div>

      {/* Quick Note Drawer */}
      {quickNoteVoter && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/30 modal-backdrop" onClick={() => setQuickNoteVoter(null)} />
          <div className="relative w-full bg-white rounded-t-2xl p-5 animate-drawer-enter">
            <h3 className="text-sm font-semibold text-surface-800 mb-3">Shto Shënim të Shpejtë</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={quickNote}
                onChange={e => setQuickNote(e.target.value)}
                className="input-field flex-1"
                placeholder="Shkruaj shënimin..."
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleQuickNote(quickNoteVoter)}
              />
              <button
                onClick={() => handleQuickNote(quickNoteVoter)}
                className="btn-primary"
                disabled={!quickNote.trim()}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {/* Quick templates */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {[
                'I interesuar, do ta kontaktojmë përsëri',
                'Nuk ishte në shtëpi',
                'Mbështetës i konfirmuar',
                'Kërkon informata shtesë',
                'Kundërshtar, por i hapur për dialog',
              ].map(template => (
                <button
                  key={template}
                  onClick={() => {
                    setQuickNote(template);
                  }}
                  className="text-xs bg-surface-100 text-surface-600 px-2.5 py-1.5 rounded-lg hover:bg-surface-200 pressable"
                  style={{ transition: `background var(--duration-normal) var(--ease-default), transform var(--duration-fast) var(--ease-out)` }}
                >
                  {template}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Voter Detail Modal */}
      {selectedVoter && (
        <VoterDetailModal voter={selectedVoter} onClose={() => setSelectedVoter(null)} />
      )}
    </div>
  );
}

function FieldVoterCard({
  voter,
  onSelect,
  onQuickNote,
  onStatusChange,
  scoreVisible = false,
}: {
  voter: Voter & { score?: number; recommendation?: string };
  onSelect: () => void;
  onQuickNote: () => void;
  onStatusChange: (status: Voter['politicalStatus']) => void;
  scoreVisible?: boolean;
}) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-surface-100 overflow-hidden shadow-sm"
      style={{ transition: `box-shadow var(--duration-normal) var(--ease-out)` }}
    >
      <div
        className="p-3.5 flex items-center gap-3 cursor-pointer active:bg-surface-50"
        onClick={() => setShowActions(!showActions)}
      >
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-semibold text-white flex-shrink-0 ${
          voter.politicalStatus === 'supporter' ? 'bg-gradient-to-br from-green-400 to-green-500' :
          voter.politicalStatus === 'opponent' ? 'bg-gradient-to-br from-red-400 to-red-500' :
          'bg-gradient-to-br from-amber-400 to-amber-500'
        }`}>
          {voter.fullName.split(' ').map(n => n[0]).join('')}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-surface-800 truncate">{voter.fullName}</h3>
            {scoreVisible && voter.score !== undefined && (
              <span className="flex items-center gap-0.5 bg-gold-100 text-gold-700 px-1.5 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0">
                <Zap className="w-2.5 h-2.5" />
                {voter.score}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-surface-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {voter.city}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {voter.interactionCount}
            </span>
            {voter.tags.length > 0 && (
              <span className="flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {voter.tags.length}
              </span>
            )}
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-surface-300"
        style={{
          transition: `transform 200ms var(--ease-out)`,
          transform: showActions ? 'rotate(90deg)' : 'rotate(0deg)',
        }} />
      </div>

      {/* Expanded Actions */}
      {showActions && (
        <div className="px-3.5 pb-3.5 animate-slide-up">
          {/* Status Quick Toggle */}
          <div className="flex gap-1.5 mb-3">
            {(['supporter', 'undecided', 'opponent'] as const).map(status => (
              <button
                key={status}
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange(status);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-medium pressable ${
                  voter.politicalStatus === status
                    ? status === 'supporter' ? 'bg-green-500 text-white'
                    : status === 'undecided' ? 'bg-amber-500 text-white'
                    : 'bg-red-500 text-white'
                    : 'bg-surface-100 text-surface-500'
                }`}
                style={{
                  transition: `background var(--duration-normal) var(--ease-default), color var(--duration-normal) var(--ease-default), transform var(--duration-fast) var(--ease-out)`,
                }}
              >
                {status === 'supporter' ? '✓ Mbësh.' :
                 status === 'undecided' ? '? Pavend.' : '✗ Kund.'}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <a
              href={`tel:${voter.phone}`}
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 pressable"
              style={{ transition: `background var(--duration-normal) var(--ease-default), transform var(--duration-fast) var(--ease-out)` }}
              onClick={e => e.stopPropagation()}
            >
              <PhoneCall className="w-4 h-4" />
              <span className="text-[10px] font-medium">Thirr</span>
            </a>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickNote();
              }}
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-primary-50 text-primary-700 hover:bg-primary-100 pressable"
              style={{ transition: `background var(--duration-normal) var(--ease-default), transform var(--duration-fast) var(--ease-out)` }}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-[10px] font-medium">Shënim</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-surface-50 text-surface-700 hover:bg-surface-100 pressable"
              style={{ transition: `background var(--duration-normal) var(--ease-default), transform var(--duration-fast) var(--ease-out)` }}
            >
              <ArrowRight className="w-4 h-4" />
              <span className="text-[10px] font-medium">Detajet</span>
            </button>
          </div>

          {/* Phone number display */}
          <div className="mt-2 text-center text-xs text-surface-400">
            {voter.phone}
          </div>
        </div>
      )}
    </div>
  );
}
