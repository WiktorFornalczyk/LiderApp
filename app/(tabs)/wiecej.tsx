import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  AppScreen,
  Card,
  EmptySpacer,
  liderColors,
  LiderIconName,
  SectionTitle,
} from '@/components/lider-ui';
import { BbArchiveScreen } from '@/src/features/bb/screens/BbArchiveScreen';
import { BbDetailsScreen } from '@/src/features/bb/screens/BbDetailsScreen';
import { BbImportExportScreen } from '@/src/features/bb/screens/BbImportExportScreen';
import * as bbArchiveService from '@/src/features/bb/services/bbArchiveService';
import * as bbBackupService from '@/src/features/bb/services/bbBackupService';
import * as bbService from '@/src/features/bb/services/bbService';
import { BbRecordWithYard } from '@/src/features/bb/types/bbTypes';

type SettingsMode = 'home' | 'archive' | 'import' | 'retention' | 'details';

const informationItems: SettingsItem[] = [
  { label: 'O aplikacji', icon: 'information-circle-outline' },
  { label: 'Pomoc', icon: 'help-circle-outline' },
];

type SettingsItem = {
  label: string;
  icon: LiderIconName;
  sub?: string;
  onPress?: () => void;
};

export default function WiecejScreen() {
  const [mode, setMode] = useState<SettingsMode>('home');
  const [archivedRecords, setArchivedRecords] = useState<BbRecordWithYard[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<BbRecordWithYard | null>(null);
  const [retentionDays, setRetentionDays] = useState(7);
  const [retentionInput, setRetentionInput] = useState('7');
  const [isLoading, setIsLoading] = useState(true);

  const loadSettingsData = useCallback(async () => {
    setIsLoading(true);
    const [nextArchivedRecords, nextRetentionDays] = await Promise.all([
      bbService.getArchivedBbRecords(),
      bbArchiveService.getBbArchiveRetentionDays(),
    ]);
    setArchivedRecords(nextArchivedRecords);
    setRetentionDays(nextRetentionDays);
    setRetentionInput(String(nextRetentionDays));
    setIsLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSettingsData();

      return () => {
        setMode('home');
        setSelectedRecord(null);
      };
    }, [loadSettingsData])
  );

  async function handleExport() {
    try {
      const result = await bbBackupService.exportBbDataToJson();
      Alert.alert(
        'Eksport gotowy',
        result.uri
          ? `Plik ${result.fileName} zapisano: ${result.locationLabel}.`
          : `Wygenerowano JSON: ${result.fileName}`
      );
    } catch {
      Alert.alert('Nie udało się wyeksportować danych.');
    }
  }

  async function saveRetentionDays() {
    try {
      const nextDays = await bbArchiveService.setBbArchiveRetentionDays(Number(retentionInput));
      setRetentionDays(nextDays);
      setRetentionInput(String(nextDays));
      Alert.alert('Zapisano ustawienie', `BB w archiwum będą usuwane po ${nextDays} dniach.`);
      await loadSettingsData();
      setMode('home');
    } catch (error) {
      Alert.alert('Nie udało się zapisać ustawienia.', error instanceof Error ? error.message : undefined);
    }
  }

  if (mode === 'archive') {
    return (
      <AppScreen title="Archiwum BB" leftIcon="chevron-back" onLeftPress={() => setMode('home')}>
        {isLoading ? (
          <StateCard message="Wczytywanie archiwum..." loading />
        ) : (
          <BbArchiveScreen
            records={archivedRecords}
            retentionDays={retentionDays}
            onChanged={loadSettingsData}
            onSelect={(record) => {
              setSelectedRecord(record);
              setMode('details');
            }}
          />
        )}
      </AppScreen>
    );
  }

  if (mode === 'details' && selectedRecord) {
    return (
      <AppScreen title="Szczegóły BB" leftIcon="chevron-back" onLeftPress={() => setMode('archive')}>
        <BbDetailsScreen
          record={selectedRecord}
          onArchived={async () => {
            await loadSettingsData();
            setMode('archive');
          }}
          onBack={() => setMode('archive')}
          onDuplicate={() => Alert.alert('Duplikowanie jest dostępne w zakładce BB.')}
          onEdit={() => Alert.alert('Edycja jest dostępna w zakładce BB.')}
          onSplit={() => {
            loadSettingsData();
            setMode('archive');
          }}
        />
      </AppScreen>
    );
  }

  if (mode === 'import') {
    return (
      <AppScreen title="Import BB" leftIcon="chevron-back" onLeftPress={() => setMode('home')}>
        <BbImportExportScreen
          showExport={false}
          onImported={async () => {
            await loadSettingsData();
            setMode('home');
          }}
        />
      </AppScreen>
    );
  }

  if (mode === 'retention') {
    return (
      <AppScreen title="Czyszczenie archiwum" leftIcon="chevron-back" onLeftPress={() => setMode('home')}>
        <SectionTitle>Automatyczne czyszczenie</SectionTitle>
        <Card style={styles.retentionCard}>
          <Text style={styles.retentionText}>
            Ustaw, po ilu dniach BB w archiwum mają być automatycznie trwale usuwane. Zakres: 1-365 dni.
          </Text>
          <TextInput
            keyboardType="number-pad"
            onChangeText={setRetentionInput}
            placeholder="Liczba dni"
            placeholderTextColor={liderColors.dim}
            style={styles.input}
            value={retentionInput}
          />
          <Pressable onPress={saveRetentionDays} style={styles.primaryButton}>
            <Text style={styles.primaryText}>Zapisz ustawienie</Text>
          </Pressable>
        </Card>
      </AppScreen>
    );
  }

  const dataItems: SettingsItem[] = [
    { label: 'Eksportuj dane BB (JSON)', icon: 'download-outline', onPress: handleExport },
    { label: 'Importuj dane BB (JSON)', icon: 'mail-outline', onPress: () => setMode('import') },
    {
      label: 'Archiwum BB',
      icon: 'archive-outline',
      sub: `${archivedRecords.length} zapisów`,
      onPress: () => setMode('archive'),
    },
  ];
  const cleanupItems: SettingsItem[] = [
    {
      label: 'Automatyczne czyszczenie archiwum BB',
      icon: 'trash-outline',
      sub: `Po ${retentionDays} dniach`,
      onPress: () => setMode('retention'),
    },
  ];

  return (
    <AppScreen title="Ustawienia">
      {isLoading ? <StateCard message="Wczytywanie ustawień..." loading /> : null}
      <SettingsSection title="Informacje" items={informationItems} />
      <SettingsSection title="Dane BB" items={dataItems} />
      <SettingsSection title="Automatyczne czyszczenie" items={cleanupItems} />
    </AppScreen>
  );
}

