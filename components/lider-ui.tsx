import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useRouter } from 'expo-router';
import { ComponentProps, PropsWithChildren, ReactNode, useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import * as calendarService from '@/src/features/calendar/services/calendarService';
import { CalendarEvent } from '@/src/features/calendar/types/calendarTypes';
import { formatCalendarDate, formatEventTime } from '@/src/features/calendar/utils/calendarFormatUtils';

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

const liderLightColors = {
  bg: '#f4f7fb',
  surface: '#ffffff',
  surfaceAlt: '#edf2f7',
  surfaceSoft: '#eef3f8',
  border: '#c8d2df',
  borderSoft: '#dbe3ec',
  text: '#111827',
  muted: '#5d6977',
  dim: '#7a8795',
  blue: liderColors.blue,
  green: liderColors.green,
  amber: liderColors.amber,
  violet: liderColors.violet,
  red: liderColors.red,
};

export type LiderIconName = ComponentProps<typeof Ionicons>['name'];

type NotificationItem = {
  id: string;
  eventId: string;
  title: string;
  details: string;
  tone: 'today' | 'upcoming';
};

type AppScreenProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  leftIcon?: LiderIconName;
  onLeftPress?: () => void;
  rightIcon?: LiderIconName;
  rightSlot?: ReactNode;
  wide?: boolean;
}>;

export function AppScreen({
  title,
  subtitle,
  leftIcon,
  onLeftPress,
  rightIcon,
  rightSlot,
  wide = false,
  children,
}: AppScreenProps) {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'light' ? liderLightColors : liderColors;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);
  const router = useRouter();
  const resolvedLeftIcon = leftIcon ?? 'chevron-back';
  const openLeftMenu = resolvedLeftIcon === 'menu-outline' && !onLeftPress;
  const openNotifications = rightIcon === 'notifications-outline' && !rightSlot;

  const loadNotifications = useCallback(async () => {
    if (!openNotifications) {
      return;
    }

    try {
      setNotificationsError(null);
      setIsLoadingNotifications(true);
      const summary = await calendarService.getDashboardCalendarSummary();
      setNotifications(buildNotificationItems(summary.todayEvents, summary.upcomingEvents));
    } catch {
      setNotificationsError('Nie udało się wczytać powiadomień.');
    } finally {
      setIsLoadingNotifications(false);
    }
  }, [openNotifications]);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications])
  );

  function openNotificationCenter() {
    setIsNotificationsOpen(true);
    loadNotifications();
  }

  function goBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(tabs)' as never);
  }

  return (
    <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <View style={[styles.phoneFrame, { backgroundColor: colors.bg }]}>
        <View style={[styles.header, { borderBottomColor: colors.borderSoft }]}>
          <IconButton
            name={resolvedLeftIcon}
            onPress={openLeftMenu ? () => setIsMenuOpen(true) : onLeftPress ?? goBack}
            color={colors.text}
          />
          <View style={styles.headerTitleWrap}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
            {subtitle ? <Text style={[styles.headerSubtitle, { color: colors.dim }]}>{subtitle}</Text> : null}
          </View>
          {rightSlot ?? (
            rightIcon ? (
              <IconButton
                name={rightIcon}
                badge={openNotifications && notifications.length > 0}
                color={colors.text}
                onPress={openNotifications ? openNotificationCenter : undefined}
              />
            ) : (
              <View style={styles.iconSpacer} />
            )
          )}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, wide && styles.contentWide]}>
          {children}
        </ScrollView>
      </View>
      <MainMenu visible={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <NotificationCenter
        error={notificationsError}
        isLoading={isLoadingNotifications}
        items={notifications}
        visible={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onRefresh={loadNotifications}
      />
    </SafeAreaView>
  );
}

function buildNotificationItems(todayEvents: CalendarEvent[], upcomingEvents: CalendarEvent[]): NotificationItem[] {
  const todayItems = todayEvents.map((event) => ({
    id: `today-${event.id}`,
    eventId: event.id,
    title: event.title,
    details: `Dzisiaj · ${formatEventTime(event)} · ${event.eventType}`,
    tone: 'today' as const,
  }));
  const upcomingItems = upcomingEvents
    .filter((event) => !todayEvents.some((todayEvent) => todayEvent.id === event.id))
    .map((event) => ({
      id: `upcoming-${event.id}`,
      eventId: event.id,
      title: event.title,
      details: `${formatCalendarDate(event.eventDate)} · ${formatEventTime(event)} · ${event.eventType}`,
      tone: 'upcoming' as const,
    }));

  return [...todayItems, ...upcomingItems].slice(0, 8);
}

