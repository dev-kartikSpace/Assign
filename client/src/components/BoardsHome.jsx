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
      <span className="text-gray-800 truncate">{card.title}</span>
      <button
        onClick={() => handleDeleteCard(card._id)}
        className="text-red-600 hover:text-red-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 rounded"
        aria-label={`Delete card ${card.title}`}
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
    <div className="bg-white p-5 rounded-xl shadow-lg min-w-[280px] max-w-[300px] h-[480px] flex-shrink-0 border border-indigo-200 flex flex-col">
      <div className="flex justify-between items-center mb-5">
        <h2
          className="text-lg md:text-xl font-bold text-white px-3 py-1 rounded-md truncate"
          style={{ backgroundColor: color }}
          title={board.title}
        >
          {board.title} ({filteredCards.length})
        </h2>
        <button
          onClick={() => handleDeleteBoard(board._id)}
          className="px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          aria-label={`Delete board ${board.title}`}
        >
          Delete
        </button>
      </div>
      {!isAdding && (
        <button
          onClick={handleAddTaskClick}
          className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 font-semibold shadow-md mb-4 whitespace-nowrap"
          disabled={isAdding}
          aria-label={`Add task to board ${board.title}`}
        >
          Add Task
        </button>
      )}
      {isAdding && (
        <form onSubmit={handleCardSubmit} className="mb-3">
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
            aria-label={`New task title for board ${board.title}`}
          />
          <div className="flex space-x-2">
            <button
              type="submit"
              className="flex-1 p-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              disabled={!newCard.title.trim()}
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 p-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      <div className="flex-grow min-h-[180px] overflow-y-auto">
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600">
            Something Went Wrong
          </h2>
          <p className="mt-3 text-gray-600 break-words">
            Please try refreshing the page or contact support.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 focus:outline-none focus:ring-4 focus:ring-blue-400"
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
  const [changeHistory, setChangeHistory] = useState([]);
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
        if (err.message.includes("401")) {
          logout();
          navigate("/login");
        } else {
          toast.error(err.message, { position: "bottom-right" });
        }
      }
    };

    const fetchChangeHistory = async () => {
      if (!token) return;
      try {
        const response = await fetch(
          `http://localhost:5001/api/workspaces/${workspaceId}/history`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const history = await response.json();
        if (Array.isArray(history)) {
          setChangeHistory(history); // Set the full history (last 10 from backend)
        }
      } catch (err) {
        console.error("Failed to fetch change history:", err.message);
        toast.error("Failed to load change history", {
          position: "bottom-right",
        });
      }
    };

    fetchBoardsAndCards();
    fetchChangeHistory();
    socket?.emit("join_workspace", workspaceId);

    return () => {
      isMounted = false;
    };
  }, [user, token, workspaceId, socket, login, logout, navigate]);

  useEffect(() => {
    if (socket && workspaceId) {
      const updateChangeHistory = (change) => {
        setChangeHistory((prev) => {
          const updatedHistory = [change, ...prev].slice(0, 10); // Keep last 10
          return updatedHistory;
        });
      };

      socket.on("initial_state", ({ boards, cards }) => {
        setBoards(boards);
        setCards(cards);
      });
      socket.on("card_moved", ({ cardId, newBoardId, newPosition }) => {
        const card = cards.find((c) => c._id === cardId);
        if (card) {
          updateChangeHistory({
            action: "card_moved",
            title: card.title,
            fromBoardId: card.boardId,
            toBoardId: newBoardId,
            timestamp: new Date().toISOString(),
            user: user?.name || "Unknown",
          });
        }
        setCards((prev) =>
          prev.map((card) =>
            card._id === cardId
              ? { ...card, boardId: newBoardId, position: newPosition }
              : card
          )
        );
      });
      socket.on("card_created", ({ card }) => {
        if (!cards.some((c) => c._id === card._id)) {
          setCards((prev) => [...prev, card]);
          updateChangeHistory({
            action: "card_created",
            title: card.title,
            boardId: card.boardId,
            timestamp: new Date().toISOString(),
            user: user?.name || "Unknown",
          });
        }
      });
      socket.on("card_deleted", ({ cardId }) => {
        const card = cards.find((c) => c._id === cardId);
        if (card) {
          updateChangeHistory({
            action: "card_deleted",
            title: card.title,
            boardId: card.boardId,
            timestamp: new Date().toISOString(),
            user: user?.name || "Unknown",
          });
        }
        setCards((prev) => prev.filter((card) => card._id !== cardId));
      });
      socket.on("board_created", ({ board }) => {
        if (!boards.some((b) => b._id === board._id)) {
          setBoards((prev) => [...prev, board]);
          updateChangeHistory({
            action: "board_created",
            title: board.title,
            timestamp: new Date().toISOString(),
            user: user?.name || "Unknown",
          });
          toast.success(`New board "${board.title}" created`, {
            position: "bottom-right",
          });
        }
      });
      socket.on("board_deleted", ({ boardId }) => {
        const board = boards.find((b) => b._id === boardId);
        if (board) {
          updateChangeHistory({
            action: "board_deleted",
            title: board.title,
            timestamp: new Date().toISOString(),
            user: user?.name || "Unknown",
          });
        }
        setBoards((prev) => prev.filter((board) => board._id !== boardId));
      });
      socket.on("user_invited", ({ userId }) => {
        updateChangeHistory({
          action: "user_invited",
          userId,
          timestamp: new Date().toISOString(),
          user: user?.name || "Unknown",
        });
        toast.success(`User ${userId} invited to workspace`, {
          position: "bottom-right",
        });
      });

      return () => {
        socket.off("initial_state");
        socket.off("card_moved");
        socket.off("card_created");
        socket.off("card_deleted");
        socket.off("board_created");
        socket.off("board_deleted");
        socket.off("user_invited");
      };
    }
  }, [socket, cards, boards, user]);

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
        if (socket) {
          socket.emit("board_created", { board: data, workspaceId });
        }
      }
      setNewBoard("");
      toast.success(`Board "${data.title}" created successfully`, {
        position: "bottom-right",
      });
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
      if (data.error) {
        throw new Error(data.error.message || "Failed to delete card");
      }
      setCards((prev) => prev.filter((c) => c._id !== cardId));
      if (socket) {
        socket.emit("card_deleted", { workspaceId, cardId });
      }
      toast.success("Card deleted successfully", { position: "bottom-right" });
    } catch (err) {
      toast.error(err.message || "Failed to delete card", {
        position: "bottom-right",
      });
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
      toast.success("Board deleted successfully", { position: "bottom-right" });
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
        toast.error(err.message, { position: "bottom-right" });
      }
    }
  };
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
        <Navbar />
        <main className="max-w-7xl mx-auto p-6 sm:p-8 min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row lg:space-x-8">
          {/* Main Content - Boards Grid */}
          <section className="flex-1 min-w-0">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-indigo-900 mb-8 tracking-tight">
              Kanban Boards
            </h1>
            <form
              onSubmit={handleCreateBoard}
              className="mb-10 flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0"
            >
              <input
                type="text"
                value={newBoard}
                onChange={(e) => setNewBoard(e.target.value)}
                placeholder="New Board Title"
                className="flex-grow p-3 border border-indigo-300 rounded-md focus:ring-4 focus:ring-indigo-400 focus:outline-none text-sm shadow-sm"
                aria-label="New Board Title"
              />
              <button
                type="submit"
                className="px-8 py-3 bg-indigo-700 text-white rounded-lg hover:bg-indigo-800 transition duration-200 text-sm font-semibold shadow-md focus:outline-none focus:ring-4 focus:ring-indigo-500 active:scale-95"
                aria-label="Create Board"
              >
                Create Board
              </button>
            </form>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 min-w-full">
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
          </section>

          {/* Sidebar - Recent Changes */}
          <aside className="w-full lg:w-80 mt-8 lg:mt-0 bg-white rounded-lg shadow-md border border-indigo-200 p-6 max-h-[80vh] overflow-y-auto lg:sticky lg:top-28">
            <h2 className="text-2xl font-bold text-indigo-900 mb-6 border-b border-indigo-300 pb-2">
              Recent Changes
            </h2>
            {changeHistory.length === 0 ? (
              <p className="text-gray-500 text-center">No recent changes.</p>
            ) : (
              <ul className="space-y-3 text-gray-700 text-sm">
                {changeHistory.map((change, index) => {
                  const fromBoard = boards.find(
                    (b) => b._id === change.fromBoardId
                  );
                  const toBoard = boards.find((b) => b._id === change.toBoardId);
                  const fromBoardName = fromBoard
                    ? fromBoard.title
                    : change.fromBoardId || "Unknown Board";
                  const toBoardName = toBoard
                    ? toBoard.title
                    : change.toBoardId || "Unknown Board";

                  return (
                    <li key={index} className="leading-relaxed">
                      <span className="font-semibold text-indigo-800">
                        {new Date(change.timestamp).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                          hour12: true,
                          timeZone: "Asia/Kolkata",
                        })}
                      </span>{" "}
                      - <strong className="capitalize">{change.user}</strong>{" "}
                      <strong className="capitalize">
                        {change.action.replace(/_/g, " ")}
                      </strong>
                      :{" "}
                      <em className="text-indigo-600">
                        {change.title || change.userId || "N/A"}
                      </em>
                      {change.fromBoardId &&
                        change.toBoardId &&
                        change.fromBoardId !== change.toBoardId && (
                          <span>
                            {" "}
                            (
                            <span className="text-gray-500">
                              from Board {fromBoardName}
                            </span>{" "}
                            to{" "}
                            <span className="text-gray-500">
                              Board {toBoardName}
                            </span>
                            )
                          </span>
                        )}
                      {change.fromBoardId && !change.toBoardId && (
                        <span>
                          {" "}
                          (
                          <span className="text-gray-500">
                            from Board {fromBoardName}
                          </span>
                          )
                        </span>
                      )}
                      {change.toBoardId && !change.fromBoardId && (
                        <span>
                          {" "}
                          (
                          <span className="text-gray-500">
                            to Board {toBoardName}
                          </span>
                          )
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </aside>
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default BoardsHome;