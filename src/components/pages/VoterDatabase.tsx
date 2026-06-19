'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { Voter, PoliticalStatus, PriorityLevel, PREDEFINED_TAGS } from '@/lib/types';
import {
  Search, Plus, Filter, X, Phone, MapPin, Tag, Clock,
  ChevronDown, ChevronUp, Edit3, Trash2, MessageSquare,
  UserPlus, Download, SlidersHorizontal, Eye,
} from 'lucide-react';
import VoterDetailModal from '@/components/modals/VoterDetailModal';
import AddVoterModal from '@/components/modals/AddVoterModal';

export default function VoterDatabase() {
  const { voters: allVoters, deleteVoter, currentUser } = useStore();

  // Activists only see voters in their assigned region(s).
  const voters = useMemo(() => {
    if (currentUser?.role !== 'activist') return allVoters;
    const allowed = new Set(currentUser.assignedRegions);
    if (allowed.size === 0 && currentUser.region) allowed.add(currentUser.region);
    return allVoters.filter(v => allowed.has(v.city));
  }, [allVoters, currentUser]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PoliticalStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityLevel | 'all'>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'interactions' | 'priority'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedVoter, setSelectedVoter] = useState<Voter | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 25;

  const cities = useMemo(() => {
    const set = new Set(voters.map(v => v.city));
    return Array.from(set).sort();
  }, [voters]);

  const filteredVoters = useMemo(() => {
    let result = voters;

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(v =>
        v.fullName.toLowerCase().includes(q) ||
        v.phone.includes(q) ||
        v.city.toLowerCase().includes(q) ||
        v.neighborhood.toLowerCase().includes(q)
      );
    }

    // Filters
    if (statusFilter !== 'all') result = result.filter(v => v.politicalStatus === statusFilter);
    if (priorityFilter !== 'all') result = result.filter(v => v.priority === priorityFilter);
    if (cityFilter !== 'all') result = result.filter(v => v.city === cityFilter);
    if (tagFilter !== 'all') result = result.filter(v => v.tags.includes(tagFilter));

    // Sort
    result = [...result].sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      switch (sortBy) {
        case 'name': return dir * a.fullName.localeCompare(b.fullName);
        case 'date': return dir * (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
        case 'interactions': return dir * (a.interactionCount - b.interactionCount);
        case 'priority': {
          const prio = { high: 3, medium: 2, low: 1 };
          return dir * (prio[a.priority] - prio[b.priority]);
        }
        default: return 0;
      }
    });

    return result;
  }, [voters, search, statusFilter, priorityFilter, cityFilter, tagFilter, sortBy, sortDir]);

  const totalPages = Math.ceil(filteredVoters.length / perPage);
  const paginatedVoters = filteredVoters.slice((page - 1) * perPage, page * perPage);

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
  };

  const exportCSV = () => {
    const header = 'Emri,Telefoni,Qyteti,Lagja,Mosha,Statusi,Prioriteti,Etiketat,Kontakti i fundit,Interaksione\n';
    const rows = filteredVoters.map(v =>
      `"${v.fullName}","${v.phone}","${v.city}","${v.neighborhood}",${v.age || ''},${v.politicalStatus},${v.priority},"${v.tags.join(', ')}",${v.lastContactedDate ? new Date(v.lastContactedDate).toLocaleDateString('sq') : 'Asnjëherë'},${v.interactionCount}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'votuesit.csv';
    a.click();
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Databaza e Votuesve</h1>
          <p className="text-surface-500 text-sm mt-1">
            {filteredVoters.length} votues {search || statusFilter !== 'all' ? '(të filtruar)' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn-secondary flex items-center gap-1.5">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Eksporto</span>
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary">
            <UserPlus className="w-4 h-4" />
            <span>Shto Votues</span>
          </button>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white rounded-xl border border-surface-100 p-3 mb-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input-field pl-10"
              placeholder="Kërko sipas emrit, telefonit, ose vendndodhjes..."
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary pressable ${showFilters ? 'bg-primary-50 border-primary-200 text-primary-700' : ''}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filtrat</span>
            {(statusFilter !== 'all' || priorityFilter !== 'all' || cityFilter !== 'all' || tagFilter !== 'all') && (
              <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center animate-scale-in">
                {[statusFilter, priorityFilter, cityFilter, tagFilter].filter(f => f !== 'all').length}
              </span>
            )}
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-surface-100 grid grid-cols-2 sm:grid-cols-4 gap-3 animate-slide-up">
            <div>
              <label className="block text-xs font-medium text-surface-500 mb-1">Statusi</label>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value as typeof statusFilter); setPage(1); }}
                className="input-field text-sm"
              >
                <option value="all">Të gjithë</option>
                <option value="supporter">Mbështetës</option>
                <option value="undecided">Pavendosur</option>
                <option value="opponent">Kundërshtar</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-500 mb-1">Prioriteti</label>
              <select
                value={priorityFilter}
                onChange={(e) => { setPriorityFilter(e.target.value as typeof priorityFilter); setPage(1); }}
                className="input-field text-sm"
              >
                <option value="all">Të gjithë</option>
                <option value="high">I lartë</option>
                <option value="medium">Mesatar</option>
                <option value="low">I ulët</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-500 mb-1">Qyteti</label>
              <select
                value={cityFilter}
                onChange={(e) => { setCityFilter(e.target.value); setPage(1); }}
                className="input-field text-sm"
              >
                <option value="all">Të gjithë</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-500 mb-1">Etiketë</label>
              <select
                value={tagFilter}
                onChange={(e) => { setTagFilter(e.target.value); setPage(1); }}
                className="input-field text-sm"
              >
                <option value="all">Të gjitha</option>
                {PREDEFINED_TAGS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-surface-100 shadow-sm overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                  <button onClick={() => toggleSort('name')} className="flex items-center gap-1 hover:text-surface-700 transition-colors">
                    Emri
                    {sortBy === 'name' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Telefoni</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Vendndodhja</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Statusi</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                  <button onClick={() => toggleSort('priority')} className="flex items-center gap-1 hover:text-surface-700 transition-colors">
                    Prioriteti
                    {sortBy === 'priority' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Etiketat</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                  <button onClick={() => toggleSort('interactions')} className="flex items-center gap-1 hover:text-surface-700 transition-colors">
                    Kontakte
                    {sortBy === 'interactions' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </button>
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Veprimet</th>
              </tr>
            </thead>
            <tbody>
              {paginatedVoters.map((voter, index) => (
                <tr
                  key={voter.id}
                  className="border-b border-surface-50 hover:bg-primary-50/30 cursor-pointer group"
                  onClick={() => setSelectedVoter(voter)}
                  style={{ transition: `background var(--duration-normal) var(--ease-default)` }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-semibold">
                        {voter.fullName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-surface-800">{voter.fullName}</div>
                        {voter.age && <div className="text-xs text-surface-400">{voter.age} vjeç</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-surface-600">{voter.phone}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm text-surface-600">
                      <MapPin className="w-3 h-3 text-surface-400" />
                      {voter.city}
                    </div>
                    <div className="text-xs text-surface-400">{voter.neighborhood}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${
                      voter.politicalStatus === 'supporter' ? 'badge-supporter' :
                      voter.politicalStatus === 'opponent' ? 'badge-opponent' : 'badge-undecided'
                    }`}>
                      {voter.politicalStatus === 'supporter' ? 'Mbështetës' :
                       voter.politicalStatus === 'opponent' ? 'Kundërshtar' : 'Pavendosur'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${
                      voter.priority === 'high' ? 'badge-high' :
                      voter.priority === 'medium' ? 'badge-medium' : 'badge-low'
                    }`}>
                      {voter.priority === 'high' ? 'I lartë' :
                       voter.priority === 'medium' ? 'Mesatar' : 'I ulët'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {voter.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-xs bg-surface-100 text-surface-600 px-1.5 py-0.5 rounded-md">
                          {tag}
                        </span>
                      ))}
                      {voter.tags.length > 2 && (
                        <span className="text-xs text-surface-400">+{voter.tags.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-surface-700 font-medium">{voter.interactionCount}</div>
                    <div className="text-xs text-surface-400">
                      {voter.lastContactedDate
                        ? new Date(voter.lastContactedDate).toLocaleDateString('sq', { day: 'numeric', month: 'short' })
                        : 'Asnjëherë'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100" style={{ transition: `opacity var(--duration-normal) var(--ease-default)` }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedVoter(voter); }}
                        className="p-1.5 rounded-lg hover:bg-primary-100 text-surface-400 hover:text-primary-600 pressable"
                        style={{ transition: `background var(--duration-normal) var(--ease-default), color var(--duration-normal) var(--ease-default), transform var(--duration-fast) var(--ease-out)` }}
                        title="Shiko detajet"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('A jeni i sigurt që dëshironi ta fshini?')) deleteVoter(voter.id);
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-100 text-surface-400 hover:text-red-500 pressable"
                        style={{ transition: `background var(--duration-normal) var(--ease-default), color var(--duration-normal) var(--ease-default), transform var(--duration-fast) var(--ease-out)` }}
                        title="Fshi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-surface-100">
          {paginatedVoters.map(voter => (
            <div
              key={voter.id}
              className="p-4 hover:bg-primary-50/30 active:bg-primary-50"
              style={{ transition: `background var(--duration-normal) var(--ease-default)` }}
              onClick={() => setSelectedVoter(voter)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-semibold">
                    {voter.fullName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-surface-800">{voter.fullName}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3 h-3 text-surface-400" />
                      <span className="text-xs text-surface-500">{voter.city}, {voter.neighborhood}</span>
                    </div>
                  </div>
                </div>
                <span className={`badge ${
                  voter.politicalStatus === 'supporter' ? 'badge-supporter' :
                  voter.politicalStatus === 'opponent' ? 'badge-opponent' : 'badge-undecided'
                }`}>
                  {voter.politicalStatus === 'supporter' ? 'Mbësh.' :
                   voter.politicalStatus === 'opponent' ? 'Kund.' : 'Pavend.'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-surface-400 ml-12">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {voter.phone}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
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
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-surface-100">
            <span className="text-sm text-surface-500">
              {(page - 1) * perPage + 1}–{Math.min(page * perPage, filteredVoters.length)} nga {filteredVoters.length}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm rounded-lg border border-surface-200 hover:bg-surface-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Mbrapa
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) pageNum = i + 1;
                else if (page <= 3) pageNum = i + 1;
                else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = page - 2 + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 text-sm rounded-lg pressable ${
                      page === pageNum
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'hover:bg-surface-100 text-surface-600'
                    }`}
                    style={{ transition: `background var(--duration-normal) var(--ease-default), color var(--duration-normal) var(--ease-default), transform var(--duration-fast) var(--ease-out)` }}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm rounded-lg border border-surface-200 hover:bg-surface-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Para
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedVoter && (
        <VoterDetailModal
          voter={selectedVoter}
          onClose={() => setSelectedVoter(null)}
          onUpdate={(updatedVoter) => {
            setSelectedVoter(updatedVoter);
          }}
        />
      )}
      {showAddModal && (
        <AddVoterModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}
