import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppScreen, Card, EmptySpacer, liderColors, SectionTitle } from '@/components/lider-ui';
import { BbCard } from '../components/BbCard';
import { BbFilters } from '../components/BbFilters';
import { BbSortPicker } from '../components/BbSortPicker';
import { BbFilters as BbFiltersType, BbInput, BbListMode, BbRecordWithYard, BbSortMode } from '../types/bbTypes';
import { YardWithStats } from '../yards/types/yardTypes';
import * as bbArchiveService from '../services/bbArchiveService';
import * as bbService from '../services/bbService';
import * as yardService from '../yards/services/yardService';
import { YardDetailsScreen } from '../yards/screens/YardDetailsScreen';
import { YardEditScreen } from '../yards/screens/YardEditScreen';
import { YardListScreen } from '../yards/screens/YardListScreen';
import { BbCreateScreen } from './BbCreateScreen';
import { BbDetailsScreen } from './BbDetailsScreen';
import { BbEditScreen } from './BbEditScreen';
import { BbPhotoAddScreen } from './BbPhotoAddScreen';

type ScreenMode = 'list' | 'yards' | 'create' | 'edit' | 'details' | 'yardDetails' | 'yardEdit' | 'photo';

export function BbListScreen({ initialMode = 'list' }: { initialMode?: ScreenMode }) {
  const [mode, setMode] = useState<ScreenMode>(initialMode);
  const [listMode, setListMode] = useState<BbListMode>('active');
  const [records, setRecords] = useState<BbRecordWithYard[]>([]);
  const [yards, setYards] = useState<YardWithStats[]>([]);
  const [carbonTypes, setCarbonTypes] = useState<string[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<BbRecordWithYard | null>(null);
  const [selectedYard, setSelectedYard] = useState<YardWithStats | null>(null);
  const [yardRecords, setYardRecords] = useState<BbRecordWithYard[]>([]);
  const [duplicateInput, setDuplicateInput] = useState<Partial<BbInput> | undefined>(undefined);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<BbFiltersType>({});
  const [sortMode, setSortMode] = useState<BbSortMode>('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      await bbArchiveService.cleanupExpiredBbArchive();
      const [nextRecords, nextYards, nextCarbonTypes] = await Promise.all([
        bbService.getBbRecords({ query, filters, sortMode }),
        yardService.getYards(),
        bbService.getRecentlyUsedCarbonTypes(),
      ]);
      setRecords(nextRecords);
      setYards(nextYards);
      setCarbonTypes(nextCarbonTypes);
    } catch {
      setError('Nie udało się wczytać BB.');
    } finally {
      setIsLoading(false);
    }
  }, [filters, query, sortMode]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  async function openYard(yard: YardWithStats) {
    setSelectedYard(yard);
    setYardRecords(await bbService.getBbRecordsByYard(yard.id));
    setMode('yardDetails');
  }

  function openRecord(record: BbRecordWithYard) {
    setSelectedRecord(record);
    setMode('details');
  }

  async function afterChanged(nextMode: ScreenMode = 'list') {
    setDuplicateInput(undefined);
    setSelectedRecord(null);
    setSelectedYard(null);
    await loadData();
    setMode(nextMode);
  }

  function goBackFromMode() {
    if (mode === 'create' || mode === 'photo' || mode === 'yards') {
      setMode('list');
      return;
    }

    if (mode === 'edit') {
      setMode('details');
      return;
    }

    if (mode === 'details') {
      setMode('list');
      return;
    }

    if (mode === 'yardDetails') {
      setMode('yards');
      return;
    }

    if (mode === 'yardEdit') {
      setMode(selectedYard ? 'yardDetails' : 'yards');
    }
  }

  const groupedRecords = useMemo(() => {
    return yards.map((yard) => ({
      yard,
      records: records.filter((record) => record.placId === yard.id),
    }));
  }, [records, yards]);

  return (
    <AppScreen
      title="BB"
      onLeftPress={mode === 'list' ? undefined : goBackFromMode}
      rightSlot={<HeaderActions onAdd={() => setMode('create')} onPhoto={() => setMode('photo')} />}>
      <View style={styles.modeTabs}>
        <ModeTab label="BB" selected={mode === 'list'} onPress={() => setMode('list')} />
        <ModeTab label="Place" selected={mode === 'yards'} onPress={() => setMode('yards')} />
      </View>

      {mode === 'create' ? (
        <BbCreateScreen
          carbonTypes={carbonTypes}
          initialInput={duplicateInput}
          yards={yards}
          onCancel={() => setMode('list')}
          onSaved={async (keepAdding) => {
            await loadData();
            setDuplicateInput(undefined);
            setMode(keepAdding ? 'create' : 'list');
          }}
        />
      ) : mode === 'edit' && selectedRecord ? (
        <BbEditScreen
          carbonTypes={carbonTypes}
          record={selectedRecord}
          yards={yards}
          onCancel={() => setMode('details')}
          onSaved={() => afterChanged('list')}
        />
      ) : mode === 'details' && selectedRecord ? (
        <BbDetailsScreen
          record={selectedRecord}
          onArchived={() => afterChanged('list')}
          onBack={() => setMode('list')}
          onDuplicate={() => {
            setDuplicateInput(bbService.duplicateToInput(selectedRecord));
            setMode('create');
          }}
          onEdit={() => setMode('edit')}
          onSplit={() => afterChanged('list')}
        />
      ) : mode === 'yards' ? (
        <YardListScreen
          yards={yards}
          onCreate={() => {
            setSelectedYard(null);
            setMode('yardEdit');
          }}
          onSelect={openYard}
        />
      ) : mode === 'yardEdit' ? (
        <YardEditScreen
          yard={selectedYard}
          onCancel={() => setMode(selectedYard ? 'yardDetails' : 'yards')}
          onSaved={() => afterChanged('yards')}
        />
      ) : mode === 'yardDetails' && selectedYard ? (
        <YardDetailsScreen
          records={yardRecords}
          yard={selectedYard}
          onBack={() => setMode('yards')}
          onDeleted={() => afterChanged('yards')}
          onEdit={() => setMode('yardEdit')}
          onSelectBb={openRecord}
        />
      ) : mode === 'photo' ? (
        <BbPhotoAddScreen
          yards={yards}
          onCancel={() => setMode('create')}
          onConfirmed={(values) => {
            setDuplicateInput(values);
            setMode('create');
          }}
        />
      ) : (
        <>
          <View style={styles.searchRow}>
            <Ionicons name="search-outline" size={19} color={liderColors.muted} />
            <TextInput
              onChangeText={setQuery}
              placeholder="Szukaj po partii, sadzy, placu, zakresie lub linii"
              placeholderTextColor={liderColors.dim}
              style={styles.searchInput}
              value={query}
            />
          </View>

          <EmptySpacer height={10} />

          <View style={styles.listModeRow}>
            <ModeTab label="Aktywne" selected={listMode === 'active'} onPress={() => setListMode('active')} />
            <ModeTab label="Według placu" selected={listMode === 'yards'} onPress={() => setListMode('yards')} />
            <ModeTab label="Ostatnio dodane" selected={listMode === 'recent'} onPress={() => setListMode('recent')} />
          </View>

          <EmptySpacer height={12} />
          <SectionTitle>Filtry</SectionTitle>
          <BbFilters filters={filters} yards={yards} onChange={setFilters} onClear={() => setFilters({})} />

          <EmptySpacer height={12} />
          <SectionTitle>Sortowanie</SectionTitle>
          <BbSortPicker value={sortMode} onChange={setSortMode} />

          <EmptySpacer height={16} />
          <SectionTitle>Lista BB</SectionTitle>
          {isLoading ? (
            <StateCard message="Wczytywanie BB..." loading />
          ) : error ? (
            <StateCard message={error} />
          ) : records.length === 0 ? (
            <StateCard message={query ? 'Brak wyników wyszukiwania.' : 'Brak zapisów BB.'} />
          ) : listMode === 'yards' ? (
            <View style={styles.list}>
              {groupedRecords.map((group) =>
                group.records.length > 0 ? (
                  <View key={group.yard.id} style={styles.group}>
                    <Text style={styles.groupTitle}>{group.yard.name}</Text>
                    {group.records.map((record) => (
                      <BbCard key={record.id} record={record} onPress={() => openRecord(record)} />
                    ))}
                  </View>
                ) : null
              )}
            </View>
          ) : (
            <View style={styles.list}>
              {(listMode === 'recent' ? records.slice(0, 10) : records).map((record) => (
                <BbCard key={record.id} record={record} onPress={() => openRecord(record)} />
              ))}
            </View>
          )}
        </>
      )}
    </AppScreen>
  );
}

