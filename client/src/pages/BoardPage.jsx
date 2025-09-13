import KanbanBoard from '../components/board/KanbanBoard';
import { useParams } from 'react-router-dom';

export default function BoardPage() {
  const { boardId } = useParams();
  return <KanbanBoard boardId={boardId} />;
}