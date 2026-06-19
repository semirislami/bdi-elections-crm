'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { PREDEFINED_TAGS } from '@/lib/types';
import { X, UserPlus, MapPin, Phone, Tag } from 'lucide-react';

interface AddVoterModalProps {
  onClose: () => void;
}

export default function AddVoterModal({ onClose }: AddVoterModalProps) {
  const { addVoter, currentUser } = useStore();

  // Activists can only assign voters to cities within their assigned regions.
  const allowedCities = useMemo(() => {
    if (currentUser?.role !== 'activist') return null;
    const set = new Set(currentUser.assignedRegions);
    if (set.size === 0 && currentUser.region) set.add(currentUser.region);
    return Array.from(set);
  }, [currentUser]);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    city: allowedCities && allowedCities.length > 0 ? allowedCities[0] : '',
    neighborhood: '',
    age: '' as string | number,
    politicalStatus: 'undecided' as 'supporter' | 'opponent' | 'undecided',
    priority: 'medium' as 'high' | 'medium' | 'low',
    tags: [] as string[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addVoter({
      ...formData,
      age: formData.age ? Number(formData.age) : undefined,
      lastContactedDate: null,
    });
    onClose();
  };

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  return (
    /* Emil: Modal backdrop + content enter separately.
       Backdrop: opacity fade. Content: scale(0.96) + translateY for depth. 
       Modals keep transform-origin: center (not anchored to a trigger). */
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm modal-backdrop" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-modal-enter">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary-100 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-primary-600" />
            </div>
            <h2 className="text-lg font-bold text-surface-900">Shto Votues të Ri</h2>
          </div>
          {/* Emil: pressable close button */}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-surface-100 flex items-center justify-center text-surface-400 pressable"
            style={{ transition: `background var(--duration-normal) var(--ease-default), transform var(--duration-fast) var(--ease-out)` }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto max-h-[70vh]">
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Emri i plotë *</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                className="input-field"
                placeholder="p.sh. Arben Ahmeti"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Numri i telefonit *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field pl-10"
                  placeholder="+389 7x xxx xxx"
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Qyteti *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                  {allowedCities ? (
                    <select
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                      className="input-field pl-10"
                      required
                    >
                      {allowedCities.length === 0 && <option value="">Asnjë rajon i caktuar</option>}
                      {allowedCities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                      className="input-field pl-10"
                      placeholder="p.sh. Tetovë"
                      required
                    />
                  )}
                </div>
                {allowedCities && allowedCities.length === 0 && (
                  <p className="text-[11px] text-red-500 mt-1">
                    Adminit duhet t&apos;ju caktojë një rajon para se të mund të shtoni votues.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Lagja</label>
                <input
                  type="text"
                  value={formData.neighborhood}
                  onChange={e => setFormData({ ...formData, neighborhood: e.target.value })}
                  className="input-field"
                  placeholder="p.sh. Qendër"
                />
              </div>
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Mosha (opsional)</label>
              <input
                type="number"
                value={formData.age}
                onChange={e => setFormData({ ...formData, age: e.target.value })}
                className="input-field"
                placeholder="p.sh. 35"
                min={18}
                max={120}
              />
            </div>

            {/* Status — Emil: pressable status buttons */}
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">Statusi politik</label>
              <div className="flex gap-2">
                {[
                  { value: 'supporter', label: 'Mbështetës', color: 'bg-green-500' },
                  { value: 'undecided', label: 'Pavendosur', color: 'bg-amber-500' },
                  { value: 'opponent', label: 'Kundërshtar', color: 'bg-red-500' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, politicalStatus: opt.value as typeof formData.politicalStatus })}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium pressable ${
                      formData.politicalStatus === opt.value
                        ? `${opt.color} text-white shadow-md`
                        : 'bg-surface-100 text-surface-500 hover:bg-surface-200'
                    }`}
                    style={{
                      transition: `background var(--duration-normal) var(--ease-default), 
                                   color var(--duration-normal) var(--ease-default),
                                   box-shadow var(--duration-normal) var(--ease-out),
                                   transform var(--duration-fast) var(--ease-out)`,
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">Prioriteti</label>
              <div className="flex gap-2">
                {[
                  { value: 'high', label: 'I lartë' },
                  { value: 'medium', label: 'Mesatar' },
                  { value: 'low', label: 'I ulët' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: opt.value as typeof formData.priority })}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium pressable ${
                      formData.priority === opt.value
                        ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20'
                        : 'bg-surface-100 text-surface-500 hover:bg-surface-200'
                    }`}
                    style={{
                      transition: `background var(--duration-normal) var(--ease-default), 
                                   color var(--duration-normal) var(--ease-default),
                                   box-shadow var(--duration-normal) var(--ease-out),
                                   transform var(--duration-fast) var(--ease-out)`,
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Etiketat
              </label>
              <div className="flex flex-wrap gap-2">
                {PREDEFINED_TAGS.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-lg text-sm pressable ${
                      formData.tags.includes(tag)
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'bg-surface-100 text-surface-500 hover:bg-surface-200'
                    }`}
                    style={{
                      transition: `background var(--duration-normal) var(--ease-default), 
                                   color var(--duration-normal) var(--ease-default),
                                   transform var(--duration-fast) var(--ease-out)`,
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-surface-100">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Anulo
            </button>
            <button type="submit" className="btn-primary flex-1">
              <UserPlus className="w-4 h-4" />
              Shto Votuesin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
