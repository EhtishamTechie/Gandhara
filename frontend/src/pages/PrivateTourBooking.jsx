import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import SEOHead from '../components/SEOHead';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000').replace(/\/$/, '');

/**
 * Not linked from the public site nav — only reachable via a private URL
 * shared by the business (e.g. /book-tour/&lt;token&gt;).
 */
const PrivateTourBooking = () => {
  const { token } = useParams();
  const [meta, setMeta] = useState(null);
  const [invalid, setInvalid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    preferredDate: '',
    partySize: '',
    message: ''
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/api/public/tour-booking/${encodeURIComponent(token)}`);
        const j = await r.json();
        if (!r.ok || !j.success) {
          if (!cancelled) setInvalid(true);
          return;
        }
        if (!cancelled) setMeta(j);
      } catch {
        if (!cancelled) setInvalid(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const r = await fetch(`${API_BASE}/api/public/tour-booking/${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const j = await r.json();
      if (!r.ok) {
        alert(j.message || 'Could not submit. Please try again.');
        return;
      }
      setDone(true);
    } catch {
      alert('Network error. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[var(--color-bg-primary)]">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[var(--color-accent-gold)] border-t-transparent" />
      </div>
    );
  }

  if (invalid || !meta) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
        <SEOHead title="Tour request" description="Private tour booking" />
        <p className="text-center">This link is invalid or no longer active. Please contact us for assistance.</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
        <SEOHead title="Thank you" description="Tour request received" />
        <h1 className="text-2xl font-semibold mb-2 text-[var(--color-accent-gold)]">Thank you</h1>
        <p className="text-center text-[var(--color-text-secondary)] max-w-md">
          We received your tour request and will contact you soon on WhatsApp or phone.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] py-10 px-4">
      <SEOHead title={meta.label || 'Tour request'} description="Private tour booking form" />
      <div className="max-w-lg mx-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 shadow-lg">
        <h1 className="text-xl font-bold text-[var(--color-text-primary)] mb-1">
          {meta.label || 'Taxila tour request'}
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
          Tell us how we can help with your visit. This form is only for invited guests.
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--color-text-secondary)] mb-1">Full name *</label>
            <input
              required
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2 text-[var(--color-text-primary)]"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--color-text-secondary)] mb-1">Phone / WhatsApp *</label>
            <input
              required
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2 text-[var(--color-text-primary)]"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--color-text-secondary)] mb-1">Email</label>
            <input
              type="email"
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2 text-[var(--color-text-primary)]"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[var(--color-text-secondary)] mb-1">Preferred date</label>
              <input
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2 text-[var(--color-text-primary)]"
                value={form.preferredDate}
                onChange={(e) => setForm((f) => ({ ...f, preferredDate: e.target.value }))}
                placeholder="e.g. April 2026"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--color-text-secondary)] mb-1">Party size</label>
              <input
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2 text-[var(--color-text-primary)]"
                value={form.partySize}
                onChange={(e) => setForm((f) => ({ ...f, partySize: e.target.value }))}
                placeholder="e.g. 2 adults"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-[var(--color-text-secondary)] mb-1">Message</label>
            <textarea
              rows={4}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2 text-[var(--color-text-primary)]"
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              placeholder="Interests, mobility needs, hotel area, etc."
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-[var(--color-accent-gold)] py-3 font-semibold text-[var(--color-bg-primary)] disabled:opacity-60"
          >
            {submitting ? 'Sending…' : 'Submit request'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PrivateTourBooking;
