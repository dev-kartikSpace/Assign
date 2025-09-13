import { useEffect, useState } from 'react';
import axios from 'axios';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import List from './List.jsx';
import CreateList from './CreateList.jsx';

export default function KanbanBoard({ boardId }) {
  const [board, setBoard] = useState(null);
  const [error, setError] = useState(null);
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/boards/${boardId}`, {
          headers: { 'x-auth-token': localStorage.getItem('token') },
        });
        setBoard(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load board');
      }
    };
    fetchBoard();
  }, [boardId]);

  const handleListCreated = (list) => {
    setBoard((prev) => ({ ...prev, lists: [...(prev.lists || []), list] }));
  };

  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!board) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded" style={{ backgroundColor: board.color || '#0ea5e9' }} />
        <h1 className="text-2xl font-semibold">{board.title}</h1>
      </div>
      <DndContext sensors={sensors}>
        <SortableContext strategy={horizontalListSortingStrategy} items={(board.lists || []).map((l) => l._id)}>
          <div className="flex gap-4 overflow-x-auto">
            {(board.lists || [])
              .sort((a, b) => a.position - b.position)
              .map((list) => (
                <List key={list._id} list={list} />
              ))}
            <CreateList boardId={board._id} position={(board.lists || []).length} onCreated={handleListCreated} />
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

