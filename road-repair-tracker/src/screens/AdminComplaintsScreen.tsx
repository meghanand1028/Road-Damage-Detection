import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  TextInput, 
  Linking,
  Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useTheme } from '../context/ThemeContext';
import { complaintsStore, Complaint } from '../services/complaintsStore';

export function AdminComplaintsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const [complaints, setComplaints] = useState<Complaint[]>(complaintsStore.getComplaints());
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(complaints[0]?.id || null);

  useEffect(() => {
    const unsubscribe = complaintsStore.subscribe(() => {
      setComplaints([...complaintsStore.getComplaints()]);
    });
    return unsubscribe;
  }, []);

  const FILTERS = ['All', 'New', 'Critical', 'Under Review', 'Assigned', 'Resolved'];

  const filteredComplaints = complaints.filter(c => {
    // Tab filter
    if (activeFilter === 'New' && c.status !== 'new') return false;
    if (activeFilter === 'Critical' && c.severity !== 'Critical') return false;
    if (activeFilter === 'Under Review' && c.status !== 'under-review') return false;
    if (activeFilter === 'Assigned' && c.status !== 'assigned') return false;
    if (activeFilter === 'Resolved' && c.status !== 'resolved') return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = c.id.toLowerCase().includes(q);
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchAddress = c.location.address.toLowerCase().includes(q);
      const matchCitizen = c.citizen.name.toLowerCase().includes(q);
      const matchCategory = c.category.toLowerCase().includes(q);
      return matchId || matchTitle || matchAddress || matchCitizen || matchCategory;
    }

    return true;
  });

  const handleStatusChange = (id: string, newStatus: Complaint['status'], assignedContractor?: string) => {
    complaintsStore.updateComplaintStatus(id, newStatus, assignedContractor);
  };

  const handleOpenGoogleMaps = (lat: number, lng: number) => {
    // Exact location in Satellite Mode (t=k for satellite imagery layer, z=19 for high zoom)
    const url = `https://maps.google.com/maps?q=${lat},${lng}&t=k&z=19`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Unable to open Google Maps', `Coordinates: ${lat}, ${lng}`);
    });
  };

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
      case 'new': return 'NEW COMPLAINT';
      case 'under-review': return 'UNDER REVIEW';
      case 'assigned': return 'CREW ASSIGNED';
      case 'in-progress': return 'IN PROGRESS';
      case 'resolved': return 'RESOLVED';
      default: return String(status).toUpperCase();
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: isDark ? '#000000' : '#ffffff' }]}>
      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: isDark ? '#000000' : '#ffffff', borderBottomColor: isDark ? '#18181b' : '#e4e4e7' }]}>
        <View style={styles.headerLeft}>
          <View style={styles.headerTitleRow}>
            <Text style={[styles.headerTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>Citizen Complaints</Text>
            <View style={styles.complaintCountBadge}>
              <Text style={styles.complaintCountText}>{complaints.length} Total</Text>
            </View>
          </View>
          <Text style={[styles.headerSubtitle, { color: isDark ? '#a1a1aa' : '#52525b' }]}>
            Direct citizen feed with Google Geo-Tagged photos & spot coordinates
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>

          <TouchableOpacity 
            style={styles.adminAvatarBtn}
            onPress={() => navigation.navigate('AdminOverview')}
          >
            <View style={styles.adminAvatar}>
              <MaterialIcons name="admin-panel-settings" size={20} color={theme.colors.onPrimary} />
            </View>
            <View style={styles.onlineDot} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: isDark ? '#000000' : '#ffffff', borderBottomColor: isDark ? '#18181b' : '#e4e4e7' }]}>
        <MaterialIcons name="search" size={20} color={isDark ? '#a1a1aa' : theme.colors.secondary} style={styles.searchIcon} />
        <TextInput 
          style={[styles.searchInput, { backgroundColor: isDark ? '#18181b' : '#f4f4f5', color: isDark ? '#ffffff' : '#09090b', borderColor: isDark ? '#27272a' : '#e4e4e7' }]}
          placeholder="Search by #CR-..., citizen name, street or ward..."
          placeholderTextColor={isDark ? '#52525b' : theme.colors.outline}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialIcons name="close" size={18} color={theme.colors.secondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <View style={styles.filterWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
          {FILTERS.map(f => {
            const isSelected = activeFilter === f;
            return (
              <TouchableOpacity 
                key={f}
                style={[
                  styles.filterChip, 
                  isSelected && styles.filterChipActive,
                  isDark && !isSelected && { backgroundColor: '#18181b', borderColor: '#27272a' }
                ]}
                onPress={() => setActiveFilter(f)}
              >
                <Text style={[
                  styles.filterChipText, 
                  isSelected && styles.filterChipTextActive,
                  isDark && !isSelected && { color: '#a1a1aa' }
                ]}>
                  {f}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Complaints List */}
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {filteredComplaints.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7' }]}>
            <MaterialIcons name="check-circle" size={48} color={theme.colors.tertiary} />
            <Text style={[styles.emptyStateTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>No Complaints Found</Text>
            <Text style={[styles.emptyStateSub, { color: isDark ? '#a1a1aa' : '#52525b' }]}>No complaints match the current filter criteria.</Text>
          </View>
        ) : (
          filteredComplaints.map(complaint => {
            const isExpanded = expandedId === complaint.id;
            const statusColor = getStatusColor(complaint.status);

            return (
              <View key={complaint.id} style={[styles.complaintCard, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7' }]}>
                {/* Card Top Meta */}
                <TouchableOpacity 
                  style={styles.cardHeader}
                  activeOpacity={0.7}
                  onPress={() => setExpandedId(isExpanded ? null : complaint.id)}
                >
                  <View style={styles.cardHeaderLeft}>
                    <View style={styles.cardIdRow}>
                      <Text style={[styles.cardId, { color: isDark ? '#ffffff' : '#09090b' }]}>{complaint.id}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                        <Text style={[styles.statusText, { color: statusColor }]}>
                          {getStatusLabel(complaint.status)}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.cardTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>{complaint.title}</Text>
                    <View style={styles.cardLocationMeta}>
                      <MaterialIcons name="place" size={14} color={theme.colors.primary} />
                      <Text style={[styles.cardLocationText, { color: isDark ? '#a1a1aa' : '#52525b' }]} numberOfLines={1}>
                        {complaint.location.street} • {complaint.location.ward}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.cardHeaderRight}>
                    <View style={[
                      styles.severityBadge, 
                      complaint.severity === 'Critical' ? styles.severityCritical : styles.severityModerate
                    ]}>
                      <Text style={[
                        styles.severityText,
                        complaint.severity === 'Critical' ? styles.severityCriticalText : styles.severityModerateText
                      ]}>
                        {complaint.severity.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={[styles.cardTimeText, { color: isDark ? '#a1a1aa' : '#71717a' }]}>{complaint.date}</Text>
                    <MaterialIcons 
                      name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} 
                      size={22} 
                      color={isDark ? '#a1a1aa' : theme.colors.secondary} 
                    />
                  </View>
                </TouchableOpacity>

                {/* Google Tagged Photo & Direct Spot Map */}
                <View style={styles.visualsRow}>
                  {/* Geo-Tagged Image with Watermark */}
                  <View style={styles.geoImageContainer}>
                    <Image source={{ uri: complaint.geoTagImage.uri }} style={styles.geoImage} />
                    <View style={styles.geoTagOverlay}>
                      <View style={styles.geoTagHeader}>
                        <MaterialIcons name="photo-camera" size={12} color="#ffffff" />
                        <Text style={styles.geoTagHeaderText}>GOOGLE GEO-TAGGED</Text>
                      </View>
                      <Text style={styles.geoTagWatermark}>{complaint.geoTagImage.watermark}</Text>
                      <Text style={styles.geoTagSensor}>{complaint.geoTagImage.cameraSensor}</Text>
                    </View>
                  </View>

                  {/* Direct Spot Map Mockup - Satellite Mode */}
                  <View style={styles.spotMapContainer}>
                    <View style={[styles.spotMapGrid, styles.spotMapSatelliteBg]}>
                      <View style={styles.mapSatelliteBadge}>
                        <View style={styles.mapSatelliteDot} />
                        <Text style={styles.mapSatelliteBadgeText}>SATELLITE 19X</Text>
                      </View>
                      {/* Stylized roads and satellite orthophoto grid */}
                      <View style={styles.mapRoadH} />
                      <View style={styles.mapRoadV} />
                      <View style={styles.mapRoadDiagonal} />
                      <View style={styles.mapCrosshairH} />
                      <View style={styles.mapCrosshairV} />
                      {/* Direct Pin at Spot */}
                      <View style={styles.spotPinWrapper}>
                        <View style={styles.spotPinPulse} />
                        <View style={styles.spotPinCore}>
                          <MaterialIcons name="location-on" size={16} color="#ffffff" />
                        </View>
                      </View>
                    </View>
                    
                    <View style={styles.spotMapOverlay}>
                      <View style={styles.googleBadge}>
                        <MaterialIcons name="satellite-alt" size={12} color="#059669" />
                        <Text style={styles.googleBadgeText}>Satellite Spot</Text>
                      </View>
                      <Text style={styles.spotCoords}>
                        {complaint.location.latitude.toFixed(4)}°N, {Math.abs(complaint.location.longitude).toFixed(4)}°W
                      </Text>
                      <TouchableOpacity 
                        style={styles.openSatelliteBtn}
                        onPress={() => handleOpenGoogleMaps(complaint.location.latitude, complaint.location.longitude)}
                      >
                        <MaterialIcons name="satellite-alt" size={11} color="#ffffff" />
                        <Text style={styles.openSatelliteBtnText}>Satellite</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Citizen Information & Contact */}
                <View style={[styles.citizenSection, isDark && { backgroundColor: '#18181b', borderColor: '#27272a' }]}>
                  <View style={styles.citizenHeader}>
                    <View style={styles.citizenAvatar}>
                      <Text style={styles.citizenAvatarText}>
                        {complaint.citizen.name.split(' ').map(n => n[0]).join('')}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.citizenNameRow}>
                        <Text style={[styles.citizenName, { color: isDark ? '#ffffff' : '#09090b' }]}>{complaint.citizen.name}</Text>
                        {complaint.citizen.isVerified && (
                          <View style={styles.verifiedBadge}>
                            <MaterialIcons name="verified" size={12} color={theme.colors.tertiary} />
                            <Text style={styles.verifiedText}>Verified Citizen</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.citizenMeta, { color: isDark ? '#a1a1aa' : '#52525b' }]}>
                        {complaint.citizen.ward} • {complaint.citizen.phone}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.callCitizenBtn}
                      onPress={() => Linking.openURL(`tel:${complaint.citizen.phone}`).catch(() => {})}
                    >
                      <MaterialIcons name="phone" size={16} color={theme.colors.primary} />
                      <Text style={styles.callCitizenBtnText}>Call</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Citizen Suggestions & Feedback */}
                <View style={[styles.suggestionBox, isDark && { backgroundColor: '#18181b', borderColor: '#27272a' }]}>
                  <View style={styles.suggestionTitleRow}>
                    <MaterialIcons name="lightbulb" size={16} color={theme.colors.warningAmber} />
                    <Text style={[styles.suggestionTitle, { color: isDark ? '#fbbf24' : theme.colors.onSurface }]}>Citizen's Remedial Suggestion:</Text>
                  </View>
                  <Text style={[styles.suggestionText, { color: isDark ? '#ffffff' : '#09090b' }]}>
                    "{complaint.citizenSuggestions}"
                  </Text>
                  {complaint.suggestionTags && complaint.suggestionTags.length > 0 && (
                    <View style={styles.suggestionTagsRow}>
                      {complaint.suggestionTags.map((tag, idx) => (
                        <View key={idx} style={[styles.tagBadge, isDark && { backgroundColor: '#27272a', borderColor: '#3f3f46' }]}>
                          <Text style={[styles.tagBadgeText, isDark && { color: '#a1a1aa' }]}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {/* Project Defect Attributes */}
                <View style={[styles.attributesStrip, isDark && { backgroundColor: '#18181b' }]}>
                  <View style={styles.attributeItem}>
                    <Text style={[styles.attributeLabel, { color: isDark ? '#a1a1aa' : '#52525b' }]}>Defect</Text>
                    <Text style={[styles.attributeVal, { color: isDark ? '#ffffff' : '#09090b' }]}>{complaint.category}</Text>
                  </View>
                  <View style={styles.attributeItem}>
                    <Text style={[styles.attributeLabel, { color: isDark ? '#a1a1aa' : '#52525b' }]}>Est. Depth</Text>
                    <Text style={[styles.attributeVal, { color: theme.colors.error }]}>{complaint.estimatedDepth}</Text>
                  </View>
                  <View style={styles.attributeItem}>
                    <Text style={[styles.attributeLabel, { color: isDark ? '#a1a1aa' : '#52525b' }]}>Road Type</Text>
                    <Text style={[styles.attributeVal, { color: isDark ? '#ffffff' : '#09090b' }]} numberOfLines={1}>{complaint.roadType}</Text>
                  </View>
                </View>

                {/* Assigned Contractor If Any */}
                {complaint.assignedContractor && (
                  <View style={[styles.assignedCrewBanner, isDark && { backgroundColor: '#18181b', borderColor: '#27272a' }]}>
                    <MaterialIcons name="engineering" size={16} color={theme.colors.primary} />
                    <Text style={[styles.assignedCrewText, { color: isDark ? '#ffffff' : '#09090b' }]}>
                      Assigned to: <Text style={{ fontWeight: '700' }}>{complaint.assignedContractor}</Text>
                    </Text>
                  </View>
                )}

                {/* Admin Actions Bar */}
                <View style={styles.actionsBar}>
                  {complaint.status === 'new' && (
                    <TouchableOpacity 
                      style={[styles.actionBtn, { backgroundColor: theme.colors.primary }]}
                      onPress={() => handleStatusChange(complaint.id, 'under-review')}
                    >
                      <MaterialIcons name="assignment-turned-in" size={16} color={theme.colors.onPrimary} />
                      <Text style={styles.actionBtnTextPrimary}>Mark Under Review</Text>
                    </TouchableOpacity>
                  )}

                  {(complaint.status === 'new' || complaint.status === 'under-review') && (
                    <TouchableOpacity 
                      style={[styles.actionBtn, { backgroundColor: theme.colors.primaryContainer }]}
                      onPress={() => {
                        handleStatusChange(complaint.id, 'assigned', 'RoadWorks Muni Crew #4');
                        Alert.alert('Contractor Dispatched', `Work order issued to RoadWorks Muni Crew #4 for complaint ${complaint.id}.`);
                      }}
                    >
                      <MaterialIcons name="send" size={16} color={theme.colors.onPrimary} />
                      <Text style={styles.actionBtnTextPrimary}>Dispatch Contractor</Text>
                    </TouchableOpacity>
                  )}

                  {complaint.status === 'assigned' && (
                    <TouchableOpacity 
                      style={[styles.actionBtn, { backgroundColor: theme.colors.tertiary }]}
                      onPress={() => {
                        handleStatusChange(complaint.id, 'resolved');
                        Alert.alert('Complaint Resolved', `Complaint ${complaint.id} marked as resolved.`);
                      }}
                    >
                      <MaterialIcons name="check-circle" size={16} color={theme.colors.onTertiary} />
                      <Text style={styles.actionBtnTextPrimary}>Complete & Resolve</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.actionBtnSecondary, isDark && { backgroundColor: '#18181b', borderColor: '#27272a' }]}
                    onPress={() => navigation.navigate('AdminComplaintDetail', { complaintId: complaint.id })}
                  >
                    <MaterialIcons name="analytics" size={16} color={isDark ? '#ffffff' : theme.colors.onSurface} />
                    <Text style={[styles.actionBtnTextSecondary, { color: isDark ? '#ffffff' : theme.colors.onSurface }]}>Full View</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
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
    paddingVertical: theme.spacing.spaceMd,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceContainerHigh,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.headlineMd.fontSize,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  complaintCountBadge: {
    backgroundColor: theme.colors.errorContainer,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  complaintCountText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.onErrorContainer,
  },
  headerSubtitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  adminAvatarBtn: {
    position: 'relative',
  },
  adminAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surfaceContainerHighest,
  },
  onlineDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.tertiary,
    borderWidth: 2,
    borderColor: theme.colors.surfaceContainerLowest,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceContainerLowest,
    marginHorizontal: theme.spacing.gutter,
    marginTop: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontFamily: theme.typography.fontFamily,
    fontSize: 13,
    color: theme.colors.onSurface,
  },
  filterWrapper: {
    marginVertical: 10,
  },
  filterContent: {
    paddingHorizontal: theme.spacing.gutter,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
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
  scrollContent: {
    paddingHorizontal: theme.spacing.gutter,
    gap: 16,
  },
  complaintCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.surfaceContainerHigh,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardHeaderLeft: {
    flex: 1,
    marginRight: 8,
  },
  cardIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardId: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    fontWeight: '700',
  },
  cardTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  cardLocationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  cardLocationText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  cardHeaderRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  severityCritical: {
    backgroundColor: theme.colors.errorContainer,
  },
  severityModerate: {
    backgroundColor: theme.colors.secondaryContainer,
  },
  severityText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    fontWeight: '800',
  },
  severityCriticalText: {
    color: theme.colors.onErrorContainer,
  },
  severityModerateText: {
    color: theme.colors.onSecondaryContainer,
  },
  cardTimeText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    color: theme.colors.outline,
  },
  visualsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  geoImageContainer: {
    flex: 1,
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceContainer,
  },
  geoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  geoTagOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    padding: 6,
  },
  geoTagHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  geoTagHeaderText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 9,
    fontWeight: '800',
    color: '#34d399',
    letterSpacing: 0.5,
  },
  geoTagWatermark: {
    fontFamily: 'monospace',
    fontSize: 8,
    color: '#ffffff',
    marginTop: 2,
  },
  geoTagSensor: {
    fontFamily: 'monospace',
    fontSize: 8,
    color: '#9ca3af',
  },
  spotMapContainer: {
    flex: 1,
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#e5e7eb',
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  spotMapGrid: {
    width: '100%',
    height: '100%',
    backgroundColor: '#d6e2e9',
    position: 'relative',
    overflow: 'hidden',
  },
  mapRoadH: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    height: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#cbd5e1',
  },
  mapRoadV: {
    position: 'absolute',
    left: 60,
    top: 0,
    bottom: 0,
    width: 20,
    backgroundColor: '#ffffff',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#cbd5e1',
  },
  mapRoadDiagonal: {
    position: 'absolute',
    top: -20,
    left: 10,
    width: 140,
    height: 10,
    backgroundColor: '#fef08a',
    transform: [{ rotate: '45deg' }],
  },
  spotPinWrapper: {
    position: 'absolute',
    top: 38,
    left: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotPinPulse: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
  },
  spotPinCore: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.alertCrimson,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  spotMapOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    padding: 6,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  googleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  googleBadgeText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  spotCoords: {
    fontFamily: 'monospace',
    fontSize: 8,
    color: theme.colors.onSurfaceVariant,
    marginTop: 1,
  },
  openMapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: theme.colors.primary,
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginTop: 4,
  },
  openMapsBtnText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.onPrimary,
  },
  spotMapSatelliteBg: {
    backgroundColor: '#09151c',
  },
  mapSatelliteBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(6, 78, 59, 0.88)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
    zIndex: 10,
  },
  mapSatelliteDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#34d399',
  },
  mapSatelliteBadgeText: {
    fontFamily: 'monospace',
    fontSize: 7,
    fontWeight: '800',
    color: '#a7f3d0',
  },
  mapCrosshairH: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 48,
    height: 1,
    backgroundColor: 'rgba(52, 211, 153, 0.3)',
  },
  mapCrosshairV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 71,
    width: 1,
    backgroundColor: 'rgba(52, 211, 153, 0.3)',
  },
  openSatelliteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#064e3b',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#059669',
  },
  openSatelliteBtnText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 9,
    fontWeight: '700',
    color: '#ffffff',
  },
  citizenSection: {
    backgroundColor: theme.colors.surfaceContainerLow,
    padding: 10,
    borderRadius: 10,
  },
  citizenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  citizenAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  citizenAvatarText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.onPrimaryFixed,
  },
  citizenNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  citizenName: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: theme.colors.tertiaryFixedDim + '40',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  verifiedText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 9,
    fontWeight: '600',
    color: theme.colors.tertiary,
  },
  citizenMeta: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
  },
  callCitizenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  callCitizenBtnText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  suggestionBox: {
    backgroundColor: '#fffbeb',
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.warningAmber,
    padding: 10,
    borderRadius: 8,
    gap: 6,
  },
  suggestionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  suggestionTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: '#b45309',
  },
  suggestionText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontStyle: 'italic',
    color: '#451a03',
    lineHeight: 18,
  },
  suggestionTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  tagBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagBadgeText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    fontWeight: '600',
    color: '#92400e',
  },
  attributesStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.surfaceContainerHigh,
    paddingVertical: 8,
  },
  attributeItem: {
    flex: 1,
    alignItems: 'center',
  },
  attributeLabel: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    color: theme.colors.outline,
    textTransform: 'uppercase',
  },
  attributeVal: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.onSurface,
    marginTop: 2,
  },
  assignedCrewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.secondaryContainer + '50',
    padding: 8,
    borderRadius: 8,
  },
  assignedCrewText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.onSecondaryContainer,
  },
  actionsBar: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionBtnSecondary: {
    flex: 0.8,
    backgroundColor: theme.colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  actionBtnTextPrimary: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.onPrimary,
  },
  actionBtnTextSecondary: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyStateTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  emptyStateSub: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  }
});
