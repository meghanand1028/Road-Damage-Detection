import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useTheme } from '../context/ThemeContext';
import { REGISTERED_CONTRACTORS, ContractorProfile } from '../services/contractorEmailStore';

export function AdminContractorDetailScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();

  // Resolve contractor from route params or fall back to first registered
  const contractorId: string = route?.params?.contractorId;
  const contractor: ContractorProfile =
    REGISTERED_CONTRACTORS.find(c => c.id === contractorId) || REGISTERED_CONTRACTORS[0];

  const capacityNumber = parseInt(contractor.capacity, 10) || 80;
  const crewsLabel = `${contractor.activeCrews} of ${contractor.totalCrews} crews deployed in the field`;

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: isDark ? '#000000' : '#ffffff' }]}>
      <View style={[styles.header, { backgroundColor: isDark ? '#000000' : '#ffffff', borderBottomColor: isDark ? '#18181b' : '#e4e4e7', borderBottomWidth: 1 }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: isDark ? '#18181b' : '#f4f4f5' }]}>
            <MaterialIcons name="arrow-back" size={20} color={isDark ? '#ffffff' : '#09090b'} />
          </TouchableOpacity>
          <View>
            <View style={[styles.titleRow, { flexShrink: 1 }]}>
              <Text style={[styles.headerTitle, { color: isDark ? '#ffffff' : '#09090b', flexShrink: 1 }]} numberOfLines={1}>{contractor.name}</Text>
              <MaterialIcons name="verified" size={16} color={theme.colors.primary} />
            </View>
            <Text style={[styles.headerSubtitle, { color: isDark ? '#a1a1aa' : '#71717a' }]}>DPW Certified • {contractor.capacity}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: isDark ? '#18181b' : '#f4f4f5' }]}
            onPress={() => Linking.openURL(`tel:${contractor.phone}`).catch(() => {})}
          >
            <MaterialIcons name="call" size={20} color={isDark ? '#ffffff' : theme.colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Card */}
        <View style={[styles.card, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7', borderWidth: 1 }]}>
          <View style={styles.heroTop}>
            <View style={styles.heroAvatarContainer}>
              <View style={[styles.heroAvatarBox, { backgroundColor: theme.colors.primaryContainer }]}>
                <MaterialIcons name="engineering" size={36} color={theme.colors.primary} />
              </View>
              <View style={styles.heroAvatarBadge}>
                <MaterialIcons name="verified" size={14} color="#ffffff" />
              </View>
            </View>
            <View style={styles.heroInfo}>
              <View style={styles.heroBadges}>
                <View style={styles.loadBadge}>
                  <Text style={styles.loadBadgeText}>{contractor.capacity}</Text>
                </View>
                <View style={[styles.ratingBadge, { backgroundColor: isDark ? '#18181b' : '#f4f4f5' }]}>
                  <MaterialIcons name="star" size={12} color={theme.colors.tertiary} />
                  <Text style={[styles.ratingText, { color: isDark ? '#a1a1aa' : theme.colors.onSurfaceVariant }]}>
                    {contractor.rating} Rating
                  </Text>
                </View>
              </View>
              <Text style={[styles.heroTrade, { color: isDark ? '#ffffff' : '#09090b' }]}>{contractor.specialty}</Text>
              <Text style={[styles.heroLocation, { color: isDark ? '#a1a1aa' : '#71717a' }]}>{contractor.assignedWards}</Text>

              <View style={styles.heroStats}>
                <View style={styles.heroStatItem}>
                  <MaterialIcons name="groups" size={14} color={theme.colors.tertiary} />
                  <Text style={[styles.heroStatText, { color: isDark ? '#a1a1aa' : '#71717a' }]}>{contractor.activeCrews}/{contractor.totalCrews} Crews Active</Text>
                </View>
                <View style={styles.heroStatItem}>
                  <MaterialIcons name="verified-user" size={14} color={theme.colors.primary} />
                  <Text style={[styles.heroStatText, { color: isDark ? '#a1a1aa' : '#71717a' }]}>{contractor.slaPercent}% SLA</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.quickActionBtn, { backgroundColor: isDark ? '#18181b' : '#f4f4f5' }]}
              onPress={() => Linking.openURL(`tel:${contractor.phone}`).catch(() => {})}
            >
              <MaterialIcons name="call" size={20} color={theme.colors.primary} />
              <Text style={[styles.quickActionText, { color: isDark ? '#ffffff' : '#09090b' }]}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickActionBtn, { backgroundColor: isDark ? '#18181b' : '#f4f4f5' }]}
              onPress={() => Linking.openURL(`mailto:${contractor.email}`).catch(() => {})}
            >
              <MaterialIcons name="email" size={20} color={theme.colors.secondary} />
              <Text style={[styles.quickActionText, { color: isDark ? '#ffffff' : '#09090b' }]}>Email</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionBtnPrimary}
              onPress={() => navigation.navigate('AdminEmails', { prefillContractorId: contractor.id })}
            >
              <MaterialIcons name="assignment" size={20} color="#ffffff" />
              <Text style={styles.quickActionTextPrimary}>Assign Work</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact Details */}
        <View style={[styles.card, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7', borderWidth: 1 }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={[styles.sectionIconBox, { backgroundColor: isDark ? '#18181b' : '#f4f4f5' }]}>
                <MaterialIcons name="contact-phone" size={18} color={theme.colors.primary} />
              </View>
              <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>Contact Information</Text>
            </View>
          </View>

          <View style={[styles.infoRow, { backgroundColor: isDark ? '#09090b' : '#f4f4f5' }]}>
            <MaterialIcons name="person" size={16} color={isDark ? '#a1a1aa' : theme.colors.outline} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoLabel, { color: isDark ? '#71717a' : '#71717a' }]}>Contact Person</Text>
              <Text style={[styles.infoValue, { color: isDark ? '#ffffff' : '#09090b' }]}>{contractor.contactPerson}</Text>
            </View>
          </View>

          <View style={[styles.infoRow, { backgroundColor: isDark ? '#09090b' : '#f4f4f5' }]}>
            <MaterialIcons name="phone" size={16} color={isDark ? '#a1a1aa' : theme.colors.outline} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoLabel, { color: isDark ? '#71717a' : '#71717a' }]}>Phone</Text>
              <Text style={[styles.infoValue, { color: isDark ? '#ffffff' : '#09090b' }]}>{contractor.phone}</Text>
            </View>
            <TouchableOpacity onPress={() => Linking.openURL(`tel:${contractor.phone}`).catch(() => {})}>
              <MaterialIcons name="call" size={18} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={[styles.infoRow, { backgroundColor: isDark ? '#09090b' : '#f4f4f5' }]}>
            <MaterialIcons name="email" size={16} color={isDark ? '#a1a1aa' : theme.colors.outline} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoLabel, { color: isDark ? '#71717a' : '#71717a' }]}>Email</Text>
              <Text style={[styles.infoValue, { color: isDark ? '#ffffff' : '#09090b' }]}>{contractor.email}</Text>
            </View>
            <TouchableOpacity onPress={() => Linking.openURL(`mailto:${contractor.email}`).catch(() => {})}>
              <MaterialIcons name="send" size={18} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Crew Deployment */}
        <View style={[styles.card, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7', borderWidth: 1 }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={[styles.sectionIconBox, { backgroundColor: isDark ? '#18181b' : '#f4f4f5' }]}>
                <MaterialIcons name="commute" size={18} color={theme.colors.primary} />
              </View>
              <View>
                <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>Fleet Allocation</Text>
                <Text style={[styles.sectionSubtitle, { color: isDark ? '#a1a1aa' : '#71717a' }]}>{crewsLabel}</Text>
              </View>
            </View>
            <Text style={styles.sectionTitlePrimary}>{capacityNumber}%</Text>
          </View>

          <View style={[styles.progressBar, { backgroundColor: isDark ? '#18181b' : '#e4e4e7' }]}>
            {Array.from({ length: contractor.totalCrews }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressFill,
                  {
                    width: `${100 / contractor.totalCrews}%`,
                    backgroundColor: i < contractor.activeCrews
                      ? theme.colors.primary
                      : (isDark ? '#27272a' : '#d4d4d8')
                  }
                ]}
              />
            ))}
          </View>

          <View style={styles.crewList}>
            {Array.from({ length: contractor.activeCrews }).map((_, i) => (
              <View key={i} style={[styles.crewItem, { backgroundColor: isDark ? '#09090b' : '#f4f4f5' }]}>
                <View style={styles.crewInfo}>
                  <View style={styles.crewAvatarPrimary}>
                    <Text style={styles.crewAvatarTextPrimary}>{String.fromCharCode(65 + i)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.crewTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>
                      {contractor.assignedWards.split('&')[i % 2]?.trim() || `Ward Crew ${i + 1}`}
                    </Text>
                    <Text style={[styles.crewDesc, { color: isDark ? '#a1a1aa' : '#71717a' }]}>
                      {contractor.specialty.split('&')[0]?.trim()} • Crew {String.fromCharCode(65 + i)}
                    </Text>
                  </View>
                </View>
                <View style={i === 0 ? styles.badgeOnSite : styles.badgeEnRoute}>
                  <Text style={i === 0 ? styles.badgeOnSiteText : styles.badgeEnRouteText}>
                    {i === 0 ? 'ON-SITE' : 'EN ROUTE'}
                  </Text>
                </View>
              </View>
            ))}

            {contractor.activeCrews < contractor.totalCrews && (
              <View style={[styles.crewItemEmergency, { backgroundColor: isDark ? '#18181b' : '#fef2f2' }]}>
                <View style={styles.crewInfo}>
                  <View style={styles.crewAvatarEmergency}>
                    <Text style={styles.crewAvatarTextEmergency}>SB</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.crewTitleEmergency}>Standby Crew</Text>
                    <Text style={[styles.crewDesc, { color: isDark ? '#a1a1aa' : '#71717a' }]}>Depot Yard • Ready for priority dispatch</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.deployBtn}
                  onPress={() => navigation.navigate('AdminEmails', { prefillContractorId: contractor.id })}
                >
                  <Text style={styles.deployBtnText}>Deploy</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.gutter,
    paddingVertical: theme.spacing.spaceSm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  backBtn: {
    padding: 8,
    backgroundColor: theme.colors.surfaceContainer,
    borderRadius: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.headlineSm.fontSize,
    fontWeight: '600',
    color: theme.colors.onSurface,
    maxWidth: 200,
  },
  headerSubtitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
  },
  iconBtn: {
    padding: 8,
    backgroundColor: theme.colors.surfaceContainer,
    borderRadius: 12,
  },
  scrollContent: {
    padding: theme.spacing.gutter,
    gap: theme.spacing.spaceMd,
  },
  card: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 16,
  },
  heroTop: {
    flexDirection: 'row',
    gap: 16,
  },
  heroAvatarContainer: {
    position: 'relative',
  },
  heroAvatarBox: {
    width: 80,
    height: 80,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroAvatarBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surfaceContainerLowest,
  },
  heroInfo: {
    flex: 1,
  },
  heroBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  loadBadge: {
    backgroundColor: theme.colors.secondaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  loadBadgeText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 9,
    fontWeight: 'bold',
    color: theme.colors.onSecondaryContainer,
    textTransform: 'uppercase',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.surfaceContainerHigh,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  ratingText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
  },
  heroTrade: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  heroLocation: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  heroStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroStatText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
  },
  quickActionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: theme.colors.surfaceContainer,
    borderRadius: 12,
  },
  quickActionText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.onSurface,
    marginTop: 4,
  },
  quickActionBtnPrimary: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
  },
  quickActionTextPrimary: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: 'bold',
    color: theme.colors.onPrimary,
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
  },
  infoLabel: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    color: theme.colors.onSurfaceVariant,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginTop: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  sectionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  sectionSubtitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  sectionTitlePrimary: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  progressBar: {
    flexDirection: 'row',
    height: 10,
    backgroundColor: theme.colors.surfaceContainerHighest,
    borderRadius: 5,
    gap: 2,
    padding: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  crewList: {
    gap: 8,
  },
  crewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surfaceContainerLow,
    padding: 10,
    borderRadius: 12,
  },
  crewItemEmergency: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surfaceContainer,
    padding: 10,
    borderRadius: 12,
  },
  crewInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  crewAvatarPrimary: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: theme.colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crewAvatarTextPrimary: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.onPrimaryFixed,
  },
  crewAvatarEmergency: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: theme.colors.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crewAvatarTextEmergency: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.onTertiary,
  },
  crewTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  crewTitleEmergency: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.tertiary,
  },
  crewDesc: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
  },
  badgeOnSite: {
    backgroundColor: theme.colors.tertiaryFixed,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeOnSiteText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.onTertiaryFixedVariant,
  },
  badgeEnRoute: {
    backgroundColor: theme.colors.secondaryFixed,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeEnRouteText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.onSecondaryFixedVariant,
  },
  deployBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  deployBtnText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: 'bold',
    color: theme.colors.onPrimary,
  }
});
