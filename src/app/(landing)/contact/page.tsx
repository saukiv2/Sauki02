'use client';

import Image from 'next/image';
import { useState } from 'react';

const CONTACTS = [
  {
    icon: '📞',
    label: 'Phone',
    value: ['+2347044647081', '+2349024099561'],
    note: 'Available 8am – 8pm WAT',
  },
  {
    icon: '✉️',
    label: 'Email',
    value: ['support@saukimart.online'],
    note: 'We reply within 24 hours',
  },
  {
    icon: '🌐',
    label: 'Website',
    value: ['www.saukimart.online'],
    note: '',
  },
  {
    icon: '🏢',
    label: 'By',
    value: ['Anjal Ventures', 'CAC BN 9258709'],
    note: '',
  },
];

const SUBJECTS = [
  'General Inquiry',
  'Technical Support',
  'Billing Issue',
  'Agent Application',
  'Other',
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: SUBJECTS[0],
    message: '',
  });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || form.message.length < 20) {
      setError('Please fill all required fields and enter a message of at least 20 characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSuccess(true);
        setForm({ name: '', email: '', phone: '', subject: SUBJECTS[0], message: '' });
      } else {
        setError('Failed to send message. Please try again.');
      }
    } catch {
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-12">
        {/* Left: Contact Info */}
        <div>
          <Image src="/logo.svg" alt="SaukiMart" width={160} height={40} className="mb-8" />
          <h1 className="font-playfair text-3xl font-bold mb-6">Get in touch</h1>
          <div className="space-y-6">
            {CONTACTS.map((c) => (
              <div key={c.label} className="bg-gray-50 rounded-xl p-5 flex gap-4 items-center">
                <span className="text-2xl">{c.icon}</span>
                <div>
                  <div className="font-semibold text-gray-800">{c.label}</div>
                  {Array.isArray(c.value) ? (
                    <div className="text-gray-700 text-sm">
                      {c.value.map((v) => (
                        <div key={v}>{v}</div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-700 text-sm">{c.value}</div>
                  )}
                  {c.note && <div className="text-xs text-gray-500 mt-1">{c.note}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Right: Contact Form */}
        <div>
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-8 space-y-6">
            <div>
              <label className="block font-medium mb-1">Full Name *</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Email *</label>
              <input
                type="email"
                className="w-full border rounded px-3 py-2"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Phone</label>
              <input
                type="tel"
                className="w-full border rounded px-3 py-2"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Subject *</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={form.subject}
                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              >
                {SUBJECTS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1">Message *</label>
              <textarea
                className="w-full border rounded px-3 py-2 min-h-[120px]"
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                minLength={20}
                required
              />
            </div>
            {error && <div className="bg-red-100 text-red-700 rounded p-3">{error}</div>}
            {success && <div className="bg-green-100 text-green-700 rounded p-3">Message sent! We&apos;ll respond within 24 hours.</div>}
            <button
              type="submit"
              className="w-full bg-brand-blue text-white font-semibold py-3 rounded hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
