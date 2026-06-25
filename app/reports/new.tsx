import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen, Card, EmptySpacer, liderColors, SectionTitle } from '@/components/lider-ui';

export default function NewReportScreen() {
  const router = useRouter();

  return (
    <AppScreen title="Nowy raport" leftIcon="chevron-back" onLeftPress={() => router.back()}>
      <SectionTitle>Tworzenie raportu</SectionTitle>
      <View style={styles.grid}>
        <ActionCard
          icon="camera-outline"
          title="Zdjęcie raportu"
          text="Zrób zdjęcie kartki i sprawdź odczytane wpisy przed dodaniem do raportu."
        />
        <ActionCard
          icon="create-outline"
          title="Wpis ręczny"
          text="Dodaj punkty raportu ręcznie, gdy nie chcesz korzystać z OCR."
        />
      </View>

      <EmptySpacer height={18} />

      <Card style={styles.infoCard}>
        <Text style={styles.infoTitle}>OCR raportu</Text>
        <Text style={styles.infoText}>
          Parser raportów rozpoznaje wpisy typu L-I N330 P564327 BB10-20 plac 3 oraz MW jako palety. Zapis będzie
          wymagał zatwierdzenia użytkownika.
        </Text>
      </Card>
    </AppScreen>
  );
}

function ActionCard({ icon, title, text }: { icon: keyof typeof Ionicons.glyphMap; title: string; text: string }) {
  return (
    <Pressable style={styles.actionCard}>
      <Ionicons name={icon} size={26} color={liderColors.blue} />
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionText}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 10,
  },
  actionCard: {
    minHeight: 126,
    gap: 8,
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    backgroundColor: liderColors.surface,
    padding: 14,
  },
  actionTitle: {
    color: liderColors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  actionText: {
    color: liderColors.muted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  infoCard: {
    gap: 8,
    padding: 14,
  },
  infoTitle: {
    color: liderColors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  infoText: {
    color: liderColors.muted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
});
