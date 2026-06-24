import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, liderColors } from '@/components/lider-ui';
import { YardWithStats } from '../types/yardTypes';

export function YardCard({ yard, onPress }: { yard: YardWithStats; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Card style={styles.card}>
        <View style={styles.body}>
          <Text style={styles.title}>{yard.name}</Text>
          <Text style={styles.description}>{yard.description || 'Brak opisu'}</Text>
          <Text style={styles.count}>Aktywne BB: {yard.activeBbCount}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={liderColors.muted} />
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: 14,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: liderColors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  description: {
    color: liderColors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  count: {
    color: liderColors.blue,
    fontSize: 12,
    fontWeight: '900',
  },
});
