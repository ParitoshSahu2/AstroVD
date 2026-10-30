'use client';

import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Save,
  CheckCircle2,
  Shield,
  Trash2,
  Plus,
} from 'lucide-react';
import { UserProfile } from '../types';

interface DashboardSettingsTabProps {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => Promise<boolean>;
  t: (en: string, hi: string) => string;
}

export const DashboardSettingsTab: React.FC<DashboardSettingsTabProps> = ({
  profile,
  onUpdateProfile,
  t,
}) => {
  const [name, setName] = useState(profile.name || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [gender, setGender] = useState(profile.gender || 'MALE');
  const [gotra, setGotra] = useState(profile.gotra || '');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('astro_saved_addresses');
        if (stored) return JSON.parse(stored);
      } catch (e) {}
    }
    return [
      {
        id: 'addr-1',
        title: 'Home / Permanent',
        recipient: profile.name,
        street: 'C-24/18 Dashashwamedh Ghat Road',
        city: 'Varanasi',
        state: 'Uttar Pradesh',
        pincode: '221001',
        isDefault: true,
      },
    ];
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const success = await onUpdateProfile({
      name,
      phone,
      gender,
      gotra,
    });
    setSaving(false);
    if (success) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-5 sm:p-6 shadow-xs">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#3B1E22]">
          {t('Account Settings & Delivery Addresses', 'खाता सेटिंग्स एवं शिपिंग पते')}
        </h2>
        <p className="text-xs text-stone-500 mt-0.5">
          {t(
            'Manage your primary identity, phone contact for consultation alerts, and store delivery locations.',
            'अपनी पहचान, संपर्क सूत्र एवं आर्डर डिलीवरी पते प्रबंधित करें।'
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Personal Details Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="pb-3 border-b border-stone-100 flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-[#3B1E22]">
              {t('Personal Information', 'व्यक्तिगत विवरण')}
            </h3>
            {savedSuccess && (
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{t('Saved successfully!', 'सफलतापूर्वक सहेजा गया!')}</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-stone-600 block mb-1">
                {t('Full Name', 'पूरा नाम')}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:border-amber-400 focus:bg-white outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-600 block mb-1">
                {t('Email Address (Verified)', 'ईमेल (सत्यापित)')}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={profile.email || ''}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-stone-100 border border-stone-200 text-stone-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-stone-600 block mb-1">
                  {t('Phone Number (WhatsApp)', 'फोन नंबर (व्हाट्सएप)')}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:border-amber-400 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-600 block mb-1">
                  {t('Gotra (Ancestral Lineage)', 'गोत्र')}
                </label>
                <input
                  type="text"
                  value={gotra}
                  onChange={(e) => setGotra(e.target.value)}
                  placeholder={t('e.g. Kashyap, Bharadwaj', 'उदा. कश्यप, भारद्वाज')}
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:border-amber-400 focus:bg-white outline-none transition-all"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-full bg-[#5B0D15] hover:bg-[#72111c] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <Save className="w-3.5 h-3.5 text-amber-300" />
                <span>{saving ? t('Saving...', 'सहेजा जा रहा है...') : t('Save Changes', 'परिवर्तन सहेजें')}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Saved Addresses Card */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="pb-3 border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-700" />
              <h3 className="font-serif text-lg font-bold text-[#3B1E22]">
                {t('Saved Shipping Addresses', 'सहेजे गए पते')}
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {savedAddresses.map((addr) => (
              <div
                key={addr.id}
                className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 text-xs text-stone-700 space-y-1 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900">{addr.title}</span>
                  {addr.isDefault && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {t('Default', 'मुख्य')}
                    </span>
                  )}
                </div>
                <p className="font-medium text-stone-800">{addr.recipient}</p>
                <p className="text-stone-500 leading-relaxed">
                  {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                </p>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-2.5 text-xs text-amber-900">
            <Shield className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{t('Saved addresses are automatically filled during cart checkout.', 'ऑर्डर देते समय यह पता स्वतः भर दिया जाता है।')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSettingsTab;
