import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { AppScreen, Card, EmptySpacer, liderColors, SectionTitle } from '@/components/lider-ui';

export default function ReportsScreen() {
  const router = useRouter();

  return (
    <AppScreen title="Raporty" leftIcon="chevron-back" onLeftPress={() => router.back()}>
      <SectionTitle>Raporty</SectionTitle>
      <Card style={styles.card}>
        <Text style={styles.title}>Nowy raport zmianowy</Text>
        <Text style={styles.text}>
          Utwórz raport ręcznie albo przygotuj go z odczytu OCR po zrobieniu zdjęcia kartki.
        </Text>
        <Pressable onPress={() => router.push('/reports/new' as never)} style={styles.primaryButton}>
          <Ionicons name="add-circle-outline" size={20} color="#ffffff" />
          <Text style={styles.primaryText}>Nowy raport</Text>
        </Pressable>
      </Card>

      <EmptySpacer height={18} />

      <SectionTitle>Ostatnie raporty</SectionTitle>
      <Card style={styles.emptyCard}>
        <Text style={styles.emptyText}>Brak zapisanych raportów.</Text>
      </Card>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    padding: 14,
  },
  title: {
    color: liderColors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  text: {
    color: liderColors.muted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  primaryButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 8,
    backgroundColor: liderColors.blue,
  },
  primaryText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  emptyCard: {
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  emptyText: {
    color: liderColors.muted,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
});
