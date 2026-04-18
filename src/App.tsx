import { useState } from 'react';
import { StickyNote } from './components/StickyNote';
import { Auth } from './components/Auth';
import { useAuth } from './contexts/AuthContext';
import { useFirestore } from './hooks/useFirestore';
import type { Note, NoteColor } from './types';
import './App.css';

const COLORS: NoteColor[] = ['yellow', 'pink', 'blue', 'green', 'purple', 'orange'];

function App() {
  // Get current user from auth context
  const { currentUser, logout } = useAuth();

  // Use Firestore instead of localStorage
  const { notes, loading, addNote: addNoteToFirestore, updateNote: updateNoteInFirestore, deleteNote: deleteNoteFromFirestore } = useFirestore(currentUser?.uid);

  const [selectedColor, setSelectedColor] = useState<NoteColor>('yellow');

  // Show login page if not authenticated
  if (!currentUser) {
    return <Auth />;
  }

  const addNote = async () => {
    const newNote = {
      content: '',
      color: selectedColor,
      completed: false,
      position: {
        x: Math.random() * (window.innerWidth - 250) + 50,
        y: Math.random() * (window.innerHeight - 300) + 100,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      userId: currentUser.uid
    };

    try {
      await addNoteToFirestore(newNote);
    } catch (error) {
      console.error('Failed to add note:', error);
      alert('Failed to add note. Please try again.');
    }
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    try {
      await updateNoteInFirestore(id, updates);
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };

  const deleteNote = async (id: string) => {
    if (confirm('Delete this note?')) {
      try {
        await deleteNoteFromFirestore(id);
      } catch (error) {
        console.error('Failed to delete note:', error);
        alert('Failed to delete note. Please try again.');
      }
    }
  };

  const toggleComplete = async (id: string) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      await updateNote(id, { completed: !note.completed });
    }
  };

  const clearCompleted = async () => {
    if (confirm('Delete all completed notes?')) {
      const completedNotes = notes.filter((note) => note.completed);
      try {
        await Promise.all(completedNotes.map(note => deleteNoteFromFirestore(note.id)));
      } catch (error) {
        console.error('Failed to clear completed notes:', error);
        alert('Failed to clear some notes. Please try again.');
      }
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

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to logout:', error);
      alert('Failed to logout. Please try again.');
    }
  };

  const stats = {
    total: notes.length,
    completed: notes.filter((n) => n.completed).length,
    active: notes.filter((n) => !n.completed).length,
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading-state">
          <h2>Loading your notes...</h2>
        </div>
      </div>
    );
  }

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
            <button onClick={clearCompleted} disabled={stats.completed === 0}>
              🗑️ Clear Done
            </button>
          </div>

          <div className="user-info">
            <span className="user-email">{currentUser.email}</span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
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