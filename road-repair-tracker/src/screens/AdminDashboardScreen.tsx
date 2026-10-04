import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useTheme } from '../context/ThemeContext';
import { complaintsStore, Complaint } from '../services/complaintsStore';

export function AdminDashboardScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const [complaints, setComplaints] = useState<Complaint[]>(complaintsStore.getComplaints());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    const unsubscribe = complaintsStore.subscribe(() => {
      setComplaints([...complaintsStore.getComplaints()]);
    });
    return unsubscribe;
  }, []);

  const totalCount = complaints.length;
  const newCount = complaints.filter(c => c.status === 'new').length;
  const activeCount = complaints.filter(c => c.status === 'assigned' || c.status === 'in-progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length;
  const criticalCount = complaints.filter(c => c.severity === 'Critical').length;

  const potholesCount = complaints.filter(c => c.category === 'Pothole').length;
  const cracksCount = complaints.filter(c => c.category === 'Deep Crack').length;
  const manholeCount = complaints.filter(c => c.category === 'Manhole Defect' || c.category === 'Sinkhole').length;

  const potholesPct = Math.round((potholesCount / (totalCount || 1)) * 100);
  const cracksPct = Math.round((cracksCount / (totalCount || 1)) * 100);
  const manholePct = Math.round((manholeCount / (totalCount || 1)) * 100);
  const resolvedPct = Math.round((resolvedCount / (totalCount || 1)) * 100);

  const FILTERS = ['All', 'Critical', 'New', 'Assigned'];

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: isDark ? '#000000' : '#ffffff' }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? '#000000' : '#ffffff', borderBottomColor: isDark ? '#18181b' : '#e4e4e7' }]}>
        <View style={styles.headerLeft}>
          <Image
            source={{ uri: 'https://lh3.googleusercontent.com/aida/AEtjO1UxarIZN_0eX1B1jvCWr_tOqn3SzDTrsuG4_P_TZtuYcKL9H0UOfWdKCEzWV1yc3U8HXGlHLH9xHtMH6G4GtVorFGGt19m8qkMPSThU2g_EekKFHWYug_A3CiR0K7TTcfWxLAE5jw5QQrv3d6G9_UHkaCovT4D6PkZHnuPl__4jcCxx1KmtUI0cp6WcZlxnjFp9cGrXj3oK4cRtJawa-IVCn_-XxtPAQYmcVhRHhrmAEnysmrdjSNFL' }}
            style={styles.logoIcon}
          />
          <View>
            <View style={styles.headerTitleRow}>
              <Text style={[styles.headerTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>CivicRoad</Text>
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>DPW ADMIN</Text>
              </View>
            </View>
            <View style={styles.headerSubtitleRow}>
              <View style={styles.tertiaryDot} />
              <Text style={[styles.headerSubtitle, { color: isDark ? '#a1a1aa' : '#52525b' }]}>Nashik Municipal Ops • Admin Dashboard</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerRight}>

          <TouchableOpacity 
            style={[styles.swapBtn, isDark && { backgroundColor: '#18181b', borderColor: '#27272a' }]}
            onPress={() => navigation.navigate('MainTabs')}
          >
            <MaterialIcons name="swap-horiz" size={20} color={isDark ? '#ffffff' : theme.colors.secondary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.profileBtn}
            onPress={() => navigation.navigate('AdminComplaints')}
          >
            <View style={styles.profileAvatar}>
              <MaterialIcons name="admin-panel-settings" size={20} color={theme.colors.onPrimary} />
            </View>
            <View style={styles.profileOnlineDot} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Ops Status Hero */}
        <View style={[styles.heroCard, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7' }]}>
          <View style={styles.heroHeader}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.heroPreTitle}>DPW OPERATIONS CENTER</Text>
              <Text style={[styles.heroTitle, { color: isDark ? '#ffffff' : '#09090b' }]} numberOfLines={1}>Nashik Municipal Hub</Text>
              <Text style={[styles.heroSubTitle, { color: isDark ? '#a1a1aa' : '#52525b' }]} numberOfLines={1}>Panchavati, Makhmalabad & Panchavati • 14 Active Wards</Text>
            </View>
            <View style={styles.liveBadge}>
              <View style={styles.liveDotPing} />
              <View style={styles.liveDot} />
              <Text style={styles.liveBadgeText}>Live Ops Dispatch</Text>
            </View>
          </View>
          <View style={styles.heroMetaRow}>
            <View style={styles.dateBadge}>
              <MaterialIcons name="calendar-today" size={14} color={theme.colors.primary} />
              <Text style={styles.dateText}>Today, {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
            </View>
            <View style={styles.syncStatus}>
              <MaterialIcons name="sync" size={14} color={theme.colors.tertiary} />
              <Text style={styles.syncText}>Live Dispatch Sync</Text>
            </View>
          </View>
          <View style={[styles.searchContainer, { backgroundColor: isDark ? '#18181b' : '#f4f4f5', borderColor: isDark ? '#27272a' : '#e4e4e7' }]}>
            <MaterialIcons name="search" size={20} color={isDark ? '#a1a1aa' : theme.colors.secondary} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: isDark ? '#ffffff' : '#09090b' }]}
              placeholder="Search Incident #CR-..., Makhmalabad Naka..."
              placeholderTextColor={isDark ? '#52525b' : theme.colors.secondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity style={styles.filterBtn}>
              <MaterialIcons name="tune" size={18} color={isDark ? '#a1a1aa' : theme.colors.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate('AdminEmails')}
          >
            <MaterialIcons name="mail" size={18} color={theme.colors.onPrimary} />
            <Text style={[styles.actionBtnText, { color: theme.colors.onPrimary }]}>Contractor Emails</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: isDark ? '#18181b' : '#ffffff', borderColor: isDark ? '#27272a' : '#e4e4e7', borderWidth: 1 }]}
            onPress={() => navigation.navigate('AdminContractorsTab')}
          >
            <MaterialIcons name="engineering" size={18} color={theme.colors.primary} />
            <Text style={[styles.actionBtnText, { color: isDark ? '#ffffff' : '#09090b' }]}>Contractor Fleet</Text>
          </TouchableOpacity>
        </View>

        {/* KPI Grid */}
        <View style={styles.kpiGrid}>
          {/* Total Incidents */}
          <TouchableOpacity 
            style={[styles.kpiCard, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7' }]}
            onPress={() => navigation.navigate('AdminComplaints')}
          >
            <View style={styles.kpiHeader}>
              <Text style={[styles.kpiLabel, { color: isDark ? '#a1a1aa' : '#52525b' }]}>Total Incidents</Text>
              <View style={[styles.kpiIconBox, isDark && { backgroundColor: '#18181b' }]}>
                <MaterialIcons name="report-problem" size={18} color={isDark ? '#a1a1aa' : theme.colors.secondary} />
              </View>
            </View>
            <Text style={[styles.kpiValue, { color: isDark ? '#ffffff' : '#09090b' }]}>{totalCount}</Text>
            <View style={styles.kpiFooter}>
              <View style={[styles.kpiTrendBox, { backgroundColor: isDark ? '#18181b' : theme.colors.surfaceContainerHigh }]}>
                <Text style={[styles.kpiTrendText, { color: theme.colors.primary }]}>{newCount} new pending</Text>
              </View>
            </View>
          </TouchableOpacity>
          
          {/* Citizen Complaints */}
          <TouchableOpacity 
            style={[styles.kpiCard, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7' }]}
            onPress={() => navigation.navigate('AdminComplaints')}
          >
            <View style={styles.kpiHeader}>
              <Text style={[styles.kpiLabel, { color: theme.colors.error, fontWeight: '700' }]}>New Complaints</Text>
              <View style={[styles.kpiIconBox, { backgroundColor: theme.colors.errorContainer }]}>
                <MaterialIcons name="assignment-late" size={18} color={theme.colors.onErrorContainer} />
              </View>
            </View>
            <Text style={[styles.kpiValue, { color: theme.colors.error }]}>{newCount}</Text>
            <View style={styles.kpiFooter}>
              <View style={[styles.kpiTrendBox, { backgroundColor: theme.colors.errorContainer }]}>
                <Text style={[styles.kpiTrendText, { color: theme.colors.onErrorContainer }]}>Requires Review</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Active Repairs */}
          <View style={[styles.kpiCard, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7' }]}>
            <View style={styles.kpiHeader}>
              <Text style={[styles.kpiLabel, { color: isDark ? '#a1a1aa' : '#52525b' }]}>Active Assigned</Text>
              <View style={[styles.kpiIconBox, { backgroundColor: theme.colors.secondaryContainer }]}>
                <MaterialIcons name="construction" size={18} color={theme.colors.onSecondaryContainer} />
              </View>
            </View>
            <Text style={[styles.kpiValue, { color: isDark ? '#ffffff' : '#09090b' }]}>{activeCount}</Text>
            <View style={styles.kpiFooter}>
              <View style={[styles.kpiTrendBox, { backgroundColor: theme.colors.secondaryContainer }]}>
                <Text style={[styles.kpiTrendText, { color: theme.colors.onSecondaryContainer }]}>Crews Dispatched</Text>
              </View>
            </View>
          </View>

          {/* Resolved */}
          <View style={[styles.kpiCard, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7' }]}>
            <View style={styles.kpiHeader}>
              <Text style={[styles.kpiLabel, { color: isDark ? '#a1a1aa' : '#52525b' }]}>Resolved</Text>
              <View style={[styles.kpiIconBox, { backgroundColor: theme.colors.tertiaryContainer + '26' }]}>
                <MaterialIcons name="check-circle" size={18} color={theme.colors.tertiary} />
              </View>
            </View>
            <Text style={[styles.kpiValue, { color: isDark ? '#ffffff' : '#09090b' }]}>{resolvedCount}</Text>
            <View style={styles.kpiFooter}>
              <View style={[styles.kpiTrendBox, { backgroundColor: theme.colors.tertiaryContainer + '33' }]}>
                <Text style={[styles.kpiTrendText, { color: theme.colors.tertiary }]}>Repairs Completed</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Citizen Complaints Stream */}
        <TouchableOpacity 
          style={[styles.aiHealthCard, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7' }]}
          onPress={() => navigation.navigate('AdminComplaints')}
          activeOpacity={0.9}
        >
          <View style={styles.aiHealthHeader}>
            <View style={styles.aiHealthLeft}>
              <View style={[styles.aiHealthIcon, { backgroundColor: theme.colors.primaryFixed }]}>
                <MaterialIcons name="feedback" size={20} color={theme.colors.primary} />
              </View>
              <View>
                <Text style={[styles.aiHealthTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>Citizen Complaints & Suggestions</Text>
                <Text style={[styles.aiHealthSub, { color: isDark ? '#a1a1aa' : '#52525b' }]}>100% Geo-Tagged • Google Maps GPS Verified</Text>
              </View>
            </View>
            <View style={[styles.aiHealthBadge, { backgroundColor: theme.colors.errorContainer }]}>
              <Text style={[styles.aiHealthBadgeText, { color: theme.colors.onErrorContainer }]}>{newCount} New Reports</Text>
            </View>
          </View>
          
          <View style={styles.aiHealthBar}>
            <View style={[styles.aiHealthSegment, { flex: Math.max(1, potholesPct), backgroundColor: theme.colors.error }]} />
            <View style={[styles.aiHealthSegment, { flex: Math.max(1, cracksPct), backgroundColor: theme.colors.warningAmber }]} />
            <View style={[styles.aiHealthSegment, { flex: Math.max(1, manholePct), backgroundColor: theme.colors.primary }]} />
            <View style={[styles.aiHealthSegment, { flex: Math.max(1, resolvedPct), backgroundColor: theme.colors.tertiary }]} />
          </View>

          <View style={styles.aiHealthLegend}>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: theme.colors.error }]} /><Text style={[styles.legendText, { color: isDark ? '#a1a1aa' : '#52525b' }]}>Potholes {potholesPct}%</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: theme.colors.warningAmber }]} /><Text style={[styles.legendText, { color: isDark ? '#a1a1aa' : '#52525b' }]}>Cracks {cracksPct}%</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} /><Text style={[styles.legendText, { color: isDark ? '#a1a1aa' : '#52525b' }]}>Manhole {manholePct}%</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: theme.colors.tertiary }]} /><Text style={[styles.legendText, { color: isDark ? '#a1a1aa' : '#52525b' }]}>Resolved {resolvedPct}%</Text></View>
          </View>
        </TouchableOpacity>

        {/* Urgent Queue */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>Urgent Road Hazards & Complaints</Text>
            <View style={styles.urgentCountBadge}>
              <Text style={styles.urgentCountText}>{complaints.length}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('AdminComplaints')}>
            <Text style={styles.batchActionBtn}>View All ({complaints.length})</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
          {FILTERS.map(f => (
            <TouchableOpacity 
              key={f} 
              style={[
                styles.filterChip, 
                activeFilter === f && styles.filterChipActive,
                isDark && activeFilter !== f && { backgroundColor: '#18181b', borderColor: '#27272a' }
              ]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[
                styles.filterChipText, 
                activeFilter === f && styles.filterChipTextActive,
                isDark && activeFilter !== f && { color: '#a1a1aa' }
              ]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.queueContainer}>
          {complaints
            .filter(item => {
              if (activeFilter === 'Critical') return item.severity === 'Critical';
              if (activeFilter === 'New') return item.status === 'new';
              if (activeFilter === 'Assigned') return item.status === 'assigned' || item.status === 'in-progress';
              return true;
            })
            .map(item => (
              <TouchableOpacity 
                key={item.id}
                style={[styles.queueCard, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7' }]}
                onPress={() => navigation.navigate('AdminComplaintDetail', { complaintId: item.id })}
                activeOpacity={0.8}
              >
                <View style={styles.queueCardTop}>
                  <View style={styles.queueCardImageContainer}>
                    <Image source={{ uri: item.geoTagImage.uri }} style={styles.queueCardImage} />
                    <View style={styles.confBadge}>
                      <MaterialIcons name="satellite-alt" size={10} color="#34d399" />
                      <Text style={styles.confBadgeText}>GEO-TAG</Text>
                    </View>
                  </View>
                  <View style={styles.queueCardInfo}>
                    <View style={styles.queueCardHeader}>
                      <Text style={[
                        styles.queueCardStatus, 
                        { color: item.severity === 'Critical' ? theme.colors.error : theme.colors.primary }
                      ]}>
                        {item.severity.toUpperCase()} HAZARD
                      </Text>
                      <Text style={[styles.queueCardTime, { color: isDark ? '#a1a1aa' : '#71717a' }]}>{item.date}</Text>
                    </View>
                    <Text style={[styles.queueCardTitle, { color: isDark ? '#ffffff' : '#09090b' }]} numberOfLines={2}>
                      {item.id} • {item.title}
                    </Text>
                    <View style={styles.queueCardLocation}>
                      <MaterialIcons name="location-on" size={14} color={isDark ? '#a1a1aa' : theme.colors.secondary} />
                      <Text style={[styles.queueCardLocText, { color: isDark ? '#a1a1aa' : '#52525b' }]} numberOfLines={1}>
                        {item.location.street} • {item.location.ward}
                      </Text>
                    </View>
                  </View>
                </View>

                {item.citizenSuggestions ? (
                  <View style={[styles.adminQueueSuggestionBox, isDark && { backgroundColor: '#18181b', borderColor: '#27272a' }]}>
                    <Text style={[styles.adminQueueSuggestionText, isDark && { color: '#fbbf24' }]} numberOfLines={2}>
                      💡 Citizen Suggestion: "{item.citizenSuggestions}"
                    </Text>
                  </View>
                ) : null}

                <View style={styles.queueCardTags}>
                  <View style={[styles.tag, { backgroundColor: theme.colors.primaryFixed }]}>
                    <Text style={[styles.tagText, { color: theme.colors.onPrimaryFixed }]}>{item.category}</Text>
                  </View>
                  <View style={[styles.tag, isDark && { backgroundColor: '#18181b', borderColor: '#27272a' }]}>
                    <Text style={[styles.tagText, isDark && { color: '#a1a1aa' }]}>Citizen: {item.citizen.name}</Text>
                  </View>
                  <View style={[styles.tag, isDark && { backgroundColor: '#18181b', borderColor: '#27272a' }]}>
                    <Text style={[styles.tagText, isDark && { color: '#a1a1aa' }]}>{item.roadType}</Text>
                  </View>
                </View>

                <View style={styles.queueCardActions}>
                  <TouchableOpacity 
                    style={styles.primaryAction}
                    onPress={() => navigation.navigate('AdminComplaints')}
                  >
                    <MaterialIcons name="assignment-turned-in" size={18} color={theme.colors.onPrimary} />
                    <Text style={styles.primaryActionText}>
                      {item.status === 'new' ? 'Review & Dispatch' : 'Manage Work Order'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.secondaryAction, isDark && { backgroundColor: '#18181b', borderColor: '#27272a' }]}
                    onPress={() => navigation.navigate('AdminComplaintDetail', { complaintId: item.id })}
                  >
                    <MaterialIcons name="open-in-new" size={18} color={isDark ? '#ffffff' : theme.colors.onSurfaceVariant} />
                    <Text style={[styles.secondaryActionText, isDark && { color: '#ffffff' }]}>Inspect Spot</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.gutter,
    height: 64,
    backgroundColor: 'rgba(247,249,251,0.9)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.spaceSm,
  },
  logoIcon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.headlineSm.fontSize,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  adminBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adminBadgeText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.onPrimary,
  },
  headerSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tertiaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.tertiary,
  },
  headerSubtitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.onSurfaceVariant,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  swapBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surfaceContainerHighest,
  },
  profileOnlineDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.tertiaryContainer,
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  scrollContent: {
    padding: theme.spacing.gutter,
    gap: theme.spacing.spaceMd,
  },
  heroCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: theme.spacing.spaceMd,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroPreTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 22,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginVertical: 2,
  },
  heroSubTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.tertiaryContainer + '26',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  liveDotPing: {
    position: 'absolute',
    left: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.tertiary,
    opacity: 0.75,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.tertiary,
  },
  liveBadgeText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.tertiary,
  },
  heroMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.surfaceContainerLow,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  dateText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.onSurfaceVariant,
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  syncText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceContainerLow,
    height: 44,
    borderRadius: 12,
    marginTop: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: theme.typography.fontFamily,
    fontSize: 14,
    color: theme.colors.onSurface,
  },
  filterBtn: {
    padding: 4,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionBtnText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  kpiCard: {
    width: '48%',
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  kpiLabel: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.onSurfaceVariant,
  },
  kpiIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiValue: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 26,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  kpiFooter: {
    marginTop: 6,
    flexDirection: 'row',
  },
  kpiTrendBox: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  kpiTrendText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '600',
  },
  aiHealthCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  aiHealthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  aiHealthLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiHealthIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: theme.colors.primary + '1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiHealthTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  aiHealthSub: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  aiHealthBadge: {
    backgroundColor: theme.colors.tertiaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  aiHealthBadgeText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.onTertiaryContainer,
  },
  aiHealthBar: {
    height: 12,
    borderRadius: 6,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceContainer,
  },
  aiHealthSegment: {
    height: '100%',
  },
  aiHealthLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  urgentCountBadge: {
    backgroundColor: theme.colors.error,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  urgentCountText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.onError,
  },
  batchActionBtn: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterContent: {
    gap: 6,
    paddingBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: 999,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
  },
  filterChipText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.onSurfaceVariant,
  },
  filterChipTextActive: {
    color: theme.colors.onPrimary,
  },
  queueContainer: {
    gap: 12,
  },
  queueCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  queueCardTop: {
    flexDirection: 'row',
    gap: 12,
  },
  queueCardImageContainer: {
    width: 96,
    height: 96,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceContainer,
    overflow: 'hidden',
  },
  queueCardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  confBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: theme.colors.error,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  confBadgeText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.onError,
  },
  queueCardInfo: {
    flex: 1,
  },
  queueCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  queueCardStatus: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  queueCardTime: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  queueCardTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  queueCardLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  queueCardLocText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    flex: 1,
  },
  adminQueueSuggestionBox: {
    backgroundColor: '#fffbeb',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.warningAmber,
  },
  adminQueueSuggestionText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontStyle: 'italic',
    color: '#92400e',
  },
  queueCardTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  tag: {
    backgroundColor: theme.colors.surfaceContainer,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.secondary,
  },
  queueCardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  primaryAction: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  primaryActionText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.onPrimary,
  },
  secondaryAction: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceContainer,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  secondaryActionText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.onSurfaceVariant,
  },
});
