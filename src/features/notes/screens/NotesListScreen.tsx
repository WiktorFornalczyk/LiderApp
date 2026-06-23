import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  AppScreen,
  Card,
  EmptySpacer,
  liderColors,
  SectionTitle,
} from '@/components/lider-ui';
import { NoteCard } from '../components/NoteCard';
import { NotesFilterTabs } from '../components/NotesFilterTabs';
import { Note, NoteSortMode, NotesFilter } from '../types/noteTypes';
import { noteErrorMessages } from '../validation/noteValidation';
import * as notesService from '../services/notesService';

const sortOptions: { label: string; value: NoteSortMode }[] = [
  { label: 'Najnowsze edytowane', value: 'updated_desc' },
  { label: 'Najstarsze edytowane', value: 'updated_asc' },
  { label: 'Ważne najpierw', value: 'important_first' },
];

export function NotesListScreen() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [filter, setFilter] = useState<NotesFilter>('all');
  const [query, setQuery] = useState('');
  const [sortMode, setSortMode] = useState<NoteSortMode>('updated_desc');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotes = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const nextNotes = await notesService.getNotes({ filter, query, sortMode });
      setNotes(nextNotes);
    } catch {
      setError(noteErrorMessages.loadFailed);
    } finally {
      setIsLoading(false);
    }
  }, [filter, query, sortMode]);

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [loadNotes])
  );

  async function handleToggleImportant(id: string) {
    try {
      await notesService.toggleImportant(id);
      await loadNotes();
    } catch {
      setError('Nie udało się zmienić ważności notatki.');
    }
  }

  function cycleSortMode() {
    const currentIndex = sortOptions.findIndex((option) => option.value === sortMode);
    const nextOption = sortOptions[(currentIndex + 1) % sortOptions.length];
    setSortMode(nextOption.value);
  }

  const emptyMessage = query.trim()
    ? 'Nie znaleziono notatek.'
    : 'Brak notatek. Dodaj pierwszą notatkę.';
  const sortLabel = sortOptions.find((option) => option.value === sortMode)?.label ?? sortOptions[0].label;

  return (
    <AppScreen
      title="Notatki"
      rightSlot={
        <Pressable onPress={() => router.push('/notes/new')} style={styles.headerButton}>
          <Ionicons name="add" size={24} color={liderColors.text} />
        </Pressable>
      }>
      <Pressable onPress={() => router.push('/notes/new')} style={styles.addButton}>
        <Ionicons name="add-circle-outline" size={22} color="#ffffff" />
        <Text style={styles.addButtonText}>Dodaj notatkę</Text>
      </Pressable>

      <EmptySpacer height={12} />

      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={20} color={liderColors.muted} />
        <TextInput
          onChangeText={setQuery}
          placeholder="Szukaj po tytule lub treści"
          placeholderTextColor={liderColors.dim}
          style={styles.searchInput}
          value={query}
        />
        {query ? (
          <Pressable onPress={() => setQuery('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={liderColors.dim} />
          </Pressable>
        ) : null}
      </View>

      <EmptySpacer height={12} />

      <NotesFilterTabs value={filter} onChange={setFilter} />

      <EmptySpacer height={10} />

      <Pressable onPress={cycleSortMode} style={styles.sortButton}>
        <Ionicons name="swap-vertical-outline" size={18} color={liderColors.blue} />
        <Text style={styles.sortText}>{sortLabel}</Text>
      </Pressable>

      <EmptySpacer height={14} />

      <SectionTitle>Lista notatek</SectionTitle>

      {isLoading ? (
        <Card style={styles.stateCard}>
          <ActivityIndicator color={liderColors.blue} />
          <Text style={styles.stateText}>Wczytywanie notatek...</Text>
        </Card>
      ) : error ? (
        <Card style={styles.stateCard}>
          <Ionicons name="alert-circle-outline" size={26} color={liderColors.red} />
          <Text style={styles.stateText}>{error}</Text>
          <Pressable onPress={loadNotes} style={styles.retryButton}>
            <Text style={styles.retryText}>Spróbuj ponownie</Text>
          </Pressable>
        </Card>
      ) : notes.length === 0 ? (
        <Card style={styles.stateCard}>
          <Ionicons name="document-text-outline" size={28} color={liderColors.muted} />
          <Text style={styles.stateText}>{emptyMessage}</Text>
        </Card>
      ) : (
        <View style={styles.list}>
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onPress={() => router.push({ pathname: '/notes/[id]', params: { id: note.id } })}
              onToggleImportant={() => handleToggleImportant(note.id)}
            />
          ))}
        </View>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  addButton: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    borderRadius: 8,
    backgroundColor: liderColors.blue,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  searchRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    backgroundColor: liderColors.surface,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    color: liderColors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  clearButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortButton: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    backgroundColor: liderColors.surfaceSoft,
  },
  sortText: {
    color: liderColors.blue,
    fontSize: 12,
    fontWeight: '900',
  },
  list: {
    gap: 10,
  },
  stateCard: {
    minHeight: 150,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 18,
  },
  stateText: {
    color: liderColors.muted,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    minHeight: 42,
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: liderColors.blue,
    paddingHorizontal: 16,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
});
