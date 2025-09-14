import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const ActivitySidebar = ({ boardId }) => {
  const [logs, setLogs] = useState([]);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    fetch(`http://localhost:5001/api/activity/boards/${boardId}/activity`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setLogs(data.slice(0, 20))); // Last 20 logs
  }, [boardId, token]);

  return (
    <div className="w-64 bg-gray-100 p-4 h-screen overflow-y-auto">
      <h2 className="text-xl mb-4">Activity</h2>
      {logs.map(log => (
        <p key={log._id} className="mb-2">
          {log.event} by User {log.userId} at {new Date(log.timestamp).toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export default ActivitySidebar;