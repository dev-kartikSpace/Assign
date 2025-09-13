import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import List from '../components/board/List.jsx';
import CreateList from '../components/board/CreateList.jsx';


import { useAuth } from '../hooks/useAuth.jsx';
import { useSocket } from '../hooks/useSocket.jsx';

export default function WorkspaceBoardView() {
  const { workspaceId } = useParams();
  const { user, loading } = useAuth();
  const { socket, boardData, users } = useSocket(workspaceId); // Use workspaceId for socket room
  const [boards, setBoards] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || loading) return;
    const fetchBoards = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5001/api/workspaces/${workspaceId}`, {
          headers: { 'x-auth-token': token },
        });
        setBoards(res.data.data.boards);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch boards');
      }
    };
    fetchBoards();
  }, [workspaceId, user, loading]);

  useEffect(() => {
    if (boardData) {
      setBoards(boardData); // Update boards from socket events
    }
  }, [boardData]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId.includes('list-')) {
      // Handle list drag (within a board)
      const boardId = active.data.current.boardId;
      const board = boards.find((b) => b._id === boardId);
      const lists = [...board.lists];
      const oldIndex = lists.findIndex((list) => list._id === activeId.replace('list-', ''));
      const newIndex = lists.findIndex((list) => list._id === overId.replace('list-', ''));

      if (oldIndex !== newIndex) {
        const [movedList] = lists.splice(oldIndex, 1);
        lists.splice(newIndex, 0, movedList);
        const updatedLists = lists.map((list, index) => ({ ...list, position: index }));
        const updatedBoard = { ...board, lists: updatedLists };
        setBoards(boards.map((b) => (b._id === boardId ? updatedBoard : b)));

        await axios.put(
          `http://localhost:5001/api/lists/${activeId.replace('list-', '')}`,
          { position: newIndex },
          { headers: { 'x-auth-token': localStorage.getItem('token') } }
        );
        socket.emit('boardUpdated', { workspaceId, boards });
      }
    } else {
      // Handle card drag (within or across boards)
      const sourceListId = active.data.current.listId;
      const sourceBoardId = boards.find((b) => b.lists.some((l) => l._id === sourceListId))?._id;
      const destListId = over.data.current?.listId || over.id.replace('list-', '');
      const destBoardId = boards.find((b) => b.lists.some((l) => l._id === destListId))?._id;
      const newPosition = over.data.current?.position || 0;

      if (sourceListId !== destListId || sourceBoardId !== destBoardId) {
        await axios.patch(
          `http://localhost:5001/api/cards/${activeId}/move`,
          { listId: destListId, boardId: destBoardId, position: newPosition },
          { headers: { 'x-auth-token': localStorage.getItem('token') } }
        );
        socket.emit('boardUpdated', { workspaceId, boards });
      }
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="p-4 min-h-screen">
      <h1 className="text-3xl mb-4">Workspace Boards</h1>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        {boards.map((board) => (
          <div key={board._id} className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{board.title}</h2>
            <SortableContext
              items={board.lists.map((list) => `list-${list._id}`)}
              strategy={horizontalListSortingStrategy}
            >
              <div className="flex gap-4 overflow-x-auto">
                {board.lists
                  .sort((a, b) => a.position - b.position)
                  .map((list) => (
                    <List key={list._id} list={list} cards={list.cards} boardId={board._id} />
                  ))}
                <CreateList boardId={board._id} position={board.lists.length || 0} />
              </div>
            </SortableContext>
          </div>
        ))}
      </DndContext>
    </div>
  );
}