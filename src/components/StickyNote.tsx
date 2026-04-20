import React, { useState } from 'react';
import type { Note, NotePriority } from '../types';

interface StickyNoteProps {
  note: Note;
  index: number;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

export const StickyNote: React.FC<StickyNoteProps> = ({
  note,
  index,
  isEditing,
  onEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
  onToggleComplete,
}) => {
  const [content, setContent] = useState(note.content);

  // Format date for display
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Just now';

    // Handle Firestore Timestamp object
    let dateMs: number;
    if (timestamp?.toDate) {
      // Firestore Timestamp
      dateMs = timestamp.toDate().getTime();
    } else if (timestamp?.seconds) {
      // Firestore Timestamp object format
      dateMs = timestamp.seconds * 1000;
    } else {
      // Regular number timestamp
      dateMs = timestamp;
    }

    const date = new Date(dateMs);
    if (isNaN(date.getTime())) return 'Just now';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const handleSave = () => {
    onUpdate(note.id, { content });
    onCancelEdit();
  };

  const handleCancel = () => {
    setContent(note.content);
    onCancelEdit();
  };

  const handlePriorityChange = (priority: NotePriority) => {
    onUpdate(note.id, { priority });
  };

  return (
    <div
      className={`sticky-note ${note.color} ${note.completed ? 'completed' : ''} ${isEditing ? 'editing' : ''} priority-${note.priority || 'normal'}`}
    >
      <div className="note-number">#{index}</div>

      <div className="note-header">
        <input
          type="checkbox"
          checked={note.completed}
          onChange={() => onToggleComplete(note.id)}
          title={note.completed ? 'Mark as incomplete' : 'Mark as complete'}
        />
        <div className="note-actions">
          {!isEditing && (
            <>
              <button
                className="edit-btn"
                onClick={onEdit}
                title="Edit note"
              >
                ✏️
              </button>
              <button
                className="delete-btn"
                onClick={() => onDelete(note.id)}
                title="Delete note"
              >
                🗑️
              </button>
            </>
          )}
        </div>
      </div>

      <div className="note-meta">
        <span className="note-date" title={new Date(note.createdAt).toLocaleString()}>
          📅 {formatDate(note.createdAt)}
        </span>
        <select
          className="priority-select"
          value={note.priority || 'normal'}
          onChange={(e) => handlePriorityChange(e.target.value as NotePriority)}
          title="Set priority"
        >
          <option value="normal">⚪ Normal</option>
          <option value="important">🟡 Important</option>
          <option value="urgent">🔴 Urgent</option>
        </select>
      </div>

      {isEditing ? (
        <div className="note-edit">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            autoFocus
            rows={6}
            placeholder="Add tasks (one per line)&#10;Use '- Task name' for checkable items"
          />
          <div className="edit-actions">
            <button onClick={handleSave}>Save</button>
            <button onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="note-content">
          {note.content ? (
            <ul className="task-list">
              {note.content.split('\n').map((line, idx) => {
                const trimmedLine = line.trim();
                if (!trimmedLine) return null;

                // Check if line has the `- ` prefix
                const hasPrefix = trimmedLine.startsWith('- ');
                const taskText = hasPrefix ? trimmedLine.substring(2) : trimmedLine;

                // Check if completed (either `- [x] text` or just `[x] text`)
                const isCompleted = taskText.startsWith('[x] ') || taskText.startsWith('[X] ');
                const displayText = isCompleted ? taskText.substring(4) : taskText;

                return (
                  <li key={idx} className="task-item">
                    <label className="task-label">
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={() => {
                          const lines = note.content.split('\n');
                          if (isCompleted) {
                            // Unchecking: remove [x] marker
                            lines[idx] = hasPrefix ? `- ${displayText}` : displayText;
                          } else {
                            // Checking: add [x] marker
                            lines[idx] = hasPrefix ? `- [x] ${displayText}` : `[x] ${displayText}`;
                          }
                          onUpdate(note.id, { content: lines.join('\n') });
                        }}
                      />
                      <span className={isCompleted ? 'task-completed' : ''}>
                        {displayText}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          ) : (
            'Click edit to add content...'
          )}
        </div>
      )}
    </div>
  );
};