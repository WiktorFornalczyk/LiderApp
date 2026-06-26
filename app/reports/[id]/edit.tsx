import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput } from 'react-native';

import { AppScreen, Card, EmptySpacer, liderColors, SectionTitle } from '@/components/lider-ui';
import * as reportRepository from '@/src/features/reports/services/reportRepository';

export default function ReportEditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadReport = useCallback(async () => {
    if (!id) {
      return;
    }

    setIsLoading(true);
    const report = await reportRepository.getReportById(id);
    setTitle(report?.title ?? '');
    setBody(report?.body ?? '');
    setIsLoading(false);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadReport();
    }, [loadReport])
  );

  async function saveReport() {
    if (!id || isSaving) {
      return;
    }

    if (!body.trim()) {
      Alert.alert('Pusty raport', 'Treść raportu nie może być pusta.');
      return;
    }

    try {
      setIsSaving(true);
      await reportRepository.updateReport(id, { title, body });
      Alert.alert('Zapisano raport', 'Zmiany zostały zapisane.');
      router.back();
    } catch {
      Alert.alert('Nie udało się zapisać raportu', 'Spróbuj ponownie.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppScreen title="Edytuj raport" leftIcon="chevron-back" onLeftPress={() => router.back()}>
      {isLoading ? (
        <Card style={styles.stateCard}>
          <ActivityIndicator color={liderColors.blue} />
          <Text style={styles.stateText}>Wczytywanie raportu...</Text>
        </Card>
      ) : (
        <>
          <SectionTitle>Tytuł</SectionTitle>
          <TextInput
            onChangeText={setTitle}
            placeholder="Tytuł raportu"
            placeholderTextColor={liderColors.dim}
            style={styles.titleInput}
            value={title}
          />

          <EmptySpacer height={14} />

          <SectionTitle>Treść raportu</SectionTitle>
          <TextInput
            multiline
            onChangeText={setBody}
            placeholder="Treść gotowego raportu"
            placeholderTextColor={liderColors.dim}
            style={styles.bodyInput}
            textAlignVertical="top"
            value={body}
          />

          <EmptySpacer height={14} />

          <Pressable disabled={isSaving} onPress={saveReport} style={[styles.primaryButton, isSaving && styles.disabled]}>
            <Text style={styles.primaryText}>{isSaving ? 'Zapisywanie...' : 'Zapisz zmiany'}</Text>
          </Pressable>
        </>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  stateCard: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
  },
  stateText: {
    color: liderColors.muted,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  titleInput: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    backgroundColor: liderColors.surface,
    color: liderColors.text,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '800',
  },
  bodyInput: {
    minHeight: 360,
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    backgroundColor: liderColors.surface,
    color: liderColors.text,
    padding: 12,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
  },
  primaryButton: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: liderColors.blue,
    paddingHorizontal: 12,
  },
  primaryText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  disabled: {
    opacity: 0.55,
  },
});
