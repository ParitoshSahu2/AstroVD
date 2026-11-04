'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getAuthToken } from '../../../lib/auth';
import { useScrollLock } from '../../../lib/scrollLock';
import {
  FileText,
  Search,
  Plus,
  RefreshCw,
  Edit3,
  Trash2,
  Clock,
  Calendar,
  User,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Eye,
  EyeOff,
  ShieldAlert,
  Tag,
  BookOpen,
} from 'lucide-react';
import BlogManageModal, { BlogPostItem } from '../../blog/components/BlogManageModal';
import { INITIAL_BLOG_ITEMS } from '../../blog/data/blog-items';

export default function AdminBlogsTab() {
  const [articles, setArticles] = useState<BlogPostItem[]>(INITIAL_BLOG_ITEMS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(9);

  // Modal State
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPostItem | null>(null);

  // Delete Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<BlogPostItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Reading Modal State (Full Article Reader)
  const [readingPost, setReadingPost] = useState<BlogPostItem | null>(null);

  useScrollLock(Boolean(manageModalOpen || deleteModalOpen || readingPost));

  // Status Action Loading
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Notifications (2-second auto-dismiss)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      setNotification(null);
    }, 2000);
    return () => clearTimeout(timer);
  }, [notification]);

  const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api').replace(/\/api\/?$/, '');

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const res = await fetch(`${backendUrl}/api/content/blog?includeUnpublished=true`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to load blog articles (HTTP ${res.status}).`);
      }

      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setArticles(data);
      } else {
        setArticles(INITIAL_BLOG_ITEMS);
      }
    } catch (err: any) {
      console.warn('Using initial blog items fallback:', err);
      setArticles(INITIAL_BLOG_ITEMS);
    } finally {
      setLoading(false);
    }
  }, [backendUrl]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleTogglePublish = async (post: BlogPostItem) => {
    setActionLoadingId(post.id);
    const nextStatus = post.isPublished === false ? true : false;
    try {
      const token = getAuthToken();
      const res = await fetch(`${backendUrl}/api/content/blog/${post.id}/publish`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ isPublished: nextStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to update publication status.');
      }

      setArticles((prev) =>
        prev.map((a) => (a.id === post.id ? { ...a, isPublished: nextStatus } : a))
      );

      setNotification({
        type: 'success',
        message: `Article "${post.title}" is now ${nextStatus ? 'Activated' : 'Deactivated'}.`,
      });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to toggle publication status.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!postToDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const token = getAuthToken();
      const res = await fetch(`${backendUrl}/api/content/blog/${postToDelete.id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete blog article.');
      }

      setNotification({
        type: 'success',
        message: `Article "${postToDelete.title}" permanently removed.`,
      });
      setDeleteModalOpen(false);
      setPostToDelete(null);
      fetchArticles();
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete article.');
    } finally {
      setDeleting(false);
    }
  };

  const handlePostSaved = (savedPost: BlogPostItem) => {
    setNotification({
      type: 'success',
      message: `Article "${savedPost.title}" successfully saved!`,
    });
    setManageModalOpen(false);
    setSelectedPost(null);
    fetchArticles();
  };

  // Filtered Articles
  const filtered = articles.filter((a) => {
    if (categoryFilter !== 'ALL' && a.category !== categoryFilter) return false;
    if (statusFilter === 'PUBLISHED' && a.isPublished === false) return false;
    if (statusFilter === 'DRAFT' && a.isPublished !== false) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const titleMatch = a.title.toLowerCase().includes(q) || (a.titleHi && a.titleHi.toLowerCase().includes(q));
      const excerptMatch = a.excerpt.toLowerCase().includes(q) || (a.excerptHi && a.excerptHi.toLowerCase().includes(q));
      const authorMatch = a.author.toLowerCase().includes(q) || (a.authorHi && a.authorHi.toLowerCase().includes(q));
      return titleMatch || excerptMatch || authorMatch;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedArticles = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-4">
      {/* Compact 2-Second Toast Notification */}
      {notification && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 animate-fadeIn pointer-events-auto"
        >
          <div
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-lg border text-xs font-semibold backdrop-blur-md ${
              notification.type === 'success'
                ? 'bg-emerald-950/95 text-emerald-100 border-emerald-500/50 shadow-emerald-950/40'
                : 'bg-rose-950/95 text-rose-100 border-rose-500/50 shadow-rose-950/40'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span className="max-w-[280px] truncate">{notification.message}</span>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="ml-1 p-0.5 hover:bg-white/20 rounded-full cursor-pointer text-white/70 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Control Header */}
      <div className="p-4 rounded-2xl bg-white/80 border border-stone-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-lg font-bold text-[#5B0D15] flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-600" />
            <span>Vedic Wisdom &amp; Blog Articles</span>
          </h2>
          <p className="text-xs text-stone-500 font-medium">
            Create, edit, activate, deactivate, and curate astrological discourses and spiritual research. Total: {articles.length}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchArticles()}
            disabled={loading}
            className="p-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh Articles List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#5B0D15]' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedPost(null);
              setManageModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-[#5B0D15] hover:bg-[#4A0A10] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Add New Article</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-3 rounded-2xl bg-white/70 border border-stone-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by title, author, or keywords..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 bg-white text-xs placeholder:text-stone-400 focus:outline-none focus:ring-1.5 focus:ring-[#5B0D15]"
          />
        </div>

        <div>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-medium text-stone-800 focus:outline-none focus:ring-1.5 focus:ring-[#5B0D15]"
          >
            <option value="ALL">All Categories</option>
            <option value="Vedic Jyotish">Vedic Jyotish</option>
            <option value="Tarot Wisdom">Tarot Wisdom</option>
            <option value="Remedies & Gems">Remedies &amp; Gems</option>
            <option value="Kundli Milan">Kundli Milan</option>
            <option value="Pooja & Rituals">Pooja &amp; Rituals</option>
            <option value="Occult & Healing">Occult &amp; Healing</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-medium text-stone-800 focus:outline-none focus:ring-1.5 focus:ring-[#5B0D15]"
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Active</option>
            <option value="DRAFT">Deactive</option>
          </select>
        </div>
      </div>

      {/* Articles Cards Grid */}
      {loading ? (
        <div className="p-12 text-center flex flex-col items-center justify-center space-y-3 bg-white/70 rounded-3xl border border-stone-200/80">
          <RefreshCw className="w-6 h-6 animate-spin text-[#5B0D15]" />
          <p className="text-xs text-stone-500 font-medium">Loading spiritual blog discourses...</p>
        </div>
      ) : paginatedArticles.length === 0 ? (
        <div className="p-12 text-center bg-white/70 rounded-3xl border border-stone-200/80 space-y-3">
          <FileText className="w-8 h-8 text-stone-400 mx-auto" />
          <h3 className="font-serif font-bold text-stone-800">No Articles Found</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            {search || categoryFilter !== 'ALL' || statusFilter !== 'ALL'
              ? 'No articles match your active search filters. Try clearing filters or searching for something else.'
              : 'No blog posts are currently configured.'}
          </p>
          {(search || categoryFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setCategoryFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="px-3.5 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {paginatedArticles.map((post) => {
            const isLive = post.isPublished !== false;
            const isActionLoading = actionLoadingId === post.id;

            return (
              <div
                key={post.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isLive
                    ? 'bg-white/95 border-stone-200/90 hover:border-amber-400/60 hover:shadow-xs'
                    : 'bg-stone-50/90 border-stone-200/80 opacity-85'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {/* Image & Post Meta Container */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Blog Cover Thumbnail - Click to Read */}
                    <div
                      onClick={() => setReadingPost(post)}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-stone-100 border border-stone-200/80 overflow-hidden shrink-0 flex items-center justify-center shadow-xs cursor-pointer group"
                      title="Click to Read Article & Preview"
                    >
                      <img
                        src={post.image || '/services/kundli.jpg'}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/services/kundli.jpg';
                        }}
                      />
                    </div>

                    <div className="min-w-0 flex-1 space-y-2">
                      {/* Status Badges Row */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                              isLive
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isLive ? 'bg-emerald-600' : 'bg-amber-500'
                              }`}
                            />
                            <span>{isLive ? 'Active' : 'Deactive'}</span>
                          </span>

                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-900 border border-amber-200">
                            {post.category}
                          </span>
                        </div>

                        <span className="font-mono text-[11px] text-stone-400 select-all shrink-0">
                          Slug: {post.id}
                        </span>
                      </div>

                      {/* Title - Click to Read */}
                      <div
                        onClick={() => setReadingPost(post)}
                        className="cursor-pointer group"
                        title="Click to Read Article & Preview"
                      >
                        <h3 className="text-[16px] sm:text-[17px] font-bold text-stone-900 group-hover:text-amber-800 transition-colors leading-snug tracking-tight">
                          {post.title}
                        </h3>
                        {post.titleHi && (
                          <p className="text-xs text-amber-900 font-medium mt-0.5 line-clamp-1 group-hover:text-amber-950">
                            {post.titleHi}
                          </p>
                        )}
                      </div>

                      {/* Excerpt */}
                      <p className="text-[13px] text-stone-600 line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>

                      {/* Metadata row */}
                      <div className="flex items-center flex-wrap gap-x-5 gap-y-1 pt-0.5 text-xs text-stone-500">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                          <span>{post.author}</span>
                          {post.authorRole && <span className="text-stone-400">({post.authorRole})</span>}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span>{post.date}</span>
                        </div>

                        {post.readTime && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <span>{post.readTime}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Action Controls */}
                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-center pt-2 sm:pt-0">
                    {/* Read Article Button */}
                    <button
                      type="button"
                      onClick={() => setReadingPost(post)}
                      className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Read Article & View Information"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                      <span className="hidden sm:inline">Read</span>
                    </button>

                    {/* Publish Toggle Button */}
                    <button
                      type="button"
                      disabled={isActionLoading}
                      onClick={() => handleTogglePublish(post)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                        isLive
                          ? 'border-emerald-300/80 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 shadow-2xs'
                          : 'border-stone-300 bg-stone-100 hover:bg-stone-200 text-stone-700 shadow-2xs'
                      }`}
                      title={isLive ? 'Currently Activated. Click to deactivate.' : 'Currently Deactivated. Click to activate.'}
                    >
                      {isActionLoading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : isLive ? (
                        <Eye className="w-3.5 h-3.5 text-emerald-700" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-stone-500" />
                      )}
                      <span>{isLive ? 'Activated' : 'Deactivated'}</span>
                    </button>

                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPost(post);
                        setManageModalOpen(true);
                      }}
                      className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors cursor-pointer"
                      title="Edit Article"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setPostToDelete(post);
                        setDeleteError(null);
                        setDeleteModalOpen(true);
                      }}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
                      title="Delete Article"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="p-3 rounded-2xl bg-white/80 border border-stone-200/80 shadow-xs flex items-center justify-between text-xs">
          <span className="text-stone-500 font-medium">
            Page <strong className="text-stone-800">{page}</strong> of{' '}
            <strong className="text-stone-800">{totalPages}</strong> ({filtered.length} total articles)
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Blog Modal */}
      {manageModalOpen && (
        <BlogManageModal
          isOpen={manageModalOpen}
          postToEdit={selectedPost}
          onClose={() => {
            setManageModalOpen(false);
            setSelectedPost(null);
          }}
          onSaved={handlePostSaved}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && postToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Delete &ldquo;{postToDelete.title}&rdquo;?
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                This will permanently remove this article from the Vedic wisdom blog and search index. This action cannot be undone.
              </p>
            </div>

            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setPostToDelete(null);
                  setDeleteError(null);
                }}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Article Reader Modal */}
      {readingPost && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
          onClick={() => setReadingPost(null)}
        >
          <div
            className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl bg-[#FAF7F2] text-[#2A1810] border-2 border-amber-300 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="shrink-0 flex items-center justify-between px-6 py-4 bg-white/95 backdrop-blur-md border-b border-amber-200 z-20">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#5B0D15] text-white text-xs font-bold uppercase tracking-wider shadow-xs">
                  {readingPost.category}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    readingPost.isPublished !== false
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      readingPost.isPublished !== false ? 'bg-emerald-600' : 'bg-amber-500'
                    }`}
                  />
                  <span>{readingPost.isPublished !== false ? 'Active' : 'Deactive'}</span>
                </span>
                {readingPost.readTime && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-medium border border-amber-200">
                    {readingPost.readTime}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const post = readingPost;
                    setReadingPost(null);
                    setSelectedPost(post);
                    setManageModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReadingPost(null)}
                  className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 flex items-center justify-center transition-all cursor-pointer"
                  aria-label="Close reader"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 sm:p-8 space-y-6 flex-1 overflow-y-auto pr-4 sm:pr-6">
              {/* Cover Banner */}
              <div className="relative h-56 sm:h-72 w-full rounded-2xl overflow-hidden border border-amber-200 shadow-md bg-stone-900 shrink-0">
                <img
                  src={readingPost.image || '/services/kundli.jpg'}
                  alt={readingPost.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Title & Metadata */}
              <div className="space-y-2">
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A151B] leading-snug">
                  {readingPost.title}
                </h2>
                {readingPost.titleHi && (
                  <h3 className="font-serif text-lg sm:text-xl font-medium text-amber-900">
                    {readingPost.titleHi}
                  </h3>
                )}

                <div className="flex items-center flex-wrap gap-4 pt-2 text-xs text-stone-600 border-t border-amber-200/60 mt-3">
                  <div className="flex items-center gap-1.5 font-semibold text-stone-800">
                    <User className="w-4 h-4 text-amber-800" />
                    <span>{readingPost.author}</span>
                    {readingPost.authorRole && (
                      <span className="text-stone-500 font-normal">({readingPost.authorRole})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-500">
                    <Calendar className="w-4 h-4" />
                    <span>{readingPost.date}</span>
                  </div>
                </div>
              </div>

              {/* Excerpt */}
              {readingPost.excerpt && (
                <div className="p-4 rounded-xl bg-amber-50/80 border-l-4 border-amber-500 text-xs sm:text-sm text-stone-700 italic leading-relaxed">
                  &ldquo;{readingPost.excerpt}&rdquo;
                </div>
              )}

              {/* Key Takeaways */}
              {readingPost.keyTakeaways && readingPost.keyTakeaways.length > 0 && (
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-amber-200/90 shadow-2xs space-y-2.5">
                  <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-[#800000] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Key Astrological Takeaways</span>
                  </h4>
                  <ul className="text-xs sm:text-sm text-stone-700 space-y-1.5 list-disc pl-5 leading-relaxed">
                    {readingPost.keyTakeaways.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Content Paragraphs */}
              <div className="space-y-4 text-xs sm:text-sm text-stone-800 leading-relaxed font-normal">
                {readingPost.content && readingPost.content.length > 0 ? (
                  readingPost.content.map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))
                ) : (
                  <p>{readingPost.excerpt}</p>
                )}
              </div>

              {/* Hindi Content Paragraphs if available */}
              {readingPost.contentHi && readingPost.contentHi.length > 0 && (
                <div className="p-5 rounded-2xl bg-stone-100/80 border border-stone-200/80 space-y-3">
                  <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-amber-900">
                    हिंदी अनुवाद एवं विवेचना
                  </h4>
                  <div className="space-y-3 text-xs sm:text-sm text-stone-800 leading-relaxed">
                    {readingPost.contentHi.map((para, idx) => (
                      <p key={idx}>{para}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="shrink-0 px-6 py-3.5 bg-stone-100/90 border-t border-amber-200 flex items-center justify-between">
              <span className="text-[11px] text-stone-500 font-mono">
                Slug: {readingPost.id}
              </span>
              <button
                type="button"
                onClick={() => setReadingPost(null)}
                className="px-4 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold cursor-pointer"
              >
                Close Reader
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
