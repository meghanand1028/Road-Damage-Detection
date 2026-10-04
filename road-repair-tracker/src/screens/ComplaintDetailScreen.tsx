import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Switch, 
  Linking,
  Alert 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { complaintsStore, Complaint } from '../services/complaintsStore';
import { useTheme } from '../context/ThemeContext';

export function ComplaintDetailScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const [smsAlerts, setSmsAlerts] = useState(true);

  const routeComplaintId = route?.params?.complaintId;
  const [complaint, setComplaint] = useState<Complaint | undefined>(
    routeComplaintId ? complaintsStore.getComplaintById(routeComplaintId) : complaintsStore.getComplaints()[0]
  );

  useEffect(() => {
    const unsubscribe = complaintsStore.subscribe(() => {
      const updated = routeComplaintId ? complaintsStore.getComplaintById(routeComplaintId) : complaintsStore.getComplaints()[0];
      setComplaint(updated);
    });
    return unsubscribe;
  }, [routeComplaintId]);

  if (!complaint) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, alignItems: 'center', justifyContent: 'center', padding: 24 }]}>
        <MaterialIcons name="error-outline" size={48} color={theme.colors.error} />
        <Text style={styles.notFoundTitle}>Complaint Not Found</Text>
        <Text style={styles.notFoundSub}>The requested road damage record could not be loaded.</Text>
        <TouchableOpacity style={styles.backHomeBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backHomeBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getStatusColor = (status: Complaint['status']) => {
    switch (status) {
      case 'new': return theme.colors.error;
      case 'under-review': return theme.colors.warningAmber;
      case 'assigned': return theme.colors.primary;
      case 'in-progress': return theme.colors.primaryContainer;
      case 'resolved': return theme.colors.tertiary;
      default: return theme.colors.secondary;
    }
  };

  const getStatusLabel = (status: Complaint['status']) => {
    switch (status) {
      case 'new': return 'NEW • AWAITING DPW TRIAGE';
      case 'under-review': return 'UNDER DPW ENGINEERING REVIEW';
      case 'assigned': return `CREW ASSIGNED: ${complaint.assignedContractor || 'MUNICIPAL CREW #4'}`;
      case 'in-progress': return 'CREW ON-SITE • REPAIR IN PROGRESS';
      case 'resolved': return 'RESOLVED • ROAD PATCH VERIFIED';
      default: return String(status).toUpperCase();
    }
  };

  const statusColor = getStatusColor(complaint.status);

  const handleOpenGoogleMaps = () => {
    const url = `https://maps.google.com/maps?q=${complaint.location.latitude},${complaint.location.longitude}&t=k&z=19`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Spot Coordinates', `Lat: ${complaint.location.latitude}, Lng: ${complaint.location.longitude}`);
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: isDark ? '#000000' : '#ffffff' }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? '#0a0e17' : '#ffffff', borderBottomColor: isDark ? '#1e293b' : '#e2e8f0' }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={[styles.backBtn, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]} 
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={22} color={isDark ? '#ffffff' : '#0f172a'} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.headerLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>CITIZEN COMPLAINT</Text>
            <Text style={[styles.headerTitle, { color: isDark ? '#ffffff' : '#0f172a' }]}>{complaint.id}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>

          <TouchableOpacity 
            style={[styles.adminSwitchBtn, isDark && { backgroundColor: '#1e293b', borderColor: '#334155' }]}
            onPress={() => navigation.navigate('AdminComplaintDetail', { complaintId: complaint.id })}
          >
            <MaterialIcons name="admin-panel-settings" size={16} color={theme.colors.primary} />
            <Text style={styles.adminSwitchText}>Admin View</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        
        {/* Status Banner */}
        <View style={[styles.statusBanner, { borderColor: statusColor + '40', backgroundColor: isDark ? '#0a0e17' : '#ffffff' }]}>
          <View style={styles.statusBannerLeft}>
            <View style={[styles.pulseDot, { backgroundColor: statusColor }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.statusTitle, { color: statusColor }]}>
                {getStatusLabel(complaint.status)}
              </Text>
              <Text style={[styles.statusSub, { color: isDark ? '#94a3b8' : '#64748b' }]}>Transmitted {complaint.date}</Text>
            </View>
          </View>
          <View style={[styles.severityBadge, { backgroundColor: complaint.severity === 'Critical' ? theme.colors.error : theme.colors.primary }]}>
            <MaterialIcons name="warning" size={13} color="#ffffff" />
            <Text style={styles.severityBadgeText}>{complaint.severity.toUpperCase()}</Text>
          </View>
        </View>

        {/* Geo-Tagged Image Card */}
        <View style={[styles.card, { backgroundColor: isDark ? '#0a0e17' : '#ffffff', borderColor: isDark ? '#1e293b' : '#e2e8f0' }]}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialIcons name="camera-alt" size={18} color={theme.colors.primary} />
              <Text style={[styles.cardTitle, { color: isDark ? '#ffffff' : '#0f172a' }]}>Google Geo-Tagged Photo</Text>
            </View>
            <View style={[styles.sensorBadge, isDark && { backgroundColor: '#1e293b' }]}>
              <Text style={[styles.sensorBadgeText, { color: isDark ? '#94a3b8' : '#64748b' }]}>{complaint.geoTagImage.cameraSensor}</Text>
            </View>
          </View>

          <View style={styles.imageWrapper}>
            <Image 
              source={{ uri: complaint.geoTagImage.uri }} 
              style={styles.defectImage}
            />
            {/* Live Watermark Banner */}
            <View style={styles.watermarkBanner}>
              <MaterialIcons name="satellite-alt" size={12} color="#34d399" />
              <Text style={styles.watermarkBannerText}>{complaint.geoTagImage.watermark}</Text>
            </View>
          </View>

          <View style={styles.imageFooterRow}>
            <View style={styles.verifiedRow}>
              <MaterialIcons name="verified" size={16} color={theme.colors.tertiary} />
              <Text style={styles.verifiedText}>Cryptographically Verified Citizen Proof</Text>
            </View>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryPillText}>{complaint.category}</Text>
            </View>
          </View>
        </View>

        {/* Spot Location Card */}
        <View style={[styles.card, { backgroundColor: isDark ? '#0a0e17' : '#ffffff', borderColor: isDark ? '#1e293b' : '#e2e8f0' }]}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialIcons name="location-on" size={18} color={theme.colors.primary} />
              <Text style={[styles.cardTitle, { color: isDark ? '#ffffff' : '#0f172a' }]}>Spot Position at Location</Text>
            </View>
            <View style={[styles.gpsAccuracyBadge, isDark && { backgroundColor: '#064e3b' }]}>
              <Text style={[styles.gpsAccuracyText, isDark && { color: '#34d399' }]}>±{complaint.location.precisionMeters || 1.8}m Accuracy</Text>
            </View>
          </View>

          <View style={styles.spotMapSimulation}>
            <View style={styles.gridLineH} />
            <View style={styles.gridLineV} />
            <View style={styles.spotMarkerContainer}>
              <View style={styles.spotMarkerPulse} />
              <View style={styles.spotMarker}>
                <MaterialIcons name="dangerous" size={16} color="#ffffff" />
              </View>
            </View>
          </View>

          <View style={styles.locationDetailsGroup}>
            <Text style={[styles.streetName, { color: isDark ? '#ffffff' : '#0f172a' }]}>{complaint.location.street}</Text>
            <Text style={[styles.wardName, { color: isDark ? '#94a3b8' : '#64748b' }]}>{complaint.location.ward}</Text>
            {complaint.location.landmark ? (
              <Text style={[styles.landmarkText, { color: isDark ? '#94a3b8' : '#64748b' }]}>Landmark: {complaint.location.landmark}</Text>
            ) : null}
            <Text style={styles.coordsText}>
              GPS: {complaint.location.latitude.toFixed(6)}° N, {Math.abs(complaint.location.longitude).toFixed(6)}° W • Alt: {complaint.location.altitudeMeters || 48}m
            </Text>
          </View>

          <TouchableOpacity style={styles.openGoogleMapsBtn} onPress={handleOpenGoogleMaps}>
            <MaterialIcons name="map" size={18} color="#ffffff" />
            <Text style={styles.openGoogleMapsBtnText}>Open Exact Spot on Google Maps</Text>
            <MaterialIcons name="open-in-new" size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Citizen Field Statement & Suggestions */}
        <View style={[styles.card, { backgroundColor: isDark ? '#0a0e17' : '#ffffff', borderColor: isDark ? '#1e293b' : '#e2e8f0' }]}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialIcons name="person-pin" size={18} color={theme.colors.primary} />
              <Text style={[styles.cardTitle, { color: isDark ? '#ffffff' : '#0f172a' }]}>Citizen Statement & Suggestion</Text>
            </View>
            <View style={styles.reporterBadge}>
              <Text style={styles.reporterBadgeText}>{complaint.citizen.name}</Text>
            </View>
          </View>

          {complaint.citizenSuggestions ? (
            <View style={[styles.quoteCard, { backgroundColor: isDark ? '#131d31' : '#f8fafc', borderColor: isDark ? '#1e293b' : '#e2e8f0' }]}>
              <MaterialIcons name="format-quote" size={24} color={theme.colors.warningAmber} style={{ marginRight: 6 }} />
              <Text style={styles.quoteContent}>"{complaint.citizenSuggestions}"</Text>
            </View>
          ) : null}

          {complaint.suggestionTags && complaint.suggestionTags.length > 0 ? (
            <View style={styles.tagsContainer}>
              {complaint.suggestionTags.map((tag, idx) => (
                <View key={idx} style={styles.tagPill}>
                  <Text style={styles.tagPillText}>{tag}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.defectTelemetryRow}>
            <View style={styles.telemetryBox}>
              <Text style={styles.telemetryBoxLabel}>Est. Depth</Text>
              <Text style={styles.telemetryBoxValue}>{complaint.estimatedDepth || '> 10 cm'}</Text>
            </View>
            <View style={styles.telemetryDivider} />
            <View style={styles.telemetryBox}>
              <Text style={styles.telemetryBoxLabel}>Corridor</Text>
              <Text style={styles.telemetryBoxValue}>{complaint.roadType || 'Arterial'}</Text>
            </View>
            <View style={styles.telemetryDivider} />
            <View style={styles.telemetryBox}>
              <Text style={styles.telemetryBoxLabel}>Traffic Density</Text>
              <Text style={styles.telemetryBoxValue}>{complaint.trafficDensity || 'High'}</Text>
            </View>
          </View>
        </View>

        {/* Resolution Timeline */}
        <View style={[styles.card, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7' }]}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialIcons name="timeline" size={18} color={theme.colors.primary} />
              <Text style={[styles.cardTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>Municipal Resolution Workflow</Text>
            </View>
            <View style={[styles.stageIndicatorBadge, isDark && { backgroundColor: '#18181b' }]}>
              <Text style={[styles.stageIndicatorText, isDark && { color: '#60a5fa' }]}>
                {complaint.status === 'resolved' ? 'Stage 5 of 5' : (complaint.status === 'in-progress' ? 'Stage 4 of 5' : (complaint.status === 'assigned' ? 'Stage 3 of 5' : (complaint.status === 'under-review' ? 'Stage 2 of 5' : 'Stage 1 of 5')))}
              </Text>
            </View>
          </View>

          <View style={styles.timeline}>
            {/* Step 1: Transmitted */}
            <View style={styles.timelineItem}>
              <View style={[styles.timelineNode, { backgroundColor: theme.colors.tertiary }]}>
                <MaterialIcons name="check" size={14} color="#ffffff" />
              </View>
              <View style={styles.timelineContent}>
                <View style={styles.timelineHeader}>
                  <Text style={[styles.timelineTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>Complaint Transmitted & Geo-Tagged</Text>
                  <Text style={[styles.timelineTime, { color: isDark ? '#a1a1aa' : '#71717a' }]}>{complaint.date}</Text>
                </View>
                <Text style={[styles.timelineDesc, { color: isDark ? '#a1a1aa' : '#52525b' }]}>Citizen proof submitted with GPS coordinates and live camera watermark.</Text>
              </View>
            </View>

            {/* Step 2: DPW Review */}
            <View style={styles.timelineItem}>
              <View style={[styles.timelineNode, { 
                backgroundColor: complaint.status !== 'new' ? theme.colors.tertiary : theme.colors.warningAmber 
              }]}>
                <MaterialIcons 
                  name={complaint.status !== 'new' ? "check" : "hourglass-top"} 
                  size={14} 
                  color="#ffffff" 
                />
              </View>
              <View style={styles.timelineContent}>
                <View style={styles.timelineHeader}>
                  <Text style={[styles.timelineTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>DPW Admin Engineering Review</Text>
                  <Text style={[styles.timelineTime, { color: isDark ? '#a1a1aa' : '#71717a' }]}>
                    {complaint.status === 'new' ? 'In Queue' : 'Completed'}
                  </Text>
                </View>
                <Text style={[styles.timelineDesc, { color: isDark ? '#a1a1aa' : '#52525b' }]}>
                  {complaint.status === 'new' 
                    ? 'Complaint awaiting review in the DPW Admin Plane.' 
                    : 'Hazard prioritized based on transit corridor and citizen safety proposal.'}
                </Text>
              </View>
            </View>

            {/* Step 3: Dispatch Crew */}
            <View style={styles.timelineItem}>
              <View style={[styles.timelineNode, { 
                backgroundColor: (complaint.status === 'assigned' || complaint.status === 'in-progress' || complaint.status === 'resolved') 
                  ? theme.colors.tertiary 
                  : (isDark ? '#27272a' : theme.colors.surfaceContainerHighest)
              }]}>
                <MaterialIcons 
                  name={(complaint.status === 'assigned' || complaint.status === 'in-progress' || complaint.status === 'resolved') ? "check" : "engineering"} 
                  size={14} 
                  color={(complaint.status === 'assigned' || complaint.status === 'in-progress' || complaint.status === 'resolved') ? "#ffffff" : (isDark ? '#71717a' : theme.colors.secondary)} 
                />
              </View>
              <View style={styles.timelineContent}>
                <View style={styles.timelineHeader}>
                  <Text style={[styles.timelineTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>Contractor & Crew Dispatch</Text>
                  <Text style={[styles.timelineTime, { color: isDark ? '#a1a1aa' : '#71717a' }]}>
                    {complaint.assignedContractor || (complaint.status === 'assigned' ? 'Assigned' : 'Pending')}
                  </Text>
                </View>
                <Text style={[styles.timelineDesc, { color: isDark ? '#a1a1aa' : '#52525b' }]}>
                  {complaint.assignedContractor 
                    ? `Work order issued to ${complaint.assignedContractor}.` 
                    : 'Dispatch pending administrator approval.'}
                </Text>
              </View>
            </View>

            {/* Step 4: Repair Execution */}
            <View style={styles.timelineItem}>
              <View style={[styles.timelineNode, { 
                backgroundColor: complaint.status === 'resolved' 
                  ? theme.colors.tertiary 
                  : (complaint.status === 'in-progress' ? theme.colors.primary : (isDark ? '#27272a' : theme.colors.surfaceContainerHighest)) 
              }]}>
                <MaterialIcons 
                  name={complaint.status === 'resolved' ? "check" : "construction"} 
                  size={14} 
                  color={complaint.status === 'resolved' || complaint.status === 'in-progress' ? "#ffffff" : (isDark ? '#71717a' : theme.colors.secondary)} 
                />
              </View>
              <View style={styles.timelineContent}>
                <View style={styles.timelineHeader}>
                  <Text style={[styles.timelineTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>Asphalt Patch & Road Repair</Text>
                  <Text style={[styles.timelineTime, { color: isDark ? '#a1a1aa' : '#71717a' }]}>
                    {complaint.status === 'resolved' ? 'Finished' : (complaint.status === 'in-progress' ? 'Active' : 'Scheduled')}
                  </Text>
                </View>
                <Text style={[styles.timelineDesc, { color: isDark ? '#a1a1aa' : '#52525b' }]}>
                  {complaint.status === 'resolved' 
                    ? 'Sub-base cleaned, asphalt compacted, and lane reopened.' 
                    : (complaint.status === 'in-progress' ? 'Crew is actively on-site laying hot-mix patch.' : 'Awaiting crew arrival on site.')}
                </Text>
              </View>
            </View>

            {/* Step 5: Final Resolution */}
            <View style={[styles.timelineItem, { marginBottom: 0 }]}>
              <View style={[styles.timelineNode, { 
                backgroundColor: complaint.status === 'resolved' ? theme.colors.tertiary : (isDark ? '#27272a' : theme.colors.surfaceContainerHighest) 
              }]}>
                <MaterialIcons 
                  name="verified-user" 
                  size={14} 
                  color={complaint.status === 'resolved' ? "#ffffff" : (isDark ? '#71717a' : theme.colors.secondary)} 
                />
              </View>
              <View style={styles.timelineContent}>
                <View style={styles.timelineHeader}>
                  <Text style={[styles.timelineTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>Municipal Verification</Text>
                  <Text style={[styles.timelineTime, { color: isDark ? '#a1a1aa' : '#71717a' }]}>
                    {complaint.status === 'resolved' ? 'Verified' : 'Pending'}
                  </Text>
                </View>
                <Text style={[styles.timelineDesc, { color: isDark ? '#a1a1aa' : '#52525b' }]}>
                  {complaint.status === 'resolved' 
                    ? 'Work order verified and closed by Ward 4 Municipal Inspector.' 
                    : 'Post-repair inspection will certify quality.'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Notifications & Support */}
        <View style={[styles.card, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7' }]}>
          <View style={styles.settingsRow}>
            <View style={styles.settingsInfo}>
              <MaterialIcons name="notifications-active" size={20} color={theme.colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingsTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>SMS Status Alerts</Text>
                <Text style={[styles.settingsSub, { color: isDark ? '#a1a1aa' : '#52525b' }]}>Notify {complaint.citizen.phone} when crew arrives</Text>
              </View>
            </View>
            <Switch
              value={smsAlerts}
              onValueChange={setSmsAlerts}
              trackColor={{ false: isDark ? '#27272a' : '#e4e4e7', true: theme.colors.primary }}
              thumbColor="#ffffff"
            />
          </View>

          <TouchableOpacity 
            style={[styles.hotlineBtn, isDark && { backgroundColor: '#18181b', borderColor: '#ef444455' }]}
            onPress={() => Linking.openURL('tel:311').catch(() => {})}
          >
            <MaterialIcons name="phone" size={18} color={theme.colors.error} />
            <Text style={[styles.hotlineBtnText, isDark && { color: '#fca5a5' }]}>DPW Road Hazard Hotline: Dial 311</Text>
          </TouchableOpacity>
        </View>

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
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceContainerHigh,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.surfaceContainerHigh,
  },
  headerLabel: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.primary,
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminSwitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primaryFixed,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },
  adminSwitchText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  scrollContent: {
    padding: theme.spacing.gutter,
    gap: 14,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surfaceContainerLowest,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  statusBannerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginRight: 8,
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '800',
  },
  statusSub: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  severityBadgeText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
  },
  card: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.surfaceContainerHigh,
    gap: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  sensorBadge: {
    backgroundColor: theme.colors.surfaceContainerLow,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  sensorBadgeText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    color: theme.colors.onSurfaceVariant,
  },
  imageWrapper: {
    width: '100%',
    height: 210,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000000',
  },
  defectImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  watermarkBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.75)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  watermarkBannerText: {
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
    color: '#34d399',
    flex: 1,
  },
  imageFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.tertiary,
    fontWeight: '600',
  },
  categoryPill: {
    backgroundColor: theme.colors.primaryFixed,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryPillText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  gpsAccuracyBadge: {
    backgroundColor: theme.colors.tertiaryContainer + '30',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  gpsAccuracyText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.tertiary,
  },
  spotMapSimulation: {
    width: '100%',
    height: 120,
    backgroundColor: '#0f172a',
    borderRadius: 10,
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 28,
    backgroundColor: '#1e293b',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 28,
    backgroundColor: '#1e293b',
  },
  spotMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotMarkerPulse: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(239, 68, 68, 0.35)',
  },
  spotMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  locationDetailsGroup: {
    gap: 3,
  },
  streetName: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  wardName: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  landmarkText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.primary,
    fontStyle: 'italic',
  },
  coordsText: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: theme.colors.secondary,
    marginTop: 2,
  },
  openGoogleMapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingVertical: 11,
    borderRadius: 10,
  },
  openGoogleMapsBtnText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  reporterBadge: {
    backgroundColor: theme.colors.surfaceContainerLow,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  reporterBadgeText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.onSurfaceVariant,
  },
  quoteCard: {
    flexDirection: 'row',
    backgroundColor: '#fffbeb',
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.warningAmber,
  },
  quoteContent: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: '#92400e',
    lineHeight: 18,
    flex: 1,
    fontStyle: 'italic',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagPill: {
    backgroundColor: theme.colors.surfaceContainerLow,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.surfaceContainerHigh,
  },
  tagPillText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.onSurface,
  },
  defectTelemetryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  telemetryBox: {
    flex: 1,
    alignItems: 'center',
  },
  telemetryBoxLabel: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    color: theme.colors.onSurfaceVariant,
  },
  telemetryBoxValue: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.onSurface,
    marginTop: 2,
  },
  telemetryDivider: {
    width: 1,
    height: 24,
    backgroundColor: theme.colors.outlineVariant,
  },
  stageIndicatorBadge: {
    backgroundColor: theme.colors.primaryFixed,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  stageIndicatorText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  timeline: {
    gap: 14,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 12,
  },
  timelineNode: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  timelineContent: {
    flex: 1,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  timelineTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  timelineTime: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    color: theme.colors.outline,
  },
  timelineDesc: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 15,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 10,
  },
  settingsTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  settingsSub: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
  },
  hotlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  hotlineBtnText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.error,
  },
  notFoundTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.onSurface,
    marginTop: 12,
  },
  notFoundSub: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  backHomeBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backHomeBtnText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  }
});
