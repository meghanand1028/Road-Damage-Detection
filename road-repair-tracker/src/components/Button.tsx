import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../../theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'emergency';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({ title, variant = 'primary', style, textStyle, ...props }: ButtonProps) {
  let backgroundColor = theme.colors.primary;
  let textColor = theme.colors.onPrimary;
  let borderColor = 'transparent';
  let borderWidth = 0;

  if (variant === 'secondary') {
    backgroundColor = theme.colors.surfaceContainerLowest;
    textColor = theme.colors.onSurface;
    borderColor = '#CBD5E1';
    borderWidth = 1.5;
  } else if (variant === 'emergency') {
    backgroundColor = theme.colors.alertCrimson;
    textColor = theme.colors.onError;
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor, borderColor, borderWidth },
        style,
      ]}
      {...props}
    >
      <Text style={[styles.text, { color: textColor }, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: theme.rounded.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.spaceLg,
  },
  text: {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.labelLg.fontSize,
    fontWeight: theme.typography.labelLg.fontWeight as any,
  },
});
