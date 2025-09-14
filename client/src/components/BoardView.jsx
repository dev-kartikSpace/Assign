import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AuthContext } from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext";
import Navbar from "./Navbar";

const SortableCard = ({ card, handleDeleteCard }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: `card-${card._id}` });


  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-4 mb-3 rounded-lg shadow-md flex justify-between items-center border border-indigo-200 hover:shadow-lg transition-shadow duration-200"
    >
      <span className="text-indigo-900 font-medium truncate">{card.title}</span>
      <button
        onClick={() => handleDeleteCard(card._id)}
        className="text-red-600 hover:text-red-800 font-semibold"
        aria-label="Delete card"
      >
        Delete
      </button>
    </div>
  );
};

const BoardColumn = ({
  board,
  cards,
  handleCreateCard,
  newCard,
  setNewCard,
}) => {
  const handleAddCardClick = () => {
    setNewCard({ title: "", boardId: board._id });
  };

  const handleCardSubmit = (e) => {
    e.preventDefault();
    if (newCard.boardId === board._id && newCard.title) {
      handleCreateCard(board._id);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl w-72 min-h-[350px] flex-shrink-0 shadow-md border border-indigo-100">
      <h2
        className="text-2xl font-bold text-indigo-900 mb-5 truncate"
        title={board.title}
      >
        {board.title}
      </h2>
      <form onSubmit={handleCardSubmit} className="mb-6">
        <input
          type="text"
          value={newCard.boardId === board._id ? newCard.title : ""}
          onChange={(e) =>
            setNewCard({
              ...newCard,
              title: e.target.value,
              boardId: board._id,
            })
          }
          placeholder="New Task Title"
          className="w-full p-3 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none mb-2 text-indigo-900"
          disabled={newCard.boardId !== board._id}
          aria-label={`New task title for board ${board.title}`}
          required={newCard.boardId === board._id}
        />
        <button
          type="submit"
          className="w-full py-5  bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 font-semibold shadow-md mb-6"
          disabled={newCard.boardId !== board._id || !newCard.title}
        >
          Add Task
        </button>

        {!newCard.boardId && (
          <button
            type="button"
            onClick={handleAddCardClick}
            className="mt-3 w-full py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition duration-200 font-semibold shadow-md"
          >
            Add Task
          </button>
        )}
      </form>
<SortableContext
  id={`board-${board._id}`}
  items={cards.filter((c) => c.boardId === board._id).map((c) => `card-${c._id}`)}
  strategy={verticalListSortingStrategy}
>
  {cards
    .filter((card) => card.boardId === board._id)
    .sort((a, b) => a.position - b.position)
    .map((card) => (
      <SortableCard key={card._id} card={card} handleDeleteCard={handleDeleteCard} />
    ))}
</SortableContext>

    </div>
  );
};

const BoardView = () => {
  const { boardId } = useParams();
  const { user, token } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const [boards, setBoards] = useState([]);
  const [cards, setCards] = useState([]);
  const [newCard, setNewCard] = useState({ title: "", boardId: "" });
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    const fetchBoardsAndCards = async () => {
      try {
        const boardsResponse = await fetch(
          `http://localhost:5001/api/boards?workspaceId=${boardId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const cardsResponse = await fetch(
          `http://localhost:5001/api/cards?workspaceId=${boardId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const boardsData = await boardsResponse.json();
        const cardsData = await cardsResponse.json();
        if (boardsData.error || cardsData.error)
          throw new Error("Failed to fetch data");
        setBoards(boardsData);
        setCards(cardsData);
      } catch (err) {
        alert(err.message);
      }
    };
    if (user && token) {
      fetchBoardsAndCards();
      socket?.emit("join_workspace", boardId);
    }
  }, [user, token, boardId, socket]);

  useEffect(() => {
    if (socket) {
      socket.on("card_moved", ({ cardId, newBoardId, newPosition }) => {
        setCards((prev) =>
          prev.map((card) =>
            card._id === cardId
              ? { ...card, boardId: newBoardId, position: newPosition }
              : card
          )
        );
      });
      socket.on("card_deleted", ({ cardId }) => {
        setCards((prev) => prev.filter((card) => card._id !== cardId));
      });
      return () => {
        socket.off("card_moved");
        socket.off("card_deleted");
      };
    }
  }, [socket]);

const handleCreateCard = async (boardId) => {
  try {
    const response = await fetch("http://localhost:5001/api/cards", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: newCard.title,
        boardId,
        position: cards.filter((c) => c.boardId === boardId).length,
      }),
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    // Option A: append only if not already there
    setCards((prev) =>
      prev.some((c) => c._id === data._id) ? prev : [...prev, data]
    );

    // Option B (cleaner): refetch cards from backend after creation
    // await fetchBoardsAndCards();
    
    setNewCard({ title: "", boardId: "" });
  } catch (err) {
    alert(err.message);
  }
};


  const handleDeleteCard = async (cardId) => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/cards/${cardId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      setCards(cards.filter((c) => c._id !== cardId));
      socket.emit("card_deleted", { workspaceId: boardId, cardId });
    } catch (err) {
      alert(err.message);
    }
  };

const handleDragEnd = async (event) => {
  const { active, over } = event;
  if (!over) return;

  // card id without "card-" prefix
  const cardId = active.id.replace("card-", "");

  let newBoardId;
  let newPosition;

  if (over.id.startsWith("card-")) {
    // dropped on another card
    const overCardId = over.id.replace("card-", "");
    const overCard = cards.find((c) => c._id === overCardId);
    newBoardId = overCard.boardId;

    const cardsInBoard = cards
      .filter((c) => c.boardId === newBoardId)
      .sort((a, b) => a.position - b.position);

    newPosition = cardsInBoard.findIndex((c) => c._id === overCardId);
  } else if (over.id.startsWith("board-")) {
    // dropped on empty board space
    newBoardId = over.id.replace("board-", "");
    const cardsInBoard = cards.filter((c) => c.boardId === newBoardId);
    newPosition = cardsInBoard.length;
  }

  try {
    const response = await fetch(
      `http://localhost:5001/api/cards/${cardId}/move`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newBoardId, newPosition }),
      }
    );
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    setCards((prev) =>
      prev.map((card) =>
        card._id === cardId
          ? { ...card, boardId: newBoardId, position: newPosition }
          : card
      )
    );

    socket.emit("card_moved", {
      cardId,
      newBoardId,
      newPosition,
      workspaceId: boardId,
    });
  } catch (err) {
    alert(err.message);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="text-4xl font-extrabold text-indigo-900 mb-8">
          Kanban Board
        </h1>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="flex space-x-6 overflow-x-auto pb-6">
            {boards.map((board) => (
              <BoardColumn
                key={board._id}
                board={board}
                cards={cards}
                handleCreateCard={handleCreateCard}
                newCard={newCard}
                setNewCard={setNewCard}
              />
            ))}
          </div>
        </DndContext>
      </div>
    </div>
  );
};

export default BoardView;
