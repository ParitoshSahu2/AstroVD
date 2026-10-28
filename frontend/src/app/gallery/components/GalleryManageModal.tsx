'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  MapPin,
  Calendar,
  Languages,
} from 'lucide-react';
import { getAuthToken } from '../../../lib/auth';
import { translateEnToHi } from '../../../lib/translator';

export interface GalleryItemData {
  id: string;
  title: string;
  titleHi: string;
  category: 'pooja' | 'consultation' | 'yantra' | 'awards' | 'kashi';
  categoryLabel?: string;
  categoryLabelHi?: string;
  image: string;
  location: string;
  locationHi: string;
  date: string;
  dateHi: string;
  description: string;
  descriptionHi: string;
  isPublished?: boolean;
}

interface GalleryManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit: GalleryItemData | null;
  onSaved: (savedItem: GalleryItemData) => void;
}

export default function GalleryManageModal({
  isOpen,
  onClose,
  itemToEdit,
  onSaved,
}: GalleryManageModalProps) {
  const isEdit = Boolean(itemToEdit);

  const [title, setTitle] = useState('');
  const [titleHi, setTitleHi] = useState('');
  const [category, setCategory] = useState<'pooja' | 'consultation' | 'yantra' | 'awards' | 'kashi'>('pooja');
  const [location, setLocation] = useState('Dashashwamedh Sanctum, Varanasi');
  const [locationHi, setLocationHi] = useState('दशाश्वमेध घाट, वाराणसी');
  const [date, setDate] = useState('Vedic Muhurta');
  const [dateHi, setDateHi] = useState('शुभ मुहूर्त');
  const [image, setImage] = useState('/gallery/IMG_2542.jpg');
  const [description, setDescription] = useState('');
  const [descriptionHi, setDescriptionHi] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  // Auto-translate state
  const [autoTranslateEnabled, setAutoTranslateEnabled] = useState(true);
  const [translatingFields, setTranslatingFields] = useState<Record<string, boolean>>({});

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const backendUrl = (
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api'
  ).replace(/\/api\/?$/, '');

  useEffect(() => {
    if (itemToEdit) {
      setTitle(itemToEdit.title || '');
      setTitleHi(itemToEdit.titleHi || '');
      setCategory(itemToEdit.category || 'pooja');
      setLocation(itemToEdit.location || 'Dashashwamedh Sanctum, Varanasi');
      setLocationHi(itemToEdit.locationHi || 'दशाश्वमेध घाट, वाराणसी');
      setDate(itemToEdit.date || 'Vedic Muhurta');
      setDateHi(itemToEdit.dateHi || 'शुभ मुहूर्त');
      setImage(itemToEdit.image || '/gallery/IMG_2542.jpg');
      setDescription(itemToEdit.description || '');
      setDescriptionHi(itemToEdit.descriptionHi || '');
      setIsPublished(itemToEdit.isPublished !== false);
    } else {
      setTitle('');
      setTitleHi('');
      setCategory('pooja');
      setLocation('Dashashwamedh Sanctum, Varanasi');
      setLocationHi('दशाश्वमेध घाट, वाराणसी');
      setDate('Vedic Muhurta');
      setDateHi('शुभ मुहूर्त');
      setImage('/gallery/IMG_2542.jpg');
      setDescription('');
      setDescriptionHi('');
      setIsPublished(true);
    }
    setFormError(null);
    setUploadError(null);
    setTranslatingFields({});
  }, [itemToEdit, isOpen]);

  // Translate specific field
  const translateField = useCallback(
    async (field: 'title' | 'location' | 'date' | 'description', sourceText?: string) => {
      const src = (sourceText !== undefined ? sourceText : (
        field === 'title' ? title :
        field === 'location' ? location :
        field === 'date' ? date :
        description
      )).trim();

      if (!src) return;

      setTranslatingFields((prev) => ({ ...prev, [field]: true }));
      try {
        const translated = await translateEnToHi(src);
        if (translated) {
          if (field === 'title') setTitleHi(translated);
          else if (field === 'location') setLocationHi(translated);
          else if (field === 'date') setDateHi(translated);
          else if (field === 'description') setDescriptionHi(translated);
        }
      } catch (err) {
        console.error(`Error auto-translating ${field}:`, err);
      } finally {
        setTranslatingFields((prev) => ({ ...prev, [field]: false }));
      }
    },
    [title, location, date, description]
  );

  // Translate all English fields to Hindi
  const translateAllFields = async () => {
    await Promise.all([
      title.trim() ? translateField('title', title) : Promise.resolve(),
      location.trim() ? translateField('location', location) : Promise.resolve(),
      date.trim() ? translateField('date', date) : Promise.resolve(),
      description.trim() ? translateField('description', description) : Promise.resolve(),
    ]);
  };

  // Debounced auto-translation triggers when English inputs change
  useEffect(() => {
    if (!autoTranslateEnabled || !title.trim()) return;
    if (isEdit && itemToEdit?.title === title) return;
    const timer = setTimeout(() => {
      translateField('title', title);
    }, 600);
    return () => clearTimeout(timer);
  }, [title, autoTranslateEnabled, isEdit, itemToEdit?.title, translateField]);

  useEffect(() => {
    if (!autoTranslateEnabled || !location.trim()) return;
    if (isEdit && itemToEdit?.location === location) return;
    const timer = setTimeout(() => {
      translateField('location', location);
    }, 600);
    return () => clearTimeout(timer);
  }, [location, autoTranslateEnabled, isEdit, itemToEdit?.location, translateField]);

  useEffect(() => {
    if (!autoTranslateEnabled || !date.trim()) return;
    if (isEdit && itemToEdit?.date === date) return;
    const timer = setTimeout(() => {
      translateField('date', date);
    }, 600);
    return () => clearTimeout(timer);
  }, [date, autoTranslateEnabled, isEdit, itemToEdit?.date, translateField]);

  useEffect(() => {
    if (!autoTranslateEnabled || !description.trim()) return;
    if (isEdit && itemToEdit?.description === description) return;
    const timer = setTimeout(() => {
      translateField('description', description);
    }, 800);
    return () => clearTimeout(timer);
  }, [description, autoTranslateEnabled, isEdit, itemToEdit?.description, translateField]);

  if (!isOpen) return null;

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

    try {
      const formData = new FormData();
      formData.append('file', file);

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
      console.error('Gallery image upload error:', err);
      setUploadError(err.message || 'Error uploading photo.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setFormError('Photo title is required.');
      return;
    }
    if (!description.trim()) {
      setFormError('Description is required.');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setFormError('Admin authentication required.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const categoryLabels: Record<string, { en: string; hi: string }> = {
      pooja: { en: 'Sacred Poojas & Havan', hi: 'वैदिक पूजा व महाहवन' },
      consultation: { en: 'Vedic Consultations', hi: 'वैदिक ज्योतिष परामर्श' },
      yantra: { en: 'Yantras & Gemstones', hi: 'सिद्ध यंत्र एवं रत्न' },
      awards: { en: 'Honors & Certifications', hi: 'राष्ट्रीय सम्मान एवं पुरस्कार' },
      kashi: { en: 'Temple Anushthan & Varanasi', hi: 'काशी अनुष्ठान व देवालय' },
    };

    const payload = {
      title: title.trim(),
      titleHi: titleHi.trim() || title.trim(),
      category,
      categoryLabel: categoryLabels[category]?.en || 'Sacred Moments',
      categoryLabelHi: categoryLabels[category]?.hi || 'पावन दर्शन',
      location: location.trim(),
      locationHi: locationHi.trim() || location.trim(),
      date: date.trim(),
      dateHi: dateHi.trim() || date.trim(),
      image: image.trim() || '/gallery/IMG_2542.jpg',
      description: description.trim(),
      descriptionHi: descriptionHi.trim() || description.trim(),
      isPublished,
    };

    try {
      const endpoint = isEdit
        ? `${backendUrl}/api/content/gallery/${itemToEdit?.id}`
        : `${backendUrl}/api/content/gallery`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `Failed to ${isEdit ? 'update' : 'create'} photo entry`);
      }

      onSaved(data);
      onClose();
    } catch (err: any) {
      console.error('Gallery entry save error:', err);
      setFormError(err.message || 'Error saving photo entry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 rounded-3xl bg-white border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#2A0E13] via-[#3B1218] to-[#2A0E13] text-white flex items-center justify-between border-b border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-amber-100">
                {isEdit ? 'Edit Gallery Photo & Details' : 'Add New Sacred Photo / Darshan'}
              </h3>
              <p className="text-xs text-amber-200/80">
                Direct Admin Gallery Management with Live Image Upload
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {formError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Smart Auto-Translate Banner */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-300 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-[#5B0D15] flex items-center justify-center shrink-0">
                <Languages className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#3B1E22] flex items-center gap-1.5">
                  <span>Automatic Translation (English → Hindi)</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-semibold">Active</span>
                </p>
                <p className="text-[11px] text-stone-500">
                  Type in English — Hindi fields translate &amp; populate automatically
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={translateAllFields}
                className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-amber-100/60 border border-amber-400/80 text-[#5B0D15] text-[11px] font-bold shadow-2xs flex items-center gap-1 cursor-pointer transition-colors"
                title="Translate all English fields to Hindi immediately"
              >
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>Translate All</span>
              </button>
            </div>
          </div>

          {/* Titles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">
                Title (English) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Grand Temple Anushthan at Sanctum..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#5B0D15]/20 focus:border-[#5B0D15]"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-700">Title (Hindi - शीर्षक)</label>
                <button
                  type="button"
                  onClick={() => translateField('title')}
                  disabled={translatingFields.title}
                  className="text-[11px] font-semibold text-[#8B1D2C] hover:text-[#5B0D15] flex items-center gap-1 cursor-pointer"
                >
                  {translatingFields.title ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
                      <span>Translating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>Auto-Translate</span>
                    </>
                  )}
                </button>
              </div>
              <input
                type="text"
                value={titleHi}
                onChange={(e) => setTitleHi(e.target.value)}
                placeholder="e.g. श्री काशी विश्वनाथ पावन अनुष्ठान..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#5B0D15]/20 focus:border-[#5B0D15]"
              />
            </div>
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Gallery Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#5B0D15]/20"
              >
                <option value="pooja">Sacred Poojas &amp; Havan (वैदिक पूजा व महाहवन)</option>
                <option value="consultation">Vedic Consultations (वैदिक ज्योतिष परामर्श)</option>
                <option value="kashi">Temple Anushthan &amp; Varanasi (काशी अनुष्ठान व देवालय)</option>
                <option value="yantra">Yantras &amp; Gemstones (सिद्ध यंत्र एवं रत्न)</option>
                <option value="awards">Honors &amp; Recognitions (राष्ट्रीय सम्मान व पुरस्कार)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-700">Auspicious Date / Muhurta</label>
                <button
                  type="button"
                  onClick={() => translateField('date')}
                  disabled={translatingFields.date}
                  className="text-[11px] font-semibold text-[#8B1D2C] hover:text-[#5B0D15] flex items-center gap-1 cursor-pointer"
                >
                  {translatingFields.date ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
                      <span>Translating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>Auto-Translate</span>
                    </>
                  )}
                </button>
              </div>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="e.g. Mahashivratri Muhurta"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#5B0D15]/20"
              />
            </div>
          </div>

          {/* Location Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Location (English)</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Dashashwamedh Sanctum, Varanasi"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#5B0D15]/20"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-700">Location (Hindi - स्थान)</label>
                <button
                  type="button"
                  onClick={() => translateField('location')}
                  disabled={translatingFields.location}
                  className="text-[11px] font-semibold text-[#8B1D2C] hover:text-[#5B0D15] flex items-center gap-1 cursor-pointer"
                >
                  {translatingFields.location ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
                      <span>Translating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>Auto-Translate</span>
                    </>
                  )}
                </button>
              </div>
              <input
                type="text"
                value={locationHi}
                onChange={(e) => setLocationHi(e.target.value)}
                placeholder="e.g. दशाश्वमेध घाट, वाराणसी"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#5B0D15]/20"
              />
            </div>
          </div>

          {/* Image Upload Area */}
          <div className="space-y-2 p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80">
            <label className="text-xs font-bold text-amber-950 flex items-center justify-between">
              <span>Photo Image / Media</span>
              <span className="text-[11px] font-normal text-amber-800">
                Supports URL or Direct Upload
              </span>
            </label>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative w-32 h-24 rounded-xl overflow-hidden border border-amber-300 bg-stone-100 shrink-0 shadow-sm">
                <img
                  src={image.startsWith('/api') ? `${backendUrl}${image}` : image}
                  alt="Gallery Preview"
                  className="w-full h-full object-cover"
                  onError={(e: any) => {
                    e.target.src = '/gallery/IMG_2542.jpg';
                  }}
                />
              </div>

              <div className="flex-1 w-full space-y-2">
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="Enter image URL or upload image below..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#5B0D15]/20"
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
                    Max 10MB (JPEG, PNG, WebP, GIF)
                  </span>
                </div>
              </div>
            </div>

            {uploadError && (
              <p className="text-[11px] text-rose-600 font-semibold">{uploadError}</p>
            )}
          </div>

          {/* Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">
                Description (English) <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Spiritual significance and details of this event..."
                className="w-full p-3 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#5B0D15]/20"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-700">
                  Description (Hindi - विवरण)
                </label>
                <button
                  type="button"
                  onClick={() => translateField('description')}
                  disabled={translatingFields.description}
                  className="text-[11px] font-semibold text-[#8B1D2C] hover:text-[#5B0D15] flex items-center gap-1 cursor-pointer"
                >
                  {translatingFields.description ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
                      <span>Translating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>Auto-Translate</span>
                    </>
                  )}
                </button>
              </div>
              <textarea
                rows={3}
                value={descriptionHi}
                onChange={(e) => setDescriptionHi(e.target.value)}
                placeholder="विवरण (हिंदी)..."
                className="w-full p-3 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#5B0D15]/20"
              />
            </div>
          </div>

          {/* Publish Checkbox */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-stone-50 border border-stone-200">
            <input
              type="checkbox"
              id="isPublishedGallery"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 rounded text-[#5B0D15] focus:ring-[#5B0D15] cursor-pointer"
            />
            <label htmlFor="isPublishedGallery" className="text-xs font-semibold text-stone-800 cursor-pointer">
              Publish immediately to public gallery
            </label>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 rounded-full border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-semibold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-full bg-[#5B0D15] hover:bg-[#480a11] text-amber-100 text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-300" />
                  <span>Saving Entry...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isEdit ? 'Save Changes' : 'Publish to Gallery'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
