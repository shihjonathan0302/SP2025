// src/screens/settings/SubscriptionScreen.js
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SubscriptionScreen() {
  // JS 版：不要用 TS 泛型
  const [billing, setBilling] = useState('monthly'); // 'monthly' | 'yearly'

  const isYearly = billing === 'yearly';
  const price = useMemo(
    () => ({
      free: { monthly: '0', yearly: '0' },
      pro: { monthly: '9', yearly: '79' }, // ≈$6.6/mo
      team: { monthly: '19', yearly: '159' }, // ≈$13.2/mo
    }),
    []
  );

  const handleSelect = (plan) => {
    Alert.alert('Coming soon', `Subscribe to ${plan} (${billing}) coming soon.`);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
    >
      {/* Header */}
      <Text style={styles.h1}>Choose your plan</Text>
      <Text style={styles.sub}>
        Power up Futra with the plan that fits you best.
      </Text>

      {/* Billing toggle */}
      <View style={styles.toggleWrap}>
        <Pressable
          onPress={() => setBilling('monthly')}
          style={[styles.toggleBtn, billing === 'monthly' && styles.toggleActive]}
        >
          <Text
            style={[
              styles.toggleTxt,
              billing === 'monthly' && styles.toggleTxtActive,
            ]}
          >
            Monthly
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setBilling('yearly')}
          style={[styles.toggleBtn, billing === 'yearly' && styles.toggleActive]}
        >
          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
            <Text
              style={[
                styles.toggleTxt,
                billing === 'yearly' && styles.toggleTxtActive,
              ]}
            >
              Yearly
            </Text>
            <View style={styles.saveBadge}>
              <Text style={styles.saveBadgeTxt}>Save 25%</Text>
            </View>
          </View>
        </Pressable>
      </View>

      {/* Plans */}
      <View style={styles.cards}>
        <PlanCard
          title="Free"
          desc="Start tracking goals"
          price={price.free[isYearly ? 'yearly' : 'monthly']}
          billing={billing}
          features={['Basic goal tracking', 'Community read-only', '1 project · 3 goals']}
          cta="Current plan"
          onPress={() => {}}
          muted
          current
        />

        <PlanCard
          title="Pro"
          desc="For serious individuals"
          price={price.pro[isYearly ? 'yearly' : 'monthly']}
          billing={billing}
          features={[
            'Unlimited goals & projects',
            'AI breakdown & daily steps',
            'Community posting & DMs',
            'Priority sync & support',
          ]}
          highlight
          ribbon="Most popular"
          cta="Choose Pro"
          onPress={() => handleSelect('Pro')}
        />

        <PlanCard
          title="Team"
          desc="For small teams"
          price={price.team[isYearly ? 'yearly' : 'monthly']}
          billing={billing}
          features={[
            'Everything in Pro',
            'Shared workspaces',
            'Role permissions',
            'Team insights & reports',
          ]}
          cta="Contact sales"
          onPress={() => handleSelect('Team')}
        />
      </View>

      {/* Footnote */}
      <Text style={styles.footnote}>
        Prices in USD. Taxes may apply. You can cancel anytime. Yearly plans are billed upfront.
      </Text>
    </ScrollView>
  );
}

/* ------------ Small components (JS 版，不加 TS 型別) ------------ */
function PlanCard({
  title,
  desc,
  price,
  billing, // 'monthly' | 'yearly'
  features,
  cta,
  onPress,
  highlight,
  ribbon,
  muted,
  current,
}) {
  return (
    <View
      style={[
        styles.card,
        highlight && styles.cardHighlight,
        muted && styles.cardMuted,
      ]}
    >
      {!!ribbon && (
        <View style={styles.ribbon}>
          <Text style={styles.ribbonTxt}>{ribbon}</Text>
        </View>
      )}

      <View style={{ gap: 6 }}>
        <Text style={[styles.cardTitle, highlight && { color: '#111' }]}>{title}</Text>
        <Text style={styles.cardDesc}>{desc}</Text>
      </View>

      <View style={styles.priceRow}>
        <Text style={[styles.price, highlight && { color: '#111' }]}>${price}</Text>
        <Text style={styles.per}>/{billing === 'yearly' ? 'yr' : 'mo'}</Text>
      </View>

      <View style={styles.divider} />

      <View style={{ gap: 8 }}>
        {features.map((f, idx) => (
          <View key={idx} style={styles.featRow}>
            <Ionicons
              name={highlight ? 'checkmark-circle' : 'checkmark-circle-outline'}
              size={18}
              color={highlight ? '#111' : '#64748B'}
              style={{ marginTop: 2 }}
            />
            <Text style={styles.featTxt}>{f}</Text>
          </View>
        ))}
      </View>

      <Pressable
        onPress={current ? undefined : onPress}
        disabled={current}
        style={({ pressed }) => [
          styles.cta,
          highlight && styles.ctaPrimary,
          current && styles.ctaDisabled,
          pressed && { opacity: 0.85 },
        ]}
      >
        <Text style={[styles.ctaTxt, highlight && styles.ctaTxtPrimary]}>
          {current ? 'Current plan' : cta}
        </Text>
      </Pressable>
    </View>
  );
}

/* ------------ Styles ------------ */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  h1: { fontSize: 22, fontWeight: '800', color: '#111' },
  sub: { color: '#6B7280', marginTop: 6, marginBottom: 12 },

  toggleWrap: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    alignSelf: 'flex-start',
    gap: 6,
    marginBottom: 14,
  },
  toggleBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  toggleActive: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb' },
  toggleTxt: { color: '#6B7280', fontWeight: '600' },
  toggleTxtActive: { color: '#111' },
  saveBadge: { backgroundColor: '#DCFCE7', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  saveBadgeTxt: { color: '#166534', fontSize: 11, fontWeight: '700' },

  cards: { gap: 12 },
  card: {
    borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 14,
    backgroundColor: '#fff',
    gap: 12,
    overflow: 'hidden',
  },
  cardMuted: { opacity: 0.9 },
  cardHighlight: {
    borderColor: '#111',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 6 },
  },

  ribbon: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: '#111',
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 999,
  },
  ribbonTxt: { color: '#fff', fontSize: 11, fontWeight: '700' },

  cardTitle: { fontSize: 18, fontWeight: '800', color: '#111' },
  cardDesc: { color: '#6B7280' },

  priceRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  price: { fontSize: 32, fontWeight: '900', color: '#111827' },
  per: { color: '#6B7280', marginBottom: 4 },

  divider: { height: 1, backgroundColor: '#F1F5F9' },

  featRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  featTxt: { color: '#111827' },

  cta: {
    marginTop: 8,
    borderWidth: 1, borderColor: '#E5E7EB',
    paddingVertical: 12, borderRadius: 12, alignItems: 'center',
    backgroundColor: '#fff',
  },
  ctaPrimary: { backgroundColor: '#111', borderColor: '#111' },
  ctaDisabled: { backgroundColor: '#F3F4F6', borderColor: '#E5E7EB' },
  ctaTxt: { fontWeight: '700', color: '#111' },
  ctaTxtPrimary: { color: '#fff' },
});