function SettingsSection({ title, items }: { title: string; items: SettingsItem[] }) {
  return (
    <View>
      <SectionTitle>{title}</SectionTitle>
      <Card style={styles.settingsCard}>
        {items.map((item, index) => (
          <Pressable
            disabled={!item.onPress}
            key={item.label}
            onPress={item.onPress}
            style={[styles.settingRow, index > 0 && styles.rowBorder]}>
            <View style={styles.settingIcon}>
              <Ionicons name={item.icon} size={18} color={liderColors.text} />
            </View>
            <View style={styles.settingTextWrap}>
              <Text style={styles.settingText}>{item.label}</Text>
              {item.sub ? <Text style={styles.settingSub}>{item.sub}</Text> : null}
            </View>
            {item.onPress ? <Ionicons name="chevron-forward" size={18} color={liderColors.muted} /> : null}
          </Pressable>
        ))}
      </Card>
      <EmptySpacer height={18} />
    </View>
  );
}

function StateCard({ message, loading }: { message: string; loading?: boolean }) {
  return (
    <Card style={styles.stateCard}>
      {loading ? <ActivityIndicator color={liderColors.blue} /> : null}
      <Text style={styles.stateText}>{message}</Text>
    </Card>
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
  stateCard: {
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
    marginBottom: 18,
  },
  stateText: {
    color: liderColors.muted,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  retentionCard: {
    gap: 12,
    padding: 14,
  },
  retentionText: {
    color: liderColors.muted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    backgroundColor: liderColors.surfaceSoft,
    color: liderColors.text,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '800',
  },
  primaryButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: liderColors.blue,
  },
  primaryText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
});
