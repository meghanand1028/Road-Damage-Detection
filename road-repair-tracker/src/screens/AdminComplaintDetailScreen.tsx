import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Linking,
  Alert 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useTheme } from '../context/ThemeContext';
import { complaintsStore, Complaint } from '../services/complaintsStore';

export function AdminComplaintDetailScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const [showYoloBoxes, setShowYoloBoxes] = useState(true);
  const [selectedContractor, setSelectedContractor] = useState('RoadWorks Muni Crew #4');
  const [adminMapMode, setAdminMapMode] = useState<'satellite' | 'street'>('satellite');

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
        <Text style={styles.notFoundTitle}>Complaint Record Not Found</Text>
        <Text style={styles.notFoundSub}>The requested road hazard complaint ID does not exist.</Text>
        <TouchableOpacity style={styles.backHomeBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backHomeBtnText}>Return to Queue</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleUpdateStatus = (newStatus: Complaint['status']) => {
    const contractor = newStatus === 'assigned' || newStatus === 'in-progress' ? selectedContractor : undefined;
    complaintsStore.updateComplaintStatus(complaint.id, newStatus, contractor);
    
    let statusMsg = '';
    if (newStatus === 'under-review') statusMsg = 'Marked Under Review';
    else if (newStatus === 'assigned') statusMsg = `Dispatched to ${selectedContractor}`;
    else if (newStatus === 'resolved') statusMsg = 'Marked Resolved';

    Alert.alert('Status Updated', `Complaint ${complaint.id} is now ${statusMsg}. Updated across citizen and admin planes.`);
  };

  const handleOpenGoogleMaps = () => {
    // Open directly in satellite mode with zoom level 19
    const url = `https://www.google.com/maps/@?api=1&map_action=map&center=${complaint.location.latitude},${complaint.location.longitude}&zoom=19&basemap=satellite`;
    Linking.openURL(url).catch(() => {
      const fallbackUrl = `https://maps.google.com/maps?q=${complaint.location.latitude},${complaint.location.longitude}&t=k&z=19`;
      Linking.openURL(fallbackUrl).catch(() => {
        Alert.alert('Google Maps Coordinates', `Lat: ${complaint.location.latitude}, Lng: ${complaint.location.longitude}`);
      });
    });
  };

  const getStatusBadge = (status: Complaint['status']) => {
    switch (status) {
      case 'new': return { label: 'NEW COMPLAINT', color: theme.colors.error };
      case 'under-review': return { label: 'UNDER REVIEW', color: theme.colors.warningAmber };
      case 'assigned': return { label: 'CREW ASSIGNED', color: theme.colors.primary };
      case 'in-progress': return { label: 'IN PROGRESS', color: theme.colors.primaryContainer };
      case 'resolved': return { label: 'RESOLVED', color: theme.colors.tertiary };
      default: return { label: String(status).toUpperCase(), color: theme.colors.secondary };
    }
  };

  const statusBadge = getStatusBadge(complaint.status);

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: isDark ? '#000000' : '#ffffff' }]}>
      {/* Sticky Header */}
      <View style={[styles.header, { backgroundColor: isDark ? '#000000' : '#ffffff', borderBottomColor: isDark ? '#18181b' : '#e4e4e7' }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitleRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <MaterialIcons name="arrow-back" size={22} color={isDark ? '#ffffff' : '#09090b'} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>{complaint.id}</Text>
            <View style={[styles.criticalBadge, { backgroundColor: complaint.severity === 'Critical' ? theme.colors.errorContainer : theme.colors.primaryFixed }]}>
              <View style={[styles.criticalDot, { backgroundColor: complaint.severity === 'Critical' ? theme.colors.error : theme.colors.primary }]} />
              <Text style={[styles.criticalBadgeText, { color: complaint.severity === 'Critical' ? theme.colors.onErrorContainer : theme.colors.primary }]}>
                {complaint.severity.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>

            <View style={[styles.pendingBadge, { backgroundColor: statusBadge.color + '20' }]}>
              <Text style={[styles.pendingBadgeText, { color: statusBadge.color }]}>
                {statusBadge.label}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.headerSubtitleRow}>
          <MaterialIcons name="verified-user" size={14} color={theme.colors.primary} />
          <Text style={[styles.headerSubtitleText, { color: isDark ? '#a1a1aa' : '#52525b' }]} numberOfLines={1}>
            Reported {complaint.date} • {complaint.citizen.name} • {complaint.location.ward}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Quick Status Control Bar */}
        <View style={[styles.statusActionBar, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7' }]}>
          <Text style={[styles.statusActionTitle, { color: isDark ? '#a1a1aa' : theme.colors.secondary }]}>ADMIN WORKFLOW ACTION:</Text>
          <View style={styles.statusButtonsRow}>
            <TouchableOpacity 
              style={[
                styles.statusBtn, 
                { backgroundColor: isDark ? '#18181b' : '#f4f4f5', borderColor: isDark ? '#27272a' : '#e4e4e7' },
                complaint.status === 'under-review' && styles.statusBtnActive
              ]}
              onPress={() => handleUpdateStatus('under-review')}
            >
              <MaterialIcons name="rate-review" size={14} color={complaint.status === 'under-review' ? '#ffffff' : theme.colors.warningAmber} />
              <Text style={[styles.statusBtnText, { color: isDark ? '#ffffff' : '#09090b' }, complaint.status === 'under-review' && styles.statusBtnTextActive]}>
                Review
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.statusBtn, 
                { backgroundColor: isDark ? '#18181b' : '#f4f4f5', borderColor: isDark ? '#27272a' : '#e4e4e7' },
                complaint.status === 'assigned' && styles.statusBtnActive
              ]}
              onPress={() => handleUpdateStatus('assigned')}
            >
              <MaterialIcons name="engineering" size={14} color={complaint.status === 'assigned' ? '#ffffff' : theme.colors.primary} />
              <Text style={[styles.statusBtnText, { color: isDark ? '#ffffff' : '#09090b' }, complaint.status === 'assigned' && styles.statusBtnTextActive]}>
                Dispatch
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.statusBtn, 
                { backgroundColor: isDark ? '#18181b' : '#f4f4f5', borderColor: isDark ? '#27272a' : '#e4e4e7' },
                complaint.status === 'resolved' && styles.statusBtnActive
              ]}
              onPress={() => handleUpdateStatus('resolved')}
            >
              <MaterialIcons name="check-circle" size={14} color={complaint.status === 'resolved' ? '#ffffff' : theme.colors.tertiary} />
              <Text style={[styles.statusBtnText, { color: isDark ? '#ffffff' : '#09090b' }, complaint.status === 'resolved' && styles.statusBtnTextActive]}>
                Resolve
              </Text>
            </TouchableOpacity>
          </View>
          
          {complaint.status === 'resolved' && (
            <TouchableOpacity 
              style={[
                styles.statusBtn, 
                { backgroundColor: theme.colors.error, borderColor: theme.colors.error, marginTop: 8 }
              ]}
              onPress={() => {
                Alert.alert(
                  'Delete Complaint', 
                  'Are you sure you want to permanently delete this complaint record?', 
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Delete', 
                      style: 'destructive',
                      onPress: () => {
                        complaintsStore.deleteComplaint(complaint.id);
                        navigation.goBack();
                      }
                    }
                  ]
                );
              }}
            >
              <MaterialIcons name="delete-forever" size={16} color="#ffffff" />
              <Text style={[styles.statusBtnText, { color: '#ffffff' }]}>
                Delete Complaint Record
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* YOLO Vision Model Inspection Card */}
        <View style={[styles.card, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7' }]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderTitleRow}>
              <MaterialIcons name="lens-blur" size={20} color={theme.colors.primary} />
              <Text style={[styles.cardTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>Spatial Vision Inspection</Text>
            </View>
            <View style={[styles.liveInferenceBadge, { backgroundColor: isDark ? '#18181b' : '#f4f4f5' }]}>
              <Text style={styles.liveInferenceText}>YOLO v8.4</Text>
            </View>
          </View>

          <View style={styles.viewport}>
            <Image 
              source={{ uri: complaint.geoTagImage.uri }} 
              style={styles.viewportImg}
            />
            {/* Google Geo-Tag watermark */}
            <View style={styles.geoTagBanner}>
              <MaterialIcons name="satellite-alt" size={12} color="#34d399" />
              <Text style={styles.geoTagBannerText}>
                {complaint.geoTagImage.watermark}
              </Text>
            </View>

            <View style={styles.viewportControls}>
              <TouchableOpacity 
                style={[styles.viewportBtn, showYoloBoxes && styles.viewportBtnActive]}
                onPress={() => setShowYoloBoxes(!showYoloBoxes)}
              >
                <MaterialIcons name="check-box" size={12} color={showYoloBoxes ? theme.colors.onPrimary : theme.colors.inverseOnSurface} />
                <Text style={[styles.viewportBtnText, showYoloBoxes && { color: theme.colors.onPrimary }]}>AI Bounding Boxes</Text>
              </TouchableOpacity>
            </View>

            {showYoloBoxes && (
              <View style={[styles.bbox, styles.bboxPrimary]}>
                <View style={styles.bboxPrimaryLabel}>
                  <MaterialIcons name="warning" size={12} color={theme.colors.onError} />
                  <Text style={styles.bboxPrimaryText}>{complaint.category} • 96.4% Conf</Text>
                </View>
              </View>
            )}
          </View>

          <View style={[styles.telemetryStrip, { backgroundColor: isDark ? '#09090b' : '#f4f4f5' }]}>
            <View style={styles.telemetryItem}>
              <Text style={[styles.telemetryLabel, { color: isDark ? '#a1a1aa' : '#71717a' }]}>Est. Depth</Text>
              <Text style={[styles.telemetryValue, { color: isDark ? '#ffffff' : '#09090b' }]}>{complaint.estimatedDepth || '> 10 cm'}</Text>
            </View>
            <View style={styles.telemetryItem}>
              <Text style={[styles.telemetryLabel, { color: isDark ? '#a1a1aa' : '#71717a' }]}>Category</Text>
              <Text style={[styles.telemetryValue, { color: isDark ? '#ffffff' : '#09090b' }]}>{complaint.category}</Text>
            </View>
            <View style={styles.telemetryItem}>
              <Text style={[styles.telemetryLabel, { color: isDark ? '#a1a1aa' : '#71717a' }]}>Corridor</Text>
              <Text style={[styles.telemetryValue, { color: isDark ? '#ffffff' : '#09090b' }]}>{complaint.roadType || 'Arterial'}</Text>
            </View>
          </View>
        </View>

        {/* Direct Spot Position Map in Satellite Mode */}
        <View style={[styles.card, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7' }]}>
          <View style={styles.cardHeaderTitleRow}>
            <MaterialIcons name="satellite-alt" size={20} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>Spot Location • Satellite Mode</Text>
            <View style={styles.satelliteLiveBadge}>
              <View style={styles.satelliteLiveDot} />
              <Text style={styles.satelliteLiveBadgeText}>SATELLITE 19X</Text>
            </View>
          </View>

          {/* Layer Selector */}
          <View style={[styles.adminMapModeTabs, { backgroundColor: isDark ? '#18181b' : '#f4f4f5' }]}>
            <TouchableOpacity 
              style={[styles.adminMapModeTab, adminMapMode === 'satellite' && styles.adminMapModeTabActive]}
              onPress={() => setAdminMapMode('satellite')}
            >
              <MaterialIcons name="satellite" size={14} color={adminMapMode === 'satellite' ? '#ffffff' : theme.colors.primary} />
              <Text style={[styles.adminMapModeTabText, { color: isDark ? '#a1a1aa' : '#71717a' }, adminMapMode === 'satellite' && styles.adminMapModeTabTextActive]}>
                Satellite View (Default)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.adminMapModeTab, adminMapMode === 'street' && styles.adminMapModeTabActive]}
              onPress={() => setAdminMapMode('street')}
            >
              <MaterialIcons name="map" size={14} color={adminMapMode === 'street' ? '#ffffff' : theme.colors.primary} />
              <Text style={[styles.adminMapModeTabText, { color: isDark ? '#a1a1aa' : '#71717a' }, adminMapMode === 'street' && styles.adminMapModeTabTextActive]}>
                Street Grid
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.spotMapBox, { borderColor: isDark ? '#18181b' : '#e4e4e7' }]}>
            <View style={[styles.spotMapGrid, adminMapMode === 'satellite' ? styles.spotMapSatelliteBg : styles.spotMapDefaultBg]}>
              {/* Telemetry and Crosshairs */}
              {adminMapMode === 'satellite' && (
                <View style={styles.satelliteTelemetryBanner}>
                  <Text style={styles.satelliteTelemetryBannerText}>
                    HIGH-RES ORTHOPHOTO • SATELLITE IMAGERY ACTIVE
                  </Text>
                </View>
              )}
              <View style={styles.spotCrosshairH} />
              <View style={styles.spotCrosshairV} />
              <View style={styles.spotRoadH} />
              <View style={styles.spotRoadV} />

              <View style={styles.spotPinContainer}>
                <View style={styles.spotPinPulse} />
                <View style={styles.spotPinDot}>
                  <MaterialIcons name="location-on" size={18} color="#ffffff" />
                </View>
                <View style={styles.spotPinBadge}>
                  <Text style={styles.spotPinBadgeText}>EXACT SPOT</Text>
                </View>
              </View>
            </View>

            <View style={[styles.spotDetailsRow, { backgroundColor: isDark ? '#000000' : '#ffffff' }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.spotStreet, { color: isDark ? '#ffffff' : '#09090b' }]}>{complaint.location.street}</Text>
                <Text style={[styles.spotWard, { color: isDark ? '#a1a1aa' : '#71717a' }]}>{complaint.location.ward}</Text>
                <Text style={styles.spotCoords}>
                  GPS: {complaint.location.latitude.toFixed(6)}° N, {Math.abs(complaint.location.longitude).toFixed(6)}° W (±{complaint.location.precisionMeters || 1.8}m)
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.openSatelliteMapsBtn}
                onPress={handleOpenGoogleMaps}
              >
                <MaterialIcons name="satellite-alt" size={15} color="#ffffff" />
                <Text style={styles.openSatelliteMapsBtnText}>Open Satellite Map</Text>
                <MaterialIcons name="open-in-new" size={13} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Citizen Information & Remedial Proposal */}
        <View style={[styles.card, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7' }]}>
          <View style={styles.cardHeaderTitleRow}>
            <MaterialIcons name="person-pin" size={20} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>Citizen Contact & Remedial Suggestion</Text>
          </View>

          <View style={styles.citizenProfileRow}>
            <View style={styles.citizenAvatar}>
              <Text style={styles.citizenAvatarText}>
                {complaint.citizen.name.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.citizenName, { color: isDark ? '#ffffff' : '#09090b' }]}>{complaint.citizen.name}</Text>
                <View style={styles.verifiedCitizenBadge}>
                  <MaterialIcons name="verified" size={12} color={theme.colors.tertiary} />
                  <Text style={styles.verifiedCitizenText}>Verified Resident</Text>
                </View>
              </View>
              <Text style={[styles.citizenContact, { color: isDark ? '#a1a1aa' : '#71717a' }]}>{complaint.citizen.phone} • {complaint.citizen.email}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.callCitizenBtn, { backgroundColor: isDark ? '#18181b' : '#f4f4f5', borderColor: isDark ? '#27272a' : '#e4e4e7' }]}
              onPress={() => Linking.openURL(`tel:${complaint.citizen.phone}`).catch(() => {})}
            >
              <MaterialIcons name="phone" size={16} color={isDark ? '#ffffff' : theme.colors.primary} />
              <Text style={[styles.callCitizenBtnText, { color: isDark ? '#ffffff' : theme.colors.primary }]}>Call</Text>
            </TouchableOpacity>
          </View>

          {complaint.citizenSuggestions ? (
            <View style={[styles.suggestionHighlight, { backgroundColor: isDark ? '#1c1917' : '#fffbeb' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                <MaterialIcons name="lightbulb" size={16} color={theme.colors.warningAmber} />
                <Text style={[styles.suggestionHighlightTitle, { color: isDark ? '#fde68a' : '#92400e' }]}>Citizen's Remedial Proposal:</Text>
              </View>
              <Text style={[styles.suggestionHighlightText, { color: isDark ? '#fef3c7' : '#78350f' }]}>
                "{complaint.citizenSuggestions}"
              </Text>
              {complaint.suggestionTags && complaint.suggestionTags.length > 0 ? (
                <View style={styles.tagsRow}>
                  {complaint.suggestionTags.map((t, idx) => (
                    <View key={idx} style={[styles.hazardTag, { backgroundColor: isDark ? '#292524' : '#fef3c7' }]}>
                      <Text style={[styles.hazardTagText, { color: isDark ? '#fde68a' : '#92400e' }]}>{t}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          ) : null}
        </View>

        {/* Contractor Dispatch Selector */}
        <View style={[styles.card, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7' }]}>
          <View style={styles.cardHeaderTitleRow}>
            <MaterialIcons name="engineering" size={20} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>Contractor Dispatch Selection</Text>
          </View>
          
          {[
            { id: 'RoadWorks Muni Crew #4', dist: '1.2 km', eta: '20m ETA', rating: '4.9', tag: 'BEST FIT' },
            { id: 'Apex Paving Corp', dist: '3.8 km', eta: '45m ETA', rating: '4.8', tag: 'STANDBY' },
            { id: 'City Cold-Patch Unit 2', dist: '2.5 km', eta: '35m ETA', rating: '4.7', tag: 'AVAILABLE' },
          ].map(contractor => {
            const isSelected = selectedContractor === contractor.id;
            return (
              <TouchableOpacity 
                key={contractor.id}
                style={[
                  styles.contractorCard, 
                  { backgroundColor: isDark ? '#09090b' : '#fafafa', borderColor: isDark ? '#18181b' : '#e4e4e7' },
                  isSelected && styles.contractorCardSelected
                ]}
                onPress={() => setSelectedContractor(contractor.id)}
              >
                <View style={styles.contractorHeader}>
                  <View style={styles.contractorInfo}>
                    <View style={styles.radio}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                    <View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.contractorName, { color: isDark ? '#ffffff' : '#09090b' }]}>{contractor.id}</Text>
                        <View style={styles.bestFitBadge}><Text style={styles.bestFitText}>{contractor.tag}</Text></View>
                      </View>
                      <Text style={[styles.contractorStats, { color: isDark ? '#a1a1aa' : '#71717a' }]}>{contractor.dist} • {contractor.eta} • ★ {contractor.rating}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity 
            style={styles.dispatchConfirmBtn}
            onPress={() => handleUpdateStatus('assigned')}
          >
            <MaterialIcons name="send" size={18} color="#ffffff" />
            <Text style={styles.dispatchConfirmBtnText}>
              Confirm Dispatch: {selectedContractor}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 60 }} />
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
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceContainerHigh,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backBtn: {
    padding: 4,
    marginLeft: -4,
  },
  headerTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  criticalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  criticalDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  criticalBadgeText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    fontWeight: '800',
  },
  pendingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pendingBadgeText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    fontWeight: '800',
  },
  headerSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 28,
  },
  headerSubtitleText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.gutter,
    gap: 14,
  },
  statusActionBar: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.surfaceContainerHigh,
    gap: 8,
  },
  statusActionTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.secondary,
    letterSpacing: 0.5,
  },
  statusButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.surfaceContainerHigh,
  },
  statusBtnActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  statusBtnText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  statusBtnTextActive: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  liveInferenceBadge: {
    backgroundColor: theme.colors.surfaceContainerLow,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveInferenceText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  viewport: {
    width: '100%',
    height: 220,
    backgroundColor: '#000000',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  viewportImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  geoTagBanner: {
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
  geoTagBannerText: {
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
    color: '#34d399',
    flex: 1,
  },
  viewportControls: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  viewportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  viewportBtnActive: {
    backgroundColor: theme.colors.primary,
  },
  viewportBtnText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  bbox: {
    position: 'absolute',
    borderWidth: 2,
  },
  bboxPrimary: {
    top: 30,
    left: '20%',
    width: '55%',
    height: '50%',
    borderColor: theme.colors.error,
  },
  bboxPrimaryLabel: {
    position: 'absolute',
    top: -20,
    left: -2,
    backgroundColor: theme.colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  bboxPrimaryText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 9,
    fontWeight: '800',
    color: '#ffffff',
  },
  telemetryStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  telemetryItem: {
    alignItems: 'center',
  },
  telemetryLabel: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    color: theme.colors.onSurfaceVariant,
  },
  telemetryValue: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.onSurface,
    marginTop: 2,
  },
  spotMapBox: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.surfaceContainerHigh,
  },
  spotMapGrid: {
    height: 110,
    backgroundColor: '#0f172a',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotRoadH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 24,
    backgroundColor: '#1e293b',
  },
  spotRoadV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 24,
    backgroundColor: '#1e293b',
  },
  spotPinContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotPinPulse: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(239, 68, 68, 0.4)',
  },
  spotPinDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: theme.colors.surfaceContainerLowest,
    gap: 10,
  },
  spotStreet: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  spotWard: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  spotCoords: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: theme.colors.primary,
    marginTop: 2,
  },
  openMapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  openMapsBtnText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  satelliteLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#064e3b',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  satelliteLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34d399',
  },
  satelliteLiveBadgeText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 9,
    fontWeight: '800',
    color: '#a7f3d0',
    letterSpacing: 0.5,
  },
  adminMapModeTabs: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: 8,
    padding: 3,
    marginBottom: 10,
    gap: 4,
  },
  adminMapModeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
    borderRadius: 6,
  },
  adminMapModeTabActive: {
    backgroundColor: theme.colors.primary,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  adminMapModeTabText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.onSurfaceVariant,
  },
  adminMapModeTabTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  spotMapSatelliteBg: {
    backgroundColor: '#09151c',
  },
  spotMapDefaultBg: {
    backgroundColor: '#0f172a',
  },
  satelliteTelemetryBanner: {
    position: 'absolute',
    top: 6,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  satelliteTelemetryBannerText: {
    fontFamily: 'monospace',
    fontSize: 8,
    fontWeight: '700',
    color: '#6ee7b7',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  spotCrosshairH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(52, 211, 153, 0.25)',
  },
  spotCrosshairV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(52, 211, 153, 0.25)',
  },
  spotPinBadge: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 3,
    marginTop: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  spotPinBadgeText: {
    fontFamily: 'monospace',
    fontSize: 8,
    fontWeight: '800',
    color: '#ffffff',
  },
  openSatelliteMapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#064e3b',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#059669',
  },
  openSatelliteMapsBtnText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  citizenProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  citizenAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  citizenAvatarText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  citizenName: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  verifiedCitizenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  verifiedCitizenText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.tertiary,
  },
  citizenContact: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  callCitizenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.surfaceContainerLow,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.surfaceContainerHigh,
  },
  callCitizenBtnText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  suggestionHighlight: {
    backgroundColor: '#fffbeb',
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.warningAmber,
  },
  suggestionHighlightTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: '#92400e',
  },
  suggestionHighlightText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: '#78350f',
    lineHeight: 17,
    fontStyle: 'italic',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  hazardTag: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  hazardTagText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    fontWeight: '600',
    color: '#92400e',
  },
  contractorCard: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.surfaceContainerHigh,
    backgroundColor: theme.colors.surfaceContainerLow,
  },
  contractorCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryFixed + '25',
  },
  contractorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contractorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  contractorName: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  bestFitBadge: {
    backgroundColor: theme.colors.primaryFixed,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  bestFitText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  contractorStats: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  dispatchConfirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  dispatchConfirmBtnText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
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
