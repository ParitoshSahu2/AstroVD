'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getAuthToken } from '../../../lib/auth';
import {
  Star,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  UserCheck,
  Calendar,
  MessageSquare,
  ShieldCheck,
  Clock,
  Check,
  Copy,
  Globe,
  AlertCircle,
} from 'lucide-react';

interface ReviewItem {
  id: string;
  bookingId?: string;
  userId?: string;
  userName: string;
  userEmail?: string;
  userPhone?: string;
  city?: string;
  cityHi?: string;
  country?: string;
  countryHi?: string;
  rating: number;
  serviceName: string;
  serviceNameHi?: string;
  review: string;
  reviewHi?: string;
  status: 'PENDING' | 'PUBLISHED' | 'REJECTED';
  isVerifiedClient: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  publishedBy?: { id: string; name: string; email: string };
}

export default function AdminReviewsTab() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'PUBLISHED'>('ALL');
  const [ratingFilter, setRatingFilter] = useState<number | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api').replace(/\/api\/?$/, '');

  const getAdminToken = useCallback((): string | null => {
    const token = getAuthToken();
    if (token) return token;
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('astro_token') ||
        localStorage.getItem('token') ||
        localStorage.getItem('astrovd_token') ||
        localStorage.getItem('astro_auth_token') ||
        null
      );
    }
    return null;
  }, []);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 4000);
  };

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const token = getAdminToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${backendUrl}/api/content/reviews/admin`, {
        headers,
      });

      if (!res.ok) {
        // If 401/403 (unauthenticated demo admin) or 404 (endpoint resolving), fallback to public reviews
        if (res.status === 401 || res.status === 403 || res.status === 404) {
          try {
            const pubRes = await fetch(`${backendUrl}/api/content/reviews/public`);
            if (pubRes.ok) {
              const pubData = await pubRes.json();
              setReviews(Array.isArray(pubData) ? pubData : []);
              return;
            }
          } catch {
            // ignore fallback error
          }
          setReviews([]);
          return;
        }
        throw new Error(`Failed to load reviews (${res.status})`);
      }

      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.warn('Could not load admin reviews:', err?.message || err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [backendUrl, getAdminToken]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Handle Publish / Unpublish Toggle
  const handleTogglePublish = async (review: ReviewItem) => {
    try {
      setActionLoadingId(review.id);
      const newStatus = review.status === 'PUBLISHED' ? 'PENDING' : 'PUBLISHED';
      const token = getAdminToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${backendUrl}/api/content/reviews/${review.id}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error(`Failed to update review status (${res.status})`);
      }

      const updated = await res.json();
      setReviews((prev) => prev.map((r) => (r.id === review.id ? updated : r)));

      // Dispatch event to inform any live components (e.g. feedback section if mounted)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('astro_review_published'));
      }

      showNotification(
        'success',
        newStatus === 'PUBLISHED'
          ? `Review from "${review.userName}" is now PUBLISHED and live on the homepage!`
          : `Review from "${review.userName}" has been Unpublished from the homepage.`
      );
    } catch (err: any) {
      console.error('Error toggling review publish:', err);
      showNotification('error', err.message || 'Failed to update review status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Delete Review
  const handleDeleteReview = async (review: ReviewItem) => {
    const ok = window.confirm(
      `Are you sure you want to permanently delete the review from "${review.userName}"?`
    );
    if (!ok) return;

    try {
      setActionLoadingId(review.id);
      const token = getAdminToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${backendUrl}/api/content/reviews/${review.id}`, {
        method: 'DELETE',
        headers,
      });

      if (!res.ok) {
        throw new Error(`Failed to delete review (${res.status})`);
      }

      setReviews((prev) => prev.filter((r) => r.id !== review.id));
      showNotification('success', `Review from "${review.userName}" deleted successfully.`);
    } catch (err: any) {
      console.error('Error deleting review:', err);
      showNotification('error', err.message || 'Failed to delete review.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCopy = (text: string, id: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Metrics Calculations
  const metrics = useMemo(() => {
    const total = reviews.length;
    const pending = reviews.filter((r) => r.status === 'PENDING').length;
    const published = reviews.filter((r) => r.status === 'PUBLISHED').length;
    const avgRating =
      total > 0
        ? (reviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / total).toFixed(1)
        : '5.0';
    return { total, pending, published, avgRating };
  }, [reviews]);

  // Filtered Reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      // Status filter
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      // Rating filter
      if (ratingFilter !== 'ALL' && r.rating !== ratingFilter) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (r.userName || '').toLowerCase().includes(q);
        const matchesService = (r.serviceName || '').toLowerCase().includes(q);
        const matchesReview = (r.review || '').toLowerCase().includes(q);
        const matchesBooking = (r.bookingId || '').toLowerCase().includes(q);
        const matchesCity = (r.city || '').toLowerCase().includes(q);
        if (!matchesName && !matchesService && !matchesReview && !matchesBooking && !matchesCity) {
          return false;
        }
      }
      return true;
    });
  }, [reviews, statusFilter, ratingFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Toast */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs font-semibold animate-fadeIn ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMsg(null)}
            className="text-stone-400 hover:text-stone-700 ml-3"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Top Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Reviews */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Total Reviews</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <MessageSquare className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-stone-900">{metrics.total}</div>
          <p className="text-[11px] text-stone-400 mt-1">Submitted by devotees</p>
        </div>

        {/* Pending Moderation */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Pending Moderation</span>
            <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-900">{metrics.pending}</span>
            {metrics.pending > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 animate-pulse">
                Action Required
              </span>
            )}
          </div>
          <p className="text-[11px] text-stone-400 mt-1">Awaiting admin publishing</p>
        </div>

        {/* Published Live */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Published Live</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Globe className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700">{metrics.published}</div>
          <p className="text-[11px] text-stone-400 mt-1">Visible on user website</p>
        </div>

        {/* Average Rating */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Average Rating</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-2xl font-bold text-stone-900">{metrics.avgRating}</span>
            <span className="text-xs text-amber-600 font-bold">/ 5.0</span>
          </div>
          <p className="text-[11px] text-stone-400 mt-1">Devotee satisfaction score</p>
        </div>
      </div>

      {/* 3. Filter & Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-stone-100/80 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All ({metrics.total})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('PENDING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'PENDING'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>Pending</span>
              {metrics.pending > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    statusFilter === 'PENDING'
                      ? 'bg-amber-800 text-amber-100'
                      : 'bg-amber-200 text-amber-900'
                  }`}
                >
                  {metrics.pending}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('PUBLISHED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'PUBLISHED'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Published ({metrics.published})
            </button>
          </div>

          {/* Search & Rating Filter */}
          <div className="flex items-center gap-2 flex-1 max-w-md ml-auto">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by devotee, service, or keywords..."
                className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-amber-400 focus:bg-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <select
              value={ratingFilter}
              onChange={(e) =>
                setRatingFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
              }
              className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 focus:outline-none focus:border-amber-400"
            >
              <option value="ALL">All Stars</option>
              <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
              <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
              <option value="3">⭐⭐⭐ (3 Stars)</option>
              <option value="2">⭐⭐ (2 Stars)</option>
              <option value="1">⭐ (1 Star)</option>
            </select>

            <button
              type="button"
              onClick={fetchReviews}
              disabled={loading}
              className="p-1.5 rounded-xl border border-stone-200 text-stone-500 hover:text-stone-800 hover:bg-stone-50 cursor-pointer disabled:opacity-50"
              title="Refresh Reviews"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Reviews List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-stone-200/80 p-12 text-center space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin text-amber-700 mx-auto" />
          <p className="text-xs text-stone-500">Loading devotee reviews...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200/80 p-12 text-center space-y-2">
          <MessageSquare className="w-8 h-8 text-stone-300 mx-auto" />
          <h4 className="text-sm font-bold text-stone-700">No Reviews Found</h4>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'ALL' || ratingFilter !== 'ALL'
              ? 'No reviews match your selected filter criteria. Try clearing filters.'
              : 'Completed consultations will receive review prompts and submitted feedback will appear here for admin moderation.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReviews.map((r) => {
            const isPending = r.status === 'PENDING';
            const isPublished = r.status === 'PUBLISHED';
            const isActionLoading = actionLoadingId === r.id;

            return (
              <div
                key={r.id}
                className={`bg-white rounded-2xl border transition-all p-4 sm:p-5 ${
                  isPending
                    ? 'border-amber-300 shadow-sm bg-gradient-to-r from-amber-50/20 to-white'
                    : 'border-stone-200/90 hover:border-amber-300 hover:shadow-xs'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left Column: Devotee & Service Details */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Devotee Name */}
                      <span className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                        <span>{r.userName}</span>
                        {r.isVerifiedClient && (
                          <span
                            title="Verified Consultation Client"
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800"
                          >
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            Verified Client
                          </span>
                        )}
                      </span>

                      {/* City / Country */}
                      {(r.city || r.country) && (
                        <span className="text-xs text-stone-400">
                          • {r.city}
                          {r.city && r.country ? `, ` : ''}
                          {r.country}
                        </span>
                      )}

                      {/* Booking ID Badge */}
                      {r.bookingId && (
                        <div className="flex items-center gap-1 font-mono text-[10px] text-stone-500 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                          <span>Booking #{r.bookingId.slice(-6)}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(r.bookingId!, r.id)}
                            className="text-stone-400 hover:text-stone-700 cursor-pointer"
                            title="Copy full booking ID"
                          >
                            {copiedId === r.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Service & Rating Row */}
                    <div className="flex items-center gap-3 text-xs flex-wrap">
                      <span className="text-amber-900 font-semibold bg-amber-100/70 px-2 py-0.5 rounded text-[11px]">
                        ✨ {r.serviceName}
                      </span>

                      {/* Stars */}
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= (Number(r.rating) || 5)
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-stone-200'
                            }`}
                          />
                        ))}
                        <span className="ml-1 text-[11px] font-bold text-amber-800">
                          {r.rating}/5
                        </span>
                      </div>

                      {/* Created Date */}
                      <span className="text-stone-400 text-[11px] flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {r.createdAt
                            ? new Date(r.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : 'Recent'}
                        </span>
                      </span>
                    </div>

                    {/* Review Text */}
                    <div className="pt-1">
                      <p className="text-xs text-stone-700 leading-relaxed font-serif bg-stone-50/80 p-3 rounded-xl border border-stone-200/60 italic">
                        "{r.review}"
                      </p>
                    </div>

                    {/* User Contact Details if available */}
                    {(r.userEmail || r.userPhone) && (
                      <div className="text-[11px] text-stone-400 flex items-center gap-3 pt-0.5">
                        {r.userEmail && <span>Email: {r.userEmail}</span>}
                        {r.userPhone && <span>Mobile: {r.userPhone}</span>}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Status & Publishing Controls */}
                  <div className="shrink-0 flex flex-col sm:flex-row md:flex-col items-end justify-between gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-stone-100">
                    {/* Status Badge */}
                    <div>
                      {isPublished ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Published (Live)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                          <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                          <span>Pending Approval</span>
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      {isPending ? (
                        <button
                          type="button"
                          disabled={isActionLoading}
                          onClick={() => handleTogglePublish(r)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                          title="Publish this review to user website"
                        >
                          {isActionLoading ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          <span>Publish to Website</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={isActionLoading}
                          onClick={() => handleTogglePublish(r)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-amber-50 text-stone-600 hover:text-amber-800 font-semibold text-xs border border-stone-200 hover:border-amber-200 transition-colors cursor-pointer disabled:opacity-50"
                          title="Unpublish this review from the homepage"
                        >
                          {isActionLoading ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                          )}
                          <span>Unpublish</span>
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={isActionLoading}
                        onClick={() => handleDeleteReview(r)}
                        className="p-1.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 border border-stone-200 hover:border-rose-200 transition-colors cursor-pointer disabled:opacity-50"
                        title="Delete Review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

