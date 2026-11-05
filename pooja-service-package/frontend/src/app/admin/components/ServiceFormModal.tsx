'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useScrollLock } from '../../../lib/scrollLock';
import {
  X,
  Sparkles,
  Save,
  RefreshCw,
  AlertCircle,
  Clock,
  IndianRupee,
  User,
  Tag,
  Image as ImageIcon,
  CheckCircle2,
  Upload,
} from 'lucide-react';
import { getAuthToken } from '../../../lib/auth';

export interface ServiceFormData {
  id?: string;
  title: string;
  categoryKey: 'astrology' | 'pooja' | 'occult' | 'education';
  categoryTag?: string;
  pandit: string;
  desc: string;
  priceNumber: number;
  price?: string;
  durationMinutes: number;
  image?: string;
  badge?: string;
  isSpecial?: boolean;
  isActive?: boolean;
}

interface ServiceFormModalProps {
  isOpen: boolean;
  service?: any | null; // null if creating new
  onClose: () => void;
  onSave: (data: ServiceFormData) => Promise<void>;
}

export default function ServiceFormModal({
  isOpen,
  service,
  onClose,
  onSave,
}: ServiceFormModalProps) {
  useScrollLock(isOpen);

  const isEditing = Boolean(service);

  const [title, setTitle] = useState('');
  const [categoryKey, setCategoryKey] = useState<'astrology' | 'pooja' | 'occult' | 'education'>('astrology');
  const [categoryTag, setCategoryTag] = useState('VEDIC ASTROLOGY');
  const [pandit, setPandit] = useState('Dr. Pandit Vishal Dubey');
  const [desc, setDesc] = useState('');
  const [priceNumber, setPriceNumber] = useState<number>(1100);
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [image, setImage] = useState('/services/consultation.jpg');
  const [badge, setBadge] = useState('');
  const [isSpecial, setIsSpecial] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api').replace(/\/api\/?$/, '');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = getAuthToken();
    if (!token) {
      setUploadError('Admin authorization token required.');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Invalid format. Please upload JPEG, PNG, WebP, GIF, or SVG.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image size exceeds 10MB limit.');
      return;
    }

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${backendUrl}/api/content/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Image upload failed');
      }

      setImage(data.url);
    } catch (err: any) {
      console.error('Service image upload error:', err);
      setUploadError(err.message || 'Error uploading service image.');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (service) {
      setTitle(service.title || '');
      setCategoryKey(service.categoryKey || 'astrology');
      setCategoryTag(service.categoryTag || 'VEDIC ASTROLOGY');
      setPandit(service.pandit || 'Dr. Pandit Vishal Dubey');
      setDesc(service.desc || '');
      setPriceNumber(typeof service.priceNumber === 'number' ? service.priceNumber : 1100);
      setDurationMinutes(service.durationMinutes || 45);
      setImage(service.image || '/services/consultation.jpg');
      setBadge(service.badge || '');
      setIsSpecial(Boolean(service.isSpecial));
      setIsActive(service.isActive !== false);
    } else {
      setTitle('');
      setCategoryKey('astrology');
      setCategoryTag('VEDIC ASTROLOGY');
      setPandit('Dr. Pandit Vishal Dubey');
      setDesc('');
      setPriceNumber(1100);
      setDurationMinutes(45);
      setImage('/services/consultation.jpg');
      setBadge('');
      setIsSpecial(false);
      setIsActive(true);
    }
    setError(null);
  }, [service, isOpen]);

  const scrollRef = useRef<HTMLDivElement>(null);

  const handleModalWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    if (
      scrollRef.current &&
      e.target !== scrollRef.current &&
      !scrollRef.current.contains(e.target as Node)
    ) {
      scrollRef.current.scrollTop += e.deltaY;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handles numeric price and duration inputs so leading zeros auto-strip when user starts typing
  const handleNumericInput = (val: string, setter: (n: number) => void) => {
    const digitsOnly = val.replace(/\D/g, '');
    if (!digitsOnly) {
      setter(0);
      return;
    }
    // Automatically strip leading zeros if followed by other digits (e.g. "05" -> "5", "01100" -> "1100")
    const stripped = digitsOnly.replace(/^0+(?=\d)/, '');
    setter(Number(stripped));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Service title is required.');
      return;
    }
    if (!desc.trim()) {
      setError('Service description is required.');
      return;
    }
    if (!pandit.trim()) {
      setError('Officiating Pandit / Spiritual Guide is required.');
      return;
    }
    if (priceNumber < 0) {
      setError('Price cannot be negative.');
      return;
    }
    if (durationMinutes < 10 || durationMinutes > 240) {
      setError('Duration must be between 10 and 240 minutes.');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        ...(service?.id ? { id: service.id } : {}),
        title: title.trim(),
        categoryKey,
        categoryTag: categoryTag.trim() || undefined,
        pandit: pandit.trim(),
        desc: desc.trim(),
        priceNumber: Number(priceNumber),
        price: priceNumber === 0 ? '100% FREE' : `₹${Number(priceNumber).toLocaleString('en-IN')}`,
        durationMinutes: Number(durationMinutes),
        image: image.trim() || '/services/consultation.jpg',
        badge: badge.trim() || undefined,
        isSpecial,
        isActive,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save service. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      data-lenis-prevent="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-fadeIn"
    >
      <div
        data-lenis-prevent="true"
        onWheel={handleModalWheel}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[calc(100dvh-32px)] flex flex-col rounded-2xl bg-[#FCFBF8] border border-amber-300/80 shadow-2xl overflow-hidden text-[#3B1E22]"
      >
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-[#50080F] via-[#6B0D16] to-[#40080D] text-white flex items-center justify-between shrink-0 border-b border-amber-400/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 text-amber-200 flex items-center justify-center border border-amber-300/25 shrink-0">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-amber-100 tracking-wide">
                {isEditing ? 'Edit Consultation Service' : 'Add New Divine Service'}
              </h3>
              <p className="text-[11px] text-amber-200/80 font-medium">
                {isEditing ? `ID: ${service.id}` : 'Create a new Vedic astrology or spiritual service'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Close modal (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
          <div
            ref={scrollRef}
            data-lenis-prevent="true"
            onWheel={(e) => e.stopPropagation()}
            className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 min-h-0 text-xs modal-scroll-container overscroll-contain modal-scrollbar"
          >
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Section 0: Service Image Upload (Top Section) */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80">
              <label className="text-xs font-bold text-amber-950 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-700" />
                  <span>Service Cover Image *</span>
                </span>
                <span className="text-[11px] font-normal text-amber-800">
                  Supports Direct Upload or Image URL
                </span>
              </label>

              <div className="flex flex-col sm:flex-row gap-3.5 items-center">
                {/* Image Preview Thumbnail */}
                <div className="relative w-28 h-20 rounded-xl overflow-hidden border border-amber-300 bg-stone-100 shrink-0 shadow-xs">
                  <img
                    src={image.startsWith('/api') ? `${backendUrl}${image}` : image}
                    alt="Service Preview"
                    className="w-full h-full object-cover"
                    onError={(e: any) => {
                      e.target.src = '/services/consultation.jpg';
                    }}
                  />
                </div>

                {/* URL Input & Upload Button */}
                <div className="flex-1 w-full space-y-2">
                  <input
                    type="text"
                    required
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="Enter image URL or click upload below..."
                    className="w-full px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-xs text-stone-800 focus:outline-none focus:ring-1.5 focus:ring-[#5B0D15]"
                  />

                  <div className="flex items-center gap-3">
                    <label className="px-3.5 py-1.5 rounded-xl bg-white border border-amber-400/80 hover:bg-amber-100/60 text-[#5B0D15] font-semibold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition-all">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploading ? 'Uploading...' : 'Upload Image File'}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[11px] text-stone-500">
                      Max 10MB (JPEG, PNG, WebP, GIF, SVG)
                    </span>
                  </div>
                </div>
              </div>

              {uploadError && (
                <p className="text-[11px] text-rose-600 font-semibold">{uploadError}</p>
              )}
            </div>

            {/* Row 1: Title & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
                  Service Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Kundali Matching & Gun Milan"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-xs font-medium text-stone-900 focus:outline-none focus:ring-1.5 focus:ring-[#5B0D15]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
                  Category *
                </label>
                <select
                  value={categoryKey}
                  onChange={(e) => setCategoryKey(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-xs font-medium text-stone-900 focus:outline-none focus:ring-1.5 focus:ring-[#5B0D15]"
                >
                  <option value="astrology">Astrology</option>
                  <option value="pooja">Pooja &amp; Rituals</option>
                  <option value="occult">Occult &amp; Vastu</option>
                  <option value="education">Vedic Education</option>
                </select>
              </div>
            </div>

            {/* Row 2: Price, Duration, Category Tag */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1">
                  <IndianRupee className="w-3 h-3 text-amber-700" />
                  <span>Dakshina / Price (INR) *</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={priceNumber === 0 ? '0' : priceNumber}
                  onChange={(e) => handleNumericInput(e.target.value, setPriceNumber)}
                  onFocus={(e) => {
                    if (priceNumber === 0) e.target.select();
                  }}
                  placeholder="1100"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-xs font-semibold text-stone-900 focus:outline-none focus:ring-1.5 focus:ring-[#5B0D15]"
                />
                <span className="text-[10px] text-stone-500">Set 0 for 100% Free / Seva</span>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-700" />
                  <span>Duration (Minutes) *</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={durationMinutes === 0 ? '0' : durationMinutes}
                  onChange={(e) => handleNumericInput(e.target.value, setDurationMinutes)}
                  onFocus={(e) => {
                    if (durationMinutes === 0) e.target.select();
                  }}
                  placeholder="45"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-xs font-semibold text-stone-900 focus:outline-none focus:ring-1.5 focus:ring-[#5B0D15]"
                />
                <span className="text-[10px] text-stone-500">Standard: 30, 45, or 60 mins</span>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1">
                  <Tag className="w-3 h-3 text-amber-700" />
                  <span>Tag Badge</span>
                </label>
                <input
                  type="text"
                  value={categoryTag}
                  onChange={(e) => setCategoryTag(e.target.value)}
                  placeholder="e.g. VEDIC ASTROLOGY"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-xs font-medium text-stone-900 focus:outline-none focus:ring-1.5 focus:ring-[#5B0D15]"
                />
              </div>
            </div>

            {/* Row 3: Pandit */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1">
                <User className="w-3 h-3 text-amber-700" />
                <span>Spiritual Guide / Pandit *</span>
              </label>
              <input
                type="text"
                required
                value={pandit}
                onChange={(e) => setPandit(e.target.value)}
                placeholder="Dr. Pandit Vishal Dubey"
                className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-xs font-medium text-stone-900 focus:outline-none focus:ring-1.5 focus:ring-[#5B0D15]"
              />
            </div>

            {/* Row 4: Description */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
                Comprehensive Description *
              </label>
              <textarea
                required
                rows={3}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Detailed explanation of the astrological consultation or sacred ceremony, what seeker receives, Vedic scriptures referenced..."
                className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-xs font-medium text-stone-900 focus:outline-none focus:ring-1.5 focus:ring-[#5B0D15] leading-relaxed resize-none"
              />
            </div>

            {/* Row 5: Promotional Badge & Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center pt-1">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
                  Promotional Ribbon
                </label>
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="e.g. Most Popular"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-xs font-medium text-stone-900 focus:outline-none focus:ring-1.5 focus:ring-[#5B0D15]"
                />
              </div>

              <div className="flex items-center gap-2 pt-4">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-[#5B0D15] rounded border-stone-300 focus:ring-[#5B0D15] cursor-pointer"
                />
                <label htmlFor="isActiveToggle" className="text-xs font-bold text-stone-800 cursor-pointer select-none">
                  Active (Accepting Bookings)
                </label>
              </div>

              <div className="flex items-center gap-2 pt-4">
                <input
                  type="checkbox"
                  id="isSpecialToggle"
                  checked={isSpecial}
                  onChange={(e) => setIsSpecial(e.target.checked)}
                  className="w-4 h-4 text-[#5B0D15] rounded border-stone-300 focus:ring-[#5B0D15] cursor-pointer"
                />
                <label htmlFor="isSpecialToggle" className="text-xs font-bold text-amber-900 cursor-pointer select-none">
                  Sacred Initiative Flag
                </label>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-5 py-3 bg-stone-50 border-t border-stone-200 flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#5B0D15] to-[#7A121D] hover:from-[#6B0D16] hover:to-[#8C1421] text-amber-100 font-bold text-xs shadow-md flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isEditing ? 'Save Changes' : 'Create Service'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
