'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
      <div
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
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

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
                  placeholder="e.g. TIGER EYE BRACELET"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-[#5B0D15]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-stone-700">Product Name (Hindi)</label>
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
                  type="number"
                  min="1"
                  required
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-[#5B0D15]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-stone-700">Original MRP (₹)</label>
                <input
                  type="number"
                  min="1"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-[#5B0D15]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-stone-700">Inventory Stock Count *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
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
                placeholder="Comprehensive spiritual description of the consecrated gemstone bracelet..."
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-[#5B0D15]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-stone-700">Description (Hindi)</label>
              <textarea
                rows={2}
                value={descHi}
                onChange={(e) => setDescHi(e.target.value)}
                placeholder="प्राकृतिक रत्न का आध्यात्मिक महत्व एवं लाभ..."
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-[#5B0D15]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-stone-700 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-amber-700" />
                <span>Product Image URL *</span>
              </label>
              <input
                type="text"
                required
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="/products/prod-tiger-eye-macro.jpg"
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
          <div className="pt-4 border-t flex items-center justify-end gap-2.5">
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
