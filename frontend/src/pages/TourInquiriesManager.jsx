import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardDocumentIcon, PlusIcon } from '@heroicons/react/20/solid';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000').replace(/\/$/, '');

const authHeaders = () => {
  const t = localStorage.getItem('adminToken');
  return t ? { Authorization: `Bearer ${t}` } : {};
};

const jsonAuthHeaders = () => ({
  ...authHeaders(),
  'Content-Type': 'application/json'
});

const TourInquiriesManager = () => {
  const [links, setLinks] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newLabel, setNewLabel] = useState('VIP tour inquiry');
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [lr, ir] = await Promise.all([
        fetch(`${API_BASE}/api/admin/tour-inquiries/links`, { headers: authHeaders() }),
        fetch(`${API_BASE}/api/admin/tour-inquiries/inquiries`, { headers: authHeaders() })
      ]);
      const lj = await lr.json();
      const ij = await ir.json();
      if (lj.success) setLinks(lj.links || []);
      if (ij.success) setInquiries(ij.inquiries || []);
    } catch (e) {
      console.error(e);
      setMsg('Failed to load data. Are you logged in?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createLink = async () => {
    setMsg('');
    try {
      const r = await fetch(`${API_BASE}/api/admin/tour-inquiries/links`, {
        method: 'POST',
        headers: jsonAuthHeaders(),
        body: JSON.stringify({ label: newLabel || 'Private tour request' })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.message || 'Failed');
      setMsg('New private link created — copy the URL below.');
      await load();
    } catch (e) {
      setMsg(e.message || 'Could not create link');
    }
  };

  const toggleLink = async (id, isActive) => {
    await fetch(`${API_BASE}/api/admin/tour-inquiries/links/${id}`, {
      method: 'PATCH',
      headers: jsonAuthHeaders(),
      body: JSON.stringify({ isActive: !isActive })
    });
    await load();
  };

  const setInquiryStatus = async (id, status) => {
    await fetch(`${API_BASE}/api/admin/tour-inquiries/inquiries/${id}`, {
      method: 'PATCH',
      headers: jsonAuthHeaders(),
      body: JSON.stringify({ status })
    });
    await load();
  };

  const publicBookingBase = typeof window !== 'undefined' ? window.location.origin : '';

  const copyUrl = (token) => {
    const url = `${publicBookingBase}/book-tour/${token}`;
    navigator.clipboard.writeText(url).then(() => setMsg('Copied to clipboard.')).catch(() => {});
  };

  if (loading && links.length === 0 && inquiries.length === 0) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-teal-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-xl font-bold text-stone-900">Private tour booking links</h2>
        <p className="text-sm text-stone-600 mt-1">
          Share a link only with the customer — it is not listed in the main website navigation.
        </p>
      </div>

      {msg && <p className="text-sm text-teal-700 bg-teal-50 border border-teal-200 rounded-lg px-3 py-2">{msg}</p>}

      <div className="bg-white rounded-lg border border-stone-200 p-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-stone-600 mb-1">Label (internal)</label>
          <input
            className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
          />
        </div>
        <button
          type="button"
          onClick={createLink}
          className="inline-flex items-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
        >
          <PlusIcon className="h-5 w-5" />
          Generate new link
        </button>
      </div>

      <div className="bg-white rounded-lg border border-stone-200 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="text-left p-3 font-semibold text-stone-700">Label</th>
              <th className="text-left p-3 font-semibold text-stone-700">Private URL</th>
              <th className="text-left p-3 font-semibold text-stone-700">Active</th>
            </tr>
          </thead>
          <tbody>
            {links.map((l) => (
              <tr key={l._id} className="border-t border-stone-100">
                <td className="p-3">{l.label}</td>
                <td className="p-3">
                  <code className="text-xs break-all block max-w-md text-stone-600">
                    {publicBookingBase}/book-tour/{l.token}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyUrl(l.token)}
                    className="mt-1 inline-flex items-center gap-1 text-teal-600 text-xs font-medium hover:underline"
                  >
                    <ClipboardDocumentIcon className="h-4 w-4" /> Copy
                  </button>
                </td>
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() => toggleLink(l._id, l.isActive)}
                    className={`text-xs px-2 py-1 rounded ${l.isActive ? 'bg-green-100 text-green-800' : 'bg-stone-200 text-stone-600'}`}
                  >
                    {l.isActive ? 'Active' : 'Disabled'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {links.length === 0 && <p className="p-6 text-stone-500 text-sm">No links yet — generate one above.</p>}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-stone-900 mb-3">Submissions</h3>
        <div className="bg-white rounded-lg border border-stone-200 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="text-left p-3 font-semibold text-stone-700">Date</th>
                <th className="text-left p-3 font-semibold text-stone-700">Name</th>
                <th className="text-left p-3 font-semibold text-stone-700">Phone</th>
                <th className="text-left p-3 font-semibold text-stone-700">Email</th>
                <th className="text-left p-3 font-semibold text-stone-700">Message</th>
                <th className="text-left p-3 font-semibold text-stone-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((q) => (
                <tr key={q._id} className="border-t border-stone-100 align-top">
                  <td className="p-3 whitespace-nowrap text-stone-600">
                    {q.createdAt ? new Date(q.createdAt).toLocaleString() : '—'}
                  </td>
                  <td className="p-3">{q.name}</td>
                  <td className="p-3">{q.phone}</td>
                  <td className="p-3">{q.email || '—'}</td>
                  <td className="p-3 max-w-xs text-stone-600">{q.message || '—'}</td>
                  <td className="p-3">
                    <select
                      value={q.status}
                      onChange={(e) => setInquiryStatus(q._id, e.target.value)}
                      className="rounded border border-stone-300 text-xs py-1"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {inquiries.length === 0 && <p className="p-6 text-stone-500 text-sm">No submissions yet.</p>}
        </div>
      </div>

      <p className="text-xs text-stone-500">
        Tip: open the site as a customer would and use{' '}
        <Link to="/visit-taxila" className="text-teal-600 underline">Visit Taxila</Link> for public tours; private links are only for invited guests.
      </p>
    </div>
  );
};

export default TourInquiriesManager;
