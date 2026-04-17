import React, { useState, useRef, useEffect } from 'react';
import type { Note } from '../types';

interface StickyNoteProps {
  note: Note;
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

export const StickyNote: React.FC<StickyNoteProps> = ({
  note,
  onUpdate,
  onDelete,
  onToggleComplete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(note.content);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const noteRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'TEXTAREA' || (e.target as HTMLElement).tagName === 'BUTTON') {
      return;
    }

    setIsDragging(true);
    const rect = noteRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        onUpdate(note.id, {
          position: {
            x: e.clientX - dragOffset.x,
            y: e.clientY - dragOffset.y,
          },
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, note.id, onUpdate]);

  const handleSave = () => {
    onUpdate(note.id, { content });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setContent(note.content);
    setIsEditing(false);
  };

  return (
    <div
      ref={noteRef}
      className={`sticky-note ${note.color} ${note.completed ? 'completed' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{
        left: `${note.position.x}px`,
        top: `${note.position.y}px`,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="note-header">
        <input
          type="checkbox"
          checked={note.completed}
          onChange={() => onToggleComplete(note.id)}
          title={note.completed ? 'Mark as incomplete' : 'Mark as complete'}
        />
        <button
          className="delete-btn"
          onClick={() => onDelete(note.id)}
          title="Delete note"
        >
          ✕
        </button>
      </div>

      {isEditing ? (
        <div className="note-edit">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            autoFocus
            rows={6}
          />
          <div className="edit-actions">
            <button onClick={handleSave}>Save</button>
            <button onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      ) : (
        <div
          className="note-content"
          onDoubleClick={() => setIsEditing(true)}
          title="Double-click to edit"
        >
          {note.content || 'Double-click to edit...'}
        </div>
      )}
    </div>
  );
};
