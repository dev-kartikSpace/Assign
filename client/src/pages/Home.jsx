import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import CreateWorkspace from '../components/workspace/CreateWorkspace.jsx';
import Logout from '../components/auth/Logout.jsx';
import { useAuth } from '../hooks/useAuth.jsx';

export default function Home() {
  const { user, loading } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || loading) return;
    const fetchWorkspaces = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5001/api/workspaces', {
          headers: { 'x-auth-token': token },
        });
        setWorkspaces(res.data.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch workspaces');
      }
    };
    fetchWorkspaces();
  }, [user, loading]);

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="p-4 min-h-screen">
      <div className="flex justify-between mb-4">
        <h1 className="text-3xl">Workspaces</h1>
        <Logout />
      </div>
      {workspaces.length === 0 ? (
        <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
          <div className="w-full max-w-md">
            <h2 className="text-2xl text-center mb-4">Create Your First Workspace</h2>
            <CreateWorkspace
              onWorkspaceCreated={(workspace) => setWorkspaces([...workspaces, workspace])}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {workspaces.map((workspace) => (
            <Link
              key={workspace._id}
              to={`/workspace/${workspace._id}`}
              className="p-4 bg-white rounded shadow hover:bg-gray-100"
            >
              <h3 className="text-xl font-semibold">{workspace.name}</h3>
              <p className="text-gray-500">{workspace.description || 'No description'}</p>
              <p className="text-sm font-medium mt-2">
                {workspace.visibility.charAt(0).toUpperCase() + workspace.visibility.slice(1)}
              </p>
            </Link>
          ))}
          <div className="p-4 bg-gray-50 rounded shadow">
            <CreateWorkspace
              onWorkspaceCreated={(workspace) => setWorkspaces([...workspaces, workspace])}
            />
          </div>
        </div>
      )}
    </div>
  );
}