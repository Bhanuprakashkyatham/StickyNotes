import { useState } from 'react';
import { StickyNote } from './components/StickyNote';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { Note, NoteColor } from './types';
import './App.css';

const COLORS: NoteColor[] = ['yellow', 'pink', 'blue', 'green', 'purple', 'orange'];

function App() {
  const [notes, setNotes] = useLocalStorage<Note[]>('sticky-notes', []);
  const [selectedColor, setSelectedColor] = useState<NoteColor>('yellow');

  const addNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      content: '',
      color: selectedColor,
      completed: false,
      position: {
        x: Math.random() * (window.innerWidth - 250) + 50,
        y: Math.random() * (window.innerHeight - 300) + 100,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes([...notes, newNote]);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(
      notes.map((note) =>
        note.id === id ? { ...note, ...updates, updatedAt: Date.now() } : note
      )
    );
  };

  const deleteNote = (id: string) => {
    if (confirm('Delete this note?')) {
      setNotes(notes.filter((note) => note.id !== id));
    }
  };

  const toggleComplete = (id: string) => {
    setNotes(
      notes.map((note) =>
        note.id === id ? { ...note, completed: !note.completed, updatedAt: Date.now() } : note
      )
    );
  };

  const clearCompleted = () => {
    if (confirm('Delete all completed notes?')) {
      setNotes(notes.filter((note) => !note.completed));
    }
  };

  const exportNotes = () => {
    const dataStr = JSON.stringify(notes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sticky-notes-backup-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importNotes = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (Array.isArray(imported)) {
          setNotes(imported);
          alert('Notes imported successfully!');
        }
      } catch (error) {
        alert('Invalid file format');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const stats = {
    total: notes.length,
    completed: notes.filter((n) => n.completed).length,
    active: notes.filter((n) => !n.completed).length,
  };

  return (
    <div className="app">
      <header className="toolbar">
        <h1>📝 Sticky Notes Tracker</h1>

        <div className="controls">
          <div className="color-picker">
            {COLORS.map((color) => (
              <button
                key={color}
                className={`color-btn ${color} ${selectedColor === color ? 'selected' : ''}`}
                onClick={() => setSelectedColor(color)}
                title={color}
              />
            ))}
          </div>

          <button className="add-btn" onClick={addNote}>
            + Add Note
          </button>

          <div className="stats">
            <span>Total: {stats.total}</span>
            <span>Active: {stats.active}</span>
            <span>Done: {stats.completed}</span>
          </div>

          <div className="file-actions">
            <button onClick={exportNotes} disabled={notes.length === 0}>
              💾 Export
            </button>
            <label className="import-btn">
              📂 Import
              <input
                type="file"
                accept=".json"
                onChange={importNotes}
                style={{ display: 'none' }}
              />
            </label>
            <button onClick={clearCompleted} disabled={stats.completed === 0}>
              🗑️ Clear Done
            </button>
          </div>
        </div>
      </header>

      <div className="notes-container">
        {notes.map((note) => (
          <StickyNote
            key={note.id}
            note={note}
            onUpdate={updateNote}
            onDelete={deleteNote}
            onToggleComplete={toggleComplete}
          />
        ))}
      </div>

      {notes.length === 0 && (
        <div className="empty-state">
          <h2>No notes yet!</h2>
          <p>Click "+ Add Note" to create your first sticky note</p>
        </div>
      )}
    </div>
  );
}

export default App;
