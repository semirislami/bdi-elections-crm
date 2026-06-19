'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Voter, PREDEFINED_TAGS } from '@/lib/types';
import {
  X, Phone, MapPin, Tag, Clock, MessageSquare, Edit3,
  Save, Zap, User, Calendar, Hash, ChevronRight,
} from 'lucide-react';
import { calculateVoterScore } from '@/lib/scoring';

interface VoterDetailModalProps {
  voter: Voter;
  onClose: () => void;
  onUpdate?: (voter: Voter) => void;
}

export default function VoterDetailModal({ voter, onClose, onUpdate }: VoterDetailModalProps) {
  const { updateVoter, addVoterNote, updateVoterStatus } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(voter);
  const [newNote, setNewNote] = useState('');
  const [activeTab, setActiveTab] = useState<'info' | 'notes' | 'tags'>('info');

  const scored = calculateVoterScore(voter);

  const handleSave = () => {
    updateVoter(voter.id, {
      fullName: editData.fullName,
      phone: editData.phone,
      city: editData.city,
      neighborhood: editData.neighborhood,
      age: editData.age,
      politicalStatus: editData.politicalStatus,
      priority: editData.priority,
      tags: editData.tags,
    });
    setIsEditing(false);
    onUpdate?.({ ...voter, ...editData });
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    addVoterNote(voter.id, newNote.trim());
    setNewNote('');
  };

  const handleStatusChange = (status: Voter['politicalStatus']) => {
    updateVoterStatus(voter.id, status);
    setEditData(prev => ({ ...prev, politicalStatus: status }));
    onUpdate?.({ ...voter, politicalStatus: status });
  };

  const toggleTag = (tag: string) => {
    setEditData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  return (
    /* Emil: backdrop + content animate separately.
       Modal keeps transform-origin: center. */
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm modal-backdrop" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-modal-enter">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-5 py-4 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center pressable"
            style={{ transition: `background var(--duration-normal) var(--ease-default), transform var(--duration-fast) var(--ease-out)` }}
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-lg font-bold border border-white/20">
              {voter.fullName.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold">{voter.fullName}</h2>
              <div className="flex items-center gap-2 mt-1 text-primary-200 text-sm">
                <MapPin className="w-3.5 h-3.5" />
                <span>{voter.city}, {voter.neighborhood}</span>
              </div>
            </div>
          </div>
          
          {/* Score Badge */}
          <div className="absolute top-4 right-14 flex items-center gap-1.5 bg-gold-400/20 backdrop-blur-sm rounded-lg px-2.5 py-1 border border-gold-400/30">
            <Zap className="w-3.5 h-3.5 text-gold-300" />
            <span className="text-sm font-bold text-gold-200">{scored.score}</span>
          </div>
        </div>

        {/* Quick Status Buttons — Emil: pressable for feedback */}
        <div className="px-5 py-3 border-b border-surface-100 flex gap-2">
          {(['supporter', 'undecided', 'opponent'] as const).map(status => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium pressable ${
                (isEditing ? editData.politicalStatus : voter.politicalStatus) === status
                  ? status === 'supporter' ? 'bg-green-500 text-white shadow-md shadow-green-500/20'
                  : status === 'undecided' ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'bg-red-500 text-white shadow-md shadow-red-500/20'
                  : 'bg-surface-100 text-surface-500 hover:bg-surface-200'
              }`}
              style={{
                transition: `background var(--duration-normal) var(--ease-default), 
                             color var(--duration-normal) var(--ease-default),
                             box-shadow var(--duration-normal) var(--ease-out),
                             transform var(--duration-fast) var(--ease-out)`,
              }}
            >
              {status === 'supporter' ? 'Mbështetës' :
               status === 'undecided' ? 'Pavendosur' : 'Kundërshtar'}
            </button>
          ))}
        </div>

        {/* Tabs — Emil: border-b indicator transition with proper easing */}
        <div className="flex border-b border-surface-100">
          {[
            { id: 'info' as const, label: 'Detajet', icon: User },
            { id: 'notes' as const, label: 'Shënimet', icon: MessageSquare },
            { id: 'tags' as const, label: 'Etiketat', icon: Tag },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium border-b-2 pressable ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-surface-400 hover:text-surface-600'
              }`}
              style={{
                transition: `border-color var(--duration-normal) var(--ease-default), 
                             color var(--duration-normal) var(--ease-default),
                             transform var(--duration-fast) var(--ease-out)`,
              }}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[50vh]">
          {activeTab === 'info' && (
            <div className="space-y-4 animate-fade-in" key="info">
              {isEditing ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-surface-500 mb-1">Emri</label>
                      <input
                        type="text"
                        value={editData.fullName}
                        onChange={e => setEditData({ ...editData, fullName: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-surface-500 mb-1">Telefoni</label>
                      <input
                        type="tel"
                        value={editData.phone}
                        onChange={e => setEditData({ ...editData, phone: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-surface-500 mb-1">Qyteti</label>
                      <input
                        type="text"
                        value={editData.city}
                        onChange={e => setEditData({ ...editData, city: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-surface-500 mb-1">Lagja</label>
                      <input
                        type="text"
                        value={editData.neighborhood}
                        onChange={e => setEditData({ ...editData, neighborhood: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-surface-500 mb-1">Mosha</label>
                      <input
                        type="number"
                        value={editData.age || ''}
                        onChange={e => setEditData({ ...editData, age: Number(e.target.value) || undefined })}
                        className="input-field"
                        placeholder="Opsional"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-surface-500 mb-1">Prioriteti</label>
                      <select
                        value={editData.priority}
                        onChange={e => setEditData({ ...editData, priority: e.target.value as Voter['priority'] })}
                        className="input-field"
                      >
                        <option value="high">I lartë</option>
                        <option value="medium">Mesatar</option>
                        <option value="low">I ulët</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={handleSave} className="btn-primary flex-1">
                      <Save className="w-4 h-4" />
                      Ruaj ndryshimet
                    </button>
                    <button onClick={() => { setIsEditing(false); setEditData(voter); }} className="btn-secondary">
                      Anulo
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <InfoRow icon={Phone} label="Telefoni" value={voter.phone} />
                    <InfoRow icon={MapPin} label="Qyteti" value={voter.city} />
                    <InfoRow icon={MapPin} label="Lagja" value={voter.neighborhood} />
                    <InfoRow icon={User} label="Mosha" value={voter.age ? `${voter.age} vjeç` : 'N/A'} />
                    <InfoRow
                      icon={Calendar}
                      label="Kontakti i Fundit"
                      value={voter.lastContactedDate
                        ? new Date(voter.lastContactedDate).toLocaleDateString('sq', { day: 'numeric', month: 'long', year: 'numeric' })
                        : 'Asnjëherë'}
                    />
                    <InfoRow icon={Hash} label="Interaksione" value={voter.interactionCount.toString()} />
                  </div>
                  
                  {/* Score Breakdown */}
                  <div className="mt-4 p-3 bg-primary-50 rounded-xl border border-primary-100">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-4 h-4 text-primary-600" />
                      <span className="text-sm font-semibold text-primary-800">Analiza e Pikëve</span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <ScoreRow label="Statusi politik" value={scored.scoreBreakdown.statusScore} />
                      <ScoreRow label="Etiketat" value={scored.scoreBreakdown.tagScore} />
                      <ScoreRow label="Kohësia e kontaktit" value={scored.scoreBreakdown.recencyScore} />
                      <ScoreRow label="Mobilizimi" value={scored.scoreBreakdown.mobilizationScore} />
                      <ScoreRow label="Prioriteti" value={scored.scoreBreakdown.priorityScore} />
                    </div>
                    <div className="mt-3 pt-2 border-t border-primary-200 text-xs italic text-primary-600">
                      {scored.recommendation}
                    </div>
                  </div>

                  <button onClick={() => setIsEditing(true)} className="btn-secondary w-full mt-3">
                    <Edit3 className="w-4 h-4" />
                    Ndrysho detajet
                  </button>
                </>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4 animate-fade-in" key="notes">
              {/* Add Note */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  className="input-field flex-1"
                  placeholder="Shto shënim të ri..."
                  onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                />
                <button onClick={handleAddNote} className="btn-primary" disabled={!newNote.trim()}>
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>

              {/* Notes List */}
              <div className="space-y-3">
                {voter.notes.length === 0 ? (
                  <div className="text-center py-8 text-surface-400">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Nuk ka shënime ende</p>
                  </div>
                ) : (
                  voter.notes.map((note, i) => (
                    <div
                      key={note.id}
                      className="p-3 bg-surface-50 rounded-xl border border-surface-100 stagger-item"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <p className="text-sm text-surface-700">{note.text}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-surface-400">
                        <span className="font-medium">{note.authorName}</span>
                        <span>•</span>
                        <span>{new Date(note.createdAt).toLocaleDateString('sq', {
                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'tags' && (
            <div className="animate-fade-in" key="tags">
              <p className="text-sm text-surface-500 mb-4">Zgjidhni etiketat relevante për këtë votues:</p>
              <div className="flex flex-wrap gap-2">
                {PREDEFINED_TAGS.map(tag => {
                  const isActive = editData.tags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => {
                        toggleTag(tag);
                        const newTags = editData.tags.includes(tag)
                          ? editData.tags.filter(t => t !== tag)
                          : [...editData.tags, tag];
                        updateVoter(voter.id, { tags: newTags });
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium pressable ${
                        isActive
                          ? 'bg-primary-600 text-white shadow-sm shadow-primary-600/20'
                          : 'bg-surface-100 text-surface-500 hover:bg-surface-200 hover:text-surface-700'
                      }`}
                      style={{
                        transition: `background var(--duration-normal) var(--ease-default), 
                                     color var(--duration-normal) var(--ease-default),
                                     transform var(--duration-fast) var(--ease-out)`,
                      }}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
              
              {editData.tags.length > 0 && (
                <div className="mt-4 p-3 bg-primary-50 rounded-xl border border-primary-100 animate-scale-in">
                  <p className="text-xs font-medium text-primary-700 mb-2">Etiketat aktive:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {editData.tags.map(tag => (
                      <span key={tag} className="badge bg-primary-100 text-primary-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-surface-400" />
      </div>
      <div>
        <p className="text-xs text-surface-400">{label}</p>
        <p className="text-sm font-medium text-surface-800">{value}</p>
      </div>
    </div>
  );
}

function ScoreRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-surface-600">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-20 h-1.5 rounded-full bg-primary-200 overflow-hidden">
          {/* Emil: animate progress bars with ease-out */}
          <div
            className="h-full rounded-full bg-primary-500"
            style={{
              width: `${(value / 5) * 100}%`,
              transition: `width 500ms var(--ease-out)`,
            }}
          />
        </div>
        <span className="font-semibold text-primary-700 w-6 text-right">+{value}</span>
      </div>
    </div>
  );
}
