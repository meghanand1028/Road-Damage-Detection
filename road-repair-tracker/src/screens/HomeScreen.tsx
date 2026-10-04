import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Linking,
  Alert 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../../theme';
import { useTheme } from '../context/ThemeContext';
import { complaintsStore, Complaint } from '../services/complaintsStore';

export function HomeScreen({ navigation }: any) {
  const { isDark } = useTheme();
  const [complaints, setComplaints] = useState<Complaint[]>(complaintsStore.getComplaints());

  useEffect(() => {
    const unsubscribe = complaintsStore.subscribe(() => {
      setComplaints([...complaintsStore.getComplaints()]);
    });
    return unsubscribe;
  }, []);

  const handleCaptureCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Camera Access Needed', 'Please allow camera access to capture road damage photos.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.85,
        exif: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        navigation.navigate('Report', { customImageUri: result.assets[0].uri });
      }
    } catch (e) {
      navigation.navigate('Report');
    }
  };

  const handleBrowseGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Gallery Access Needed', 'Please allow photo gallery access to upload road damage images.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.85,
        exif: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        navigation.navigate('Report', { customImageUri: result.assets[0].uri });
      }
    } catch (e) {
      navigation.navigate('Report');
    }
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
      case 'new': return 'NEW';
      case 'under-review': return 'UNDER REVIEW';
      case 'assigned': return 'CREW ASSIGNED';
      case 'in-progress': return 'IN PROGRESS';
      case 'resolved': return 'RESOLVED';
      default: return String(status).toUpperCase();
    }
  };

  const activeComplaints = complaints.filter(c => c.status !== 'resolved');

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#ffffff' }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? '#000000' : '#ffffff', borderBottomColor: isDark ? '#18181b' : '#e4e4e7' }]}>
        <View style={styles.headerLeft}>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>CivicRoad</Text>
            <View style={styles.cityBadge}>
              <Text style={styles.cityBadgeText}>Citizen Portal</Text>
            </View>
          </View>
          <View style={styles.locationContainer}>
            <MaterialIcons name="location-on" size={14} color={theme.colors.primary} />
            <Text style={[styles.locationText, { color: isDark ? '#a1a1aa' : '#52525b' }]}>Nashik City • Ward 8 Panchavati</Text>
          </View>
        </View>
        <View style={styles.headerRight}>

          <TouchableOpacity 
            style={[styles.switchAdminBtn, isDark && { backgroundColor: '#18181b', borderColor: '#27272a' }]}
            onPress={() => navigation.navigate('AdminTabs')}
          >
            <MaterialIcons name="admin-panel-settings" size={15} color={theme.colors.primary} />
            <Text style={styles.switchAdminBtnText}>Admin Plane</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.avatarCircle, isDark && { borderColor: '#27272a' }]}
            onPress={() => navigation.navigate('ProfileTab')}
          >
            <Text style={styles.avatarText}>RP</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Welcome Section */}
        <View style={[styles.welcomeCard, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7' }]}>
          <View style={styles.welcomeTextGroup}>
            <Text style={[styles.welcomeTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>Hello, Rahul 👋</Text>
            <Text style={[styles.welcomeSub, { color: isDark ? '#a1a1aa' : '#52525b' }]}>
              Ward 8 Resident • Help report and track hazardous potholes, deep cracks, and road defects in your neighborhood.
            </Text>
          </View>
        </View>

        {/* Action Hero: File a Road Complaint */}
        <View style={[styles.reportHeroCard, { backgroundColor: isDark ? '#0a0e17' : '#ffffff', borderColor: isDark ? '#1e293b' : '#e2e8f0' }]}>
          <View style={styles.reportHeroHeader}>
            <View style={styles.reportIconCircle}>
              <MaterialIcons name="report-problem" size={24} color="#ffffff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.reportHeroTitle, { color: isDark ? '#ffffff' : '#0f172a' }]}>Spotted a Road Hazard?</Text>
              <Text style={[styles.reportHeroSub, { color: isDark ? '#94a3b8' : '#475569' }]}>
                Send a geo-tagged complaint directly to the DPW Admin Plane with exact spot coordinates.
              </Text>
            </View>
          </View>

          {/* Dual Action Buttons */}
          <View style={styles.heroButtonsRow}>
            <TouchableOpacity 
              style={styles.heroBtnCamera}
              onPress={handleCaptureCamera}
              activeOpacity={0.85}
            >
              <MaterialIcons name="photo-camera" size={20} color="#ffffff" />
              <Text style={[styles.heroBtnCameraText, { flexShrink: 1 }]} numberOfLines={1}>Capture with Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.heroBtnGallery, isDark && { backgroundColor: '#1e293b', borderColor: '#334155' }]}
              onPress={handleBrowseGallery}
              activeOpacity={0.85}
            >
              <MaterialIcons name="photo-library" size={20} color={theme.colors.primary} />
              <Text style={[styles.heroBtnGalleryText, isDark && { color: '#ffffff' }, { flexShrink: 1 }]} numberOfLines={1}>Browse Gallery</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.fileFullFormBtn}
            onPress={() => navigation.navigate('Report')}
          >
            <Text style={[styles.fileFullFormText, isDark && { color: '#38bdf8' }]}>Or open detailed report form with Map of Nashik Municipal Corporation finder</Text>
            <MaterialIcons name="chevron-right" size={16} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* My Active Complaints Section (Live from complaintsStore) */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#0f172a' }]}>My Active Complaints</Text>
            <View style={styles.activeCountBadge}>
              <Text style={styles.activeCountText}>{activeComplaints.length} Active</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.viewAllBtn}
            onPress={() => navigation.navigate('MyReportsTab')}
          >
            <Text style={styles.viewAllText}>View All Reports</Text>
            <MaterialIcons name="arrow-forward" size={14} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {activeComplaints.length === 0 ? (
          <View style={[styles.emptyComplaintsCard, { backgroundColor: isDark ? '#0a0e17' : '#ffffff', borderColor: isDark ? '#1e293b' : '#e2e8f0' }]}>
            <MaterialIcons name="check-circle" size={40} color={theme.colors.tertiary} />
            <Text style={[styles.emptyComplaintsTitle, { color: isDark ? '#ffffff' : '#0f172a' }]}>No Pending Complaints</Text>
            <Text style={[styles.emptyComplaintsSub, { color: isDark ? '#94a3b8' : '#475569' }]}>
              All your reported road hazards have been resolved or you have not submitted one yet.
            </Text>
            <TouchableOpacity 
              style={styles.emptyReportBtn}
              onPress={() => navigation.navigate('Report')}
            >
              <MaterialIcons name="add" size={16} color="#ffffff" />
              <Text style={styles.emptyReportBtnText}>Report Road Damage</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.complaintsList}>
            {activeComplaints.slice(0, 3).map(item => {
              const statusColor = getStatusColor(item.status);
              return (
                <TouchableOpacity 
                  key={item.id}
                  style={[styles.complaintCard, { backgroundColor: isDark ? '#0a0e17' : '#ffffff', borderColor: isDark ? '#1e293b' : '#e2e8f0' }]}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('ComplaintDetail', { complaintId: item.id })}
                >
                  <View style={styles.complaintCardTop}>
                    {/* Geo-Tagged Image Thumbnail */}
                    <View style={styles.thumbBox}>
                      <Image source={{ uri: item.geoTagImage.uri }} style={styles.thumbImg} />
                      <View style={styles.geoTagBadge}>
                        <MaterialIcons name="satellite-alt" size={10} color="#34d399" />
                        <Text style={styles.geoTagText}>GEO-TAG</Text>
                      </View>
                    </View>

                    {/* Complaint Details */}
                    <View style={styles.complaintDetails}>
                      <View style={styles.idStatusRow}>
                        <Text style={[styles.complaintIdText, { color: isDark ? '#ffffff' : '#0f172a' }]}>{item.id}</Text>
                        <View style={[styles.statusPill, { backgroundColor: statusColor + '18' }]}>
                          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                          <Text style={[styles.statusPillText, { color: statusColor }]}>
                            {getStatusLabel(item.status)}
                          </Text>
                        </View>
                      </View>

                      <Text style={[styles.complaintTitle, { color: isDark ? '#ffffff' : '#0f172a' }]} numberOfLines={1}>{item.title}</Text>
                      
                      <View style={styles.locationRow}>
                        <MaterialIcons name="place" size={13} color={theme.colors.primary} />
                        <Text style={[styles.locationText, { color: isDark ? '#94a3b8' : '#475569' }]} numberOfLines={1}>
                          {item.location.street}
                        </Text>
                      </View>

                      <Text style={[styles.dateText, { color: isDark ? '#64748b' : '#94a3b8' }]}>{item.date}</Text>
                    </View>
                  </View>

                  {/* Citizen's Suggestion if present */}
                  {item.citizenSuggestions ? (
                    <View style={[styles.suggestionHighlight, isDark && { backgroundColor: '#1e293b' }]}>
                      <MaterialIcons name="lightbulb" size={13} color={theme.colors.warningAmber} />
                      <Text style={[styles.suggestionText, { color: isDark ? '#f8fafc' : theme.colors.onSurface }]} numberOfLines={1}>
                        "{item.citizenSuggestions}"
                      </Text>
                    </View>
                  ) : null}

                  {/* Card Bottom: Spot coords and track link */}
                  <View style={[styles.cardBottomRow, isDark && { borderTopColor: '#1e293b' }]}>
                    <View style={styles.spotCoordsRow}>
                      <MaterialIcons name="gps-fixed" size={12} color={theme.colors.secondary} />
                      <Text style={styles.spotCoordsText}>
                        Spot: {item.location.latitude.toFixed(4)}°N, {Math.abs(item.location.longitude).toFixed(4)}°E
                      </Text>
                    </View>
                    <View style={styles.trackLink}>
                      <Text style={styles.trackLinkText}>Track Live Status</Text>
                      <MaterialIcons name="chevron-right" size={16} color={theme.colors.primary} />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}



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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.gutter,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceContainerHigh,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.headlineSm.fontSize,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  cityBadge: {
    backgroundColor: theme.colors.primaryFixed,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cityBadgeText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchAdminBtn: {
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
  switchAdminBtnText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surfaceContainerHighest,
  },
  avatarText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.onPrimary,
  },
  scrollContent: {
    padding: theme.spacing.gutter,
    gap: 16,
  },
  welcomeCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.surfaceContainerHigh,
  },
  welcomeTextGroup: {
    gap: 4,
  },
  welcomeTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  welcomeSub: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 18,
  },
  reportHeroCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    gap: 14,
  },
  reportHeroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reportIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportHeroTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  reportHeroSub: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
    lineHeight: 16,
  },
  heroButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  heroBtnCamera: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  heroBtnCameraText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  heroBtnGallery: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    paddingVertical: 12,
    borderRadius: 10,
  },
  heroBtnGalleryText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  fileFullFormBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: 4,
  },
  fileFullFormText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  activeCountBadge: {
    backgroundColor: theme.colors.errorContainer,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  activeCountText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.onErrorContainer,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  emptyComplaintsCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.surfaceContainerHigh,
    gap: 8,
  },
  emptyComplaintsTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  emptyComplaintsSub: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  emptyReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 6,
  },
  emptyReportBtnText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  complaintsList: {
    gap: 12,
  },
  complaintCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.surfaceContainerHigh,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  complaintCardTop: {
    flexDirection: 'row',
    gap: 12,
  },
  thumbBox: {
    width: 76,
    height: 76,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: theme.colors.surfaceContainer,
  },
  thumbImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  geoTagBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  geoTagText: {
    fontFamily: 'monospace',
    fontSize: 7,
    fontWeight: '700',
    color: '#34d399',
  },
  complaintDetails: {
    flex: 1,
    justifyContent: 'center',
    flexShrink: 1,
  },
  idStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
    gap: 4,
  },
  complaintIdText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statusPillText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 9,
    fontWeight: '800',
  },
  complaintTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  dateText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    color: theme.colors.outline,
    marginTop: 2,
  },
  suggestionHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fffbeb',
    padding: 8,
    borderRadius: 8,
  },
  suggestionText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontStyle: 'italic',
    color: '#92400e',
    flex: 1,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceContainerHigh,
  },
  spotCoordsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  spotCoordsText: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: theme.colors.onSurfaceVariant,
  },
  trackLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  trackLinkText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  supportCard: {
    backgroundColor: '#fef2f2',
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
    gap: 8,
  },
  supportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  supportTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.error,
  },
  supportDesc: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: '#7f1d1d',
    lineHeight: 16,
  },
  hotlineButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  hotlineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: theme.colors.error,
    paddingVertical: 8,
    borderRadius: 8,
  },
  hotlineBtnText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  hotlineBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#fca5a5',
    paddingVertical: 8,
    borderRadius: 8,
  },
  hotlineBtnSecondaryText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  slaCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.surfaceContainerHigh,
    gap: 10,
  },
  slaTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  slaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: 10,
    paddingVertical: 10,
  },
  slaItem: {
    flex: 1,
    alignItems: 'center',
  },
  slaVal: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  slaLabel: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 9,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  slaDivider: {
    width: 1,
    height: 20,
    backgroundColor: theme.colors.outlineVariant,
  }
});
