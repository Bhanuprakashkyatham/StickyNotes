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
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Show login page if not authenticated
  if (!currentUser) {
    return <Auth />;
  }

  const addNote = async () => {
    // Calculate safe position that won't go off-screen
    const noteWidth = 220;
    const noteHeight = 280; // Increased for new meta section
    const toolbar = 100; // Approximate toolbar height

    const maxX = Math.max(50, window.innerWidth - noteWidth - 20);
    const maxY = Math.max(toolbar + 20, window.innerHeight - noteHeight - 20);

    // For mobile, stack notes vertically
    const isMobile = window.innerWidth < 768;
    const existingNotes = notes.length;

    const newNote = {
      content: '',
      color: selectedColor,
      completed: false,
      position: isMobile ? {
        x: 10,
        y: toolbar + (existingNotes * 30) // Stack vertically on mobile
      } : {
        x: Math.min(Math.random() * maxX + 10, maxX),
        y: Math.min(Math.random() * (maxY - toolbar) + toolbar, maxY),
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      userId: currentUser.uid,
      priority: 'normal' as const
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
    <div className="app" onClick={(e) => {
      // Close profile menu when clicking outside
      if (!(e.target as HTMLElement).closest('.hamburger-menu')) {
        setShowProfileMenu(false);
      }
    }}>
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
          </div>

        </div>
      </header>

      <div className="notes-grid">
        {notes.map((note, index) => (
          <StickyNote
            key={note.id}
            note={note}
            index={index + 1}
            isEditing={editingNoteId === note.id}
            onEdit={() => setEditingNoteId(note.id)}
            onCancelEdit={() => setEditingNoteId(null)}
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

      {/* Fixed hamburger menu */}
      <div className="hamburger-menu">
        <button
          className="hamburger-btn"
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          aria-label="Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        {showProfileMenu && (
          <div className="hamburger-dropdown">
            <div className="profile-info">
              <div className="profile-avatar">
                {currentUser.email?.[0].toUpperCase() || '👤'}
              </div>
              <div className="profile-email">{currentUser.email}</div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;