import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen, Card, liderColors } from '@/components/lider-ui';

const notes = [
  {
    title: 'Kontrola linii L-I',
    body: 'Sprawdzić stan kapturownic na placu 2.',
    date: 'Dzisiaj, 08:30',
    important: true,
  },
  {
    title: 'Zamówienie palet',
    body: 'Zamówić plastikowe palety - 20 szt.',
    date: 'Wczoraj, 15:30',
    important: false,
  },
  {
    title: 'Awaria wózka widłowego',
    body: 'Wózek nr 7 czeka na serwis.',
    date: '12.05.2024, 11:20',
    important: false,
  },
  {
    title: 'Spotkanie produkcyjne',
    body: 'Omówienie planu na przyszły tydzień.',
    date: '10.05.2024, 09:00',
    important: false,
  },
];

export default function NotatkiScreen() {
  return (
    <AppScreen title="Notatki" rightIcon="add-outline">
      <View style={styles.tabs}>
        <Text style={[styles.tab, styles.tabActive]}>Wszystkie</Text>
        <Text style={styles.tab}>Ważne</Text>
      </View>

      <View style={styles.list}>
        {notes.map((note) => (
          <Card key={note.title} style={styles.note}>
            <View style={styles.noteHeader}>
              <Text style={styles.noteTitle}>{note.title}</Text>
              {note.important ? (
                <Ionicons name="star" size={18} color={liderColors.amber} />
              ) : (
                <Pressable style={styles.moreButton}>
                  <Ionicons name="ellipsis-horizontal" size={18} color={liderColors.dim} />
                </Pressable>
              )}
            </View>
            <Text style={styles.noteBody}>{note.body}</Text>
            <Text style={styles.noteDate}>{note.date}</Text>
          </Card>
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  tabs: {
    height: 42,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: liderColors.borderSoft,
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    color: liderColors.muted,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  tabActive: {
    color: liderColors.blue,
    borderBottomWidth: 2,
    borderBottomColor: liderColors.blue,
  },
  list: {
    gap: 10,
  },
  note: {
    padding: 14,
    gap: 9,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  noteTitle: {
    color: liderColors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  noteBody: {
    color: '#c6ced8',
    fontSize: 12,
    fontWeight: '600',
  },
  noteDate: {
    color: liderColors.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  moreButton: {
    width: 24,
    alignItems: 'center',
  },
});
