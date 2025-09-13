import { useState } from 'react';
import axios from 'axios';

export default function CreateWorkspace({ onWorkspaceCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('workspace');
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5001/api/workspaces', { name, description, visibility }, {
        headers: { 'x-auth-token': token }
      });
      setError(null);
      setName('');
      setDescription('');
      if (onWorkspaceCreated) onWorkspaceCreated(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create workspace');
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <h3 className="text-xl font-semibold">New Workspace</h3>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <input className="w-full border px-3 py-2" placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} required />
      <textarea className="w-full border px-3 py-2" placeholder="Description" value={description} onChange={(e)=>setDescription(e.target.value)} />
      <select className="w-full border px-3 py-2" value={visibility} onChange={(e)=>setVisibility(e.target.value)}>
        <option value="workspace">Workspace</option>
        <option value="private">Private</option>
      </select>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Create</button>
    </form>
  );
}

