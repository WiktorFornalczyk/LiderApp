import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

import { AppScreen, Card, liderColors } from '@/components/lider-ui';
import { NoteForm } from '../components/NoteForm';
import { Note, NoteInput } from '../types/noteTypes';
import { noteErrorMessages } from '../validation/noteValidation';
import * as notesService from '../services/notesService';

type NoteEditScreenProps = {
  mode: 'create' | 'edit';
};

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function NoteEditScreen({ mode }: NoteEditScreenProps) {
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(mode === 'edit');
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [canLeave, setCanLeave] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadNote = useCallback(async () => {
    if (mode !== 'edit') {
      return;
    }

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
  }, [id, mode]);

  useFocusEffect(
    useCallback(() => {
      loadNote();
    }, [loadNote])
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (event) => {
      if (!isDirty || canLeave) {
        return;
      }

      event.preventDefault();
      Alert.alert(
        'Niezapisane zmiany',
        'Masz niezapisane zmiany. Czy chcesz wyjść bez zapisywania?',
        [
          { text: 'Zostań', style: 'cancel' },
          {
            text: 'Wyjdź',
            style: 'destructive',
            onPress: () => {
              setCanLeave(true);
              navigation.dispatch(event.data.action);
            },
          },
        ]
      );
    });

    return unsubscribe;
  }, [canLeave, isDirty, navigation]);

  async function handleSubmit(input: NoteInput) {
    try {
      setError(null);
      setSuccessMessage(null);
      setIsSaving(true);

      if (mode === 'create') {
        const createdNote = await notesService.createNote(input);
        setCanLeave(true);
        setIsDirty(false);
        setSuccessMessage('Notatka została dodana.');
        setIsSaving(false);
        await wait(900);
        router.replace({ pathname: '/notes/[id]', params: { id: createdNote.id } });
        return;
      }

      if (!id) {
        throw new Error(noteErrorMessages.saveFailed);
      }

      const updatedNote = await notesService.updateNote(id, input);
      setCanLeave(true);
      setIsDirty(false);
      setSuccessMessage('Zmiany zostały zapisane.');
      setIsSaving(false);
      await wait(900);

      if (updatedNote) {
        router.replace({ pathname: '/notes/[id]', params: { id: updatedNote.id } });
      } else {
        router.replace('/(tabs)/notatki');
      }
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : noteErrorMessages.saveFailed;
      setError(message || noteErrorMessages.saveFailed);
      Alert.alert('Błąd', message || noteErrorMessages.saveFailed);
    } finally {
      setIsSaving(false);
    }
  }

  const title = mode === 'create' ? 'Nowa notatka' : 'Edycja';

  return (
    <AppScreen title={title} leftIcon="chevron-back-outline" onLeftPress={() => router.back()}>
      {isLoading ? (
        <Card style={styles.stateCard}>
          <ActivityIndicator color={liderColors.blue} />
          <Text style={styles.stateText}>Wczytywanie notatki...</Text>
        </Card>
      ) : error && mode === 'edit' && !note ? (
        <Card style={styles.stateCard}>
          <Text style={styles.stateText}>{error}</Text>
        </Card>
      ) : (
        <View style={styles.formWrap}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <NoteForm
            initialNote={note ?? undefined}
            isSaving={isSaving}
            onDirtyChange={setIsDirty}
            onSubmit={handleSubmit}
            submitLabel={mode === 'create' ? 'Zapisz notatkę' : 'Zapisz zmiany'}
          />
          {successMessage ? (
            <View style={styles.successToast}>
              <Text style={styles.successToastText}>{successMessage}</Text>
            </View>
          ) : null}
        </View>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  formWrap: {
    position: 'relative',
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
  errorText: {
    marginBottom: 12,
    color: liderColors.red,
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
  },
  successToast: {
    position: 'absolute',
    right: 0,
    bottom: 8,
    maxWidth: 260,
    borderWidth: 1,
    borderColor: 'rgba(50, 198, 106, 0.45)',
    borderRadius: 8,
    backgroundColor: '#12351f',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  successToastText: {
    color: '#dff8e8',
    fontSize: 13,
    fontWeight: '900',
  },
});
