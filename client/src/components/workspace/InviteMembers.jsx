import { useState } from 'react';
import axios from 'axios';

export default function InviteMembers({ workspaceId, onInvited }) {
  const [emails, setEmails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    const list = emails.split(',').map(e => e.trim()).filter(Boolean);
    if (list.length === 0) return;
    setLoading(true);
    try {
      const res = await axios.post(`http://localhost:5001/api/workspaces/${workspaceId}/invite`, { emails: list }, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setError(null);
      setEmails('');
      if (onInvited) onInvited(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to invite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-2">
      <h4 className="font-semibold">Invite Members</h4>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <input className="w-full border px-3 py-2" placeholder="Emails, comma separated" value={emails} onChange={(e)=>setEmails(e.target.value)} />
      <button disabled={loading} className="bg-gray-800 text-white px-3 py-2 rounded" type="submit">Invite</button>
    </form>
  );
}

