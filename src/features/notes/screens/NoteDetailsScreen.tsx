import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen, Card, EmptySpacer, liderColors, SectionTitle } from '@/components/lider-ui';
import { Note } from '../types/noteTypes';
import { noteErrorMessages } from '../validation/noteValidation';
import * as notesService from '../services/notesService';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function NoteDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNote = useCallback(async () => {
    if (!id) {
      setError(noteErrorMessages.loadFailed);
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      setIsLoading(true);
      const nextNote = await notesService.getNoteById(id);
      setNote(nextNote);
      if (!nextNote) {
        setError('Nie znaleziono notatki.');
      }
    } catch {
      setError(noteErrorMessages.loadFailed);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadNote();
    }, [loadNote])
  );

  async function handleToggleImportant() {
    if (!note) {
      return;
    }

    try {
      const updatedNote = await notesService.toggleImportant(note.id);
      if (updatedNote) {
        setNote(updatedNote);
      }
    } catch {
      setError('Nie udało się zmienić ważności notatki.');
    }
  }

  function confirmDelete() {
    if (!note) {
      return;
    }

    Alert.alert('Usuń notatkę', 'Czy na pewno chcesz usunąć tę notatkę?', [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Usuń',
        style: 'destructive',
        onPress: async () => {
          try {
            await notesService.deleteNote(note.id);
            Alert.alert('Gotowe', 'Notatka została usunięta.');
            router.replace('/(tabs)/notatki');
          } catch {
            Alert.alert('Błąd', noteErrorMessages.deleteFailed);
          }
        },
      },
    ]);
  }

  return (
    <AppScreen title="Szczegóły" leftIcon="chevron-back-outline" onLeftPress={() => router.back()}>
      {isLoading ? (
        <Card style={styles.stateCard}>
          <ActivityIndicator color={liderColors.blue} />
          <Text style={styles.stateText}>Wczytywanie notatki...</Text>
        </Card>
      ) : error || !note ? (
        <Card style={styles.stateCard}>
          <Ionicons name="alert-circle-outline" size={26} color={liderColors.red} />
          <Text style={styles.stateText}>{error ?? noteErrorMessages.loadFailed}</Text>
          <Pressable onPress={loadNote} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Spróbuj ponownie</Text>
          </Pressable>
        </Card>
      ) : (
        <View>
          <Card style={styles.detailsCard}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{note.title || 'Bez tytułu'}</Text>
              <Pressable onPress={handleToggleImportant} style={styles.starButton}>
                <Ionicons
                  name={note.isImportant ? 'star' : 'star-outline'}
                  size={24}
                  color={note.isImportant ? liderColors.amber : liderColors.dim}
                />
              </Pressable>
            </View>

            {note.isImportant ? (
              <View style={styles.badge}>
                <Ionicons name="star" size={13} color={liderColors.amber} />
                <Text style={styles.badgeText}>Ważna</Text>
              </View>
            ) : null}

            <Text style={styles.content}>{note.content}</Text>
          </Card>

          <EmptySpacer height={16} />

          <SectionTitle>Informacje</SectionTitle>
          <Card>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Utworzono</Text>
              <Text style={styles.metaValue}>{formatDate(note.createdAt)}</Text>
            </View>
            <View style={[styles.metaRow, styles.metaBorder]}>
              <Text style={styles.metaLabel}>Ostatnia edycja</Text>
              <Text style={styles.metaValue}>{formatDate(note.updatedAt)}</Text>
            </View>
          </Card>

          <EmptySpacer height={16} />

          <View style={styles.actions}>
            <Pressable
              onPress={() => router.push({ pathname: '/notes/[id]/edit', params: { id: note.id } })}
              style={styles.primaryButton}>
              <Ionicons name="create-outline" size={20} color="#ffffff" />
              <Text style={styles.primaryButtonText}>Edytuj</Text>
            </Pressable>
            <Pressable onPress={confirmDelete} style={styles.deleteButton}>
              <Ionicons name="trash-outline" size={20} color="#ffffff" />
              <Text style={styles.primaryButtonText}>Usuń</Text>
            </Pressable>
          </View>
        </View>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  detailsCard: {
    padding: 16,
    gap: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  title: {
    flex: 1,
    color: liderColors.text,
    fontSize: 21,
    fontWeight: '900',
    lineHeight: 28,
  },
  starButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(245, 165, 36, 0.14)',
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  badgeText: {
    color: liderColors.amber,
    fontSize: 12,
    fontWeight: '900',
  },
  content: {
    color: '#d7dde5',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 23,
  },
  metaRow: {
    minHeight: 54,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 3,
  },
  metaBorder: {
    borderTopWidth: 1,
    borderTopColor: liderColors.borderSoft,
  },
  metaLabel: {
    color: liderColors.muted,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  metaValue: {
    color: liderColors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  actions: {
    gap: 10,
  },
  primaryButton: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 8,
    backgroundColor: liderColors.blue,
    paddingHorizontal: 16,
  },
  deleteButton: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 8,
    backgroundColor: liderColors.red,
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  stateCard: {
    minHeight: 180,
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
  },
});
