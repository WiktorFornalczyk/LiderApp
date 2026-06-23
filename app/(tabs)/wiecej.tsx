import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import {
  AppScreen,
  Card,
  EmptySpacer,
  liderColors,
  LiderIconName,
  SectionTitle,
} from '@/components/lider-ui';

const sections: {
  title: string;
  items: { label: string; icon: LiderIconName; sub?: string }[];
}[] = [
  {
    title: 'Informacje',
    items: [
      { label: 'O aplikacji', icon: 'information-circle-outline' },
      { label: 'Pomoc', icon: 'help-circle-outline' },
    ],
  },
  {
    title: 'Dane BB',
    items: [
      { label: 'Eksportuj dane BB (JSON)', icon: 'download-outline' },
      { label: 'Importuj dane BB (JSON)', icon: 'mail-outline' },
      { label: 'Archiwizuj BB', icon: 'archive-outline' },
    ],
  },
  {
    title: 'Automatyczne czyszczenie',
    items: [{ label: 'Automatyczne czyszczenie archiwum BB', icon: 'trash-outline', sub: 'Po 7 dniach' }],
  },
];

export default function WiecejScreen() {
  return (
    <AppScreen title="Ustawienia">
      {sections.map((section) => (
        <View key={section.title}>
          <SectionTitle>{section.title}</SectionTitle>
          <Card style={styles.settingsCard}>
            {section.items.map((item, index) => (
              <View key={item.label} style={[styles.settingRow, index > 0 && styles.rowBorder]}>
                <View style={styles.settingIcon}>
                  <Ionicons name={item.icon} size={18} color={liderColors.text} />
                </View>
                <View style={styles.settingTextWrap}>
                  <Text style={styles.settingText}>{item.label}</Text>
                  {'sub' in item && item.sub ? <Text style={styles.settingSub}>{item.sub}</Text> : null}
                </View>
                <Ionicons name="chevron-forward" size={18} color={liderColors.muted} />
              </View>
            ))}
          </Card>
          <EmptySpacer height={18} />
        </View>
      ))}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  settingsCard: {
    overflow: 'hidden',
  },
  settingRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: liderColors.borderSoft,
  },
  settingIcon: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: liderColors.border,
    borderRadius: 7,
  },
  settingTextWrap: {
    flex: 1,
  },
  settingText: {
    color: liderColors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  settingSub: {
    marginTop: 3,
    color: liderColors.muted,
    fontSize: 11,
    fontWeight: '600',
  },
});
