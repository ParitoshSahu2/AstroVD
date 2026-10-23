'use client';

import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { PageHeader } from '../../components/PageHeader';
import { Phone, Mail, MapPin, MessageCircle, Send, CheckCircle2, Clock, Globe, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function ContactPage() {
  const { t, language } = useLanguage();
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
    <div className="relative min-h-screen w-full bg-[#FAF7F2] m-0 p-0 overflow-x-clip selection:bg-amber-400">
      <Navbar />

      <PageHeader
        breadcrumb={t('Contact & Ashram', 'संपर्क एवं आश्रम')}
        title={t('Connect with AstroVD Sanctum', 'AstroVD आश्रम एवं परामर्श केंद्र से जुड़ें')}
        subtitle={t(
          "Reach out to Dr. Pandit Vishal Dubey's spiritual desks in Varanasi, Indore, New Delhi, and Dubai for astrology consultations, yagyas, and appointments.",
          'काशी, इंदौर, नई दिल्ली एवं दुबई स्थित डॉ. पंडित विशाल दुबे जी के आध्यात्मिक केंद्रों से परामर्श, यज्ञ एवं अपॉइंटमेंट हेतु संपर्क करें।'
        )}
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
                {t('Direct Consultation Lines', 'प्रत्यक्ष परामर्श हेल्पलाइन')}
              </h3>
              <div className="space-y-1 text-xs text-stone-700">
                <p>
                  <strong>{t('Primary Helpline:', 'मुख्य हेल्पलाइन:')}</strong>{' '}
                  <a href="tel:+919826012345" className="text-[#5B0D15] font-semibold hover:underline">
                    +91 98260 12345
                  </a>
                </p>
                <p>
                  <strong>{t('Desk & WhatsApp:', 'कार्यालय एवं व्हाट्सएप:')}</strong>{' '}
                  <a href="tel:+918889977665" className="text-[#5B0D15] font-semibold hover:underline">
                    +91 88899 77665
                  </a>
                </p>
                <p>
                  <strong>{t('Dubai / International:', 'दुबई / अंतर्राष्ट्रीय:')}</strong>{' '}
                  <a href="tel:+971501234567" className="text-[#5B0D15] font-semibold hover:underline">
                    +971 50 123 4567
                  </a>
                </p>
              </div>
              <span className="text-[11px] text-amber-800 font-semibold block pt-1 border-t border-stone-100">
                🕒 {t('Mon - Sun: 8:00 AM - 9:00 PM IST', 'सोमवार - रविवार: प्रातः 8:00 से रात्रि 9:00 बजे')}
              </span>
            </div>

            {/* Email Card */}
            <div className="p-6 rounded-3xl bg-white border border-amber-200/90 shadow-md space-y-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-[#5B0D15] flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#2A1810]">
                {t('Official Email Desks', 'आधिकारिक ईमेल संपर्क')}
              </h3>
              <div className="space-y-1 text-xs text-stone-700">
                <p>
                  <strong>{t('General Inquiries:', 'सामान्य जानकारी:')}</strong>{' '}
                  <a href="mailto:contact@astrovd.com" className="text-[#5B0D15] font-semibold hover:underline">
                    contact@astrovd.com
                  </a>
                </p>
                <p>
                  <strong>{t('Consultations & Pooja:', 'परामर्श एवं पूजा:')}</strong>{' '}
                  <a href="mailto:consultations@astrovd.com" className="text-[#5B0D15] font-semibold hover:underline">
                    consultations@astrovd.com
                  </a>
                </p>
                <p>
                  <strong>{t('Astrology Academy:', 'ज्योतिष शिक्षण:')}</strong>{' '}
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
                {t('Instant WhatsApp Chat (Dr. Vishal Dubey)', 'त्वरित व्हाट्सएप संपर्क (डॉ. विशाल दुबे)')}
              </h3>
              <p className="text-xs text-stone-600">
                {t(
                  'Connect directly with AstroVD Acharyas for instant slot availability, Kundli sharing, and priority booking.',
                  'कुंडली साझा करने, स्लॉट उपलब्धता एवं तत्काल परामर्श हेतु सीधे व्हाट्सएप पर संवाद करें।'
                )}
              </p>
              <span className="text-xs font-bold text-emerald-700 underline block pt-1">
                {t('Chat on WhatsApp (+91 98260 12345) →', 'व्हाट्सएप पर चैट करें (+91 98260 12345) →')}
              </span>
            </div>

            {/* Sacred Ashrams & Centers */}
            <div className="p-6 rounded-3xl bg-white border border-amber-200/90 shadow-md space-y-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-[#5B0D15] flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#2A1810]">
                {t('Spiritual Centers & Vidyapiths', 'आश्रम एवं प्रमुख आध्यात्मिक केंद्र')}
              </h3>
              <div className="space-y-2 text-xs text-stone-600 leading-relaxed">
                <p>
                  <strong className="text-stone-900">{t('Varanasi (Main Ashram):', 'वाराणसी (मुख्य आश्रम):')}</strong><br />
                  {t(
                    'Shree Ganesh Vidyapith Astrological Center, Near Kashi Vishwanath Corridor, Dashashwamedh, Varanasi, Uttar Pradesh - 221001.',
                    'श्री गणेश विद्यापीठ ज्योतिष केंद्र, श्री काशी विश्वनाथ कॉरिडोर के समीप, दशाश्वमेध घाट, वाराणसी, उत्तर प्रदेश - 221001।'
                  )}
                </p>
                <p>
                  <strong className="text-stone-900">{t('Indore (Research Office):', 'इंदौर (शोध कार्यालय):')}</strong><br />
                  {t(
                    'Scheme No. 54, Vijay Nagar, Indore, Madhya Pradesh - 452010.',
                    'स्कीम नं. 54, विजय नगर, इंदौर, मध्य प्रदेश - 452010।'
                  )}
                </p>
                <p>
                  <strong className="text-stone-900">{t('New Delhi Consultation Desk:', 'नई दिल्ली परामर्श केंद्र:')}</strong><br />
                  {t(
                    'South Extension Part II, Ring Road, New Delhi - 110049.',
                    'साउथ एक्सटेंशन पार्ट II, रिंग रोड, नई दिल्ली - 110049।'
                  )}
                </p>
                <p>
                  <strong className="text-stone-900">{t('Dubai Overseas Desk:', 'दुबई अंतर्राष्ट्रीय केंद्र:')}</strong><br />
                  {t(
                    'Business Bay, Downtown Dubai, United Arab Emirates.',
                    'बिजनेस बे, डाउनटाउन दुबई, संयुक्त अरब अमीरात।'
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Message Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-amber-200/90 shadow-xl space-y-5">
            <div>
              <span className="text-amber-700 text-xs font-bold uppercase tracking-wider">
                {t('Direct Message', 'प्रत्यक्ष संदेश')}
              </span>
              <h3 className="font-serif font-bold text-2xl text-[#2A1810]">
                {t('Send Us an Inquiry', 'अपना परामर्श संदेश भेजें')}
              </h3>
              <p className="text-xs text-stone-600 mt-1">
                {t(
                  'Fill out the form below with your birth details or questions. Our Vedic Acharyas will respond within 2 to 4 hours.',
                  'नीचे दिए गए फॉर्म में अपना जन्म विवरण व प्रश्न दर्ज करें। हमारे वैदिक आचार्य 2 से 4 घंटों में आपसे संपर्क करेंगे।'
                )}
              </p>
            </div>

            {submitted ? (
              <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-serif font-bold text-lg text-emerald-950">
                  {t('Inquiry Received with Reverence!', 'संदेश श्रद्धापूर्वक प्राप्त हुआ!')}
                </h4>
                <p className="text-xs text-stone-600 max-w-md mx-auto">
                  {language === 'hi' ? (
                    <>धन्यवाद, {name || 'जातक'}। डॉ. पंडित विशाल दुबे जी की टीम को आपका विवरण प्राप्त हो गया है और शीघ्र ही {phone || email} पर संपर्क किया जाएगा।</>
                  ) : (
                    <>Thank you, {name || 'Seeker'}. Dr. Pandit Vishal Dubey Ji’s team has received your details and will get in touch shortly on {phone || email}.</>
                  )}
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2 rounded-full bg-[#5B0D15] text-white text-xs font-bold shadow-md hover:bg-[#72111c] transition-all"
                >
                  {t('Send Another Inquiry', 'अन्य संदेश भेजें')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {t('Your Full Name *', 'आपका पूरा नाम *')}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={t('e.g. Paritosh Sharma', 'उदा. पारितोष शर्मा')}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-800 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {t('Phone Number (WhatsApp) *', 'मोबाइल / व्हाट्सएप नंबर *')}
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
                      {t('Email Address *', 'ईमेल पता *')}
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
                      {t('Select Service / Purpose *', 'सेवा / परामर्श का उद्देश्य चुनें *')}
                    </label>
                    <select
                      value={service}
                      onChange={(e) => setService(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-800 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-300 bg-white cursor-pointer"
                    >
                      <option value="Astrological Consultation">{t('Astrological Consultation', 'वैदिक ज्योतिष परामर्श')}</option>
                      <option value="Marriage Match Making">{t('Marriage Match Making', 'कुंडली मिलान व विवाह')}</option>
                      <option value="Free Baby Girl Kundli">{t('Free Birth Chart For Baby Girl Below 9 Years', '9 वर्ष से कम उम्र की बालिकाओं हेतु निःशुल्क कुंडली')}</option>
                      <option value="Mangal Dosh Shanti">{t('Mangal Dosh Shanti', 'मंगल दोष शांति अनुष्ठान')}</option>
                      <option value="Navgrah Shanti Poojan">{t('Navgrah Shanti Poojan', 'नवग्रह शांति महापूजन')}</option>
                      <option value="Kaal Sarp Dosh Shanti">{t('Kaal Sarp Dosh Shanti', 'कालसर्प दोष शांति')}</option>
                      <option value="Tarot Card Reading">{t('Tarot Card Reading (Madhuri Ji)', 'टैरो कार्ड रीडिंग (माधुरी जी)')}</option>
                      <option value="Vastu Consultation">{t('Vastu Consultation', 'वास्तु परामर्श')}</option>
                      <option value="Education in Astrology">{t('Education in Astrology Course', 'वैदिक ज्योतिष शिक्षण कोर्स')}</option>
                      <option value="Gemstones & Talismans">{t('Gemstones & Products', 'सिद्ध रत्न व आध्यात्मिक उत्पाद')}</option>
                      <option value="Other Vedic Inquiry">{t('Other Vedic Inquiry', 'अन्य वैदिक पूछताछ')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t('Your Birth Details / Message (Date, Time, Place of Birth)', 'जन्म विवरण / प्रश्न (जन्म तिथि, समय, स्थान एवं मुख्य जिज्ञासा)')}
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder={t(
                      'Provide your Date of Birth, Time of Birth, Place of Birth, and your primary questions or requirements...',
                      'अपनी जन्म तिथि, जन्म समय, जन्म स्थान और अपने मुख्य प्रश्न दर्ज करें...'
                    )}
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
                  <span>{t('Submit Consultation Inquiry', 'परामर्श संदेश प्रेषित करें')}</span>
                </button>
              </form>
            )}

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                {t('100% Confidential & Encrypted', '100% पूर्णतः गोपनीय एवं सुरक्षित')}
              </span>
              <span>{t('Response within 2 - 4 hours', '2 से 4 घंटों में संपर्क')}</span>
            </div>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
