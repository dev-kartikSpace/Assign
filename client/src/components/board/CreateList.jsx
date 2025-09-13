import { useState } from 'react';
import axios from 'axios';

export default function CreateList({ boardId, position, onCreated }) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5001/api/lists', { boardId, title, position }, { headers: { 'x-auth-token': localStorage.getItem('token') } });
      setTitle('');
      if (onCreated) onCreated(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="min-w-[280px] bg-gray-100 rounded p-3">
      <input className="w-full border px-2 py-1" placeholder="Add list" value={title} onChange={(e)=>setTitle(e.target.value)} />
      <button disabled={loading} className="mt-2 px-3 py-1 bg-blue-600 text-white rounded" type="submit">Add list</button>
    </form>
  );
}

