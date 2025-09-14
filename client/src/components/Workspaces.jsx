import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from './Navbar';
import { toast } from 'react-toastify';

const WorkspaceCard = ({ workspace, isPersonal, user, onDelete, onOpenBoards }) => {
  const borderColor = isPersonal ? 'border-teal-400' : 'border-amber-400';
  const bgBadge = isPersonal ? 'bg-teal-100' : 'bg-amber-100';
  const textBadge = isPersonal ? 'text-teal-800' : 'text-amber-800';
  const titleColor = isPersonal ? 'text-teal-900' : 'text-amber-900';
  const btnBg = isPersonal
    ? 'bg-teal-600 hover:bg-teal-700 focus:ring-teal-500'
    : 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500';

  return (
    <div
      className={`bg-white p-7 rounded-3xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition duration-300 border ${borderColor} cursor-pointer`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onOpenBoards();
      }}
      onClick={onOpenBoards}
      aria-label={`Open workspace ${workspace.title}`}
    >
      <div className="flex justify-between items-start mb-5">
        <h2 className={`text-3xl font-extrabold truncate ${titleColor}`}>
          {workspace.title}
        </h2>
        <span
          className={`inline-block px-3 py-1 text-sm font-semibold rounded-full select-none whitespace-nowrap shadow-sm ${bgBadge} ${textBadge}`}
        >
          {isPersonal ? 'Personal' : 'Collaborative'}
        </span>
      </div>

      <p className="text-gray-700 leading-relaxed mb-6 min-h-[3.5rem]">
        Members: {workspace.members.map((m) => m.userId.email).join(', ')}
      </p>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {workspace.createdBy === user._id && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(workspace._id);
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 focus:ring-red-400 focus:outline-none transition duration-200 shadow-md text-base font-semibold"
            aria-label={`Delete workspace ${workspace.title}`}
          >
            Delete
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenBoards();
          }}
          className={`flex-grow sm:flex-grow-0 px-6 py-3 rounded-xl text-white font-semibold shadow-md transition duration-200 focus:outline-none focus:ring-4 ${btnBg}`}
        >
          Open Boards
        </button>
      </div>
    </div>
  );
};

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
      // Refresh workspaces after invite
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
      const workspace = workspaces.find((w) => w._id === workspaceId);
      if (!workspace || workspace.createdBy !== user._id) {
        toast.error('Only the workspace creator can delete it', { position: 'bottom-right' });
        return;
      }
      const response = await fetch(`http://localhost:5001/api/workspaces/${workspaceId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      setWorkspaces(workspaces.filter((w) => w._id !== workspaceId));
      toast.success('Workspace deleted successfully', { position: 'bottom-right' });
      navigate('/'); // Redirect to homepage after deletion
    } catch (err) {
      toast.error(err.message, { position: 'bottom-right' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-100 to-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-12 tracking-tight">
          Your Workspaces
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-14">
          {/* Create Workspace Form */}
          <section className="bg-white p-8 rounded-3xl shadow-xl border border-gray-200">
            <h2 className="text-3xl font-semibold text-gray-900 mb-6">Create New Workspace</h2>
            <form
              onSubmit={handleCreateWorkspace}
              className="flex flex-col space-y-5 sm:flex-row sm:space-y-0 sm:space-x-5"
              noValidate
            >
              <input
                type="text"
                value={newWorkspace}
                onChange={(e) => setNewWorkspace(e.target.value)}
                placeholder="Workspace title"
                className="flex-grow p-5 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-teal-300 focus:outline-none shadow-sm w-full min-w-0 text-lg font-medium text-gray-800"
                aria-label="New Workspace Title"
                required
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-4 bg-teal-600 text-white text-lg font-semibold rounded-2xl hover:bg-teal-700 transition duration-300 shadow-lg focus:ring-4 focus:ring-teal-500 focus:outline-none"
              >
                Create
              </button>
            </form>
          </section>

          {/* Invite Member Form */}
          <section className="bg-white p-8 rounded-3xl shadow-xl border border-gray-200">
            <h2 className="text-3xl font-semibold text-gray-900 mb-6">Invite Member to Workspace</h2>
            <form
              onSubmit={handleInviteMember}
              className="flex flex-col space-y-5 sm:flex-row sm:space-y-0 sm:space-x-5"
              noValidate
            >
              <select
                value={inviteWorkspaceId}
                onChange={(e) => setInviteWorkspaceId(e.target.value)}
                className="p-5 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-amber-300 focus:outline-none shadow-sm w-full sm:w-auto min-w-0 text-lg font-medium text-gray-700"
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
                className="flex-grow p-5 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-amber-300 focus:outline-none shadow-sm w-full min-w-0 text-lg font-medium text-gray-700"
                aria-label="User Email"
                required
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-4 bg-amber-600 text-white text-lg font-semibold rounded-2xl hover:bg-amber-700 transition duration-300 shadow-lg focus:ring-4 focus:ring-amber-500 focus:outline-none"
              >
                Invite
              </button>
            </form>
          </section>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Personal Workspaces Section */}
          <section>
            <h2 className="text-4xl font-extrabold mb-8 text-teal-800">Your Personal Workspaces</h2>
            {workspaces.filter((w) => w.members.length < 2).length === 0 ? (
              <p className="text-gray-500 text-lg">No personal workspaces found. Create one to get started!</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                {workspaces
                  .filter((w) => w.members.length < 2)
                  .map((workspace) => (
                    <WorkspaceCard
                      key={workspace._id}
                      workspace={workspace}
                      isPersonal={true}
                      user={user}
                      onDelete={handleDeleteWorkspace}
                      onOpenBoards={() => navigate(`/workspaces/${workspace._id}/boards`)}
                    />
                  ))}
              </div>
            )}
          </section>

          {/* Collaborative Workspaces Section */}
          <section>
            <h2 className="text-4xl font-extrabold mb-8 text-amber-800">Collaborative Workspaces</h2>
            {workspaces.filter((w) => w.members.length >= 2).length === 0 ? (
              <p className="text-gray-500 text-lg">No collaborative workspaces found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                {workspaces
                  .filter((w) => w.members.length >= 2)
                  .map((workspace) => (
                    <WorkspaceCard
                      key={workspace._id}
                      workspace={workspace}
                      isPersonal={false}
                      user={user}
                      onDelete={handleDeleteWorkspace}
                      onOpenBoards={() => navigate(`/workspaces/${workspace._id}/boards`)}
                    />
                  ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Workspaces;
