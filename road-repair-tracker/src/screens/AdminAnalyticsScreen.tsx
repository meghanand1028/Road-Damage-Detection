import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useTheme } from '../context/ThemeContext';
import { complaintsStore, Complaint } from '../services/complaintsStore';

export function AdminAnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const [selectedRange, setSelectedRange] = useState('30d');
  const [selectedLayer, setSelectedLayer] = useState('all');
  const [complaints, setComplaints] = useState<Complaint[]>(complaintsStore.getComplaints());

  useEffect(() => {
    const unsub = complaintsStore.subscribe(() => setComplaints([...complaintsStore.getComplaints()]));
    return unsub;
  }, []);

  // Live metrics
  const totalDetected = complaints.length;
  const criticalCount = complaints.filter(c => c.severity === 'Critical').length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length;
  const inProgressCount = complaints.filter(c => c.status === 'in-progress' || c.status === 'assigned').length;
  const resolutionRate = totalDetected > 0 ? Math.round((resolvedCount / totalDetected) * 100) : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: isDark ? '#000000' : '#ffffff' }]}>
      <View style={[styles.header, { backgroundColor: isDark ? '#000000' : '#ffffff', borderBottomColor: isDark ? '#18181b' : '#e4e4e7', borderBottomWidth: 1 }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.headerTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>Civic Road Analytics</Text>
            <Text style={[styles.headerSubtitle, { color: isDark ? '#a1a1aa' : '#71717a' }]}>Citywide Defect Density & Fleet Telemetry</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity style={[styles.exportBtn, { backgroundColor: isDark ? '#18181b' : '#f4f4f5' }]}>
              <MaterialIcons name="download" size={18} color={theme.colors.primary} />
              <Text style={[styles.exportBtnText, { color: isDark ? '#ffffff' : '#09090b' }]}>Export DPW</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rangeScroller} contentContainerStyle={styles.rangeContent}>
          <TouchableOpacity 
            style={[styles.rangePill, { backgroundColor: isDark ? '#18181b' : '#f4f4f5' }, selectedRange === '7d' && styles.rangePillActive]} 
            onPress={() => setSelectedRange('7d')}
          >
            <Text style={[styles.rangeText, { color: isDark ? '#a1a1aa' : '#71717a' }, selectedRange === '7d' && styles.rangeTextActive]}>7 Days</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.rangePill, { backgroundColor: isDark ? '#18181b' : '#f4f4f5' }, selectedRange === '30d' && styles.rangePillActive]} 
            onPress={() => setSelectedRange('30d')}
          >
            <Text style={[styles.rangeText, { color: isDark ? '#a1a1aa' : '#71717a' }, selectedRange === '30d' && styles.rangeTextActive]}>30 Days</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.rangePill, { backgroundColor: isDark ? '#18181b' : '#f4f4f5' }, selectedRange === '90d' && styles.rangePillActive]} 
            onPress={() => setSelectedRange('90d')}
          >
            <Text style={[styles.rangeText, { color: isDark ? '#a1a1aa' : '#71717a' }, selectedRange === '90d' && styles.rangeTextActive]}>90 Days</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.rangePill, { backgroundColor: isDark ? '#18181b' : '#f4f4f5' }, selectedRange === 'ytd' && styles.rangePillActive]} 
            onPress={() => setSelectedRange('ytd')}
          >
            <Text style={[styles.rangeText, { color: isDark ? '#a1a1aa' : '#71717a' }, selectedRange === 'ytd' && styles.rangeTextActive]}>Year to Date</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* KPI Grid */}
        <View style={styles.kpiGrid}>
          {/* KPI 1 - live complaint count */}
          <View style={[styles.kpiCard, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7', borderWidth: 1 }]}>
            <View style={styles.kpiHeader}>
              <Text style={[styles.kpiLabel, { color: isDark ? '#a1a1aa' : '#71717a' }]}>Total Reports</Text>
              <View style={[styles.kpiIconBox, { backgroundColor: theme.colors.errorContainer }]}>
                <MaterialIcons name="warning" size={16} color={theme.colors.onErrorContainer} />
              </View>
            </View>
            <Text style={[styles.kpiValue, { color: isDark ? '#ffffff' : '#09090b' }]}>{totalDetected}</Text>
            <View style={styles.kpiTrend}>
              <MaterialIcons name="trending-up" size={14} color={theme.colors.error} />
              <Text style={[styles.kpiTrendText, { color: theme.colors.error }]}>{criticalCount} Critical</Text>
            </View>
          </View>

          {/* KPI 2 - in progress */}
          <View style={[styles.kpiCard, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7', borderWidth: 1 }]}>
            <View style={styles.kpiHeader}>
              <Text style={[styles.kpiLabel, { color: isDark ? '#a1a1aa' : '#71717a' }]}>In Progress</Text>
              <View style={[styles.kpiIconBox, { backgroundColor: theme.colors.secondaryContainer }]}>
                <MaterialIcons name="local-fire-department" size={16} color={theme.colors.onSecondaryContainer} />
              </View>
            </View>
            <Text style={[styles.kpiValue, { color: isDark ? '#ffffff' : '#09090b' }]}>{inProgressCount}</Text>
            <View style={styles.kpiTrend}>
              <View style={styles.errorDot} />
              <Text style={[styles.kpiTrendText, { color: isDark ? '#a1a1aa' : theme.colors.onSurfaceVariant }]}>Assigned / Active</Text>
            </View>
          </View>

          {/* KPI 3 */}
          <View style={[styles.kpiCard, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7', borderWidth: 1 }]}>
            <View style={styles.kpiHeader}>
              <Text style={[styles.kpiLabel, { color: isDark ? '#a1a1aa' : '#71717a' }]}>Fix Velocity</Text>
              <View style={[styles.kpiIconBox, { backgroundColor: theme.colors.tertiaryContainer }]}>
                <MaterialIcons name="timer" size={16} color={theme.colors.onTertiaryContainer} />
              </View>
            </View>
            <Text style={[styles.kpiValue, { color: isDark ? '#ffffff' : '#09090b' }]}>2.4 Days</Text>
            <View style={styles.kpiTrend}>
              <MaterialIcons name="trending-down" size={14} color={theme.colors.tertiary} />
              <Text style={[styles.kpiTrendText, { color: theme.colors.tertiary }]}>Avg. Resolution</Text>
            </View>
          </View>

          {/* KPI 4 - live resolution rate */}
          <View style={[styles.kpiCard, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7', borderWidth: 1 }]}>
            <View style={styles.kpiHeader}>
              <Text style={[styles.kpiLabel, { color: isDark ? '#a1a1aa' : '#71717a' }]}>Resolution Rate</Text>
              <View style={[styles.kpiIconBox, { backgroundColor: theme.colors.primaryFixed }]}>
                <MaterialIcons name="verified" size={16} color={theme.colors.onPrimaryFixed} />
              </View>
            </View>
            <Text style={[styles.kpiValue, { color: isDark ? '#ffffff' : '#09090b' }]}>{resolutionRate}%</Text>
            <View style={styles.kpiTrend}>
              <Text style={[styles.kpiTrendText, { color: isDark ? '#a1a1aa' : theme.colors.onSurfaceVariant }]}>{resolvedCount} resolved</Text>
            </View>
          </View>
        </View>

        {/* Heatmap Card */}
        <View style={[styles.card, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7', borderWidth: 1 }]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <MaterialIcons name="map" size={20} color={theme.colors.primary} />
              <Text style={[styles.cardTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>Spatial Defect Heatmap</Text>
            </View>
            <View style={[styles.liveBadge, { backgroundColor: isDark ? '#18181b' : '#f4f4f5' }]}>
              <View style={styles.liveDot} />
              <Text style={[styles.liveBadgeText, { color: isDark ? '#a1a1aa' : theme.colors.onSurfaceVariant }]}>LIVE GPS FEED</Text>
            </View>
          </View>
          <Text style={[styles.cardSubtitle, { color: isDark ? '#a1a1aa' : '#71717a' }]}>YOLOv8 automated street scanner density telemetry</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.layerScroller} contentContainerStyle={styles.layerContent}>
            <TouchableOpacity 
              style={[styles.layerPill, { backgroundColor: isDark ? '#18181b' : '#f4f4f5' }, selectedLayer === 'all' && styles.layerPillActive]} 
              onPress={() => setSelectedLayer('all')}
            >
              <Text style={[styles.layerText, { color: isDark ? '#a1a1aa' : '#71717a' }, selectedLayer === 'all' && styles.layerTextActive]}>All Layers</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.layerPill, { backgroundColor: isDark ? '#18181b' : '#f4f4f5' }, selectedLayer === 'pothole' && styles.layerPillActive]} 
              onPress={() => setSelectedLayer('pothole')}
            >
              <Text style={[styles.layerText, { color: isDark ? '#a1a1aa' : '#71717a' }, selectedLayer === 'pothole' && styles.layerTextActive]}>Potholes (Severe)</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.layerPill, { backgroundColor: isDark ? '#18181b' : '#f4f4f5' }, selectedLayer === 'cavity' && styles.layerPillActive]} 
              onPress={() => setSelectedLayer('cavity')}
            >
              <Text style={[styles.layerText, { color: isDark ? '#a1a1aa' : '#71717a' }, selectedLayer === 'cavity' && styles.layerTextActive]}>Subgrade Cavities</Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={[styles.mapPlaceholder, { backgroundColor: isDark ? '#09090b' : '#f4f4f5', borderColor: isDark ? '#18181b' : '#e4e4e7', borderWidth: 1 }]}>
            <MaterialIcons name="map" size={40} color={isDark ? '#27272a' : '#d4d4d8'} />
            <Text style={[styles.mapPlaceholderText, { color: isDark ? '#a1a1aa' : '#71717a', marginTop: 8 }]}>GPS Heatmap — {totalDetected} Reports Indexed</Text>
            <Text style={[styles.mapPlaceholderText, { color: isDark ? '#52525b' : '#a1a1aa', fontSize: 10, marginTop: 4 }]}>Live density from submitted complaints</Text>
          </View>

          <View style={[styles.telemetryStrip, { backgroundColor: isDark ? '#09090b' : '#f4f4f5' }]}>
            <MaterialIcons name="speed" size={18} color={theme.colors.primary} />
            <Text style={[styles.telemetryText, { color: isDark ? '#a1a1aa' : '#71717a' }]} numberOfLines={1}>
              <Text style={{ fontWeight: 'bold', color: isDark ? '#ffffff' : '#09090b' }}>Hotspot: {criticalCount} Critical Reports</Text> • Panchavati & Makhmalabad Naka Corridor
            </Text>
          </View>
        </View>

        {/* Classification Analysis */}
        <View style={[styles.card, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7', borderWidth: 1 }]}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={[styles.cardTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>Classification Analysis</Text>
              <Text style={[styles.cardSubtitle, { color: isDark ? '#a1a1aa' : '#71717a' }]}>Computer vision detection categories</Text>
            </View>
            <MaterialIcons name="donut-large" size={20} color={isDark ? '#a1a1aa' : theme.colors.onSurfaceVariant} />
          </View>

          <View style={styles.stackedBar}>
            <View style={[styles.stackedBarSegment, { backgroundColor: theme.colors.error, width: '58%' }]} />
            <View style={[styles.stackedBarSegment, { backgroundColor: theme.colors.primary, width: '24%' }]} />
            <View style={[styles.stackedBarSegment, { backgroundColor: '#d97706', width: '11%' }]} />
            <View style={[styles.stackedBarSegment, { backgroundColor: theme.colors.secondary, width: '7%' }]} />
          </View>

          <View style={styles.breakdownList}>
            {/* Row 1 */}
            <View style={styles.breakdownRow}>
              <View style={styles.breakdownLeft}>
                <View style={[styles.breakdownDot, { backgroundColor: theme.colors.error }]} />
                <View>
                  <Text style={[styles.breakdownTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>Severe Potholes &gt;12cm</Text>
                  <Text style={[styles.breakdownDesc, { color: isDark ? '#a1a1aa' : '#71717a' }]}>High vehicular axle hazard</Text>
                </View>
              </View>
              <View style={styles.breakdownRight}>
                <Text style={[styles.breakdownVal, { color: isDark ? '#ffffff' : '#09090b' }]}>
                  {complaints.filter(c => c.category === 'Pothole').length}
                </Text>
                <Text style={[styles.breakdownPct, { color: theme.colors.error }]}>
                  {totalDetected > 0 ? Math.round((complaints.filter(c => c.category === 'Pothole').length / totalDetected) * 100) : 0}%
                </Text>
              </View>
            </View>
            
            {/* Row 2 */}
            <View style={styles.breakdownRow}>
              <View style={styles.breakdownLeft}>
                <View style={[styles.breakdownDot, { backgroundColor: theme.colors.primary }]} />
                <View>
                  <Text style={[styles.breakdownTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>Longitudinal & Alligator Cracks</Text>
                  <Text style={[styles.breakdownDesc, { color: isDark ? '#a1a1aa' : '#71717a' }]}>Base surface degradation</Text>
                </View>
              </View>
              <View style={styles.breakdownRight}>
                <Text style={[styles.breakdownVal, { color: isDark ? '#ffffff' : '#09090b' }]}>
                  {complaints.filter(c => c.category === 'Deep Crack').length}
                </Text>
                <Text style={[styles.breakdownPct, { color: theme.colors.primary }]}>
                  {totalDetected > 0 ? Math.round((complaints.filter(c => c.category === 'Deep Crack').length / totalDetected) * 100) : 0}%
                </Text>
              </View>
            </View>

          </View>

          <View style={[styles.insightBanner, { backgroundColor: isDark ? '#1c1917' : '#fef2f2' }]}>
            <MaterialIcons name="thunderstorm" size={20} color={theme.colors.error} />
            <Text style={[styles.insightText, { color: isDark ? '#fecaca' : '#991b1b' }]}>
              <Text style={{ fontWeight: 'bold' }}>Weather Impact:</Text> 68% of severe potholes formed within 48h of storm events.
            </Text>
          </View>
        </View>

        {/* AI Alert */}
        <View style={[styles.card, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7', borderWidth: 1 }]}>
          <View style={styles.aiAlertHeader}>
            <MaterialIcons name="psychology" size={22} color={theme.colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.aiAlertTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>Subgrade Weather Warning</Text>
              <Text style={[styles.aiAlertDesc, { color: isDark ? '#a1a1aa' : '#71717a' }]}>
                Heavy rainfall forecast for Thursday is projected to increase pothole formation by <Text style={{ fontWeight: 'bold', color: isDark ? '#ffffff' : '#09090b' }}>+35% in Wards 4 & 7</Text>. Pre-emptive patching advised.
              </Text>
            </View>
          </View>
          <View style={styles.aiActions}>
            <TouchableOpacity style={styles.primaryBtn}>
              <MaterialIcons name="picture-as-pdf" size={20} color="#ffffff" />
              <Text style={styles.primaryBtnText}>Generate Council Briefing Pack</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.secondaryBtn, { backgroundColor: isDark ? '#18181b' : '#f4f4f5' }]}>
              <MaterialIcons name="alt-route" size={20} color={theme.colors.primary} />
              <Text style={[styles.secondaryBtnText, { color: isDark ? '#ffffff' : theme.colors.primary }]}>Reallocate Fleet to High-Density Wards</Text>
            </TouchableOpacity>
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
    paddingHorizontal: theme.spacing.gutter,
    paddingVertical: theme.spacing.spaceSm,
    backgroundColor: theme.colors.surface,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.headlineMd.fontSize,
    fontWeight: '600',
    color: theme.colors.onSurface,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.surfaceContainerHigh,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  exportBtnText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  rangeScroller: {
    marginTop: 16,
    marginHorizontal: -theme.spacing.gutter,
  },
  rangeContent: {
    paddingHorizontal: theme.spacing.gutter,
    gap: 6,
  },
  rangePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceContainerHigh,
  },
  rangePillActive: {
    backgroundColor: theme.colors.primary,
  },
  rangeText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.onSurfaceVariant,
  },
  rangeTextActive: {
    color: theme.colors.onPrimary,
  },
  scrollContent: {
    padding: theme.spacing.gutter,
    gap: theme.spacing.spaceMd,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  kpiCard: {
    width: '48%',
    backgroundColor: theme.colors.surfaceContainerLowest,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    justifyContent: 'space-between',
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kpiLabel: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
  },
  kpiIconBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiValue: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginTop: 8,
    letterSpacing: -0.5,
  },
  kpiTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  errorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.error,
  },
  kpiTrendText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
  },
  card: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.surfaceContainer,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.error,
  },
  liveBadgeText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 9,
    fontWeight: 'bold',
    color: theme.colors.onSurfaceVariant,
  },
  cardSubtitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginTop: -8,
  },
  layerScroller: {
    marginHorizontal: -16,
  },
  layerContent: {
    paddingHorizontal: 16,
    gap: 6,
  },
  layerPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceContainer,
  },
  layerPillActive: {
    backgroundColor: theme.colors.primary,
  },
  layerText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
  },
  layerTextActive: {
    color: theme.colors.onPrimary,
  },
  mapPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: theme.colors.surfaceContainerHighest,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPlaceholderText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  telemetryStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.surfaceContainerLow,
    padding: 8,
    borderRadius: 12,
  },
  telemetryText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: theme.colors.onSurface,
    flex: 1,
  },
  telemetryTextBold: {
    fontWeight: '600',
  },
  stackedBar: {
    flexDirection: 'row',
    height: 14,
    backgroundColor: theme.colors.surfaceContainer,
    borderRadius: 7,
    overflow: 'hidden',
  },
  stackedBarSegment: {
    height: '100%',
  },
  breakdownList: {
    gap: 12,
    marginTop: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  breakdownDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  breakdownTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  breakdownDesc: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
  },
  breakdownRight: {
    alignItems: 'flex-end',
  },
  breakdownVal: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  breakdownPct: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: 'bold',
  },
  insightBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.errorContainer,
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  insightText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: theme.colors.onErrorContainer,
    flex: 1,
  },
  aiAlertHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: theme.colors.secondaryContainer,
    padding: 12,
    borderRadius: 12,
  },
  aiAlertTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onSecondaryContainer,
  },
  aiAlertDesc: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginTop: 4,
  },
  aiActions: {
    gap: 8,
    marginTop: 12,
  },
  primaryBtn: {
    height: 48,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtnText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onPrimary,
  },
  secondaryBtn: {
    height: 48,
    backgroundColor: theme.colors.surfaceContainerHigh,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryBtnText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onSurface,
  }
});