function HeaderActions({ onAdd, onPhoto }: { onAdd: () => void; onPhoto: () => void }) {
  return (
    <View style={styles.headerActions}>
      <Pressable onPress={onPhoto} style={styles.headerButton}>
        <Ionicons name="camera-outline" size={21} color={liderColors.text} />
      </Pressable>
      <Pressable onPress={onAdd} style={styles.headerButton}>
        <Ionicons name="add" size={24} color={liderColors.text} />
      </Pressable>
    </View>
  );
}

function ModeTab({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.modeTab, selected && styles.modeTabActive]}>
      <Text style={[styles.modeText, selected && styles.modeTextActive]}>{label}</Text>
    </Pressable>
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
  headerActions: {
    flexDirection: 'row',
    gap: 4,
  },
  headerButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  modeTabs: {
    flexDirection: 'row',
    gap: 7,
    marginBottom: 14,
  },
  listModeRow: {
    flexDirection: 'row',
    gap: 7,
  },
  modeTab: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    backgroundColor: liderColors.surface,
    paddingHorizontal: 6,
  },
  modeTabActive: {
    borderColor: liderColors.blue,
    backgroundColor: 'rgba(45, 124, 255, 0.16)',
  },
  modeText: {
    color: liderColors.muted,
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
  },
  modeTextActive: {
    color: liderColors.blue,
  },
  searchRow: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    backgroundColor: liderColors.surface,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    color: liderColors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  list: {
    gap: 10,
  },
  group: {
    gap: 8,
  },
  groupTitle: {
    color: liderColors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  stateCard: {
    minHeight: 126,
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
});
