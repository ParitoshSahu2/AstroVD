'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { getAuthToken } from '../../../lib/auth';

export interface BlogPostItem {
  id: string;
  title: string;
  titleHi: string;
  category: string;
  categoryHi: string;
  author: string;
  authorHi: string;
  authorRole: string;
  authorRoleHi: string;
  date: string;
  dateHi: string;
  readTime: string;
  readTimeHi: string;
  image: string;
  excerpt: string;
  excerptHi: string;
  content: string[];
  contentHi: string[];
  keyTakeaways: string[];
  keyTakeawaysHi: string[];
  isPublished?: boolean;
}

interface BlogManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  postToEdit: BlogPostItem | null;
  onSaved: (savedPost: BlogPostItem) => void;
}

export default function BlogManageModal({
  isOpen,
  onClose,
  postToEdit,
  onSaved,
}: BlogManageModalProps) {
  const isEdit = Boolean(postToEdit);

  const [title, setTitle] = useState('');
  const [titleHi, setTitleHi] = useState('');
  const [category, setCategory] = useState('Vedic Jyotish');
  const [categoryHi, setCategoryHi] = useState('वैदिक ज्योतिष');
  const [author, setAuthor] = useState('Dr. Pandit Vishal Dubey');
  const [authorHi, setAuthorHi] = useState('डॉ. पंडित विशाल दुबे');
  const [authorRole, setAuthorRole] = useState('PhD, Jyotishacharya');
  const [authorRoleHi, setAuthorRoleHi] = useState('पीएचडी, ज्योतिषाचार्य');
  const [date, setDate] = useState('');
  const [dateHi, setDateHi] = useState('');
  const [readTime, setReadTime] = useState('6 min read');
  const [readTimeHi, setReadTimeHi] = useState('6 मिनट पठन');
  const [image, setImage] = useState('/services/kundli.jpg');
  const [excerpt, setExcerpt] = useState('');
  const [excerptHi, setExcerptHi] = useState('');
  const [contentText, setContentText] = useState('');
  const [contentTextHi, setContentTextHi] = useState('');
  const [takeawaysText, setTakeawaysText] = useState('');
  const [takeawaysTextHi, setTakeawaysTextHi] = useState('');
  const [isPublished, setIsPublished] = useState(true);

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
    if (postToEdit) {
      setTitle(postToEdit.title || '');
      setTitleHi(postToEdit.titleHi || '');
      setCategory(postToEdit.category || 'Vedic Jyotish');
      setCategoryHi(postToEdit.categoryHi || 'वैदिक ज्योतिष');
      setAuthor(postToEdit.author || 'Dr. Pandit Vishal Dubey');
      setAuthorHi(postToEdit.authorHi || 'डॉ. पंडित विशाल दुबे');
      setAuthorRole(postToEdit.authorRole || 'PhD, Jyotishacharya');
      setAuthorRoleHi(postToEdit.authorRoleHi || 'पीएचडी, ज्योतिषाचार्य');
      setDate(postToEdit.date || '');
      setDateHi(postToEdit.dateHi || '');
      setReadTime(postToEdit.readTime || '6 min read');
      setReadTimeHi(postToEdit.readTimeHi || '6 मिनट पठन');
      setImage(postToEdit.image || '/services/kundli.jpg');
      setExcerpt(postToEdit.excerpt || '');
      setExcerptHi(postToEdit.excerptHi || '');
      setContentText(Array.isArray(postToEdit.content) ? postToEdit.content.join('\n\n') : '');
      setContentTextHi(Array.isArray(postToEdit.contentHi) ? postToEdit.contentHi.join('\n\n') : '');
      setTakeawaysText(Array.isArray(postToEdit.keyTakeaways) ? postToEdit.keyTakeaways.join('\n') : '');
      setTakeawaysTextHi(Array.isArray(postToEdit.keyTakeawaysHi) ? postToEdit.keyTakeawaysHi.join('\n') : '');
      setIsPublished(postToEdit.isPublished !== false);
    } else {
      // Default reset
      setTitle('');
      setTitleHi('');
      setCategory('Vedic Jyotish');
      setCategoryHi('वैदिक ज्योतिष');
      setAuthor('Dr. Pandit Vishal Dubey');
      setAuthorHi('डॉ. पंडित विशाल दुबे');
      setAuthorRole('PhD, Jyotishacharya');
      setAuthorRoleHi('पीएचडी, ज्योतिषाचार्य');
      const now = new Date();
      setDate(now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
      setDateHi('आज');
      setReadTime('6 min read');
      setReadTimeHi('6 मिनट पठन');
      setImage('/services/kundli.jpg');
      setExcerpt('');
      setExcerptHi('');
      setContentText('');
      setContentTextHi('');
      setTakeawaysText('');
      setTakeawaysTextHi('');
      setIsPublished(true);
    }
    setFormError(null);
    setUploadError(null);
  }, [postToEdit, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = getAuthToken();
    if (!token) {
      setUploadError('Admin authentication required to upload image.');
      return;
    }

    // Client-side file format validation
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Invalid format. Please upload JPEG, PNG, WebP, GIF, or SVG.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds 10MB limit.');
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
      console.error('Upload error:', err);
      setUploadError(err.message || 'Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setFormError('Article Title (English) is required.');
      return;
    }
    if (!excerpt.trim()) {
      setFormError('Article Excerpt (English summary) is required.');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setFormError('Admin authentication token missing. Please sign in as Admin.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const contentParagraphs = contentText
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean);

    const contentParagraphsHi = contentTextHi
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean);

    const takeawaysList = takeawaysText
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);

    const takeawaysListHi = takeawaysTextHi
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title: title.trim(),
      titleHi: titleHi.trim() || title.trim(),
      category: category.trim(),
      categoryHi: categoryHi.trim() || category.trim(),
      author: author.trim(),
      authorHi: authorHi.trim() || author.trim(),
      authorRole: authorRole.trim(),
      authorRoleHi: authorRoleHi.trim() || authorRole.trim(),
      date: date.trim() || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      dateHi: dateHi.trim() || 'आज',
      readTime: readTime.trim() || '5 min read',
      readTimeHi: readTimeHi.trim() || '5 मिनट पठन',
      image: image.trim() || '/services/kundli.jpg',
      excerpt: excerpt.trim(),
      excerptHi: excerptHi.trim() || excerpt.trim(),
      content: contentParagraphs.length > 0 ? contentParagraphs : [excerpt.trim()],
      contentHi: contentParagraphsHi.length > 0 ? contentParagraphsHi : [excerptHi.trim() || excerpt.trim()],
      keyTakeaways: takeawaysList,
      keyTakeawaysHi: takeawaysListHi,
      isPublished,
    };

    try {
      const endpoint = isEdit
        ? `${backendUrl}/api/content/blog/${postToEdit?.id}`
        : `${backendUrl}/api/content/blog`;
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
        throw new Error(data.message || `Failed to ${isEdit ? 'update' : 'create'} blog article`);
      }

      onSaved(data);
      onClose();
    } catch (err: any) {
      console.error('Save blog post error:', err);
      setFormError(err.message || 'Error saving blog post.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 rounded-3xl bg-white border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#2A0E13] via-[#3B1218] to-[#2A0E13] text-white flex items-center justify-between border-b border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-amber-100">
                {isEdit ? 'Edit Sacred Discourse / Article' : 'Compose New Sacred Article'}
              </h3>
              <p className="text-xs text-amber-200/80">
                Admin Content Management with Bilingual &amp; Media Support
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {formError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Title Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">
                Article Title (English) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Major Planetary Transits of 2026..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#5B0D15]/20 focus:border-[#5B0D15]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">
                Article Title (Hindi - शीर्षक)
              </label>
              <input
                type="text"
                value={titleHi}
                onChange={(e) => setTitleHi(e.target.value)}
                placeholder="e.g. वर्ष 2026 के प्रमुख ग्रह गोचर..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#5B0D15]/20 focus:border-[#5B0D15]"
              />
            </div>
          </div>

          {/* Category & Read Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Category (English)</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Vedic Jyotish"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#5B0D15]/20 focus:border-[#5B0D15]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Category (Hindi)</label>
              <input
                type="text"
                value={categoryHi}
                onChange={(e) => setCategoryHi(e.target.value)}
                placeholder="e.g. वैदिक ज्योतिष"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#5B0D15]/20 focus:border-[#5B0D15]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Read Time (English)</label>
              <input
                type="text"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                placeholder="e.g. 6 min read"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#5B0D15]/20 focus:border-[#5B0D15]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Date Display</label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="e.g. Oct 23, 2026"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#5B0D15]/20 focus:border-[#5B0D15]"
              />
            </div>
          </div>

          {/* Author Details Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Author Name</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#5B0D15]/20 focus:border-[#5B0D15]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Author Name (Hindi)</label>
              <input
                type="text"
                value={authorHi}
                onChange={(e) => setAuthorHi(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#5B0D15]/20 focus:border-[#5B0D15]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Author Role</label>
              <input
                type="text"
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#5B0D15]/20 focus:border-[#5B0D15]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Author Role (Hindi)</label>
              <input
                type="text"
                value={authorRoleHi}
                onChange={(e) => setAuthorRoleHi(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#5B0D15]/20 focus:border-[#5B0D15]"
              />
            </div>
          </div>

          {/* Image & Upload Area */}
          <div className="space-y-2 p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80">
            <label className="text-xs font-bold text-amber-950 flex items-center justify-between">
              <span>Article Cover Image</span>
              <span className="text-[11px] font-normal text-amber-800">
                Supports URL or Direct Upload
              </span>
            </label>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              {/* Image Preview Thumbnail */}
              <div className="relative w-32 h-20 rounded-xl overflow-hidden border border-amber-300 bg-stone-100 shrink-0 shadow-sm">
                <img
                  src={image.startsWith('/api') ? `${backendUrl}${image}` : image}
                  alt="Cover Preview"
                  className="w-full h-full object-cover"
                  onError={(e: any) => {
                    e.target.src = '/services/kundli.jpg';
                  }}
                />
              </div>

              {/* URL Input & Upload Button */}
              <div className="flex-1 w-full space-y-2">
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="Enter image URL or upload file..."
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
                    Max 10MB (JPEG, PNG, WebP, GIF, SVG)
                  </span>
                </div>
              </div>
            </div>

            {uploadError && (
              <p className="text-[11px] text-rose-600 font-semibold">{uploadError}</p>
            )}
          </div>

          {/* Excerpt Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">
                Short Excerpt (English) <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="2-3 sentences summarizing the discourse..."
                className="w-full p-3 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#5B0D15]/20 focus:border-[#5B0D15]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">
                Short Excerpt (Hindi - संक्षिप्त विवरण)
              </label>
              <textarea
                rows={3}
                value={excerptHi}
                onChange={(e) => setExcerptHi(e.target.value)}
                placeholder="संक्षिप्त सारांश (हिंदी)..."
                className="w-full p-3 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#5B0D15]/20 focus:border-[#5B0D15]"
              />
            </div>
          </div>

          {/* Full Discourse Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">
                Full Article Content (English)
                <span className="text-[10px] font-normal text-stone-400 ml-1">
                  (Separate paragraphs with blank lines)
                </span>
              </label>
              <textarea
                rows={6}
                value={contentText}
                onChange={(e) => setContentText(e.target.value)}
                placeholder="Detailed discourse text. Write paragraphs separated by new lines..."
                className="w-full p-3 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#5B0D15]/20 font-sans leading-relaxed"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">
                Full Article Content (Hindi - पूर्ण लेख सामग्री)
                <span className="text-[10px] font-normal text-stone-400 ml-1">
                  (अनुच्छेदों को नई पंक्ति से अलग करें)
                </span>
              </label>
              <textarea
                rows={6}
                value={contentTextHi}
                onChange={(e) => setContentTextHi(e.target.value)}
                placeholder="लेख की पूर्ण सामग्री (हिंदी)..."
                className="w-full p-3 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#5B0D15]/20 font-sans leading-relaxed"
              />
            </div>
          </div>

          {/* Key Takeaways */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">
                Key Takeaways (English)
                <span className="text-[10px] font-normal text-stone-400 ml-1">(One bullet per line)</span>
              </label>
              <textarea
                rows={3}
                value={takeawaysText}
                onChange={(e) => setTakeawaysText(e.target.value)}
                placeholder="One core takeaway per line..."
                className="w-full p-3 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#5B0D15]/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">
                Key Takeaways (Hindi - मुख्य बिंदु)
                <span className="text-[10px] font-normal text-stone-400 ml-1">(प्रति पंक्ति एक बिंदु)</span>
              </label>
              <textarea
                rows={3}
                value={takeawaysTextHi}
                onChange={(e) => setTakeawaysTextHi(e.target.value)}
                placeholder="प्रति पंक्ति एक मुख्य बिंदु..."
                className="w-full p-3 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#5B0D15]/20"
              />
            </div>
          </div>

          {/* Publish Checkbox */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-stone-50 border border-stone-200">
            <input
              type="checkbox"
              id="isPublishedCheck"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 rounded text-[#5B0D15] focus:ring-[#5B0D15] cursor-pointer"
            />
            <label htmlFor="isPublishedCheck" className="text-xs font-semibold text-stone-800 cursor-pointer">
              Publish immediately (visible to all seekers and public website visitors)
            </label>
          </div>

          {/* Modal Actions */}
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
                  <span>Saving Article...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isEdit ? 'Save Changes' : 'Publish Article'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
