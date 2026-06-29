import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen, Card, liderColors, SectionTitle } from '@/components/lider-ui';
import * as reportRepository from '@/src/features/reports/services/reportRepository';
import { Report } from '@/src/features/reports/types/reportTypes';

export default function ReportsScreen() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadReports = useCallback(async () => {
    setIsLoading(true);
    setReports(await reportRepository.getRecentReports());
    setIsLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadReports();
    }, [loadReports])
  );

  return (
    <AppScreen
      title="Raporty"
      rightSlot={
        <Pressable onPress={() => router.push('/reports/new' as never)} style={styles.headerButton}>
          <Ionicons name="add" size={24} color={liderColors.text} />
        </Pressable>
      }>
      <SectionTitle>Ostatnie raporty</SectionTitle>
      {isLoading ? (
        <Card style={styles.emptyCard}>
          <ActivityIndicator color={liderColors.blue} />
          <Text style={styles.emptyText}>Wczytywanie raportów...</Text>
        </Card>
      ) : reports.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>Brak zapisanych raportów.</Text>
        </Card>
      ) : (
        <View style={styles.reportList}>
          {reports.map((report) => (
            <Pressable key={report.id} onPress={() => router.push(`/reports/${report.id}` as never)}>
              <Card style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <View style={styles.reportHeaderText}>
                    <Text style={styles.reportTitle}>{report.title}</Text>
                    <Text style={styles.reportMeta}>
                      {report.entryCount} pozycji · {new Date(report.createdAt).toLocaleDateString('pl-PL')}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={liderColors.muted} />
                </View>
                <Text numberOfLines={3} style={styles.reportBody}>{report.body}</Text>
              </Card>
            </Pressable>
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
  emptyCard: {
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
  },
  emptyText: {
    color: liderColors.muted,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  reportList: {
    gap: 10,
  },
  reportCard: {
    gap: 7,
    padding: 12,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reportHeaderText: {
    flex: 1,
    gap: 3,
  },
  reportTitle: {
    color: liderColors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  reportMeta: {
    color: liderColors.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  reportBody: {
    color: liderColors.muted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
});
