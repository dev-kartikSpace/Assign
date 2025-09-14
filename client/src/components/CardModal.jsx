import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const CardModal = ({ card, onClose, onUpdate }) => {
  const [formData, setFormData] = useState(card);
  const [newComment, setNewComment] = useState('');
  const { token } = useContext(AuthContext);

  const handleUpdate = async () => {
    const res = await fetch(`http://localhost:5001/api/cards/${card._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    onUpdate(data);
  };

  const handleAddComment = async () => {
    const res = await fetch('http://localhost:5001/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text: newComment, cardId: card._id }),
    });
    const comment = await res.json();
    setFormData({ ...formData, comments: [...formData.comments, comment] });
    setNewComment('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-1/2">
        <h2 className="text-2xl mb-4">{formData.title}</h2>
        <input
          type="text"
          className="w-full p-2 mb-4 border rounded"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Description"
        />
        <input
          type="text"
          className="w-full p-2 mb-4 border rounded"
          value={formData.labels.join(', ') || ''}
          onChange={(e) => setFormData({ ...formData, labels: e.target.value.split(', ') })}
          placeholder="Labels (comma-separated)"
        />
        <input
          type="text"
          className="w-full p-2 mb-4 border rounded"
          value={formData.assignees.join(', ') || ''}
          onChange={(e) => setFormData({ ...formData, assignees: e.target.value.split(', ') })}
          placeholder="Assignees (comma-separated IDs)"
        />
        <input
          type="date"
          className="w-full p-2 mb-4 border rounded"
          value={formData.dueDate || ''}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
        />
        <div className="mb-4">
          <h3 className="text-lg">Comments</h3>
          {formData.comments.map(comment => (
            <p key={comment._id} className="p-2 border-b">
              {comment.text} - {new Date(comment.createdAt).toLocaleString()}
            </p>
          ))}
          <input
            type="text"
            className="w-full p-2 mb-2 border rounded"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add comment"
          />
          <button className="bg-blue-500 text-white p-2 rounded" onClick={handleAddComment}>
            Add Comment
          </button>
        </div>
        <button className="bg-green-500 text-white p-2 rounded mr-2" onClick={handleUpdate}>
          Save
        </button>
        <button className="bg-red-500 text-white p-2 rounded" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default CardModal;