import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Logout from '../auth/Logout.jsx';
import InviteMembers from './InviteMembers.jsx';

export default function WorkspaceView() {
  const { workspaceId } = useParams();
  const [workspace, setWorkspace] = useState(null);
  const [boards, setBoards] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchWs = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/workspaces/${workspaceId}`, { headers: { 'x-auth-token': token } });
        setWorkspace(res.data.data);
        setBoards(res.data.data.boards || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load workspace');
      }
    };
    fetchWs();
  }, [workspaceId]);

  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!workspace) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl">{workspace.name}</h1>
          <p className="text-gray-500">{workspace.description}</p>
        </div>
        <Logout />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {boards.map((b) => (
          <Link key={b._id} to={`/board/${b._id}`} className="p-4 rounded shadow bg-white border">
            <div className="w-full h-2 rounded mb-2" style={{ backgroundColor: b.color || '#0ea5e9' }} />
            <h3 className="text-xl font-semibold">{b.title}</h3>
            <p className="text-sm text-gray-500 capitalize">{b.visibility}</p>
          </Link>
        ))}
        <CreateBoard workspaceId={workspaceId} onCreated={(board)=>setBoards([board, ...boards])} />
        <div className="p-4 rounded border bg-gray-50">
          <InviteMembers workspaceId={workspaceId} onInvited={(ws)=>setWorkspace(ws)} />
        </div>
      </div>
    </div>
  );
}

function CreateBoard({ workspaceId, onCreated }) {
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('#0ea5e9');
  const [visibility, setVisibility] = useState('workspace');
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5001/api/boards', { workspaceId, title, color, visibility }, { headers: { 'x-auth-token': token } });
      setTitle('');
      onCreated(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create board');
    }
  };

  return (
    <form onSubmit={submit} className="p-4 rounded border bg-gray-50 space-y-2">
      <h3 className="font-semibold">Create Board</h3>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <input className="w-full border px-3 py-2" placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} required />
      <div className="flex gap-2">
        <input className="border px-3 py-2" type="color" value={color} onChange={(e)=>setColor(e.target.value)} />
        <select className="border px-3 py-2" value={visibility} onChange={(e)=>setVisibility(e.target.value)}>
          <option value="workspace">Workspace</option>
          <option value="private">Private</option>
        </select>
      </div>
      <button className="bg-blue-600 text-white px-3 py-2 rounded" type="submit">Create</button>
    </form>
  );
}

