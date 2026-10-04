import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, TextInput, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useTheme } from '../context/ThemeContext';

export function OTPVerificationScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const [code, setCode] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(42);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    return `00:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const isComplete = code.length === 6;
  const handlePressOTP = () => inputRef.current?.focus();

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: isDark ? '#000000' : '#ffffff' }]}>
        <View style={[styles.header, { backgroundColor: isDark ? '#000000' : '#ffffff', borderBottomColor: isDark ? '#18181b' : '#e4e4e7', borderBottomWidth: 1 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: isDark ? '#18181b' : '#f4f4f5' }]}>
            <MaterialIcons name="arrow-back" size={24} color={isDark ? '#ffffff' : theme.colors.onSurface} />
          </TouchableOpacity>
          <View style={styles.headerBrand}>
            <Text style={styles.brandText}>CivicRoad</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={[styles.officialBadge, { backgroundColor: isDark ? '#18181b' : theme.colors.surfaceContainer }]}>
              <MaterialIcons name="verified-user" size={14} color={theme.colors.primary} />
              <Text style={[styles.officialText, { color: isDark ? '#a1a1aa' : theme.colors.onSurfaceVariant }]}>OFFICIAL</Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Security Banner */}
          <View style={[styles.securityBanner, { backgroundColor: isDark ? '#09090b' : '#f4f4f5', borderColor: isDark ? '#18181b' : '#e4e4e7', borderWidth: 1 }]}>
            <View style={styles.securityBannerLeft}>
              <MaterialIcons name="verified" size={16} color={theme.colors.tertiary} />
              <Text style={[styles.securityBannerText, { color: isDark ? '#a1a1aa' : '#71717a' }]}>CivicRoad Secure Auth • 256-Bit Encrypted</Text>
            </View>
            <View style={styles.stepBadge}>
              <Text style={styles.stepText}>Step 2 of 2</Text>
            </View>
          </View>

          {/* Main Card */}
          <View style={[styles.card, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7', borderWidth: 1 }]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={[styles.iconBox, { backgroundColor: isDark ? '#18181b' : theme.colors.surfaceContainer }]}>
                  <MaterialIcons name="mark-email-read" size={28} color={theme.colors.primary} />
                </View>
                <View>
                  <Text style={[styles.cardTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>Enter 6-Digit Code</Text>
                  <Text style={[styles.cardSubtitle, { color: isDark ? '#a1a1aa' : '#71717a' }]}>One-Time Passcode Generated</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
                <MaterialIcons name="close" size={18} color={isDark ? '#a1a1aa' : theme.colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            <View style={[styles.recipientInfo, { backgroundColor: isDark ? '#09090b' : '#f4f4f5', borderColor: isDark ? '#18181b' : '#e4e4e7', borderWidth: 1 }]}>
              <View style={styles.recipientLeft}>
                <MaterialIcons name="sms" size={20} color={theme.colors.secondary} />
                <View>
                  <Text style={[styles.recipientTextSmall, { color: isDark ? '#a1a1aa' : '#71717a' }]}>Code sent via SMS to</Text>
                  <Text style={[styles.recipientTextLarge, { color: isDark ? '#ffffff' : '#09090b' }]}>+1 (555) 019-2834</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.editBtn}>
                <MaterialIcons name="edit" size={16} color={theme.colors.primary} />
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.pasteRow}>
              <TouchableOpacity style={[styles.pasteBtn, { backgroundColor: isDark ? '#18181b' : '#f4f4f5', borderColor: isDark ? '#27272a' : '#e4e4e7', borderWidth: 1 }]} onPress={() => setCode('842901')}>
                <MaterialIcons name="content-paste-go" size={18} color={theme.colors.primary} />
                <Text style={[styles.pasteText, { color: isDark ? '#ffffff' : '#09090b' }]}>From Messages: <Text style={styles.pasteTextBold}>842901</Text></Text>
                <MaterialIcons name="touch-app" size={16} color={theme.colors.secondary} />
              </TouchableOpacity>
            </View>

            {/* OTP Grid */}
            <Pressable style={styles.otpGrid} onPress={handlePressOTP}>
              <TextInput
                ref={inputRef}
                value={code}
                onChangeText={setCode}
                maxLength={6}
                keyboardType="numeric"
                textContentType="oneTimeCode"
                autoComplete="sms-otp"
                style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }}
              />
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <View 
                  key={index} 
                  style={[
                    styles.otpCell,
                    { backgroundColor: isDark ? '#18181b' : '#f4f4f5', borderColor: isDark ? '#27272a' : '#e4e4e7' },
                    index === code.length && styles.otpCellActive,
                    index < code.length && styles.otpCellFilled
                  ]}
                >
                  {index < code.length ? (
                    <Text style={[styles.otpText, { color: isDark ? '#ffffff' : '#09090b' }]}>{code[index]}</Text>
                  ) : index === code.length ? (
                    <View style={styles.cursor} />
                  ) : (
                    <Text style={[styles.otpTextEmpty, { color: isDark ? '#71717a' : undefined }]}>•</Text>
                  )}
                </View>
              ))}
            </Pressable>

            <View style={styles.timerRow}>
              <View style={styles.timerLeft}>
                <MaterialIcons name="schedule" size={16} color={theme.colors.tertiary} />
                <Text style={[styles.timerText, { color: isDark ? '#a1a1aa' : '#71717a' }]}>Resend SMS in <Text style={styles.timerTextBold}>{formatTime(timeLeft)}</Text></Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.voiceCallText}>Try Voice Call</Text>
              </TouchableOpacity>
            </View>

            {/* Security Advisory */}
            <View style={[styles.advisoryCard, { backgroundColor: isDark ? '#09090b' : '#f4f4f5', borderColor: isDark ? '#18181b' : '#e4e4e7', borderWidth: 1 }]}>
              <View style={styles.advisoryHeader}>
                <View style={styles.advisoryHeaderLeft}>
                  <MaterialIcons name="badge" size={16} color={theme.colors.primary} />
                  <Text style={[styles.advisoryTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>Active Role</Text>
                </View>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>Verified Citizen</Text>
                </View>
              </View>
              <View style={styles.advisoryBody}>
                <MaterialIcons name="security-update-warning" size={15} color={theme.colors.secondary} />
                <Text style={[styles.advisoryText, { color: isDark ? '#a1a1aa' : '#71717a' }]}>CivicRoad administrators and DPW dispatchers will never ask for your 6-digit confirmation code.</Text>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity 
                style={[styles.verifyBtn, isComplete && styles.verifyBtnActive]}
                onPress={() => isComplete && navigation.navigate('MainTabs')}
                activeOpacity={isComplete ? 0.8 : 1}
              >
                <Text style={styles.verifyBtnText}>Verify & Continue</Text>
                <MaterialIcons name="arrow-forward" size={20} color="#ffffff" />
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.biometricBtn, { backgroundColor: isDark ? '#18181b' : '#f4f4f5' }]}>
                <MaterialIcons name="fingerprint" size={20} color={theme.colors.primary} />
                <Text style={[styles.biometricBtnText, { color: isDark ? '#ffffff' : theme.colors.primary }]}>Use Municipal Passkey / Face ID</Text>
              </TouchableOpacity>
            </View>
          </View>


        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.gutter,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  officialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.surfaceContainer,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  officialText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.onSurfaceVariant,
  },
  scrollContent: {
    padding: theme.spacing.margin,
    paddingBottom: 40,
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surfaceContainerLow,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  securityBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  securityBannerText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
  },
  stepBadge: {
    backgroundColor: theme.colors.surfaceContainerHigh,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stepText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.secondary,
  },
  card: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: theme.colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  cardSubtitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.tertiary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surfaceContainerLow,
    padding: 12,
    borderRadius: 12,
  },
  recipientLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recipientTextSmall: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  recipientTextLarge: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.surfaceContainerHigh,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editBtnText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  pasteRow: {
    alignItems: 'center',
    marginVertical: -4,
  },
  pasteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.secondaryContainer,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pasteText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.onSecondaryFixedVariant,
  },
  pasteTextBold: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  otpGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  otpCell: {
    flex: 1,
    height: 56,
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpCellActive: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  otpCellFilled: {
    backgroundColor: theme.colors.surfaceContainerLow,
  },
  otpText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 22,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  otpTextEmpty: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 22,
    fontWeight: '600',
    color: theme.colors.onSurface,
    opacity: 0.3,
  },
  cursor: {
    width: 2,
    height: 24,
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  timerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.secondary,
  },
  timerTextBold: {
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  voiceCallText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  advisoryCard: {
    backgroundColor: theme.colors.surfaceContainerLow,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  advisoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  advisoryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  advisoryTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  roleBadge: {
    backgroundColor: theme.colors.secondaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  roleBadgeText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.onSecondaryFixedVariant,
  },
  advisoryBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  advisoryText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: theme.colors.secondary,
    lineHeight: 16,
  },
  actions: {
    gap: 8,
    marginTop: 4,
  },
  verifyBtn: {
    height: 48,
    backgroundColor: theme.colors.primaryContainer,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    opacity: 0.7,
  },
  verifyBtnActive: {
    backgroundColor: theme.colors.primary,
    opacity: 1,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  verifyBtnText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onPrimary,
  },
  biometricBtn: {
    height: 44,
    backgroundColor: theme.colors.surfaceContainer,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  biometricBtnText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  keypadContainer: {
    marginTop: 24,
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: 16,
    padding: 16,
  },
  keypadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  keypadTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.secondary,
    letterSpacing: 0.5,
  },
  keypadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  keyBtn: {
    width: '31%',
    height: 48,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  keyNum: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  keyLetters: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 9,
    color: theme.colors.secondary,
    marginTop: 2,
  },
  keyBtnSpecial: {
    width: '31%',
    height: 48,
    backgroundColor: theme.colors.surfaceContainer,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keySpecialText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onSurfaceVariant,
  }
});
