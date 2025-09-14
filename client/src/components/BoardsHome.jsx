import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { toast } from "react-toastify";
import { useDroppable } from "@dnd-kit/core";

const colorPalette = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEEAD",
  "#D4A4EB",
];

const DroppableColumn = ({ boardId, children }) => {
  const { setNodeRef } = useDroppable({
    id: boardId,
    data: { type: "board", boardId },
  });

  return (
    <div ref={setNodeRef} className="w-full min-h-[200px]">
      {children}
    </div>
  );
};

const SortableCard = ({ card, handleDeleteCard }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: card._id,
      data: { type: "card", cardId: card._id, boardId: card.boardId },
    });

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
      className="bg-white p-4 mb-3 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 flex justify-between items-center border border-indigo-100"
    >
      <span className="text-gray-800">{card.title}</span>
      <button
        onClick={() => handleDeleteCard(card._id)}
        className="text-red-600 hover:text-red-800 text-sm"
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
  handleDeleteBoard,
  handleDeleteCard,
  color,
}) => {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddTaskClick = () => {
    setIsAdding(true);
    setNewCard({ title: "", boardId: board._id });
  };

  const handleCardSubmit = (e) => {
    e.preventDefault();
    if (newCard.title.trim() && newCard.boardId === board._id) {
      handleCreateCard(board._id)
        .then(() => {
          setIsAdding(false);
          setNewCard({ title: "", boardId: "" });
        })
        .catch((err) => {
          toast.error(err.message || "Failed to add task", {
            position: "bottom-right",
          });
        });
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setNewCard({ title: "", boardId: "" });
  };

  const filteredCards = cards
    .filter((c) => c.boardId === board._id)
    .sort((a, b) => a.position - b.position);

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg w-72 min-h-[400px] flex-shrink-0 border border-indigo-200">
      <div className="flex justify-between items-center mb-6">
        <h2
          className="text-xl font-bold text-white px-3 py-1 rounded-md truncate"
          style={{ backgroundColor: color }}
          title={board.title}
        >
          {board.title} ({filteredCards.length})
        </h2>
        <button
          onClick={() => handleDeleteBoard(board._id)}
          className="px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200 text-sm"
        >
          Delete
        </button>
      </div>
      {!isAdding && (
        <button
          onClick={handleAddTaskClick}
          className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 font-semibold shadow-md mb-6"
          disabled={isAdding}
        >
          Add Task
        </button>
      )}
      {isAdding && (
        <form onSubmit={handleCardSubmit} className="mb-4">
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
            className="w-full p-2 mb-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
            autoFocus
          />
          <div className="flex space-x-2">
            <button
              type="submit"
              className="flex-1 p-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200 text-sm"
              disabled={!newCard.title.trim()}
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 p-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition duration-200 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      <div className="min-h-[200px]">
        <DroppableColumn boardId={board._id}>
          <SortableContext
            items={filteredCards.map((c) => c._id)}
            strategy={verticalListSortingStrategy}
          >
            {filteredCards.map((card) => (
              <SortableCard
                key={card._id}
                card={card}
                handleDeleteCard={handleDeleteCard}
              />
            ))}
          </SortableContext>
        </DroppableColumn>
      </div>
    </div>
  );
};

const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (event) => {
      console.error("Global error caught:", event.error);
      setHasError(true);
    };
    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold text-red-600">
            Something Went Wrong
          </h2>
          <p className="mt-2 text-gray-600">
            Please try refreshing the page or contact support.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return children;
};

const BoardsHome = () => {
  const { workspaceId } = useParams();
  const { user, token, login, logout } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const [boards, setBoards] = useState([]);
  const [cards, setCards] = useState([]);
  const [newCard, setNewCard] = useState({ title: "", boardId: "" });
  const [newBoard, setNewBoard] = useState("");
  const navigate = useNavigate();
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    let isMounted = true;
    const fetchBoardsAndCards = async () => {
      if (!token) return;
      try {
        const boardsResponse = await fetch(
          `http://localhost:5001/api/boards?workspaceId=${workspaceId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!boardsResponse.ok)
          throw new Error(`HTTP error! status: ${boardsResponse.status}`);
        const boardsData = await boardsResponse.json();
        console.log("Fetched boards data:", boardsData);
        if (boardsData.error)
          throw new Error(
            boardsData.error?.message || "Failed to fetch boards"
          );

        const cardsPromises = boardsData.map((board) =>
          fetch(`http://localhost:5001/api/cards?boardId=${board._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((res) => {
            if (!res.ok) {
              console.warn(
                `Failed to fetch cards for board ${board._id}: ${res.status} - ${res.statusText}`
              );
              return [];
            }
            return res.json();
          })
        );
        const cardsArrays = await Promise.all(cardsPromises);
        const allCards = cardsArrays.flat().filter((card) => card && card._id);
        if (isMounted) {
          setBoards(boardsData);
          setCards(allCards);
        }
      } catch (err) {
        console.error("Fetch error:", err.message);
        if (err.message.includes("401")) {
          logout();
          navigate("/login");
        } else {
          toast.error(err.message, { position: "bottom-right" });
        }
      }
    };
    fetchBoardsAndCards();
    socket?.emit("join_workspace", workspaceId);

    return () => {
      isMounted = false;
    };
  }, [user, token, workspaceId, socket, login, logout, navigate]);

  useEffect(() => {
    if (socket && workspaceId) {
      const handleCardCreated = ({ card }) => {
        if (!cards.some((c) => c._id === card._id)) {
          console.log("Adding new card:", card);
          setCards((prev) => [...prev, card]);
        }
      };

      socket.on("initial_state", ({ boards, cards }) => {
        setBoards(boards);
        setCards(cards);
      });
      socket.on("card_moved", ({ cardId, newBoardId, newPosition }) => {
        setCards((prev) =>
          prev.map((card) =>
            card._id === cardId
              ? { ...card, boardId: newBoardId, position: newPosition }
              : card
          )
        );
      });
      socket.on("card_created", handleCardCreated);
      socket.on("card_deleted", ({ cardId }) => {
        setCards((prev) => prev.filter((card) => card._id !== cardId));
      });
      socket.on("board_created", ({ board }) => {
        if (!boards.some((b) => b._id === board._id)) {
          setBoards((prev) => [...prev, board]);
        }
      });
      socket.on("board_deleted", ({ boardId }) => {
        setBoards((prev) => prev.filter((board) => board._id !== boardId));
      });
      socket.on("user_invited", ({ userId }) => {
        toast.success(`User ${userId} invited to workspace`, {
          position: "bottom-right",
        });
      });

      return () => {
        socket.off("initial_state");
        socket.off("card_moved");
        socket.off("card_created", handleCardCreated);
        socket.off("card_deleted");
        socket.off("board_created");
        socket.off("board_deleted");
        socket.off("user_invited");
      };
    }
  }, [socket, cards, boards]);

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!token || !newBoard.trim()) return;
    try {
      const response = await fetch("http://localhost:5001/api/boards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newBoard,
          visibility: "workspace",
          workspaceId,
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      if (!boards.some((b) => b._id === data._id)) {
        setBoards((prev) => [...prev, data]);
        socket.emit("board_created", { board: data, workspaceId });
      }
      setNewBoard("");
    } catch (err) {
      toast.error(err.message, { position: "bottom-right" });
    }
  };

  const handleCreateCard = async (boardId) => {
    if (!token) return;
    try {
      const response = await fetch("http://localhost:5001/api/cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newCard.title.trim(),
          boardId,
          position: cards.filter((c) => c.boardId === boardId).length,
        }),
      });
      const data = await response.json();
      if (data.error)
        throw new Error(data.error.message || "Failed to create card");
      if (!cards.some((c) => c._id === data._id)) {
        setCards((prev) => [...prev, data]);
        socket.emit("card_created", { card: data, workspaceId });
      }
      return Promise.resolve();
    } catch (err) {
      console.error("Create card error:", err.message);
      throw err;
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!token) return;
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
      socket.emit("card_deleted", { workspaceId, cardId });
    } catch (err) {
      toast.error(err.message, { position: "bottom-right" });
    }
  };

  const handleDeleteBoard = async (boardId) => {
    if (!token) return;
    try {
      const response = await fetch(
        `http://localhost:5001/api/boards/${boardId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      setBoards(boards.filter((b) => b._id !== boardId));
      socket.emit("board_deleted", { workspaceId, boardId });
    } catch (err) {
      toast.error(err.message, { position: "bottom-right" });
    }
  };

  const handleDragEnd = async ({ active, over }) => {
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData || activeData.type !== "card") return;

    const cardId = activeData.cardId;
    const currentCard = cards.find((c) => c._id === cardId);
    if (!currentCard) return;

    let newBoardId = currentCard.boardId;
    let newPosition = currentCard.position;

    if (overData.type === "card") {
      newBoardId = overData.boardId;
      const cardsInBoard = cards
        .filter((c) => c.boardId === newBoardId && c._id !== cardId)
        .sort((a, b) => a.position - b.position);

      newPosition = cardsInBoard.findIndex((c) => c._id === overData.cardId);
      if (newPosition === -1) newPosition = cardsInBoard.length;
    } else if (overData.type === "board") {
      newBoardId = overData.boardId;
      const cardsInBoard = cards.filter((c) => c.boardId === newBoardId);
      newPosition = cardsInBoard.length;
    }

    if (
      currentCard.boardId !== newBoardId ||
      currentCard.position !== newPosition
    ) {
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
        if (!response.ok) throw new Error(data.error?.message || "Move failed");
        console.log("Move successful:", data);

        setCards((prev) =>
          prev.map((c) =>
            c._id === cardId
              ? { ...c, boardId: newBoardId, position: newPosition }
              : c
          )
        );

        socket.emit("card_moved", {
          cardId,
          newBoardId,
          newPosition,
          workspaceId,
        });
      } catch (err) {
        console.error("Move failed:", err.message);
        toast.error(err.message, { position: "bottom-right" });
      }
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
        <Navbar />
        <div className="container mx-auto p-6">
          <h1 className="text-4xl font-bold text-indigo-900 mb-8">
            Kanban Boards
          </h1>
          <form onSubmit={handleCreateBoard} className="mb-8">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newBoard}
                onChange={(e) => setNewBoard(e.target.value)}
                placeholder="New Board Title"
                className="flex-1 p-3 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200 text-sm"
              >
                Create Board
              </button>
            </div>
          </form>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="flex space-x-6 overflow-x-auto pb-6">
              {boards.map((board, index) => (
                <BoardColumn
                  key={board._id}
                  board={board}
                  cards={cards}
                  handleCreateCard={handleCreateCard}
                  newCard={newCard}
                  setNewCard={setNewCard}
                  handleDeleteBoard={handleDeleteBoard}
                  handleDeleteCard={handleDeleteCard}
                  color={colorPalette[index % colorPalette.length]}
                />
              ))}
            </div>
          </DndContext>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default BoardsHome;