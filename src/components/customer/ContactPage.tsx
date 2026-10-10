import React, { useState } from 'react';
import {
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Send,
  Clock,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { dataStore } from '../../services/dataStore';
import { getDirectWhatsAppInquiryUrl, normalizeWhatsAppNumber } from '../../services/whatsapp';
import { analytics } from '../../services/analytics';
import { useLanguage } from '../../context/LanguageContext';

export const ContactPage: React.FC = () => {
  const { lang, t, tx } = useLanguage();
  const settings = dataStore.getSettings();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    analytics.track('WHATSAPP_CLICK', { source: 'contact_page_form' });

    const cleanPhone = normalizeWhatsAppNumber(settings.whatsapp_number);

    const text = lang === 'en'
      ? `Hello, a new message from Bidaya Home website:\nName: ${name || 'Not provided'}\nPhone: ${phone || 'Not provided'}\nMessage:\n${message}`
      : `السلام عليكم، رسالة جديدة من موقع بداية هوم:\n👤 الاسم: ${name || 'غير محدد'}\n📱 الهاتف: ${phone || 'غير محدد'}\n💬 الرسالة:\n${message}`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '80vh', padding: '50px 0 80px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 40px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--primary-700)',
              fontWeight: 700,
              fontSize: '0.85rem',
              marginBottom: '8px'
            }}
          >
            <Sparkles size={16} />
            <span>{tx(t.contact.eyebrow)}</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '12px', fontFamily: 'Cairo, sans-serif' }}>
            {tx(t.contact.mainTitle)}
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            {tx(t.contact.intro)}
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '36px',
            maxWidth: '1000px',
            margin: '0 auto'
          }}
        >
          {/* Contact Cards Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* WhatsApp Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                border: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-xs)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#25D366', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageCircle size={26} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {tx(t.contact.directChat)}
                  </h3>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{tx(t.contact.quickReply)}</span>
                </div>
              </div>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.6' }}>
                {tx(t.contact.directChatDesc)}
              </p>

              <a
                href={getDirectWhatsAppInquiryUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp"
                style={{ width: '100%', textDecoration: 'none' }}
              >
                <MessageCircle size={18} />
                <span>{tx(t.contact.startChat)}</span>
                <ExternalLink size={16} />
              </a>
            </div>

            {/* General Info */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                border: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-xs)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Phone size={20} color="var(--primary-700)" />
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{tx(t.contact.phone)}:</div>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }} dir="ltr">{settings.support_phone || '01509990745'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Mail size={20} color="var(--primary-700)" />
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{tx(t.contact.email)}:</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{settings.support_email || 'info@bidayahome.com'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <MapPin size={20} color="var(--primary-700)" />
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{tx(t.contact.delivery)}</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{lang === 'en' ? 'Egypt — delivery available nationwide' : (settings.store_address || 'جمهورية مصر العربية — خدمة الشحن لكافة المحافظات')}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Clock size={20} color="var(--primary-700)" />
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{tx(t.contact.workingHoursLabel)}</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{tx(t.contact.workingHoursText)}</div>
                </div>
              </div>
            </div>

            {/* Social Links Box */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                border: '1px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                {tx(t.contact.socialTitle)}
              </span>
              <div style={{ display: 'flex', gap: '10px' }}>
                <a
                  href={settings.facebook_url || 'https://www.facebook.com/triple3homeegypt'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                  style={{ padding: '8px 14px', borderRadius: 'var(--radius-full)' }}
                >
                  Facebook
                </a>
                <a
                  href={settings.instagram_url || 'https://www.instagram.com/bidaya_home1/'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                  style={{ padding: '8px 14px', borderRadius: 'var(--radius-full)' }}
                >
                  Instagram
                </a>
              </div>
            </div>
          </div>

          {/* Direct Message Form */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              padding: '32px',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px', fontFamily: 'Cairo, sans-serif' }}>
              {tx(t.contact.formTitle)}
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              {tx(t.contact.formDesc)}
            </p>

            <form onSubmit={handleSendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px' }}>
                  {tx(t.contact.yourName)}
                </label>
                <input
                  type="text"
                  placeholder={tx(t.contact.namePlaceholder)}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--border-default)',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px' }}>
                  {tx(t.contact.phone)}
                </label>
                <input
                  type="tel"
                  placeholder={tx(t.contact.phonePlaceholder)}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  dir="ltr"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--border-default)',
                    fontSize: '0.9rem',
                    textAlign: 'start',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px' }}>
                  {tx(t.contact.messageTitle)} <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder={tx(t.contact.messagePlaceholder)}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--border-default)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ borderRadius: 'var(--radius-md)', marginTop: '8px', fontWeight: 700 }}
              >
                <Send size={18} />
                <span>{tx(t.contact.sendWhatsapp)}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
