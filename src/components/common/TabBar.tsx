import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePathname, useRouter } from 'expo-router';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

const ORANGE = '#F26522';
const MUTED = '#777777';
const BG = '#0a0a0a';
const BORDER = '#1a1a1a';

// ── Placeholder icons ──────────────────────────────────────────────────────────

function DashboardIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="8" height="8" rx="1" stroke={color} strokeWidth={1.5} />
      <Rect x="13" y="3" width="8" height="8" rx="1" stroke={color} strokeWidth={1.5} />
      <Rect x="3" y="13" width="8" height="8" rx="1" stroke={color} strokeWidth={1.5} />
      <Rect x="13" y="13" width="8" height="8" rx="1" stroke={color} strokeWidth={1.5} />
    </Svg>
  );
}

function ChatroomIcon({ color }: { color: string }) {
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

function PnlIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M3 17L8 12L12 16L17 9L21 13" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M17 9H21V13" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function AuditIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth={1.5} />
      <Line x1="7" y1="8" x2="17" y2="8" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Line x1="7" y1="12" x2="17" y2="12" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Line x1="7" y1="16" x2="13" y2="16" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

function ResourcesIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M6.5 2H20V22H6.5A2.5 2.5 0 014 19.5V4.5A2.5 2.5 0 016.5 2Z" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
    </Svg>
  );
}

// ── Tab definitions ────────────────────────────────────────────────────────────

const TABS = [
  { id: 'dashboard', label: 'Dashboard', route: '/(app)/dashboard',  Icon: DashboardIcon },
  { id: 'chatroom',  label: 'Chatroom',  route: '/(app)/chatroom/',  Icon: ChatroomIcon },
  { id: 'pnl',       label: 'P&L',       route: '/(app)/pnl',        Icon: PnlIcon },
  { id: 'audit',     label: 'Audit',     route: '/(app)/audit',      Icon: AuditIcon },
  { id: 'resources', label: 'Resources', route: '/(app)/resources',  Icon: ResourcesIcon },
] as const;

function getActive(pathname: string): string {
  if (pathname.includes('/trees'))     return 'dashboard';
  if (pathname.includes('/channels'))  return 'dashboard';
  if (pathname.includes('/wallet'))    return 'dashboard';
  if (pathname.includes('/settings'))  return 'resources';
  for (const t of TABS) {
    if (pathname.endsWith(`/${t.id}`)) return t.id;
  }
  return 'dashboard';
}

export default function TabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const activeId = getActive(pathname);

  if (pathname.includes('/trees')) return null;

  return (
    <SafeAreaView edges={['bottom']} style={s.safe}>
      <View style={s.bar}>
        {TABS.map(({ id, label, route, Icon }) => {
          const active = activeId === id;
          const color = active ? ORANGE : MUTED;
          return (
            <TouchableOpacity
              key={id}
              style={s.tab}
              onPress={() => router.push(route)}
              activeOpacity={0.7}
            >
              <Icon color={color} />
              <Text style={[s.label, active && s.labelActive]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { backgroundColor: BG },
  bar:         { flexDirection: 'row', borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 10, paddingBottom: 2 },
  tab:         { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 4 },
  label:       { fontSize: 9, marginTop: 4, letterSpacing: 0.3, color: MUTED },
  labelActive: { color: ORANGE },
});
