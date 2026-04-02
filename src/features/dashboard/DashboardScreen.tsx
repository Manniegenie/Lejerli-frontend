import React from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/authSlice';
import authService from '../../services/authService';


export default function DashboardScreen({ navigation }: any) {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const handleSignOut = async () => {
    await authService.logout();
    dispatch(logout());
  };

  return (
    <View style={styles.container}>

      {/* ── Left pane (703px — matches auth image panel) ── */}
      <View style={styles.leftPane}>

        {/* Logo */}
        <View style={styles.logoRow}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* CTA button */}
        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.ctaButton} activeOpacity={0.85}>
            <Text style={styles.ctaText}>Quick Access</Text>
            <View style={styles.ctaDivider} />
            <Image source={require('../../../assets/cross.png')} style={styles.ctaCrossEnd} resizeMode="contain" />
          </TouchableOpacity>
        </View>
        <View style={styles.ctaUnderline} />

        {/* Secondary button */}
        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.ctaSecondary} activeOpacity={0.85}>
            <Image source={require('../../../assets/Vector.png')} style={styles.vectorIcon} resizeMode="contain" />
            <Text style={styles.ctaText}>Dashboard</Text>
          </TouchableOpacity>
        </View>

        {/* Channels button */}
        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.ctaChannels} activeOpacity={0.85}>
            <Image source={require('../../../assets/material-symbols_window.png')} style={styles.windowIcon} resizeMode="contain" />
            <Text style={styles.ctaText}>Channels</Text>
            <Image source={require('../../../assets/chevron-down.png')} style={styles.chevronIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        {/* Reconciliation button */}
        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.ctaChannels} activeOpacity={0.85}>
            <Image source={require('../../../assets/token_swap.png')} style={styles.windowIcon} resizeMode="contain" />
            <Text style={styles.ctaText}>Reconciliation</Text>
            <Image source={require('../../../assets/chevron-down.png')} style={styles.chevronIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        {/* P&L Engine button */}
        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.ctaChannels} activeOpacity={0.85}>
            <Image source={require('../../../assets/carbon_circle-filled.png')} style={styles.windowIcon} resizeMode="contain" />
            <Text style={styles.ctaText}>P&L Engine</Text>
            <Image source={require('../../../assets/chevron-down.png')} style={styles.chevronIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>


        {/* Alerts button */}
        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.ctaChannels} activeOpacity={0.85}>
            <Image source={require('../../../assets/mingcute_notification-fill.png')} style={styles.windowIcon} resizeMode="contain" />
            <Text style={styles.ctaText}>Alerts</Text>
            <Image source={require('../../../assets/chevron-down.png')} style={styles.chevronIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        {/* AI Insights button */}
        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.ctaChannels} activeOpacity={0.85}>
            <Image source={require('../../../assets/mingcute_ai-fill.png')} style={styles.windowIcon} resizeMode="contain" />
            <Text style={styles.ctaText}>AI Insights</Text>
            <Image source={require('../../../assets/chevron-down.png')} style={styles.chevronIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        {/* Audit Log button */}
        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.ctaChannels} activeOpacity={0.85}>
            <Image source={require('../../../assets/icon-park-solid_audit.png')} style={styles.windowIcon} resizeMode="contain" />
            <Text style={styles.ctaText}>Audit Log</Text>
            <Image source={require('../../../assets/chevron-down.png')} style={styles.chevronIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        {/* Settings button */}
        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.ctaChannels} activeOpacity={0.85}>
            <Image source={require('../../../assets/Vector (1).png')} style={styles.windowIcon} resizeMode="contain" />
            <Text style={styles.ctaText}>Settings</Text>
            <Image source={require('../../../assets/chevron-down.png')} style={styles.chevronIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Bottom — user info + sign out */}
        <View style={styles.bottomSection}>
          <View style={styles.dividerLine} />

          <View style={styles.userRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.username || '—'}</Text>
              <Text style={styles.userEmail}>{user?.email || '—'}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Main content ── */}
      <View style={styles.mainContent}>
        <View style={styles.contentInner}>
          <View style={styles.topBar}>
            <View>
              <Text style={styles.pageTitle}>Dashboard</Text>
              <Text style={styles.pageSubtitle}>Manage accounts</Text>
            </View>
            <View style={styles.searchRow}>
              <Image source={require('../../../assets/Group (2).png')} style={styles.searchIcon} resizeMode="contain" />
              <View style={styles.searchInput}>
                <View style={styles.searchInner}>
                  <Image source={require('../../../assets/tdesign_ai-search.png')} style={styles.searchIcon} resizeMode="contain" />
                  <TextInput style={styles.searchField} placeholder="Search portfolio" placeholderTextColor="#737373" />
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#0a0a0a',
  },

  // ── Left pane ──────────────────────────────────────────
  leftPane: {
    width: 337,
    backgroundColor: '#0d0d0d',
    borderRightWidth: 1,
    borderRightColor: '#2a2a2a',
    flexDirection: 'column',
  },

  logoRow: {
    paddingHorizontal: 25,
    paddingTop: 48,
    paddingBottom: 40,
  },
  logo: {
    width: 164,
    height: 28.72,
  },

  ctaRow: {
    paddingHorizontal: 25,
    marginBottom: 16,
  },
  ctaUnderline: {
    width: 287,
    height: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
    marginLeft: 25,
    marginBottom: 40,
  },
  ctaButton: {
    width: 287,
    height: 80,
    backgroundColor: '#F26522',
    borderRadius: 6,
    padding: 12,
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  ctaDivider: {
    position: 'absolute',
    left: 216,
    top: 0,
    width: 1,
    height: 80,
    backgroundColor: '#ffffff',
    opacity: 1,
  },
  ctaCrossEnd: {
    position: 'absolute',
    right: 24,
    top: 28,
    width: 24,
    height: 24,
  },
  ctaSecondary: {
    width: 287,
    height: 68,
    backgroundColor: '#F26522',
    borderRadius: 6,
    padding: 12,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  ctaChannels: {
    width: 287,
    height: 68,
    backgroundColor: '#171717',
    borderRadius: 6,
    padding: 12,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  vectorIcon: {
    width: 24,
    height: 24,
  },
  windowIcon: {
    width: 24,
    height: 24,
  },
  chevronIcon: {
    width: 24,
    height: 24,
    marginLeft: 'auto',
  },
  ctaText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'GeneralSans',
    width: 191,
    height: 24,
    gap: 12,
  },
  nav: {
    flex: 1,
    paddingHorizontal: 25,
    gap: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    position: 'relative',
  },
  navItemActive: {
    backgroundColor: '#1a1a1a',
  },
  navLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#555555',
    flex: 1,
    fontFamily: 'GeneralSans',
  },
  navLabelActive: {
    color: '#ffffff',
  },
  navIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F26522',
  },

  // ── Bottom section ─────────────────────────────────────
  bottomSection: {
    paddingHorizontal: 25,
    paddingBottom: 40,
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#2a2a2a',
    marginBottom: 24,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F26522',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'GeneralSans',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: 'GeneralSans',
  },
  userEmail: {
    fontSize: 12,
    color: '#555555',
    marginTop: 2,
    fontFamily: 'GeneralSans',
  },
  signOutButton: {
    height: 44,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#888888',
    fontFamily: 'GeneralSans',
  },

  // ── Main content ───────────────────────────────────────
  mainContent: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  contentInner: {
    paddingHorizontal: 48,
    paddingTop: 60,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 371,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchIcon: {
    width: 24,
    height: 24,
  },
  searchInput: {
    width: 619,
    height: 68,
    backgroundColor: '#171717',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#383838',
    position: 'relative',
  },
  searchInner: {
    width: 324,
    height: 27,
    position: 'absolute',
    top: 19,
    left: 21,
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  searchField: {
    width: 146,
    height: 27,
    color: '#ffffff',
    fontFamily: 'GeneralSans',
    fontWeight: '400',
    fontSize: 20,
    lineHeight: 20,
    letterSpacing: 0,
    outlineStyle: 'none' as any,
    outlineWidth: 0,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: 32,
    fontFamily: 'GeneralSans',
    letterSpacing: 0,
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 15,
    color: '#888888',
    fontFamily: 'GeneralSans',
  },
});
