import Ionicons from '@expo/vector-icons/Ionicons';
import * as Clipboard from 'expo-clipboard';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen, Card, EmptySpacer, liderColors, SectionTitle } from '@/components/lider-ui';
import * as reportRepository from '@/src/features/reports/services/reportRepository';
import { Report } from '@/src/features/reports/types/reportTypes';

export default function ReportDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadReport = useCallback(async () => {
    if (!id) {
      return;
    }

    setIsLoading(true);
    setReport(await reportRepository.getReportById(id));
    setIsLoading(false);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadReport();
    }, [loadReport])
  );

  async function copyReport() {
    if (!report) {
      return;
    }

    await Clipboard.setStringAsync(report.body);
    Alert.alert('Skopiowano raport', 'Cały gotowy raport został skopiowany do schowka.');
  }

  function confirmDeleteReport() {
    if (!report) {
      return;
    }

    Alert.alert(
      'Usunąć raport?',
      'Raport zostanie trwale usunięty. Tej operacji nie da się cofnąć.',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: async () => {
            await reportRepository.deleteReport(report.id);
            router.replace('/reports' as never);
          },
        },
      ]
    );
  }

  return (
    <AppScreen title="Raport" leftIcon="chevron-back" onLeftPress={() => router.back()}>
      {isLoading ? (
        <Card style={styles.stateCard}>
          <ActivityIndicator color={liderColors.blue} />
          <Text style={styles.stateText}>Wczytywanie raportu...</Text>
        </Card>
      ) : !report ? (
        <Card style={styles.stateCard}>
          <Text style={styles.stateText}>Nie znaleziono raportu.</Text>
        </Card>
      ) : (
        <>
          <SectionTitle>Szczegóły</SectionTitle>
          <Card style={styles.headerCard}>
            <Text style={styles.title}>{report.title}</Text>
            <Text style={styles.meta}>
              {report.entryCount} pozycji · {new Date(report.createdAt).toLocaleString('pl-PL')}
            </Text>
          </Card>

          <EmptySpacer height={12} />

          <View style={styles.actions}>
            <Pressable onPress={() => router.push(`/reports/${report.id}/edit` as never)} style={styles.secondaryButton}>
              <Ionicons name="create-outline" size={18} color={liderColors.blue} />
              <Text style={styles.secondaryText}>Edytuj</Text>
            </Pressable>
            <Pressable onPress={copyReport} style={styles.primaryButton}>
              <Ionicons name="copy-outline" size={18} color="#ffffff" />
              <Text style={styles.primaryText}>Kopiuj raport</Text>
            </Pressable>
          </View>

          <EmptySpacer height={10} />

          <Pressable onPress={confirmDeleteReport} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={18} color={liderColors.red} />
            <Text style={styles.deleteText}>Usuń raport</Text>
          </Pressable>

          <EmptySpacer height={18} />

          <SectionTitle>Gotowy raport</SectionTitle>
          <Card style={styles.bodyCard}>
            <Text selectable style={styles.bodyText}>{report.body}</Text>
          </Card>
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
  headerCard: {
    gap: 6,
    padding: 14,
  },
  title: {
    color: liderColors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  meta: {
    color: liderColors.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 8,
    backgroundColor: liderColors.blue,
    paddingHorizontal: 12,
  },
  primaryText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  secondaryButton: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    backgroundColor: liderColors.surfaceSoft,
    paddingHorizontal: 12,
  },
  secondaryText: {
    color: liderColors.blue,
    fontSize: 13,
    fontWeight: '900',
  },
  deleteButton: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,92,66,0.35)',
    borderRadius: 8,
    backgroundColor: 'rgba(255,92,66,0.1)',
    paddingHorizontal: 12,
  },
  deleteText: {
    color: liderColors.red,
    fontSize: 13,
    fontWeight: '900',
  },
  bodyCard: {
    padding: 14,
  },
  bodyText: {
    color: liderColors.text,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
  },
});
