import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme';

interface BadgeProps {
  status: 'critical' | 'review' | 'resolved';
  label: string;
  style?: ViewStyle;
}

export function Badge({ status, label, style }: BadgeProps) {
  let backgroundColor = theme.colors.surfaceContainer;
  let textColor = theme.colors.onSurface;
  let borderColor = theme.colors.outlineVariant;

  if (status === 'critical') {
    backgroundColor = '#FEF2F2';
    borderColor = '#FCA5A5';
    textColor = '#DC2626';
  } else if (status === 'review') {
    backgroundColor = '#FFFBEB';
    borderColor = '#FDE68A';
    textColor = '#D97706';
  } else if (status === 'resolved') {
    backgroundColor = '#ECFDF5';
    borderColor = '#A7F3D0';
    textColor = '#059669';
  }

  return (
    <View style={[styles.badge, { backgroundColor, borderColor }, style]}>
      <Text style={[styles.text, { color: textColor }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: theme.spacing.spaceSm,
    paddingVertical: theme.spacing.spaceXs,
    borderRadius: theme.rounded.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.labelSm.fontSize,
    fontWeight: theme.typography.labelSm.fontWeight as any,
    letterSpacing: 0.5,
  },
});
