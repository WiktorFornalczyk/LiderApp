import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { AppScreen, Card, liderColors, SectionTitle } from '@/components/lider-ui';

const days = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];
const numbers = ['13', '14', '15', '16', '17', '18', '19'];
const rows = [
  { name: 'Jan Kowalski', shifts: ['1', '2', '2', 'U', 'U', 'U'] },
  { name: 'Piotr Nowak', shifts: ['1', '2', '3', '3', '1', 'L4'] },
  { name: 'Adam Wójcik', shifts: ['1', '2', '3', 'U', 'U', 'U'] },
  { name: 'Tomasz Kaczmarek', shifts: ['1', '2', '3', 'U', 'U', 'U'] },
  { name: 'Krzysztof Zieliński', shifts: ['1', '3', '3', '2', 'U', 'U'] },
];

export default function GrafikScreen() {
  return (
    <AppScreen title="Grafik" rightIcon="calendar-outline">
      <View style={styles.weekHeader}>
        <Ionicons name="chevron-back" size={20} color={liderColors.text} />
        <View>
          <Text style={styles.weekTitle}>13.05.2024 - 19.05.2024</Text>
          <Text style={styles.weekSub}>Tydzień 20</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={liderColors.text} />
      </View>

      <View style={styles.days}>
        <View style={styles.nameSpace} />
        {days.map((day, index) => (
          <View key={day} style={[styles.dayCell, index === 2 && styles.dayActive]}>
            <Text style={styles.dayText}>{day}</Text>
            <Text style={styles.dayNumber}>{numbers[index]}</Text>
          </View>
        ))}
      </View>

      <Card style={styles.schedule}>
        {rows.map((row, index) => (
          <View key={row.name} style={[styles.shiftRow, index > 0 && styles.shiftBorder]}>
            <Text style={styles.workerName}>{row.name}</Text>
            <View style={styles.shiftCells}>
              {row.shifts.map((shift, shiftIndex) => (
                <View key={`${row.name}-${shiftIndex}`} style={[styles.shiftBadge, badgeStyle(shift)]}>
                  <Text style={styles.shiftText}>{shift}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </Card>

      <SectionTitle>Legenda</SectionTitle>
      <View style={styles.legend}>
        {['Zmiana 1', 'Zmiana 2', 'Zmiana 3', 'Urlop', 'Zwol. lekarskie'].map((label, index) => (
          <View key={label} style={styles.legendItem}>
            <View style={[styles.legendDot, [styles.one, styles.two, styles.three, styles.off, styles.sick][index]]} />
            <Text style={styles.legendText}>{label}</Text>
          </View>
        ))}
      </View>
    </AppScreen>
  );
}

function badgeStyle(shift: string) {
  if (shift === '1') return styles.one;
  if (shift === '2') return styles.two;
  if (shift === '3') return styles.three;
  if (shift === 'L4') return styles.sick;
  return styles.off;
}

const styles = StyleSheet.create({
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  weekTitle: {
    color: liderColors.text,
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },
  weekSub: {
    marginTop: 4,
    color: liderColors.muted,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  days: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  nameSpace: {
    width: 116,
  },
  dayCell: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  dayActive: {
    borderWidth: 1,
    borderColor: liderColors.blue,
    backgroundColor: 'rgba(45, 124, 255, 0.1)',
  },
  dayText: {
    color: liderColors.text,
    fontSize: 11,
    fontWeight: '800',
  },
  dayNumber: {
    marginTop: 3,
    color: liderColors.text,
    fontSize: 12,
    fontWeight: '800',
  },
  schedule: {
    paddingVertical: 8,
    marginBottom: 18,
  },
  shiftRow: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  shiftBorder: {
    borderTopWidth: 1,
    borderTopColor: liderColors.borderSoft,
  },
  workerName: {
    width: 116,
    color: liderColors.text,
    fontSize: 12,
    fontWeight: '800',
  },
  shiftCells: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shiftBadge: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  shiftText: {
    color: liderColors.text,
    fontSize: 11,
    fontWeight: '900',
  },
  one: {
    backgroundColor: 'rgba(50, 198, 106, 0.36)',
  },
  two: {
    backgroundColor: 'rgba(245, 165, 36, 0.38)',
  },
  three: {
    backgroundColor: 'rgba(45, 124, 255, 0.35)',
  },
  off: {
    backgroundColor: 'rgba(143, 155, 168, 0.22)',
  },
  sick: {
    backgroundColor: 'rgba(245, 165, 36, 0.55)',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginRight: 8,
  },
  legendDot: {
    width: 18,
    height: 18,
    borderRadius: 5,
  },
  legendText: {
    color: liderColors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
});
