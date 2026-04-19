export type Note = {
  id: string;
  content: string;
  color: string;
  completed: boolean;
  position: { x: number; y: number };
  createdAt: number;
  updatedAt: number;
  userId?: string; // ID of the user who owns this note
  priority?: 'normal' | 'important' | 'urgent'; // Priority level
};

export type NoteColor = 'yellow' | 'pink' | 'blue' | 'green' | 'purple' | 'orange';

export type NotePriority = 'normal' | 'important' | 'urgent';
