export type Note = {
  id: string;
  content: string;
  color: string;
  completed: boolean;
  position: { x: number; y: number };
  createdAt: number;
  updatedAt: number;
};

export type NoteColor = 'yellow' | 'pink' | 'blue' | 'green' | 'purple' | 'orange';
