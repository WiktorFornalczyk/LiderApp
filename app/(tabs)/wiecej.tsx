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
import * as scheduleMaintenanceService from '@/src/features/schedule/services/scheduleMaintenanceService';

type SettingsMode = 'home' | 'archive' | 'import' | 'retention' | 'scheduleRetention' | 'details' | 'about' | 'help';

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
  const [scheduleRetentionDays, setScheduleRetentionDays] = useState(28);
  const [scheduleRetentionInput, setScheduleRetentionInput] = useState('28');
  const [isLoading, setIsLoading] = useState(true);

  const loadSettingsData = useCallback(async () => {
    setIsLoading(true);
    const [nextArchivedRecords, nextRetentionDays, nextScheduleRetentionDays] = await Promise.all([
      bbService.getArchivedBbRecords(),
      bbArchiveService.getBbArchiveRetentionDays(),
      scheduleMaintenanceService.getScheduleRetentionDays(),
    ]);
    setArchivedRecords(nextArchivedRecords);
    setRetentionDays(nextRetentionDays);
    setRetentionInput(String(nextRetentionDays));
    setScheduleRetentionDays(nextScheduleRetentionDays);
    setScheduleRetentionInput(String(nextScheduleRetentionDays));
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

  async function saveScheduleRetentionDays() {
    try {
      const nextDays = await scheduleMaintenanceService.setScheduleRetentionDays(Number(scheduleRetentionInput));
      setScheduleRetentionDays(nextDays);
      setScheduleRetentionInput(String(nextDays));
      Alert.alert('Zapisano ustawienie', `Grafiki będą usuwane po ${nextDays} dniach od daty zakończenia.`);
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

  if (mode === 'scheduleRetention') {
    return (
      <AppScreen title="Czyszczenie grafików" leftIcon="chevron-back" onLeftPress={() => setMode('home')}>
        <SectionTitle>Automatyczne czyszczenie</SectionTitle>
        <Card style={styles.retentionCard}>
          <Text style={styles.retentionText}>
            Ustaw, po ilu dniach od daty zakończenia grafiki mają być automatycznie usuwane. Domyślnie: 28 dni. Zakres: 1-365 dni.
          </Text>
          <TextInput
            keyboardType="number-pad"
            onChangeText={setScheduleRetentionInput}
            placeholder="Liczba dni"
            placeholderTextColor={liderColors.dim}
            style={styles.input}
            value={scheduleRetentionInput}
          />
          <Pressable onPress={saveScheduleRetentionDays} style={styles.primaryButton}>
            <Text style={styles.primaryText}>Zapisz ustawienie</Text>
          </Pressable>
        </Card>
      </AppScreen>
    );
  }

  if (mode === 'about') {
    return (
      <AppScreen title="O aplikacji" leftIcon="chevron-back" onLeftPress={() => setMode('home')}>
        <Card style={styles.infoCard}>
          <Ionicons name="briefcase-outline" size={28} color={liderColors.blue} />
          <Text style={styles.infoTitle}>LiderApp</Text>
          <Text style={styles.infoText}>
            Aplikacja do codziennego prowadzenia BB, placów, grafików, kalendarza, notatek i raportów zmianowych.
          </Text>
        </Card>

        <EmptySpacer height={14} />

        <SectionTitle>Co zawiera</SectionTitle>
        <InfoList
          items={[
            'BB: dodawanie partii, zakresów, placów, archiwum i import/eksport danych.',
            'Grafik: tygodniowy grafik pracowników z eksportem do pliku.',
            'Raporty: tworzenie raportu zmianowego ręcznie albo ze zdjęcia OCR.',
            'Kalendarz i notatki: szybkie przypomnienia oraz zapiski z pracy.',
          ]}
        />

        <EmptySpacer height={14} />

        <SectionTitle>Dane</SectionTitle>
        <Card style={styles.infoCard}>
          <Text style={styles.infoText}>
            Dane są przechowywane lokalnie w aplikacji. Kopię BB możesz wyeksportować jako JSON w sekcji Dane BB.
          </Text>
        </Card>
      </AppScreen>
    );
  }

  if (mode === 'help') {
    return (
      <AppScreen title="Pomoc" leftIcon="chevron-back" onLeftPress={() => setMode('home')}>
        <SectionTitle>Nawigacja</SectionTitle>
        <InfoList
          items={[
            'Dolne menu prowadzi do Dashboardu, BB, Raportów, Notatek i Ustawień.',
            'Menu w lewym górnym rogu Dashboardu otwiera pełną listę sekcji, w tym Grafik.',
            'Strzałka w lewym górnym rogu wraca do poprzedniego widoku.',
          ]}
        />

        <EmptySpacer height={14} />

        <SectionTitle>OCR</SectionTitle>
        <InfoList
          items={[
            'OCR działa tylko w development build/dev client, nie w zwykłym Expo Go.',
            'Przed zdjęciem poczekaj chwilę, aż aparat złapie ostrość.',
            'Tekst powinien być dobrze oświetlony, prosty i możliwie blisko kadru.',
            'Dla BB aplikacja rozpoznaje najczęstsze gatunki: N330, N339, N326 i N375.',
            'Jeśli OCR nic nie odczyta, użyj podglądu i popraw dane ręcznie.',
          ]}
        />

        <EmptySpacer height={14} />

        <SectionTitle>BB i raporty</SectionTitle>
        <InfoList
          items={[
            'BB zapisuj po wybraniu placu, numeru partii, gatunku sadzy, zakresu BB i linii.',
            'Raport możesz składać z kilku zdjęć OCR albo z wpisów ręcznych.',
            'Eksport i import BB znajdziesz w Ustawieniach w sekcji Dane BB.',
          ]}
        />
      </AppScreen>
    );
  }

  const informationItems: SettingsItem[] = [
    { label: 'O aplikacji', icon: 'information-circle-outline', onPress: () => setMode('about') },
    { label: 'Pomoc', icon: 'help-circle-outline', onPress: () => setMode('help') },
  ];
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
    {
      label: 'Automatyczne czyszczenie grafików',
      icon: 'calendar-clear-outline',
      sub: `Po ${scheduleRetentionDays} dniach`,
      onPress: () => setMode('scheduleRetention'),
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

function InfoList({ items }: { items: string[] }) {
  return (
    <Card style={styles.infoList}>
      {items.map((item, index) => (
        <View key={item} style={[styles.infoRow, index > 0 && styles.rowBorder]}>
          <Ionicons name="checkmark-circle-outline" size={18} color={liderColors.green} />
          <Text style={styles.infoRowText}>{item}</Text>
        </View>
      ))}
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
  infoCard: {
    gap: 10,
    padding: 14,
  },
  infoTitle: {
    color: liderColors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  infoText: {
    color: liderColors.muted,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
  },
  infoList: {
    overflow: 'hidden',
  },
  infoRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  infoRowText: {
    flex: 1,
    color: liderColors.text,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
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
