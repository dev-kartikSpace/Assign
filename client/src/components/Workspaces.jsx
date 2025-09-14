import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from './Navbar';
import { toast } from 'react-toastify';

const Workspaces = () => {
  const { user, token } = useContext(AuthContext);
  const [workspaces, setWorkspaces] = useState([]);
  const [newWorkspace, setNewWorkspace] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteWorkspaceId, setInviteWorkspaceId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/workspaces', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        setWorkspaces(data);
      } catch (err) {
        toast.error(err.message, { position: 'bottom-right' });
      }
    };
    if (user && token) fetchWorkspaces();
  }, [user, token]);

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!newWorkspace.trim()) {
      toast.error('Workspace title cannot be empty', { position: 'bottom-right' });
      return;
    }
    try {
      const response = await fetch('http://localhost:5001/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newWorkspace.trim() }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      setWorkspaces([...workspaces, data]);
      setNewWorkspace('');
      toast.success('Workspace created successfully', { position: 'bottom-right' });
    } catch (err) {
      toast.error(err.message, { position: 'bottom-right' });
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    if (!inviteWorkspaceId || !inviteEmail.trim()) {
      toast.error('Select a workspace and enter a valid email', { position: 'bottom-right' });
      return;
    }
    try {
      const response = await fetch(`http://localhost:5001/api/workspaces/${inviteWorkspaceId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      toast.success('User invited successfully', { position: 'bottom-right' });
      setInviteEmail('');
      setInviteWorkspaceId('');
      const updatedResponse = await fetch('http://localhost:5001/api/workspaces', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedData = await updatedResponse.json();
      setWorkspaces(updatedData);
    } catch (err) {
      toast.error(err.message, { position: 'bottom-right' });
    }
  };

  const handleDeleteWorkspace = async (workspaceId) => {
    if (!token) return;
    try {
      const workspace = workspaces.find(w => w._id === workspaceId);
      if (!workspace || workspace.createdBy !== user._id) {
        toast.error('Only the workspace creator can delete it', { position: 'bottom-right' });
        return;
      }
      const response = await fetch(
        `http://localhost:5001/api/workspaces/${workspaceId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      setWorkspaces(workspaces.filter(w => w._id !== workspaceId));
      toast.success('Workspace deleted successfully', { position: 'bottom-right' });
    } catch (err) {
      toast.error(err.message, { position: 'bottom-right' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="text-5xl font-extrabold text-indigo-900 mb-10 tracking-wide">Your Workspaces</h1>

        <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Create Workspace Form */}
          <section className="bg-white p-6 rounded-xl shadow-md border border-indigo-200">
            <h2 className="text-2xl font-semibold text-indigo-800 mb-6">Create New Workspace</h2>
            <form onSubmit={handleCreateWorkspace} className="flex space-x-4">
              <input
                type="text"
                value={newWorkspace}
                onChange={(e) => setNewWorkspace(e.target.value)}
                placeholder="Workspace title"
                className="flex-grow p-4 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm"
                aria-label="New Workspace Title"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-indigo-600 text-white text-lg rounded-lg hover:bg-indigo-700 transition duration-300 shadow-md flex items-center justify-center"
              >
                Create
              </button>
            </form>
          </section>

          {/* Invite Member Form */}
          <section className="bg-white p-6 rounded-xl shadow-md border border-green-300">
            <h2 className="text-2xl font-semibold text-green-800 mb-6">Invite Member to Workspace</h2>
            <form onSubmit={handleInviteMember} className="flex space-x-4">
              <select
                value={inviteWorkspaceId}
                onChange={(e) => setInviteWorkspaceId(e.target.value)}
                className="p-4 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none shadow-sm"
                aria-label="Select Workspace"
                required
              >
                <option value="">Select Workspace</option>
                {workspaces.map((workspace) => (
                  <option key={workspace._id} value={workspace._id}>
                    {workspace.title}
                  </option>
                ))}
              </select>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="User Email"
                className="flex-grow p-4 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none shadow-sm"
                aria-label="User Email"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-green-600 text-white text-lg rounded-lg hover:bg-green-700 transition duration-300 shadow-md flex items-center justify-center"
              >
                Invite
              </button>
            </form>
          </section>
        </div>

        {/* Workspace Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {workspaces.length === 0 ? (
            <p className="text-center text-gray-600 col-span-full">No workspaces found. Create one to get started!</p>
          ) : (
            workspaces.map((workspace) => (
              <div
                key={workspace._id}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition duration-300 border border-indigo-100"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/workspaces/${workspace._id}/boards`); }}
                aria-label={`Open workspace ${workspace.title}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-2xl font-bold text-indigo-900 mb-3 truncate">{workspace.title}</h2>
                  {workspace.createdBy === user._id && (
                    <button
                      onClick={() => handleDeleteWorkspace(workspace._id)}
                      className="px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200 text-sm"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Members: {workspace.members.map(m => m.userId.email).join(', ')}
                </p>
                <button
                  onClick={() => navigate(`/workspaces/${workspace._id}/boards`)}
                  className="mt-4 w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 text-sm"
                >
                  Open Boards
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Workspaces;