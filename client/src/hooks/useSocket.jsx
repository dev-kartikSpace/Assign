import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

export function useSocket(roomId) {
  const socketRef = useRef(null);
  const [boardData, setBoardData] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const socket = io('http://localhost:5001');
    socketRef.current = socket;
    if (roomId) socket.emit('joinWorkspace', roomId);

    const onBoards = (data) => setBoardData(data);
    socket.on('boards', onBoards);

    return () => {
      if (roomId) socket.emit('leaveWorkspace', roomId);
      socket.off('boards', onBoards);
      socket.disconnect();
    };
  }, [roomId]);

  return { socket: socketRef.current, boardData, users };
}

