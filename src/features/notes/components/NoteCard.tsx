import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, liderColors } from '@/components/lider-ui';
import { Note } from '../types/noteTypes';

type NoteCardProps = {
  note: Note;
  onPress: () => void;
  onToggleImportant: () => void;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function createPreview(content: string) {
  const compact = content.replace(/\s+/g, ' ').trim();
  return compact.length > 110 ? `${compact.slice(0, 110)}...` : compact;
}

export function NoteCard({ note, onPress, onToggleImportant }: NoteCardProps) {
  return (
    <Pressable onPress={onPress}>
      <Card style={[styles.card, note.isImportant && styles.importantCard]}>
        <View style={styles.header}>
          <View style={styles.titleWrap}>
            <Text numberOfLines={1} style={styles.title}>
              {note.title || 'Bez tytułu'}
            </Text>
            {note.isImportant ? (
              <View style={styles.badge}>
                <Ionicons name="star" size={12} color={liderColors.amber} />
                <Text style={styles.badgeText}>Ważna</Text>
              </View>
            ) : null}
          </View>
          <Pressable
            accessibilityLabel="Przełącz ważność notatki"
            hitSlop={10}
            onPress={(event) => {
              event.stopPropagation();
              onToggleImportant();
            }}
            style={styles.starButton}>
            <Ionicons
              name={note.isImportant ? 'star' : 'star-outline'}
              size={22}
              color={note.isImportant ? liderColors.amber : liderColors.dim}
            />
          </Pressable>
        </View>

        <Text numberOfLines={2} style={styles.preview}>
          {createPreview(note.content)}
        </Text>

        <View style={styles.footer}>
          <Ionicons name="time-outline" size={14} color={liderColors.muted} />
          <Text style={styles.date}>Edytowano: {formatDate(note.updatedAt)}</Text>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    gap: 10,
  },
  importantCard: {
    borderColor: 'rgba(245, 165, 36, 0.72)',
    backgroundColor: '#151a1e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  titleWrap: {
    flex: 1,
    gap: 7,
  },
  title: {
    color: liderColors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 6,
    backgroundColor: 'rgba(245, 165, 36, 0.14)',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    color: liderColors.amber,
    fontSize: 11,
    fontWeight: '800',
  },
  starButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  preview: {
    color: '#c6ced8',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  date: {
    color: liderColors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
});
