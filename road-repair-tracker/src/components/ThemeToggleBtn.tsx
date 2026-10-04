import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleBtnProps {
  compact?: boolean;
}

export function ThemeToggleBtn({ compact = false }: ThemeToggleBtnProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        isDark ? styles.containerDark : styles.containerLight,
        compact && styles.containerCompact
      ]}
      onPress={toggleTheme}
      activeOpacity={0.75}
      accessibilityLabel={`Switch theme. Currently in ${isDark ? 'Black' : 'White'} mode.`}
    >
      <View style={[styles.iconCircle, isDark ? styles.iconCircleDark : styles.iconCircleLight]}>
        <MaterialIcons 
          name={isDark ? "wb-sunny" : "dark-mode"} 
          size={compact ? 13 : 15} 
          color={isDark ? "#f59e0b" : "#3b82f6"} 
        />
      </View>
      <Text style={[styles.label, isDark ? styles.labelDark : styles.labelLight]}>
        {isDark ? "White" : "Black"}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  containerCompact: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 5,
  },
  containerLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e4e4e7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  containerDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 3,
  },
  iconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleLight: {
    backgroundColor: '#f4f4f5',
  },
  iconCircleDark: {
    backgroundColor: '#000000',
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  labelLight: {
    color: '#09090b',
  },
  labelDark: {
    color: '#ffffff',
  },
});
