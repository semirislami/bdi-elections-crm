'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { PREDEFINED_TAGS } from '@/lib/types';
import {
  MessageSquare, Download, Users, Filter, Tag,
  CheckSquare, Square, Mail, Phone, FileDown,
  Copy, Check, Target, UserCheck, AlertCircle,
} from 'lucide-react';

type Segment = 'all' | 'supporters' | 'undecided' | 'opponents' | 'custom';

export default function Communication() {
  const { voters } = useStore();
  const [segment, setSegment] = useState<Segment>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedVoterIds, setSelectedVoterIds] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'phones' | 'emails'>('csv');

  const cities = useMemo(() => {
    const set = new Set(voters.map(v => v.city));
    return Array.from(set).sort();
  }, [voters]);

  const filteredVoters = useMemo(() => {
    let result = voters;

    // Status segment
    if (segment === 'supporters') result = result.filter(v => v.politicalStatus === 'supporter');
    else if (segment === 'undecided') result = result.filter(v => v.politicalStatus === 'undecided');
    else if (segment === 'opponents') result = result.filter(v => v.politicalStatus === 'opponent');

    // Tag filter
    if (selectedTags.length > 0) {
      result = result.filter(v => selectedTags.some(tag => v.tags.includes(tag)));
    }

    // City filter
    if (selectedCities.length > 0) {
      result = result.filter(v => selectedCities.includes(v.city));
    }

    return result;
  }, [voters, segment, selectedTags, selectedCities]);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedVoterIds(new Set());
    } else {
      setSelectedVoterIds(new Set(filteredVoters.map(v => v.id)));
    }
    setSelectAll(!selectAll);
  };

  const toggleVoter = (id: string) => {
    const newSet = new Set(selectedVoterIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedVoterIds(newSet);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const toggleCity = (city: string) => {
    setSelectedCities(prev =>
      prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]
    );
  };

  const selectedVoters = filteredVoters.filter(v => selectedVoterIds.has(v.id));

  const exportData = () => {
    const votersToExport = selectedVoterIds.size > 0 ? selectedVoters : filteredVoters;
    
    let content = '';
    let filename = '';

    if (exportFormat === 'csv') {
      content = 'Emri,Telefoni,Qyteti,Lagja,Statusi,Etiketat\n';
      content += votersToExport.map(v =>
        `"${v.fullName}","${v.phone}","${v.city}","${v.neighborhood}","${v.politicalStatus}","${v.tags.join(', ')}"`
      ).join('\n');
      filename = 'kontaktet.csv';
    } else if (exportFormat === 'phones') {
      content = votersToExport.map(v => v.phone).join('\n');
      filename = 'numrat.txt';
    }

    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const copyPhones = () => {
    const votersToExport = selectedVoterIds.size > 0 ? selectedVoters : filteredVoters;
    const phones = votersToExport.map(v => v.phone).join('\n');
    navigator.clipboard.writeText(phones);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Komunikimi</h1>
          <p className="text-surface-500 text-sm mt-1">Segmentoni votuesit dhe përgatsini listat e mesazheve</p>
        </div>
        <div className="flex gap-2">
          <button onClick={copyPhones} className="btn-secondary">
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Kopjuar!' : 'Kopjo numrat'}</span>
          </button>
          <button onClick={exportData} className="btn-primary">
            <FileDown className="w-4 h-4" />
            Eksporto
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Filters Panel */}
        <div className="lg:col-span-1 space-y-4">
          {/* Segment Selection */}
          <div className="stat-card">
            <h3 className="text-sm font-semibold text-surface-800 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-primary-500" />
              Segmenti
            </h3>
            <div className="space-y-1.5">
              {[
                { id: 'all' as Segment, label: 'Të gjithë', icon: Users, count: voters.length },
                { id: 'supporters' as Segment, label: 'Mbështetës', icon: UserCheck, count: voters.filter(v => v.politicalStatus === 'supporter').length },
                { id: 'undecided' as Segment, label: 'Pavendosur', icon: AlertCircle, count: voters.filter(v => v.politicalStatus === 'undecided').length },
                { id: 'opponents' as Segment, label: 'Kundërshtarë', icon: Users, count: voters.filter(v => v.politicalStatus === 'opponent').length },
              ].map(seg => (
                <button
                  key={seg.id}
                  onClick={() => setSegment(seg.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-sm pressable ${
                    segment === seg.id
                      ? 'bg-primary-50 text-primary-700 border border-primary-200 font-medium'
                      : 'bg-surface-50 text-surface-600 hover:bg-surface-100 border border-transparent'
                  }`}
                  style={{
                    transition: `background var(--duration-normal) var(--ease-default), border-color var(--duration-normal) var(--ease-default), color var(--duration-normal) var(--ease-default), transform var(--duration-fast) var(--ease-out)`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <seg.icon className="w-4 h-4" />
                    {seg.label}
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    segment === seg.id ? 'bg-primary-200 text-primary-700' : 'bg-surface-200 text-surface-500'
                  }`}>
                    {seg.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Tags Filter */}
          <div className="stat-card">
            <h3 className="text-sm font-semibold text-surface-800 mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary-500" />
              Filtroni sipas etiketave
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {PREDEFINED_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium pressable ${
                    selectedTags.includes(tag)
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-surface-100 text-surface-500 hover:bg-surface-200'
                  }`}
                  style={{
                    transition: `background var(--duration-normal) var(--ease-default), color var(--duration-normal) var(--ease-default), transform var(--duration-fast) var(--ease-out)`,
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* City Filter */}
          <div className="stat-card">
            <h3 className="text-sm font-semibold text-surface-800 mb-3 flex items-center gap-2">
              <Filter className="w-4 h-4 text-primary-500" />
              Filtroni sipas qytetit
            </h3>
            <div className="max-h-[200px] overflow-y-auto space-y-1">
              {cities.map(city => (
                <button
                  key={city}
                  onClick={() => toggleCity(city)}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg text-xs text-left pressable ${
                    selectedCities.includes(city)
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-surface-600 hover:bg-surface-50'
                  }`}
                  style={{
                    transition: `background var(--duration-normal) var(--ease-default), color var(--duration-normal) var(--ease-default), transform var(--duration-fast) var(--ease-out)`,
                  }}
                >
                  {selectedCities.includes(city) ?
                    <CheckSquare className="w-3.5 h-3.5 text-primary-500" /> :
                    <Square className="w-3.5 h-3.5 text-surface-300" />
                  }
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Export Format */}
          <div className="stat-card">
            <h3 className="text-sm font-semibold text-surface-800 mb-3">Formati i eksportit</h3>
            <div className="space-y-1.5">
              {[
                { id: 'csv' as const, label: 'CSV (Excel)', icon: FileDown },
                { id: 'phones' as const, label: 'Vetëm numrat', icon: Phone },
              ].map(fmt => (
                <button
                  key={fmt.id}
                  onClick={() => setExportFormat(fmt.id)}
                  className={`w-full flex items-center gap-2 p-2.5 rounded-lg text-xs pressable ${
                    exportFormat === fmt.id
                      ? 'bg-primary-50 text-primary-700 font-medium border border-primary-200'
                      : 'bg-surface-50 text-surface-600 hover:bg-surface-100 border border-transparent'
                  }`}
                  style={{
                    transition: `background var(--duration-normal) var(--ease-default), border-color var(--duration-normal) var(--ease-default), transform var(--duration-fast) var(--ease-out)`,
                  }}
                >
                  <fmt.icon className="w-4 h-4" />
                  {fmt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          <div className="stat-card">
            {/* Summary Bar */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-surface-100">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center gap-2 text-sm text-surface-600 hover:text-primary-600 pressable"
                  style={{ transition: `color var(--duration-normal) var(--ease-default), transform var(--duration-fast) var(--ease-out)` }}
                >
                  {selectAll ? <CheckSquare className="w-4 h-4 text-primary-600" /> : <Square className="w-4 h-4" />}
                  {selectAll ? 'Çzgjedh të gjithë' : 'Zgjedh të gjithë'}
                </button>
                {selectedVoterIds.size > 0 && (
                  <span className="badge bg-primary-100 text-primary-700">
                    {selectedVoterIds.size} zgjedhur
                  </span>
                )}
              </div>
              <span className="text-sm text-surface-500">
                {filteredVoters.length} votues
              </span>
            </div>

            {/* Voter List */}
            <div className="space-y-1 max-h-[600px] overflow-y-auto">
              {filteredVoters.slice(0, 50).map(voter => (
                <div
                  key={voter.id}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer pressable ${
                    selectedVoterIds.has(voter.id)
                      ? 'bg-primary-50 border border-primary-200'
                      : 'hover:bg-surface-50 border border-transparent'
                  }`}
                  style={{
                    transition: `background var(--duration-normal) var(--ease-default), border-color var(--duration-normal) var(--ease-default), transform var(--duration-fast) var(--ease-out)`,
                  }}
                  onClick={() => toggleVoter(voter.id)}
                >
                  {selectedVoterIds.has(voter.id) ?
                    <CheckSquare className="w-4 h-4 text-primary-600 flex-shrink-0" /> :
                    <Square className="w-4 h-4 text-surface-300 flex-shrink-0" />
                  }
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-surface-800 truncate">{voter.fullName}</span>
                      <span className={`badge text-[10px] ${
                        voter.politicalStatus === 'supporter' ? 'badge-supporter' :
                        voter.politicalStatus === 'opponent' ? 'badge-opponent' : 'badge-undecided'
                      }`}>
                        {voter.politicalStatus === 'supporter' ? 'Mbësh.' :
                         voter.politicalStatus === 'opponent' ? 'Kund.' : 'Pavend.'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-surface-400 mt-0.5">
                      <span>{voter.phone}</span>
                      <span>{voter.city}</span>
                    </div>
                  </div>
                  {voter.tags.length > 0 && (
                    <div className="hidden sm:flex flex-wrap gap-1 max-w-[180px] justify-end">
                      {voter.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[10px] bg-surface-100 text-surface-500 px-1.5 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {filteredVoters.length > 50 && (
                <div className="text-center py-4 text-sm text-surface-400">
                  Treguar 50 nga {filteredVoters.length} votues. Eksportoni për listën e plotë.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
