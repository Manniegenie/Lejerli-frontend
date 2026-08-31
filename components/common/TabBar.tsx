import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePathname, useRouter } from 'expo-router';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import { useTheme } from '../../contexts/ThemeContext';

// ── Tab icons ───────────────────────────────────────────────────────────────

function ChatsIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 15C21 15.53 20.789 16.039 20.414 16.414C20.039 16.789 19.53 17 19 17H7L3 21V5C3 4.47 3.211 3.961 3.586 3.586C3.961 3.211 4.47 3 5 3H19C19.53 3 20.039 3.211 20.414 3.586C20.789 3.961 21 4.47 21 5V15Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function DesksIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="7" width="18" height="12" rx="1.5" stroke={color} strokeWidth={1.5} />
      <Path d="M8 7V5.5C8 4.67 8.67 4 9.5 4H14.5C15.33 4 16 4.67 16 5.5V7" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Line x1="3" y1="12" x2="21" y2="12" stroke={color} strokeWidth={1.5} />
    </Svg>
  );
}

function BlotterIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth={1.5} />
      <Line x1="7" y1="8" x2="17" y2="8" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Line x1="7" y1="12" x2="17" y2="12" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Line x1="7" y1="16" x2="13" y2="16" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

function ContactsIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="3.5" stroke={color} strokeWidth={1.5} />
      <Path d="M4.5 20C4.5 16.41 7.86 13.5 12 13.5C16.14 13.5 19.5 16.41 19.5 20" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

function SettingsIcon({ color, bg }: { color: string; bg: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Line x1="4" y1="6" x2="20" y2="6" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Line x1="4" y1="12" x2="20" y2="12" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Line x1="4" y1="18" x2="20" y2="18" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Circle cx="9" cy="6" r="2" stroke={color} strokeWidth={1.5} fill={bg} />
      <Circle cx="16" cy="12" r="2" stroke={color} strokeWidth={1.5} fill={bg} />
      <Circle cx="10" cy="18" r="2" stroke={color} strokeWidth={1.5} fill={bg} />
    </Svg>
  );
}

// ── Tab definitions ────────────────────────────────────────────────────────────

const TABS = [
  { id: 'chats',    label: 'Chats',    route: '/(app)/chats',    Icon: ChatsIcon },
  { id: 'desks',    label: 'Desks',    route: '/(app)/desks',    Icon: DesksIcon },
  { id: 'blotter',  label: 'Blotter',  route: '/(app)/blotter',  Icon: BlotterIcon },
  { id: 'contacts', label: 'Contacts', route: '/(app)/contacts', Icon: ContactsIcon },
  { id: 'settings', label: 'Settings', route: '/(app)/settings', Icon: SettingsIcon },
] as const;

function getActive(pathname: string): string {
  if (pathname.includes('/chats'))    return 'chats';
  if (pathname.includes('/desks'))    return 'desks';
  if (pathname.includes('/blotter'))  return 'blotter';
  if (pathname.includes('/contacts')) return 'contacts';
  if (pathname.includes('/settings')) return 'settings';
  return 'chats';
}

export default function TabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { colors } = useTheme();
  const activeId = getActive(pathname);

  return (
    <SafeAreaView edges={['bottom']} style={{ backgroundColor: colors.background }}>
      <View style={[s.bar, { borderTopColor: colors.border }]}>
        {TABS.map(({ id, label, route, Icon }) => {
          const active = activeId === id;
          const color = active ? colors.primary : colors.textSecondary;
          return (
            <TouchableOpacity
              key={id}
              style={s.tab}
              onPress={() => router.push(route)}
              activeOpacity={0.7}
            >
              <Icon color={color} bg={colors.background} />
              <Text style={[s.label, { color }]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  bar:   { flexDirection: 'row', borderTopWidth: 1, paddingTop: 10, paddingBottom: 2 },
  tab:   { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 4 },
  label: { fontSize: 9, marginTop: 4, letterSpacing: 0.3 },
});