function MainMenu({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const router = useRouter();
  const items: { label: string; icon: LiderIconName; route: string }[] = [
    { label: 'Dashboard', icon: 'home-outline', route: '/(tabs)' },
    { label: 'BB', icon: 'briefcase-outline', route: '/(tabs)/bb' },
    { label: 'Grafik', icon: 'calendar-outline', route: '/(tabs)/grafik' },
    { label: 'Kalendarz', icon: 'today-outline', route: '/calendar' },
    { label: 'Notatki', icon: 'document-text-outline', route: '/(tabs)/notatki' },
    { label: 'Raporty', icon: 'reader-outline', route: '/reports' },
  ];

  function goTo(route: string) {
    onClose();
    router.push(route as never);
  }

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <Pressable onPress={onClose} style={styles.menuBackdrop}>
        <Pressable style={styles.menuPanel}>
          <View style={styles.menuHeader}>
            <Text style={styles.menuTitle}>Menu</Text>
            <IconButton name="close-outline" onPress={onClose} color={liderColors.text} />
          </View>
          {items.map((item, index) => (
            <Pressable
              key={item.label}
              onPress={() => goTo(item.route)}
              style={[styles.menuItem, index > 0 && styles.menuItemBorder]}>
              <Ionicons name={item.icon} size={20} color={liderColors.text} />
              <Text style={styles.menuItemText}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={liderColors.muted} />
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function IconButton({
  name,
  accent,
  badge,
  color,
  onPress,
}: {
  name: LiderIconName;
  accent?: boolean;
  badge?: boolean;
  color?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.iconButton}>
      <Ionicons name={name} size={22} color={accent ? liderColors.blue : color ?? liderColors.text} />
      {badge ? <View style={styles.dot} /> : null}
    </Pressable>
  );
}

function NotificationCenter({
  visible,
  items,
  isLoading,
  error,
  onClose,
  onRefresh,
}: {
  visible: boolean;
  items: NotificationItem[];
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const router = useRouter();

  function openEvent(eventId: string) {
    onClose();
    router.push(`/calendar/${eventId}` as never);
  }

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <Pressable onPress={onClose} style={styles.notificationBackdrop}>
        <Pressable style={styles.notificationPanel}>
          <View style={styles.notificationHeader}>
            <View>
              <Text style={styles.notificationTitle}>Powiadomienia</Text>
              <Text style={styles.notificationSubtitle}>Kalendarz i najbliższe terminy</Text>
            </View>
            <IconButton name="close-outline" onPress={onClose} color={liderColors.text} />
          </View>

          {isLoading ? (
            <View style={styles.notificationState}>
              <ActivityIndicator color={liderColors.blue} />
              <Text style={styles.notificationStateText}>Wczytywanie powiadomień...</Text>
            </View>
          ) : error ? (
            <View style={styles.notificationState}>
              <Text style={styles.notificationStateText}>{error}</Text>
              <Pressable onPress={onRefresh} style={styles.notificationAction}>
                <Text style={styles.notificationActionText}>Odśwież</Text>
              </Pressable>
            </View>
          ) : items.length === 0 ? (
            <View style={styles.notificationState}>
              <Ionicons name="notifications-off-outline" size={28} color={liderColors.muted} />
              <Text style={styles.notificationStateText}>Brak powiadomień.</Text>
              <Pressable onPress={() => openEvent('new')} style={styles.notificationAction}>
                <Text style={styles.notificationActionText}>Dodaj wydarzenie</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <ScrollView style={styles.notificationList} contentContainerStyle={styles.notificationListContent}>
                {items.map((item, index) => (
                  <Pressable
                    key={item.id}
                    onPress={() => openEvent(item.eventId)}
                    style={[styles.notificationItem, index > 0 && styles.notificationBorder]}>
                    <View style={[styles.notificationMarker, item.tone === 'today' && styles.notificationMarkerToday]} />
                    <View style={styles.notificationBody}>
                      <Text style={styles.notificationItemTitle}>{item.title}</Text>
                      <Text style={styles.notificationDetails}>{item.details}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={liderColors.muted} />
                  </Pressable>
                ))}
              </ScrollView>
              <Pressable onPress={onRefresh} style={styles.notificationAction}>
                <Text style={styles.notificationActionText}>Odśwież</Text>
              </Pressable>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
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
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  menuPanel: {
    width: '82%',
    maxWidth: 360,
    minHeight: '100%',
    borderRightWidth: 1,
    borderRightColor: liderColors.borderSoft,
    backgroundColor: liderColors.bg,
    paddingTop: 42,
    paddingHorizontal: 14,
  },
  menuHeader: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  menuTitle: {
    color: liderColors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  menuItem: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 8,
  },
  menuItemBorder: {
    borderTopWidth: 1,
    borderTopColor: liderColors.borderSoft,
  },
  menuItemText: {
    flex: 1,
    color: liderColors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  notificationBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingTop: 74,
    paddingHorizontal: 14,
  },
  notificationPanel: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '76%',
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    backgroundColor: liderColors.bg,
    padding: 14,
  },
  notificationHeader: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  notificationTitle: {
    color: liderColors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  notificationSubtitle: {
    marginTop: 3,
    color: liderColors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  notificationList: {
    maxHeight: 360,
  },
  notificationListContent: {
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    backgroundColor: liderColors.surface,
    overflow: 'hidden',
  },
  notificationItem: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  notificationBorder: {
    borderTopWidth: 1,
    borderTopColor: liderColors.borderSoft,
  },
  notificationMarker: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: liderColors.blue,
  },
  notificationMarkerToday: {
    backgroundColor: liderColors.amber,
  },
  notificationBody: {
    flex: 1,
    gap: 3,
  },
  notificationItemTitle: {
    color: liderColors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  notificationDetails: {
    color: liderColors.muted,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
  },
  notificationState: {
    minHeight: 150,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    backgroundColor: liderColors.surface,
    padding: 16,
  },
  notificationStateText: {
    color: liderColors.muted,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 18,
  },
  notificationAction: {
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    backgroundColor: liderColors.surfaceSoft,
    paddingHorizontal: 12,
    marginTop: 10,
  },
  notificationActionText: {
    color: liderColors.blue,
    fontSize: 12,
    fontWeight: '900',
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
