// Firestore Hook
// This replaces localStorage with cloud storage

import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Note } from '../types';

export function useFirestore(userId: string | undefined) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time listener for notes
  useEffect(() => {
    if (!userId) {
      setNotes([]);
      setLoading(false);
      return;
    }

    // Create a query to get only this user's notes
    const notesRef = collection(db, 'notes');
    const q = query(notesRef, where('userId', '==', userId));

    // Listen for real-time updates
    // Whenever notes change in Firestore, this callback runs
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notesData: Note[] = [];
        snapshot.forEach((doc) => {
          notesData.push({
            id: doc.id,
            ...doc.data()
          } as Note);
        });
        console.log('📝 Loaded notes from Firestore:', notesData.length);
        setNotes(notesData);
        setLoading(false);
      },
      (error) => {
        console.error('❌ Firestore error:', error);
        setLoading(false);
      }
    );

    // Cleanup: stop listening when component unmounts
    return unsubscribe;
  }, [userId]);

  // Add a new note to Firestore
  async function addNote(note: Omit<Note, 'id'> & { userId: string }) {
    try {
      await addDoc(collection(db, 'notes'), {
        ...note,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  }

  // Update an existing note
  async function updateNote(noteId: string, updates: Partial<Note>) {
    try {
      const noteRef = doc(db, 'notes', noteId);
      await updateDoc(noteRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  }

  // Delete a note
  async function deleteNote(noteId: string) {
    try {
      await deleteDoc(doc(db, 'notes', noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }

  return {
    notes,
    loading,
    addNote,
    updateNote,
    deleteNote
  };
}