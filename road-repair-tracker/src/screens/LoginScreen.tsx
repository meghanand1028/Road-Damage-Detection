import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useTheme } from '../context/ThemeContext';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../services/firebase';
import Constants from 'expo-constants';
import { Alert } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export function LoginScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const [role, setRole] = useState<'citizen' | 'admin'>('citizen');
  const [authMode, setAuthMode] = useState<'otp' | 'pwd'>('otp');
  const [passwordVisible, setPasswordVisible] = useState(false);



  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: '533964304637-9465htodkkkj0gjpcbhqob401ckkssap.apps.googleusercontent.com',
    iosClientId: '533964304637-9465htodkkkj0gjpcbhqob401ckkssap.apps.googleusercontent.com', 
    androidClientId: '533964304637-9465htodkkkj0gjpcbhqob401ckkssap.apps.googleusercontent.com',
    redirectUri: 'https://auth.expo.io/@anonymous/road-repair-tracker',
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential).then(() => {
        navigation.navigate('MainTabs');
      }).catch(err => {
        console.log('Firebase Auth Error:', err);
      });
    }
  }, [response]);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: isDark ? '#000000' : '#ffffff' }]}>
        <View style={[styles.header, { backgroundColor: isDark ? '#000000' : '#ffffff', borderBottomColor: isDark ? '#18181b' : '#e4e4e7', borderBottomWidth: 1 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={isDark ? '#ffffff' : theme.colors.onSurface} />
          </TouchableOpacity>
          <View style={styles.headerBrand}>
            <Image 
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4fsTUFX6JkeJ7BcmSg-lgGDXYiv66dkIcxLRqieE5Uu-OrAylfP2f7hJ2UsMy0CLCtH7ZAAITDy5xF7TaZ6nOMjN-XLKyWOOFt6-ZTCN_1rSvcLQ_SivjkD5-FQanesmEg8LhLUGFYKDTMemZM5n5Y5Iwm6EJhfupsRqus-X4lvecu6JF4fm0d_uNj5cMJVOHV-tSk4JA33ZDAIQJvpHPloepVV91Kzy5xK-vST_BMzxzViBmoyEP' }} 
              style={styles.logoSmall} 
            />
            <Text style={styles.brandText}>CivicRoad</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={[styles.officialBadge, { backgroundColor: isDark ? '#18181b' : theme.colors.surfaceContainer }]}>
              <MaterialIcons name="verified-user" size={14} color={theme.colors.primary} />
              <Text style={[styles.officialText, { color: isDark ? '#a1a1aa' : theme.colors.onSurfaceVariant }]}>OFFICIAL</Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.logoContainer}>
              <View style={[styles.logoBox, { backgroundColor: isDark ? '#09090b' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7', borderWidth: 1 }]}>
                <Image 
                  source={{ uri: 'https://lh3.googleusercontent.com/aida/AEtjO1UxarIZN_0eX1B1jvCWr_tOqn3SzDTrsuG4_P_TZtuYcKL9H0UOfWdKCEzWV1yc3U8HXGlHLH9xHtMH6G4GtVorFGGt19m8qkMPSThU2g_EekKFHWYug_A3CiR0K7TTcfWxLAE5jw5QQrv3d6G9_UHkaCovT4D6PkZHnuPl__4jcCxx1KmtUI0cp6WcZlxnjFp9cGrXj3oK4cRtJawa-IVCn_-XxtPAQYmcVhRHhrmAEnysmrdjSNFL' }} 
                  style={styles.logoLarge}
                />
              </View>
              <View style={styles.verifiedBadge}>
                <MaterialIcons name="verified" size={12} color="#ffffff" />
              </View>
            </View>
            
            <View style={[styles.encryptedPill, { backgroundColor: isDark ? '#18181b' : '#f4f4f5' }]}>
              <MaterialIcons name="lock" size={12} color={theme.colors.primary} />
              <Text style={[styles.encryptedText, { color: isDark ? '#a1a1aa' : theme.colors.onSurfaceVariant }]}>OFFICIAL PORTAL • 256-BIT ENCRYPTED</Text>
            </View>
            
            <Text style={[styles.heroTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>CivicRoad Access</Text>
            <Text style={[styles.heroSubtitle, { color: isDark ? '#a1a1aa' : '#71717a' }]}>Municipal Road Intelligence & Defect Reporting System</Text>
          </View>

          {/* Role Switcher */}
          <View style={styles.roleSwitcherWrapper}>
            <View style={[styles.roleSwitcher, { backgroundColor: isDark ? '#18181b' : '#f4f4f5' }]}>
              <TouchableOpacity 
                style={[
                  styles.roleTab, 
                  role === 'citizen' && [styles.roleTabActive, { backgroundColor: isDark ? '#000000' : '#ffffff' }]
                ]} 
                onPress={() => setRole('citizen')}
                activeOpacity={0.8}
              >
                <View style={styles.roleTabContent}>
                  <MaterialIcons name="person-pin-circle" size={18} color={role === 'citizen' ? theme.colors.primary : (isDark ? '#a1a1aa' : theme.colors.secondary)} />
                  <Text style={[styles.roleTabText, { color: role === 'citizen' ? theme.colors.primary : (isDark ? '#a1a1aa' : theme.colors.secondary) }, role === 'citizen' && styles.roleTabTextActive]}>Citizen / Resident</Text>
                </View>
                <Text style={[styles.roleTabSubtext, { color: isDark ? '#71717a' : theme.colors.onSurfaceVariant }]}>Report & Track Hazards</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.roleTab, 
                  role === 'admin' && [styles.roleTabActive, { backgroundColor: isDark ? '#000000' : '#ffffff' }]
                ]} 
                onPress={() => setRole('admin')}
                activeOpacity={0.8}
              >
                <View style={styles.roleTabContent}>
                  <MaterialIcons name="engineering" size={18} color={role === 'admin' ? theme.colors.primary : (isDark ? '#a1a1aa' : theme.colors.secondary)} />
                  <Text style={[styles.roleTabText, { color: role === 'admin' ? theme.colors.primary : (isDark ? '#a1a1aa' : theme.colors.secondary) }, role === 'admin' && styles.roleTabTextActive]}>DPW Admin / Crew</Text>
                </View>
                <Text style={[styles.roleTabSubtext, { color: isDark ? '#71717a' : theme.colors.onSurfaceVariant }]}>Complaints & Operations</Text>
              </TouchableOpacity>
            </View>
            
            <View style={[styles.helperBanner, { backgroundColor: isDark ? '#18181b' : theme.colors.secondaryContainer + '66' }]}>
              <MaterialIcons name="info" size={16} color={theme.colors.primary} />
              <Text style={[styles.helperText, { color: isDark ? '#d4d4d8' : theme.colors.onSecondaryContainer }]}>
                {role === 'citizen' ? 'Resident portal: Instant SMS code or 1-tap civic credentials.' : 'DPW Crew portal: Requires Division SSO, Smart CAC card, or Badge PIN.'}
              </Text>
            </View>
          </View>

          {role === 'citizen' ? (
            /* Citizen Auth Flow */
            <View style={styles.authFlow}>
              {/* SSO Buttons */}
              <View style={styles.ssoGrid}>
                <TouchableOpacity style={[styles.ssoBtn, { backgroundColor: isDark ? '#18181b' : '#ffffff', borderColor: isDark ? '#27272a' : '#e4e4e7', borderWidth: 1 }]}>
                  <MaterialIcons name="apple" size={18} color={isDark ? '#ffffff' : '#09090b'} />
                  <Text style={[styles.ssoText, { color: isDark ? '#ffffff' : '#09090b' }]}>Apple</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.ssoBtn, { backgroundColor: isDark ? '#18181b' : '#ffffff', borderColor: isDark ? '#27272a' : '#e4e4e7', borderWidth: 1 }]}
                  disabled={!request}
                  onPress={() => {
                    promptAsync();
                  }}
                >
                  <Text style={[styles.ssoText, { color: '#4285F4' }]}>Google</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.ssoBtn, { backgroundColor: isDark ? '#18181b' : '#ffffff', borderColor: isDark ? '#27272a' : '#e4e4e7', borderWidth: 1 }]}>
                  <MaterialIcons name="badge" size={18} color={theme.colors.primary} />
                  <Text style={[styles.ssoText, { color: theme.colors.primary }]}>GovID</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.divider}>
                <View style={[styles.dividerLine, { backgroundColor: isDark ? '#27272a' : '#e4e4e7' }]} />
                <Text style={[styles.dividerText, { color: isDark ? '#a1a1aa' : '#71717a' }]}>OR ENTER MOBILE / EMAIL</Text>
                <View style={[styles.dividerLine, { backgroundColor: isDark ? '#27272a' : '#e4e4e7' }]} />
              </View>

              <View style={[styles.inputCard, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7', borderWidth: 1 }]}>
                <Text style={[styles.label, { color: isDark ? '#ffffff' : '#09090b' }]}>Registered Contact</Text>
                <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#18181b' : '#f4f4f5', borderColor: isDark ? '#27272a' : '#e4e4e7', borderWidth: 1 }]}>
                  <Text style={[styles.prefixText, { color: isDark ? '#a1a1aa' : '#71717a' }]}>+1</Text>
                  <View style={[styles.verticalDivider, { backgroundColor: isDark ? '#27272a' : '#e4e4e7' }]} />
                  <TextInput 
                    style={[styles.input, { color: isDark ? '#ffffff' : '#09090b' }]} 
                    placeholder="(555) 019-2834 or name@city.org" 
                    placeholderTextColor={isDark ? '#71717a' : theme.colors.outline}
                  />
                  <MaterialIcons name="smartphone" size={20} color={isDark ? '#a1a1aa' : theme.colors.onSurfaceVariant} />
                </View>

                <View style={styles.authModeToggle}>
                  <View style={styles.authModeLeft}>
                    <TouchableOpacity 
                      style={[styles.authModeBtn, { backgroundColor: isDark ? '#18181b' : '#f4f4f5' }, authMode === 'otp' && styles.authModeBtnActive]}
                      onPress={() => setAuthMode('otp')}
                    >
                      <Text style={[styles.authModeText, { color: isDark ? '#a1a1aa' : '#71717a' }, authMode === 'otp' && styles.authModeTextActive]}>6-Digit SMS OTP</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.authModeBtn, { backgroundColor: isDark ? '#18181b' : '#f4f4f5' }, authMode === 'pwd' && styles.authModeBtnActive]}
                      onPress={() => setAuthMode('pwd')}
                    >
                      <Text style={[styles.authModeText, { color: isDark ? '#a1a1aa' : '#71717a' }, authMode === 'pwd' && styles.authModeTextActive]}>Password</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity>
                    <Text style={styles.helpLinkText}>Need help?</Text>
                  </TouchableOpacity>
                </View>

                {authMode === 'pwd' && (
                  <View style={styles.passwordField}>
                    <Text style={[styles.label, { color: isDark ? '#ffffff' : '#09090b' }]}>Your Account Password</Text>
                    <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#18181b' : '#f4f4f5', borderColor: isDark ? '#27272a' : '#e4e4e7', borderWidth: 1 }]}>
                      <TextInput 
                        style={[styles.input, { color: isDark ? '#ffffff' : '#09090b' }]} 
                        placeholder="••••••••••••" 
                        placeholderTextColor={isDark ? '#71717a' : theme.colors.outline}
                        secureTextEntry={!passwordVisible}
                      />
                      <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                        <MaterialIcons name={passwordVisible ? "visibility" : "visibility-off"} size={20} color={isDark ? '#a1a1aa' : theme.colors.onSurfaceVariant} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                <View style={styles.checkboxRow}>
                  <TouchableOpacity style={styles.checkbox}>
                    <MaterialIcons name="check" size={16} color="#ffffff" style={{ opacity: 1 }} />
                  </TouchableOpacity>
                  <Text style={[styles.checkboxText, { color: isDark ? '#a1a1aa' : '#71717a' }]}>Remember this device for 30 days</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={() => {
                if (authMode === 'otp') {
                  navigation.navigate('OTPVerification');
                } else {
                  navigation.navigate('MainTabs');
                }
              }}>
                <MaterialIcons name={authMode === 'otp' ? "send-to-mobile" : "lock-open"} size={20} color="#ffffff" />
                <Text style={styles.submitBtnText}>{authMode === 'otp' ? 'Send 6-Digit SMS Code' : 'Sign In to CivicRoad'}</Text>
              </TouchableOpacity>
              


            </View>
          ) : (
            /* Admin Auth Flow */
            <View style={styles.authFlow}>
              <View style={[styles.inputCard, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7', borderWidth: 1 }]}>
                <View style={styles.adminCardHeader}>
                  <Text style={[styles.label, { color: isDark ? '#ffffff' : '#09090b' }]}>Municipal SSO Gateways</Text>
                  <View style={styles.securedBadge}>
                    <Text style={styles.securedBadgeText}>Secured</Text>
                  </View>
                </View>
                
                <View style={styles.adminSsoGrid}>
                  <TouchableOpacity style={[styles.adminSsoBtn, { backgroundColor: isDark ? '#18181b' : '#f4f4f5', borderColor: isDark ? '#27272a' : '#e4e4e7', borderWidth: 1 }]}>
                    <MaterialIcons name="domain" size={18} color={theme.colors.primary} />
                    <Text style={[styles.adminSsoText, { color: isDark ? '#ffffff' : '#09090b' }]}>City Hall SSO</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.adminSsoBtn, { backgroundColor: isDark ? '#18181b' : '#f4f4f5', borderColor: isDark ? '#27272a' : '#e4e4e7', borderWidth: 1 }]}>
                    <MaterialIcons name="cloud-download" size={18} color={theme.colors.tertiary} />
                    <Text style={[styles.adminSsoText, { color: isDark ? '#ffffff' : '#09090b' }]}>Smart CAC / PIV</Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.divider, { marginVertical: 8 }]}>
                  <View style={[styles.dividerLine, { backgroundColor: isDark ? '#27272a' : '#e4e4e7' }]} />
                  <Text style={[styles.dividerText, { color: isDark ? '#a1a1aa' : '#71717a' }]}>OR ENTER CREDENTIALS</Text>
                  <View style={[styles.dividerLine, { backgroundColor: isDark ? '#27272a' : '#e4e4e7' }]} />
                </View>

                <Text style={[styles.label, { color: isDark ? '#ffffff' : '#09090b' }]}>Inspector Badge / Employee ID</Text>
                <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#18181b' : '#f4f4f5', borderColor: isDark ? '#27272a' : '#e4e4e7', borderWidth: 1 }]}>
                  <MaterialIcons name="badge" size={20} color={isDark ? '#a1a1aa' : theme.colors.onSurfaceVariant} />
                  <TextInput 
                    style={[styles.input, { marginLeft: 8, color: isDark ? '#ffffff' : '#09090b' }]} 
                    placeholder="e.g., DPW-8821-NY" 
                    placeholderTextColor={isDark ? '#71717a' : theme.colors.outline}
                  />
                </View>

                <Text style={[styles.label, { marginTop: 12, color: isDark ? '#ffffff' : '#09090b' }]}>Division Security PIN</Text>
                <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#18181b' : '#f4f4f5', borderColor: isDark ? '#27272a' : '#e4e4e7', borderWidth: 1 }]}>
                  <MaterialIcons name="pin" size={20} color={isDark ? '#a1a1aa' : theme.colors.onSurfaceVariant} />
                  <TextInput 
                    style={[styles.input, { marginLeft: 8, color: isDark ? '#ffffff' : '#09090b' }]} 
                    placeholder="••••••" 
                    placeholderTextColor={isDark ? '#71717a' : theme.colors.outline}
                    secureTextEntry
                    maxLength={6}
                    keyboardType="number-pad"
                  />
                </View>

                <View style={styles.geolockRow}>
                  <View style={styles.geolockLeft}>
                    <MaterialIcons name="location-on" size={16} color={theme.colors.tertiary} />
                    <Text style={[styles.geolockText, { color: isDark ? '#a1a1aa' : theme.colors.onSurfaceVariant }]}>Geofence Geo-Lock Active</Text>
                  </View>
                  <TouchableOpacity>
                    <Text style={styles.helpLinkText}>Dispatch IT Help</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={() => navigation.navigate('AdminTabs')}>
                <MaterialIcons name="login" size={20} color="#ffffff" />
                <Text style={styles.submitBtnText}>Authorize Field Terminal</Text>
              </TouchableOpacity>
              
              {/* Biometric */}
              <TouchableOpacity style={[styles.biometricBtn, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7', borderWidth: 1 }]}>
                <View style={styles.biometricLeft}>
                  <View style={[styles.biometricIconBox, { backgroundColor: isDark ? '#18181b' : theme.colors.secondaryContainer }]}>
                    <MaterialIcons name="fingerprint" size={22} color={theme.colors.primary} />
                  </View>
                  <View>
                    <Text style={[styles.biometricTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>Biometric Fast Pass</Text>
                    <Text style={[styles.biometricSubtitle, { color: isDark ? '#a1a1aa' : theme.colors.onSurfaceVariant }]}>Use Face ID or Passkey credential</Text>
                  </View>
                </View>
                <MaterialIcons name="arrow-forward-ios" size={18} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.footer}>
            <View style={[styles.footerNotice, { backgroundColor: isDark ? '#09090b' : '#f4f4f5' }]}>
              <MaterialIcons name="policy" size={18} color={theme.colors.secondary} />
              <Text style={[styles.footerNoticeText, { color: isDark ? '#a1a1aa' : '#71717a' }]}>
                Privacy Civic ADA Accessible
              </Text>
            </View>
            <View style={styles.footerLinks}>
              <Text style={[styles.footerLink, { color: isDark ? '#a1a1aa' : '#71717a' }]}>Privacy Policy</Text>
              <Text style={[styles.footerDot, { color: isDark ? '#71717a' : undefined }]}>•</Text>
              <Text style={[styles.footerLink, { color: isDark ? '#a1a1aa' : '#71717a' }]}>Civic Terms</Text>
              <Text style={[styles.footerDot, { color: isDark ? '#71717a' : undefined }]}>•</Text>
              <Text style={[styles.footerLink, { color: isDark ? '#a1a1aa' : '#71717a' }]}>ADA Accessible</Text>
            </View>
            <Text style={[styles.footerVersion, { color: isDark ? '#71717a' : '#a1a1aa' }]}>CivicRoad Mobile v2.4.0 • Metro DPW Technology Division</Text>
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
  logoSmall: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
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
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  logoBox: {
    width: 64,
    height: 64,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLarge: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: theme.colors.tertiary,
    borderRadius: 10,
    padding: 2,
  },
  encryptedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.surfaceContainerLow,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 12,
  },
  encryptedText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.onSurfaceVariant,
  },
  heroTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  heroSubtitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 4,
  },
  roleSwitcherWrapper: {
    marginBottom: 24,
  },
  roleSwitcher: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceContainer,
    borderRadius: 16,
    padding: 4,
  },
  roleTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  roleTabActive: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  roleTabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roleTabText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.secondary,
  },
  roleTabTextActive: {
    color: theme.colors.primary,
  },
  roleTabSubtext: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  helperBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.secondaryContainer + '66',
    padding: 10,
    borderRadius: 12,
    marginTop: 12,
  },
  helperText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: theme.colors.onSecondaryContainer,
    flex: 1,
  },
  authFlow: {
    gap: 16,
  },
  ssoGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  ssoBtn: {
    flex: 1,
    height: 48,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  ssoText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.outlineVariant,
    opacity: 0.3,
  },
  dividerText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.onSurfaceVariant,
  },
  inputCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  label: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: theme.colors.surfaceContainer,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  prefixText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onSurfaceVariant,
  },
  verticalDivider: {
    width: 1,
    height: 16,
    backgroundColor: theme.colors.outlineVariant,
    opacity: 0.5,
    marginHorizontal: 8,
  },
  input: {
    flex: 1,
    fontFamily: theme.typography.fontFamily,
    fontSize: 14,
    color: theme.colors.onSurface,
  },
  authModeToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  authModeLeft: {
    flexDirection: 'row',
    gap: 8,
  },
  authModeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceContainer,
  },
  authModeBtnActive: {
    backgroundColor: theme.colors.primary,
  },
  authModeText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.onSurfaceVariant,
  },
  authModeTextActive: {
    color: theme.colors.onPrimary,
  },
  helpLinkText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  passwordField: {
    marginTop: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  submitBtn: {
    height: 48,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitBtnText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.onPrimary,
  },
  guestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surfaceContainerLow,
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  guestBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  guestIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  guestSubtitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.surfaceContainerLowest,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  guestBtnText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  adminCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  securedBadge: {
    backgroundColor: theme.colors.tertiaryContainer + '33',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  securedBadgeText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.tertiary,
  },
  adminSsoGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  adminSsoBtn: {
    flex: 1,
    height: 44,
    backgroundColor: theme.colors.surfaceContainer,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  adminSsoText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  geolockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  geolockLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  geolockText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  biometricBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surfaceContainerLowest,
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  biometricLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  biometricIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  biometricTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  biometricSubtitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
    gap: 12,
  },
  footerNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: theme.colors.surfaceContainerLow,
    padding: 12,
    borderRadius: 12,
  },
  footerNoticeText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 16,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  footerLink: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.onSurfaceVariant,
  },
  footerDot: {
    color: theme.colors.outlineVariant,
  },
  footerVersion: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    opacity: 0.6,
  }
});
