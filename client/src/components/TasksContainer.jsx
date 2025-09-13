import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DndContext, useSensor, useSensors, PointerSensor, useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';

const SortableItem = ({ id, title, columnTitle, comments }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${columnTitle.toLowerCase()}__items`}
    >
      <p>{title}</p>
      <p className="comment">
        <Link to={`/comments/${columnTitle}/${id}`}>
          {comments ? 'View Comments' : 'Add Comment'}
        </Link>
      </p>
    </div>
  );
};

const DroppableColumn = ({ columnId, title, items }) => {
  const { setNodeRef } = useDroppable({ id: columnId });

  return (
    <div className={`${title.toLowerCase()}__wrapper`}>
      <h3>{title} Tasks</h3>
      <div ref={setNodeRef} className={`${title.toLowerCase()}__container`}>
        <SortableContext id={columnId} items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortableItem
              key={item.id}
              id={item.id}
              title={item.title}
              columnTitle={title}
              comments={item.comments}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

const TasksContainer = ({ socket }) => {
  const [tasks, setTasks] = useState({});
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    function fetchTasks() {
      fetch('http://localhost:5001/api')
        .then((res) => res.json())
        .then((data) => setTasks(data));
    }
    fetchTasks();
  }, []);

  useEffect(() => {
    socket.on('tasks', (data) => {
      setTasks(data);
    });
    return () => socket.off('tasks');
  }, [socket]);

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) return;
    if (active.id === over.id) return;

    const source = {
      droppableId: active.data.current.sortable.containerId,
      index: active.data.current.sortable.index,
    };

    let destinationDroppableId = over.id;
    if (over.data.current?.sortable) {
      destinationDroppableId = over.data.current.sortable.containerId;
    }

    const destination = {
      droppableId: destinationDroppableId,
      index: over.data.current?.sortable?.index ?? tasks[destinationDroppableId].items.length,
    };

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;

    socket.emit('taskDragged', {
      source,
      destination,
    });
  };

  return (
    <>
      <style>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
        }

        .pending__wrapper,
        .ongoing__wrapper,
        .completed__wrapper {
          flex: 1;
          min-width: 300px;
          background-color: #f4f4f4;
          border-radius: 8px;
          padding: 15px;
        }

        .pending__wrapper h3,
        .ongoing__wrapper h3,
        .completed__wrapper h3 {
          font-size: 1.5rem;
          margin-bottom: 15px;
          color: #333;
        }

        .pending__container,
        .ongoing__container,
        .completed__container {
          background-color: #fff;
          border-radius: 4px;
          padding: 10px;
          height: 400px; /* Fixed height for droppable area */
          overflow-y: auto; /* Allow scrolling if tasks exceed height */
        }

        .pending__items,
        .ongoing__items,
        .completed__items {
          padding: 10px;
          margin: 5px 0;
          background-color: #fff;
          border: 1px solid #ddd;
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          cursor: move;
        }

        .pending__items p,
        .ongoing__items p,
        .completed__items p {
          margin: 0;
          color: #333;
        }

        .comment {
          margin-top: 5px;
        }

        .comment a {
          color: #007bff;
          text-decoration: none;
          font-size: 0.9rem;
        }

        .comment a:hover {
          text-decoration: underline;
        }
      `}</style>
      <div className="container">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          {Object.entries(tasks).map(([key, task]) => (
            <DroppableColumn
              key={task.title}
              columnId={task.title}
              title={task.title}
              items={task.items}
            />
          ))}
        </DndContext>
      </div>
    </>
  );
};

export default TasksContainer;