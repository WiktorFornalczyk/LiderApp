import Ionicons from '@expo/vector-icons/Ionicons';
import { ComponentProps, PropsWithChildren, ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const liderColors = {
  bg: '#080d12',
  surface: '#111821',
  surfaceAlt: '#151d27',
  surfaceSoft: '#0d141c',
  border: '#243140',
  borderSoft: '#1b2633',
  text: '#f4f7fb',
  muted: '#8f9ba8',
  dim: '#637181',
  blue: '#2d7cff',
  green: '#32c66a',
  amber: '#f5a524',
  violet: '#9b73ff',
  red: '#ff5c42',
};

export type LiderIconName = ComponentProps<typeof Ionicons>['name'];

type AppScreenProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  leftIcon?: LiderIconName;
  rightIcon?: LiderIconName;
  rightSlot?: ReactNode;
  wide?: boolean;
}>;

export function AppScreen({
  title,
  subtitle,
  leftIcon = 'menu-outline',
  rightIcon,
  rightSlot,
  wide = false,
  children,
}: AppScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.phoneFrame}>
        <View style={styles.statusBar}>
          <Text style={styles.statusText}>09:41</Text>
          <View style={styles.statusIcons}>
            <Ionicons name="cellular" size={13} color={liderColors.text} />
            <Ionicons name="wifi" size={13} color={liderColors.text} />
            <Ionicons name="battery-full" size={16} color={liderColors.text} />
          </View>
        </View>

        <View style={styles.header}>
          <IconButton name={leftIcon} />
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>{title}</Text>
            {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
          </View>
          {rightSlot ?? (rightIcon ? <IconButton name={rightIcon} /> : <View style={styles.iconSpacer} />)}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, wide && styles.contentWide]}>
          {children}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

export function IconButton({ name, accent }: { name: LiderIconName; accent?: boolean }) {
  return (
    <Pressable style={styles.iconButton}>
      <Ionicons name={name} size={22} color={accent ? liderColors.blue : liderColors.text} />
      {name === 'notifications-outline' ? <View style={styles.dot} /> : null}
    </Pressable>
  );
}

export function SectionTitle({ children }: PropsWithChildren) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export function Card({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Pill({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: 'blue' | 'green' | 'amber' | 'red' | 'neutral';
}) {
  return (
    <View style={[styles.pill, toneMap[tone].pill]}>
      <Text style={[styles.pillText, toneMap[tone].text]}>{label}</Text>
    </View>
  );
}

export function EmptySpacer({ height = 12 }: { height?: number }) {
  return <View style={{ height }} />;
}

const toneStyles = StyleSheet.create({
  bluePill: { backgroundColor: 'rgba(45, 124, 255, 0.16)' },
  blueText: { color: liderColors.blue },
  greenPill: { backgroundColor: 'rgba(50, 198, 106, 0.16)' },
  greenText: { color: liderColors.green },
  amberPill: { backgroundColor: 'rgba(245, 165, 36, 0.16)' },
  amberText: { color: liderColors.amber },
  redPill: { backgroundColor: 'rgba(255, 92, 66, 0.16)' },
  redText: { color: liderColors.red },
  neutralPill: { backgroundColor: 'rgba(143, 155, 168, 0.13)' },
  neutralText: { color: liderColors.muted },
});

const toneMap = {
  blue: { pill: toneStyles.bluePill, text: toneStyles.blueText },
  green: { pill: toneStyles.greenPill, text: toneStyles.greenText },
  amber: { pill: toneStyles.amberPill, text: toneStyles.amberText },
  red: { pill: toneStyles.redPill, text: toneStyles.redText },
  neutral: { pill: toneStyles.neutralPill, text: toneStyles.neutralText },
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: liderColors.bg,
  },
  phoneFrame: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 520,
    backgroundColor: liderColors.bg,
  },
  statusBar: {
    height: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  statusText: {
    color: liderColors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  header: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: liderColors.borderSoft,
    paddingHorizontal: 16,
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: liderColors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  headerSubtitle: {
    marginTop: 2,
    color: liderColors.dim,
    fontSize: 10,
    fontWeight: '600',
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  iconSpacer: {
    width: 36,
    height: 36,
  },
  dot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: liderColors.red,
    borderWidth: 1,
    borderColor: liderColors.bg,
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  contentWide: {
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  sectionTitle: {
    marginBottom: 10,
    color: '#d7dde5',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  card: {
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    backgroundColor: liderColors.surface,
  },
  pill: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '800',
  },
});
