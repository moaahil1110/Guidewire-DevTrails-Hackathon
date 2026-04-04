import { StyleSheet, Text, View } from 'react-native';

import { Badge } from './Badge';
import { palette, radius, typography } from '../theme';
import { getClaimStatus, getDisruptionCode, getDisruptionLabel, formatCurrency, formatDate } from '../utils/format';
import type { Claim } from '../types';

type ReviewEntry = {
  releaseAt: number;
};

const codeColors = {
  RN: palette.orangeTint,
  HT: palette.errorBg,
  FF: palette.infoBg,
  CW: '#F3E8FF',
  PD: palette.successBg,
};

export function ClaimRow({
  claim,
  reviewEntry,
  now,
}: {
  claim: Claim;
  reviewEntry?: ReviewEntry;
  now: number;
}) {
  const code = getDisruptionCode(claim.disruption_type) as keyof typeof codeColors;
  const status = getClaimStatus(claim, reviewEntry?.releaseAt, now);

  return (
    <View style={styles.row}>
      <View style={[styles.codeCircle, { backgroundColor: codeColors[code] || palette.bgMuted }]}>
        <Text style={styles.codeText}>{code}</Text>
      </View>
      <View style={styles.center}>
        <Text style={styles.type}>{getDisruptionLabel(claim.disruption_type)}</Text>
        <Text style={styles.meta}>
          {formatDate(claim.created_at)} • {claim.payout_reference || `Claim ${claim.id}`}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.amount}>{formatCurrency(claim.payout_amount)}</Text>
        <Badge label={status.label} tone={status.tone} />
        {status.detail !== status.label ? <Text style={styles.detail}>{status.detail}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: palette.divider,
  },
  codeCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeText: {
    fontSize: 12,
    fontWeight: '800',
    color: palette.textPrimary,
  },
  center: {
    flex: 1,
    gap: 3,
  },
  type: {
    color: palette.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  meta: {
    ...typography.caption,
  },
  right: {
    alignItems: 'flex-end',
    gap: 6,
    maxWidth: 100,
  },
  amount: {
    color: palette.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  detail: {
    ...typography.caption,
    textAlign: 'right',
  },
});
