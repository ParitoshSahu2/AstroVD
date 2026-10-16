'use client';

import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { PageHeader } from '../../components/PageHeader';
import { Phone, Mail, MapPin, MessageCircle, Send, CheckCircle2, Clock, Globe, ShieldCheck } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('Astrological Consultation');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const openWhatsApp = () => {
    window.open('https://wa.me/919826012345?text=Hello%20AstroVD,%20I%20have%20an%20inquiry%20regarding%20consultations.', '_blank');
  };

  return (
    <div className="relative min-h-screen w-full bg-[#FAF7F2] m-0 p-0 overflow-x-hidden selection:bg-amber-400">
      <Navbar />

      <PageHeader
        breadcrumb="Contact &amp; Ashram"
        title="Connect with AstroVD Sanctum"
        subtitle="Reach out to Dr. Pandit Vishal Dubey's spiritual desks in Varanasi, Indore, New Delhi, and Dubai for astrology consultations, yagyas, and appointments."
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-14 space-y-12">

        {/* Contact Information & Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Cards */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Phone Card */}
            <div className="p-6 rounded-3xl bg-white border border-amber-200/90 shadow-md space-y-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-[#5B0D15] flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#2A1810]">
                Direct Consultation Lines
              </h3>
              <div className="space-y-1 text-xs text-stone-700">
                <p>
                  <strong>Primary Helpline:</strong>{' '}
                  <a href="tel:+919826012345" className="text-[#5B0D15] font-semibold hover:underline">
                    +91 98260 12345
                  </a>
                </p>
                <p>
                  <strong>Desk &amp; WhatsApp:</strong>{' '}
                  <a href="tel:+918889977665" className="text-[#5B0D15] font-semibold hover:underline">
                    +91 88899 77665
                  </a>
                </p>
                <p>
                  <strong>Dubai / International:</strong>{' '}
                  <a href="tel:+971501234567" className="text-[#5B0D15] font-semibold hover:underline">
                    +971 50 123 4567
                  </a>
                </p>
              </div>
              <span className="text-[11px] text-amber-800 font-semibold block pt-1 border-t border-stone-100">
                🕒 Mon - Sun: 8:00 AM - 9:00 PM IST
              </span>
            </div>

            {/* Email Card */}
            <div className="p-6 rounded-3xl bg-white border border-amber-200/90 shadow-md space-y-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-[#5B0D15] flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#2A1810]">
                Official Email Desks
              </h3>
              <div className="space-y-1 text-xs text-stone-700">
                <p>
                  <strong>General Inquiries:</strong>{' '}
                  <a href="mailto:contact@astrovd.com" className="text-[#5B0D15] font-semibold hover:underline">
                    contact@astrovd.com
                  </a>
                </p>
                <p>
                  <strong>Consultations &amp; Pooja:</strong>{' '}
                  <a href="mailto:consultations@astrovd.com" className="text-[#5B0D15] font-semibold hover:underline">
                    consultations@astrovd.com
                  </a>
                </p>
                <p>
                  <strong>Astrology Academy:</strong>{' '}
                  <a href="mailto:academy@astrovd.com" className="text-[#5B0D15] font-semibold hover:underline">
                    academy@astrovd.com
                  </a>
                </p>
              </div>
            </div>

            {/* WhatsApp Direct Card */}
            <div
              onClick={openWhatsApp}
              className="p-6 rounded-3xl bg-gradient-to-br from-[#25D366]/15 via-white to-emerald-50/60 border border-emerald-300 shadow-md space-y-2 cursor-pointer hover:shadow-lg transition-all"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#25D366] text-white flex items-center justify-center">
                <MessageCircle className="w-5 h-5 fill-current" />
              </div>
              <h3 className="font-serif font-bold text-base text-emerald-950">
                Instant WhatsApp Chat (Dr. Vishal Dubey)
              </h3>
              <p className="text-xs text-stone-600">
                Connect directly with AstroVD Acharyas for instant slot availability, Kundli sharing, and priority booking.
              </p>
              <span className="text-xs font-bold text-emerald-700 underline block pt-1">
                Chat on WhatsApp (+91 98260 12345) →
              </span>
            </div>

            {/* Sacred Ashrams & Centers */}
            <div className="p-6 rounded-3xl bg-white border border-amber-200/90 shadow-md space-y-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-[#5B0D15] flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#2A1810]">
                Spiritual Centers &amp; Vidyapiths
              </h3>
              <div className="space-y-2 text-xs text-stone-600 leading-relaxed">
                <p>
                  <strong className="text-stone-900">Varanasi (Main Ashram):</strong><br />
                  Shree Ganesh Vidyapith Astrological Center, Near Kashi Vishwanath Corridor, Dashashwamedh, Varanasi, Uttar Pradesh - 221001.
                </p>
                <p>
                  <strong className="text-stone-900">Indore (Research Office):</strong><br />
                  Scheme No. 54, Vijay Nagar, Indore, Madhya Pradesh - 452010.
                </p>
                <p>
                  <strong className="text-stone-900">New Delhi Consultation Desk:</strong><br />
                  South Extension Part II, Ring Road, New Delhi - 110049.
                </p>
                <p>
                  <strong className="text-stone-900">Dubai Overseas Desk:</strong><br />
                  Business Bay, Downtown Dubai, United Arab Emirates.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Message Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-amber-200/90 shadow-xl space-y-5">
            <div>
              <span className="text-amber-700 text-xs font-bold uppercase tracking-wider">Direct Message</span>
              <h3 className="font-serif font-bold text-2xl text-[#2A1810]">
                Send Us an Inquiry
              </h3>
              <p className="text-xs text-stone-600 mt-1">
                Fill out the form below with your birth details or questions. Our Vedic Acharyas will respond within 2 to 4 hours.
              </p>
            </div>

            {submitted ? (
              <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-serif font-bold text-lg text-emerald-950">
                  Inquiry Received with Reverence!
                </h4>
                <p className="text-xs text-stone-600 max-w-md mx-auto">
                  Thank you, {name || 'Seeker'}. Dr. Pandit Vishal Dubey Ji’s team has received your details and will get in touch shortly on {phone || email}.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2 rounded-full bg-[#5B0D15] text-white text-xs font-bold shadow-md hover:bg-[#72111c] transition-all"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Paritosh Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-800 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Phone Number (WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98260 12345"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-800 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="paritosh@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-800 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Select Service / Purpose *
                    </label>
                    <select
                      value={service}
                      onChange={(e) => setService(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-800 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-300 bg-white cursor-pointer"
                    >
                      <option value="Astrological Consultation">Astrological Consultation</option>
                      <option value="Marriage Match Making">Marriage Match Making</option>
                      <option value="Free Baby Girl Kundli">Free Birth Chart For Baby Girl Below 9 Years</option>
                      <option value="Mangal Dosh Shanti">Mangal Dosh Shanti</option>
                      <option value="Navgrah Shanti Poojan">Navgrah Shanti Poojan</option>
                      <option value="Kaal Sarp Dosh Shanti">Kaal Sarp Dosh Shanti</option>
                      <option value="Tarot Card Reading">Tarot Card Reading (Madhuri Ji)</option>
                      <option value="Vastu Consultation">Vastu Consultation</option>
                      <option value="Education in Astrology">Education in Astrology Course</option>
                      <option value="Gemstones & Talismans">Gemstones &amp; Products</option>
                      <option value="Other Vedic Inquiry">Other Vedic Inquiry</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Your Birth Details / Message (Date, Time, Place of Birth)
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide your Date of Birth, Time of Birth, Place of Birth, and your primary questions or requirements..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-800 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-300"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-[#5B0D15] hover:bg-[#72111c] text-white text-xs sm:text-sm font-bold shadow-lg shadow-rose-950/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-amber-300" />
                  <span>Submit Consultation Inquiry</span>
                </button>
              </form>
            )}

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                100% Confidential &amp; Encrypted
              </span>
              <span>Response within 2 - 4 hours</span>
            </div>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
