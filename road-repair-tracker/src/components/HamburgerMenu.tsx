import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggleBtn } from './ThemeToggleBtn';

export function HamburgerMenu() {
  const [visible, setVisible] = useState(false);
  const { isDark } = useTheme();

  return (
    <>
      <TouchableOpacity 
        style={[styles.menuBtn, { backgroundColor: isDark ? '#18181b' : theme.colors.surfaceContainer }]}
        onPress={() => setVisible(true)}
      >
        <MaterialIcons name="menu" size={24} color={isDark ? '#ffffff' : theme.colors.onSurface} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <Pressable style={[styles.menuContent, { backgroundColor: isDark ? '#18181b' : '#ffffff', borderColor: isDark ? '#27272a' : '#e4e4e7' }]}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: isDark ? '#ffffff' : '#09090b' }]}>Menu</Text>
              <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeBtn}>
                <MaterialIcons name="close" size={20} color={isDark ? '#a1a1aa' : theme.colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            <View style={styles.menuItem}>
              <Text style={[styles.menuLabel, { color: isDark ? '#d4d4d8' : '#3f3f46' }]}>App Theme</Text>
              <ThemeToggleBtn />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 16,
  },
  menuContent: {
    width: 280,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 4,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  menuLabel: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 16,
    fontWeight: '500',
  }
});
