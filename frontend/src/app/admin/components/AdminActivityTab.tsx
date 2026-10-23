'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  History,
  RefreshCw,
  Search,
  Filter,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  Eye,
  EyeOff,
  Trash2,
  PlusCircle,
  Upload,
  User,
  Shield,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { getAuthToken } from '../../../lib/auth';

export interface AdminActivityItem {
  id: string;
  adminId: string;
  adminEmail: string;
  adminName: string;
  adminRole: 'ADMIN' | 'SUPERADMIN';
  contentType: 'BLOG' | 'GALLERY';
  itemId: string;
  itemTitle: string;
  action: 'CREATE' | 'UPDATE' | 'PUBLISH' | 'UNPUBLISH' | 'DELETE' | 'UPLOAD_IMAGE';
  summary: string;
  details?: any;
  timestamp: string;
}

export default function AdminActivityTab() {
  const [activities, setActivities] = useState<AdminActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [contentTypeFilter, setContentTypeFilter] = useState<'ALL' | 'BLOG' | 'GALLERY'>('ALL');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const backendUrl = (
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api'
  ).replace(/\/api\/?$/, '');

  const fetchActivityHistory = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setError('Admin authorization token required.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (contentTypeFilter !== 'ALL') {
        params.set('contentType', contentTypeFilter);
      }
      if (actionFilter !== 'ALL') {
        params.set('action', actionFilter);
      }
      params.set('limit', '150');

      const res = await fetch(`${backendUrl}/api/content/activity?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to load activity logs: status ${res.status}`);
      }

      const data = await res.json();
      setActivities(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error fetching admin activity history:', err);
      setError(err.message || 'Error fetching activity logs.');
    } finally {
      setLoading(false);
    }
  }, [backendUrl, contentTypeFilter, actionFilter]);

  useEffect(() => {
    fetchActivityHistory();
  }, [fetchActivityHistory]);

  const filteredActivities = activities.filter((act) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      act.itemTitle?.toLowerCase().includes(query) ||
      act.summary?.toLowerCase().includes(query) ||
      act.adminName?.toLowerCase().includes(query) ||
      act.adminEmail?.toLowerCase().includes(query) ||
      act.itemId?.toLowerCase().includes(query)
    );
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE':
        return {
          icon: <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />,
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          label: 'Created',
        };
      case 'UPDATE':
        return {
          icon: <CheckCircle className="w-3.5 h-3.5 text-sky-600" />,
          bg: 'bg-sky-50 text-sky-800 border-sky-200',
          label: 'Updated',
        };
      case 'PUBLISH':
        return {
          icon: <Eye className="w-3.5 h-3.5 text-teal-600" />,
          bg: 'bg-teal-50 text-teal-800 border-teal-200',
          label: 'Published',
        };
      case 'UNPUBLISH':
        return {
          icon: <EyeOff className="w-3.5 h-3.5 text-amber-600" />,
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          label: 'Unpublished',
        };
      case 'DELETE':
        return {
          icon: <Trash2 className="w-3.5 h-3.5 text-rose-600" />,
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          label: 'Deleted',
        };
      case 'UPLOAD_IMAGE':
        return {
          icon: <Upload className="w-3.5 h-3.5 text-purple-600" />,
          bg: 'bg-purple-50 text-purple-800 border-purple-200',
          label: 'Uploaded Image',
        };
      default:
        return {
          icon: <History className="w-3.5 h-3.5 text-stone-600" />,
          bg: 'bg-stone-50 text-stone-800 border-stone-200',
          label: action,
        };
    }
  };

  const formatTimestamp = (iso: string) => {
    try {
      const date = new Date(iso);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  const blogCount = activities.filter((a) => a.contentType === 'BLOG').length;
  const galleryCount = activities.filter((a) => a.contentType === 'GALLERY').length;

  return (
    <div className="space-y-6">
      {/* Activity Overview Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Total Operations</p>
            <p className="text-2xl font-serif font-bold text-[#3B1E22] mt-1">{activities.length}</p>
            <p className="text-[11px] text-stone-400 mt-0.5">Recorded content changes</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center">
            <History className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Blog Operations</p>
            <p className="text-2xl font-serif font-bold text-amber-800 mt-1">{blogCount}</p>
            <p className="text-[11px] text-stone-400 mt-0.5">Articles created, edited, published</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-[#5B0D15] flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Gallery Operations</p>
            <p className="text-2xl font-serif font-bold text-purple-900 mt-1">{galleryCount}</p>
            <p className="text-[11px] text-stone-400 mt-0.5">Photos uploaded, edited, deleted</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center">
            <ImageIcon className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by article title, photo title, admin name, or change summary..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs sm:text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#5B0D15]/20 focus:border-[#5B0D15]"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Content Type Filter */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-100 border border-stone-200 text-xs font-medium">
              <button
                type="button"
                onClick={() => setContentTypeFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  contentTypeFilter === 'ALL'
                    ? 'bg-white text-[#5B0D15] shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                All Content
              </button>
              <button
                type="button"
                onClick={() => setContentTypeFilter('BLOG')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  contentTypeFilter === 'BLOG'
                    ? 'bg-white text-[#5B0D15] shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Blog Posts
              </button>
              <button
                type="button"
                onClick={() => setContentTypeFilter('GALLERY')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  contentTypeFilter === 'GALLERY'
                    ? 'bg-white text-[#5B0D15] shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Gallery
              </button>
            </div>

            {/* Action Filter */}
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#5B0D15]/20"
            >
              <option value="ALL">All Actions</option>
              <option value="CREATE">Created</option>
              <option value="UPDATE">Updated</option>
              <option value="PUBLISH">Published</option>
              <option value="UNPUBLISH">Unpublished</option>
              <option value="DELETE">Deleted</option>
              <option value="UPLOAD_IMAGE">Uploaded Images</option>
            </select>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={fetchActivityHistory}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Refresh Activity Log"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#5B0D15]' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Activity Log Feed */}
      <div className="rounded-2xl bg-white border border-stone-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-[#5B0D15]" />
            <p className="text-xs text-stone-500 font-medium">Fetching administrative audit trail...</p>
          </div>
        ) : error ? (
          <div className="p-10 text-center space-y-3">
            <p className="text-sm text-rose-700 font-semibold">{error}</p>
            <button
              onClick={fetchActivityHistory}
              className="px-4 py-2 rounded-full bg-[#5B0D15] text-white text-xs font-semibold shadow-xs"
            >
              Retry
            </button>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <History className="w-10 h-10 text-stone-300 mx-auto" />
            <h3 className="text-base font-serif font-bold text-stone-700">No Activity Logs Found</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              No content operations match your current search or filter criteria. Operations on Blog or Gallery will be automatically recorded here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {filteredActivities.map((act) => {
              const badge = getActionBadge(act.action);
              const isExpanded = expandedId === act.id;

              return (
                <div
                  key={act.id}
                  className="p-4 sm:p-5 hover:bg-stone-50/70 transition-colors space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-3">
                      {/* Content Type Pill */}
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0 ${
                          act.contentType === 'BLOG'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-purple-100 text-purple-900 border border-purple-300'
                        }`}
                      >
                        {act.contentType === 'BLOG' ? (
                          <FileText className="w-3 h-3 text-amber-800" />
                        ) : (
                          <ImageIcon className="w-3 h-3 text-purple-800" />
                        )}
                        {act.contentType}
                      </span>

                      {/* Action Badge */}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 shrink-0 ${badge.bg}`}
                      >
                        {badge.icon}
                        <span>{badge.label}</span>
                      </span>

                      {/* Item Title */}
                      <h4 className="text-xs sm:text-sm font-bold text-[#3B1E22] truncate max-w-md">
                        {act.itemTitle}
                      </h4>
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center gap-1 text-[11px] text-stone-400 shrink-0">
                      <Clock className="w-3 h-3 text-stone-400" />
                      <span>{formatTimestamp(act.timestamp)}</span>
                    </div>
                  </div>

                  {/* Summary & Actor details */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-stone-600 bg-stone-50/80 px-3.5 py-2.5 rounded-xl border border-stone-200/60">
                    <p className="font-medium text-stone-700 leading-relaxed">{act.summary}</p>
                    <div className="flex items-center gap-2 shrink-0 text-[11px]">
                      <span className="flex items-center gap-1 text-stone-500">
                        <User className="w-3 h-3 text-stone-400" />
                        <strong>{act.adminName}</strong> ({act.adminEmail})
                      </span>
                      <span
                        className={`px-2 py-0.2 rounded-full text-[9px] font-bold border uppercase ${
                          act.adminRole === 'SUPERADMIN'
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {act.adminRole}
                      </span>
                    </div>
                  </div>

                  {/* Details Toggle (if details object present) */}
                  {act.details && (
                    <div>
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : act.id)}
                        className="text-[11px] font-semibold text-stone-500 hover:text-[#5B0D15] flex items-center gap-1 cursor-pointer"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-3 h-3" />
                            <span>Hide Payload Details</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3" />
                            <span>View Payload Details (ID: {act.itemId})</span>
                          </>
                        )}
                      </button>

                      {isExpanded && (
                        <div className="mt-2 p-3 rounded-xl bg-stone-900 text-stone-100 text-[11px] font-mono overflow-x-auto max-h-56">
                          <pre>{JSON.stringify(act.details, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
