import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  cryptoTotal: number;
  fiatTotal: number;
  profitNet: number;
}

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

const fmtPnl = (n: number) =>
  `${n >= 0 ? '+' : '-'}${fmt(Math.abs(n))}`;

export default function PortfolioCard({ cryptoTotal, fiatTotal, profitNet }: Props) {
  const total = cryptoTotal + fiatTotal;
  const pnlUp = profitNet >= 0;

  return (
    <View style={s.card}>
      <Text style={s.label}>TOTAL PORTFOLIO</Text>
      <Text style={s.total}>{fmt(total)}</Text>

      <View style={s.row}>
        <View style={s.stat}>
          <Text style={s.statLabel}>Crypto</Text>
          <Text style={s.statValue}>{fmt(cryptoTotal)}</Text>
        </View>
        <View style={s.divider} />
        <View style={s.stat}>
          <Text style={s.statLabel}>Fiat</Text>
          <Text style={s.statValue}>{fmt(fiatTotal)}</Text>
        </View>
        <View style={s.divider} />
        <View style={s.stat}>
          <Text style={s.statLabel}>Net P&L</Text>
          <Text style={[s.statValue, { color: pnlUp ? '#22c55e' : '#ef4444' }]}>
            {fmtPnl(profitNet)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: '#111111',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1e1e1e',
  },
  label: {
    fontSize: 11,
    color: '#555555',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  total: {
    fontSize: 38,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 28,
    letterSpacing: -0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 16,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#666666',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: '#1e1e1e',
  },
});
