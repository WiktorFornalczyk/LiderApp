export type Note = {
  id: string;
  title: string | null;
  content: string;
  isImportant: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NoteInput = {
  title?: string | null;
  content: string;
  isImportant: boolean;
};

export type NoteSortMode = 'updated_desc' | 'updated_asc' | 'important_first';

export type NotesFilter = 'all' | 'important';

export type NoteValidationErrors = Partial<Record<'title' | 'content', string>>;

export type NoteRow = {
  id: string;
  title: string | null;
  content: string;
  isImportant: number;
  createdAt: string;
  updatedAt: string;
};
