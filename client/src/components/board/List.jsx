import { useState } from 'react';
import axios from 'axios';

export default function List({ list }) {
  const [cards, setCards] = useState(list.cards || []);
  const [title, setTitle] = useState(list.title);

  const updateTitle = async (e) => {
    e.preventDefault();
    await axios.put(`http://localhost:5001/api/lists/${list._id}`, { title }, { headers: { 'x-auth-token': localStorage.getItem('token') } });
  };

  return (
    <div className="min-w-[280px] bg-gray-100 rounded p-3">
      <form onSubmit={updateTitle}>
        <input className="w-full font-semibold bg-transparent" value={title} onChange={(e)=>setTitle(e.target.value)} />
      </form>
      <div className="space-y-2 mt-2">
        {cards.map((c) => (
          <div key={c._id} className="bg-white rounded p-2 shadow border">
            <div className="text-sm font-medium">{c.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

