'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useScrollLock } from '../../../lib/scrollLock';
import {
  X,
  Package,
  Save,
  RefreshCw,
  AlertCircle,
  IndianRupee,
  Layers,
  Sparkles,
  Tag,
  Image as ImageIcon,
  CheckCircle2,
  Upload,
  Languages,
} from 'lucide-react';
import { getAuthToken } from '../../../lib/auth';
import { translateEnToHi } from '../../../lib/translator';

export interface ProductFormData {
  id?: string;
  name: string;
  nameHi?: string;
  tag?: string;
  tagHi?: string;
  category: string;
  categoryLabel?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  inStock?: boolean;
  isFeatured?: boolean;
  desc: string;
  descHi?: string;
  image: string;
  planet?: string;
  chakra?: string;
  mantra?: string;
  dayToWear?: string;
  beadSize?: string;
}

interface ProductFormModalProps {
  isOpen: boolean;
  product?: any | null; // null if creating new
  onClose: () => void;
  onSave: (data: ProductFormData) => Promise<void>;
}

export default function ProductFormModal({
  isOpen,
  product,
  onClose,
  onSave,
}: ProductFormModalProps) {
  useScrollLock(isOpen);

  const isEditing = Boolean(product);

  const [name, setName] = useState('');
  const [nameHi, setNameHi] = useState('');
  const [tag, setTag] = useState('');
  const [category, setCategory] = useState('wealth');
  const [price, setPrice] = useState<number>(1299);
  const [originalPrice, setOriginalPrice] = useState<number>(2499);
  const [stock, setStock] = useState<number>(45);
  const [inStock, setInStock] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [desc, setDesc] = useState('');
  const [descHi, setDescHi] = useState('');
  const [image, setImage] = useState('/products/prod-tiger-eye-macro.jpg');
  const [planet, setPlanet] = useState('Sun & Mars');
  const [chakra, setChakra] = useState('Solar Plexus (Manipura)');
  const [mantra, setMantra] = useState('ॐ सूर्याय नमः');
  const [beadSize, setBeadSize] = useState('8mm Natural Beads');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isTranslatingName, setIsTranslatingName] = useState(false);
  const [isTranslatingDesc, setIsTranslatingDesc] = useState(false);

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
      console.error('Product image upload error:', err);
      setUploadError(err.message || 'Error uploading product image.');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setNameHi(product.nameHi || '');
      setTag(product.tag || '');
      setCategory(product.category || 'wealth');
      setPrice(typeof product.price === 'number' ? product.price : 1299);
      setOriginalPrice(typeof product.originalPrice === 'number' ? product.originalPrice : Math.round(product.price * 1.5));
      setStock(typeof product.stock === 'number' ? product.stock : 50);
      setInStock(product.inStock !== false);
      setIsFeatured(Boolean(product.isFeatured));
      setDesc(product.desc || '');
      setDescHi(product.descHi || '');
      setImage(product.image || '/products/prod-tiger-eye-macro.jpg');
      setPlanet(product.planet || 'Sun & Mars');
      setChakra(product.chakra || 'Solar Plexus (Manipura)');
      setMantra(product.mantra || 'ॐ सूर्याय नमः');
      setBeadSize(product.beadSize || '8mm Natural Beads');
    } else {
      setName('');
      setNameHi('');
      setTag('NATURAL GEMSTONE • SACRED ENERGY');
      setCategory('wealth');
      setPrice(1299);
      setOriginalPrice(2499);
      setStock(50);
      setInStock(true);
      setIsFeatured(false);
      setDesc('');
      setDescHi('');
      setImage('/products/prod-tiger-eye-macro.jpg');
      setPlanet('Sun & Mars');
      setChakra('Solar Plexus (Manipura)');
      setMantra('ॐ सूर्याय नमः');
      setBeadSize('8mm Natural Beads');
    }
    setError(null);
  }, [product, isOpen]);

  // Auto-translate product name from English to Hindi (debounced)
  useEffect(() => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (isEditing && product?.name === name) return;

    const timer = setTimeout(async () => {
      setIsTranslatingName(true);
      try {
        const translated = await translateEnToHi(trimmed);
        if (translated) {
          setNameHi(translated);
        }
      } catch (err) {
        console.error('Error auto-translating product name:', err);
      } finally {
        setIsTranslatingName(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [name, isEditing, product?.name]);

  const handleTranslateNameNow = async (text?: string) => {
    const src = (text !== undefined ? text : name).trim();
    if (!src) return;
    setIsTranslatingName(true);
    try {
      const translated = await translateEnToHi(src);
      if (translated) {
        setNameHi(translated);
      }
    } catch (err) {
      console.error('Error translating product name:', err);
    } finally {
      setIsTranslatingName(false);
    }
  };

  // Auto-translate product description from English to Hindi (debounced)
  useEffect(() => {
    const trimmed = desc.trim();
    if (!trimmed) return;
    if (isEditing && product?.desc === desc) return;

    const timer = setTimeout(async () => {
      setIsTranslatingDesc(true);
      try {
        const translated = await translateEnToHi(trimmed);
        if (translated) {
          setDescHi(translated);
        }
      } catch (err) {
        console.error('Error auto-translating description:', err);
      } finally {
        setIsTranslatingDesc(false);
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [desc, isEditing, product?.desc]);

  const handleTranslateDescNow = async (text?: string) => {
    const src = (text !== undefined ? text : desc).trim();
    if (!src) return;
    setIsTranslatingDesc(true);
    try {
      const translated = await translateEnToHi(src);
      if (translated) {
        setDescHi(translated);
      }
    } catch (err) {
      console.error('Error translating description:', err);
    } finally {
      setIsTranslatingDesc(false);
    }
  };

  // Handles numeric price and inventory inputs so leading zeros auto-strip when user starts typing
  const handleNumericInput = (val: string, setter: (n: number) => void) => {
    const digitsOnly = val.replace(/\D/g, '');
    if (!digitsOnly) {
      setter(0);
      return;
    }
    // Automatically strip leading zeros if followed by other digits (e.g. "05" -> "5", "01299" -> "1299")
    const stripped = digitsOnly.replace(/^0+(?=\d)/, '');
    setter(Number(stripped));
  };

  const formRef = useRef<HTMLFormElement>(null);

  const handleFormWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    if (
      formRef.current &&
      e.target !== formRef.current &&
      !formRef.current.contains(e.target as Node)
    ) {
      formRef.current.scrollTop += e.deltaY;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Product name is required.');
      return;
    }
    if (!desc.trim()) {
      setError('Product description is required.');
      return;
    }
    if (price <= 0) {
      setError('Price must be greater than zero.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave({
        ...(product?.id ? { id: product.id } : {}),
        name: name.trim(),
        nameHi: nameHi.trim() || undefined,
        tag: tag.trim() || undefined,
        category,
        price,
        originalPrice: originalPrice > price ? originalPrice : undefined,
        stock,
        inStock,
        isFeatured,
        desc: desc.trim(),
        descHi: descHi.trim() || undefined,
        image: image.trim(),
        planet: planet.trim() || undefined,
        chakra: chakra.trim() || undefined,
        mantra: mantra.trim() || undefined,
        beadSize: beadSize.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save product details.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      data-lenis-prevent="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn"
    >
      <div
        data-lenis-prevent="true"
        onWheel={handleFormWheel}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-[#5B0D15] text-amber-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Package className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="font-serif font-bold text-base tracking-wide text-white">
                {isEditing ? 'Edit Sacred Store Product' : 'Add New Sacred Store Product'}
              </h3>
              <p className="text-[11px] text-amber-200/80">
                {isEditing
                  ? `Updating "${product?.name}" (${product?.id})`
                  : 'Configure energized gemstone bracelet, inventory & spiritual details'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-amber-200 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          data-lenis-prevent="true"
          onWheel={(e) => e.stopPropagation()}
          className="p-5 overflow-y-auto space-y-4 text-xs modal-scroll-container overscroll-contain flex-1 min-h-0 modal-scrollbar"
        >
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 0: Product Image Upload (Top Section) */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80">
            <label className="text-xs font-bold text-amber-950 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-amber-700" />
                <span>Product Image *</span>
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
                  alt="Product Preview"
                  className="w-full h-full object-cover"
                  onError={(e: any) => {
                    e.target.src = '/products/prod-tiger-eye-macro.jpg';
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

          {/* Section 1: Product Identification */}
          <div className="space-y-3">
            <h4 className="font-semibold text-stone-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b pb-1">
              <Tag className="w-3.5 h-3.5 text-amber-700" />
              <span>Basic Identification &amp; Category</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-medium text-stone-700">Product Name (English) *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => {
                    if (name.trim() && !nameHi.trim()) {
                      handleTranslateNameNow(name);
                    }
                  }}
                  placeholder="e.g. TIGER EYE BRACELET"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-[#5B0D15]"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-medium text-stone-700">Product Name (Hindi)</label>
                  {isTranslatingName ? (
                    <span className="text-[10px] text-amber-700 font-semibold flex items-center gap-1 animate-pulse">
                      <Sparkles className="w-3 h-3 text-amber-600 animate-spin" />
                      <span>Translating...</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleTranslateNameNow()}
                      disabled={!name.trim() || isTranslatingName}
                      className="text-[10px] text-[#5B0D15] hover:text-[#78121d] font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-40"
                      title="Auto-translate name from English"
                    >
                      <Languages className="w-3 h-3 text-amber-700" />
                      <span>Auto-translate</span>
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={nameHi}
                  onChange={(e) => setNameHi(e.target.value)}
                  placeholder="उदा. टाइगर आई सिद्ध ब्रेसलेट"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-[#5B0D15]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-medium text-stone-700">Spiritual Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-[#5B0D15]"
                >
                  <option value="wealth">Wealth &amp; Prosperity (धन एवं समृद्धि)</option>
                  <option value="protection">Protection &amp; Nazar (सुरक्षा व नज़र दोष)</option>
                  <option value="love">Love &amp; Harmony (प्रेम व शांति)</option>
                  <option value="healing">Healing &amp; Peace (आरोग्य व संतुलन)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-stone-700">Tagline / Energy Badge</label>
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="e.g. NATURAL GEMSTONE • SOLAR ENERGY"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-[#5B0D15]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Stock Inventory */}
          <div className="space-y-3 pt-2">
            <h4 className="font-semibold text-stone-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b pb-1">
              <IndianRupee className="w-3.5 h-3.5 text-amber-700" />
              <span>Pricing &amp; Inventory</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-medium text-stone-700">Selling Price (₹) *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  value={price}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => handleNumericInput(e.target.value, setPrice)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-[#5B0D15]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-stone-700">Original MRP (₹)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={originalPrice}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => handleNumericInput(e.target.value, setOriginalPrice)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-[#5B0D15]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-stone-700">Inventory Stock Count *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  value={stock}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => handleNumericInput(e.target.value, setStock)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-[#5B0D15]"
                />
              </div>
            </div>

            <div className="flex items-center gap-6 pt-1">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-700">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                  className="rounded border-stone-300 text-[#5B0D15] focus:ring-[#5B0D15]"
                />
                <span>In Stock &amp; Available for Purchase</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-700">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded border-stone-300 text-[#5B0D15] focus:ring-[#5B0D15]"
                />
                <span>Mark as Featured Product</span>
              </label>
            </div>
          </div>

          {/* Section 3: Descriptions */}
          <div className="space-y-3 pt-2">
            <h4 className="font-semibold text-stone-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b pb-1">
              <Layers className="w-3.5 h-3.5 text-amber-700" />
              <span>Description &amp; Media</span>
            </h4>

            <div className="space-y-1">
              <label className="font-medium text-stone-700">Description (English) *</label>
              <textarea
                rows={2}
                required
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                onBlur={() => {
                  if (desc.trim() && !descHi.trim()) {
                    handleTranslateDescNow(desc);
                  }
                }}
                placeholder="Comprehensive spiritual description of the consecrated gemstone bracelet..."
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-[#5B0D15]"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-medium text-stone-700">Description (Hindi)</label>
                {isTranslatingDesc ? (
                  <span className="text-[10px] text-amber-700 font-semibold flex items-center gap-1 animate-pulse">
                    <Sparkles className="w-3 h-3 text-amber-600 animate-spin" />
                    <span>Translating...</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleTranslateDescNow()}
                    disabled={!desc.trim() || isTranslatingDesc}
                    className="text-[10px] text-[#5B0D15] hover:text-[#78121d] font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-40"
                    title="Auto-translate description from English"
                  >
                    <Languages className="w-3 h-3 text-amber-700" />
                    <span>Auto-translate</span>
                  </button>
                )}
              </div>
              <textarea
                rows={2}
                value={descHi}
                onChange={(e) => setDescHi(e.target.value)}
                placeholder="प्राकृतिक रत्न का आध्यात्मिक महत्व एवं लाभ..."
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-[#5B0D15]"
              />
            </div>
          </div>

          {/* Section 4: Astrological & Spiritual Specs */}
          <div className="space-y-3 pt-2">
            <h4 className="font-semibold text-stone-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b pb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Astrological &amp; Consecration Specs</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-medium text-stone-700">Associated Planet</label>
                <input
                  type="text"
                  value={planet}
                  onChange={(e) => setPlanet(e.target.value)}
                  placeholder="e.g. Sun (Surya) & Mars (Mangal)"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-[#5B0D15]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-stone-700">Associated Chakra</label>
                <input
                  type="text"
                  value={chakra}
                  onChange={(e) => setChakra(e.target.value)}
                  placeholder="e.g. Solar Plexus (Manipura)"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-[#5B0D15]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-medium text-stone-700">Activation Mantra</label>
                <input
                  type="text"
                  value={mantra}
                  onChange={(e) => setMantra(e.target.value)}
                  placeholder="e.g. ॐ सूर्याय नमः"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-[#5B0D15]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-stone-700">Bead Size &amp; Specs</label>
                <input
                  type="text"
                  value={beadSize}
                  onChange={(e) => setBeadSize(e.target.value)}
                  placeholder="e.g. 8mm Natural Beads"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-[#5B0D15]"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="shrink-0 pt-4 border-t flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 font-medium text-stone-700 cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-[#5B0D15] hover:bg-[#4A0A10] text-white font-semibold flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-300" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isEditing ? 'Save Changes' : 'Create Product'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
