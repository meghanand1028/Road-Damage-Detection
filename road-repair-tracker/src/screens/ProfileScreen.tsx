import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Switch, 
  Alert 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../../theme';
import { useTheme } from '../context/ThemeContext';
import { HamburgerMenu } from '../components/HamburgerMenu';
import { complaintsStore, Complaint } from '../services/complaintsStore';

export function ProfileScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { isDark, toggleTheme } = useTheme();
  const [complaints, setComplaints] = useState<Complaint[]>(complaintsStore.getComplaints());
  const [activeTab, setActiveTab] = useState<'All' | 'New' | 'In Progress' | 'Resolved'>('All');
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [autoGps, setAutoGps] = useState(true);

  useEffect(() => {
    const unsubscribe = complaintsStore.subscribe(() => {
      setComplaints([...complaintsStore.getComplaints()]);
    });
    return unsubscribe;
  }, []);

  // Filter complaints
  const filteredComplaints = complaints.filter(c => {
    if (activeTab === 'New') return c.status === 'new' || c.status === 'under-review';
    if (activeTab === 'In Progress') return c.status === 'assigned' || c.status === 'in-progress';
    if (activeTab === 'Resolved') return c.status === 'resolved';
    return true;
  });

  const totalReports = complaints.length;
  const inProgressReports = complaints.filter(c => c.status === 'in-progress' || c.status === 'assigned').length;
  const resolvedReports = complaints.filter(c => c.status === 'resolved').length;

  // Handle Camera Capture
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
        const imageUri = result.assets[0].uri;
        navigation.navigate('Report', { customImageUri: imageUri });
      }
    } catch (error) {
      // Fallback: navigate directly to Report screen
      navigation.navigate('Report');
    }
  };

  // Handle Gallery Browse
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
        const imageUri = result.assets[0].uri;
        navigation.navigate('Report', { customImageUri: imageUri });
      }
    } catch (error) {
      // Fallback: navigate directly to Report screen
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

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: isDark ? '#000000' : '#ffffff' }]}>
      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: isDark ? '#000000' : '#ffffff', borderBottomColor: isDark ? '#18181b' : '#e4e4e7' }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>User Profile</Text>
          <Text style={[styles.headerSubtitle, { color: isDark ? '#a1a1aa' : '#52525b' }]}>Citizen Account & Report Management</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <HamburgerMenu />
          <TouchableOpacity 
            style={[styles.switchAdminHeaderBtn, isDark && { backgroundColor: '#18181b', borderColor: '#27272a' }]}
            onPress={() => navigation.navigate('AdminTabs')}
          >
            <MaterialIcons name="swap-horiz" size={18} color={theme.colors.primary} />
            <Text style={styles.switchAdminHeaderText}>Admin</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7' }]}>
          <View style={styles.profileTopRow}>
            {/* Clean Initials Avatar */}
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>RP</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.nameRow}>
                <Text style={[styles.userName, { color: isDark ? '#ffffff' : '#09090b' }]}>Rahul Patil</Text>
                <View style={styles.scoutBadge}>
                  <MaterialIcons name="verified" size={12} color={theme.colors.tertiary} />
                  <Text style={styles.scoutBadgeText}>Verified Citizen</Text>
                </View>
              </View>
              <Text style={styles.userWard}>Ward 8 Resident • Panchavati, Nashik</Text>
              <Text style={[styles.userContact, { color: isDark ? '#a1a1aa' : '#52525b' }]}>+91 98230 45678 • rahul.patil@civicportal.org</Text>
            </View>
          </View>

          {/* Civic Impact Metrics Strip */}
          <View style={[styles.metricsStrip, isDark && { backgroundColor: '#18181b' }]}>
            <View style={styles.metricBox}>
              <Text style={[styles.metricVal, { color: isDark ? '#ffffff' : '#09090b' }]}>{totalReports}</Text>
              <Text style={[styles.metricLabel, { color: isDark ? '#a1a1aa' : '#52525b' }]}>Total Filed</Text>
            </View>
            <View style={[styles.metricDivider, isDark && { backgroundColor: '#27272a' }]} />
            <View style={styles.metricBox}>
              <Text style={[styles.metricVal, { color: theme.colors.primary }]}>{inProgressReports}</Text>
              <Text style={[styles.metricLabel, { color: isDark ? '#a1a1aa' : '#52525b' }]}>In Progress</Text>
            </View>
            <View style={[styles.metricDivider, isDark && { backgroundColor: '#27272a' }]} />
            <View style={styles.metricBox}>
              <Text style={[styles.metricVal, { color: theme.colors.tertiary }]}>{resolvedReports}</Text>
              <Text style={[styles.metricLabel, { color: isDark ? '#a1a1aa' : '#52525b' }]}>Resolved</Text>
            </View>
            <View style={[styles.metricDivider, isDark && { backgroundColor: '#27272a' }]} />
            <View style={styles.metricBox}>
              <Text style={[styles.metricVal, { color: '#fbbf24' }]}>980</Text>
              <Text style={[styles.metricLabel, { color: isDark ? '#a1a1aa' : '#52525b' }]}>Civic Pts</Text>
            </View>
          </View>
        </View>

        {/* Quick Add Complaint with Camera or Gallery */}
        <View style={[styles.actionCard, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7' }]}>
          <View style={styles.actionCardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialIcons name="add-circle" size={20} color={theme.colors.primary} />
              <Text style={[styles.actionCardTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>Submit New Complaint</Text>
            </View>
            <Text style={styles.actionCardTag}>Capture or Upload</Text>
          </View>
          <Text style={[styles.actionCardSub, { color: isDark ? '#a1a1aa' : '#52525b' }]}>
            Take a live photo with camera or browse your gallery to report road damage directly to DPW Admin.
          </Text>

          <View style={styles.photoSourceButtonsRow}>
            {/* Capture by Camera */}
            <TouchableOpacity 
              style={styles.captureBtn}
              onPress={handleCaptureCamera}
              activeOpacity={0.8}
            >
              <View style={styles.captureBtnIconBox}>
                <MaterialIcons name="photo-camera" size={24} color="#ffffff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.captureBtnTitle} numberOfLines={1}>Capture by Camera</Text>
                <Text style={styles.captureBtnSub} numberOfLines={2}>Live photo with GPS tag</Text>
              </View>
            </TouchableOpacity>

            {/* Browse from Gallery */}
            <TouchableOpacity 
              style={[styles.galleryBtn, isDark && { backgroundColor: '#18181b', borderColor: '#27272a' }]}
              onPress={handleBrowseGallery}
              activeOpacity={0.8}
            >
              <View style={styles.galleryBtnIconBox}>
                <MaterialIcons name="photo-library" size={24} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.galleryBtnTitle, isDark && { color: '#ffffff' }]} numberOfLines={1}>Browse Gallery</Text>
                <Text style={[styles.galleryBtnSub, isDark && { color: '#a1a1aa' }]} numberOfLines={2}>Select from device photos</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* My Reports / Complaints Section */}
        <View style={styles.reportsSectionHeader}>
          <View>
            <Text style={[styles.sectionHeading, { color: isDark ? '#ffffff' : '#09090b' }]}>My Reports</Text>
            <Text style={[styles.sectionSubheading, { color: isDark ? '#a1a1aa' : '#52525b' }]}>Complaints submitted from camera & gallery</Text>
          </View>
          <TouchableOpacity 
            style={styles.newReportBtn}
            onPress={() => navigation.navigate('Report')}
          >
            <MaterialIcons name="add" size={16} color={theme.colors.onPrimary} />
            <Text style={styles.newReportBtnText}>New Report</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Filters */}
        <View style={styles.tabsRow}>
          {(['All', 'New', 'In Progress', 'Resolved'] as const).map(tab => (
            <TouchableOpacity 
              key={tab}
              style={[
                styles.tabChip, 
                activeTab === tab && styles.tabChipActive,
                isDark && activeTab !== tab && { backgroundColor: '#18181b', borderColor: '#27272a' }
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[
                styles.tabChipText, 
                activeTab === tab && styles.tabChipTextActive,
                isDark && activeTab !== tab && { color: '#a1a1aa' }
              ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Complaints Feed */}
        <View style={styles.complaintsList}>
          {filteredComplaints.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7' }]}>
              <MaterialIcons name="assignment-turned-in" size={40} color={theme.colors.outline} />
              <Text style={[styles.emptyTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>No Reports in this Tab</Text>
              <Text style={[styles.emptySub, { color: isDark ? '#a1a1aa' : '#52525b' }]}>Capture a photo to file your first road complaint.</Text>
              <TouchableOpacity 
                style={styles.emptyActionBtn}
                onPress={handleCaptureCamera}
              >
                <MaterialIcons name="add-a-photo" size={16} color={theme.colors.onPrimary} />
                <Text style={styles.emptyActionBtnText}>Capture Road Damage</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredComplaints.map(item => {
              const statusColor = getStatusColor(item.status);
              return (
                <TouchableOpacity 
                  key={item.id}
                  style={[styles.complaintItemCard, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7' }]}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('ComplaintDetail', { complaintId: item.id })}
                >
                  <View style={styles.complaintCardTop}>
                    {/* Geo-Tagged Image Thumbnail */}
                    <View style={styles.thumbWrapper}>
                      <Image source={{ uri: item.geoTagImage.uri }} style={styles.thumbImage} />
                      <View style={styles.thumbGpsBadge}>
                        <MaterialIcons name="satellite-alt" size={10} color="#34d399" />
                        <Text style={styles.thumbGpsText}>GEO-TAG</Text>
                      </View>
                    </View>

                    {/* Complaint Details */}
                    <View style={styles.complaintInfo}>
                      <View style={styles.complaintIdStatusRow}>
                        <Text style={[styles.complaintId, { color: isDark ? '#ffffff' : '#09090b' }]}>{item.id}</Text>
                        <View style={[styles.statusPill, { backgroundColor: statusColor + '18' }]}>
                          <View style={[styles.statusPillDot, { backgroundColor: statusColor }]} />
                          <Text style={[styles.statusPillText, { color: statusColor }]}>
                            {getStatusLabel(item.status)}
                          </Text>
                        </View>
                      </View>

                      <Text style={[styles.complaintTitle, { color: isDark ? '#ffffff' : '#09090b' }]} numberOfLines={1}>{item.title}</Text>
                      
                      <View style={styles.locationRow}>
                        <MaterialIcons name="place" size={13} color={theme.colors.primary} />
                        <Text style={[styles.locationText, { color: isDark ? '#a1a1aa' : '#52525b' }]} numberOfLines={1}>
                          {item.location.street}
                        </Text>
                      </View>

                      <Text style={[styles.dateText, { color: isDark ? '#a1a1aa' : '#71717a' }]}>{item.date}</Text>
                    </View>
                  </View>

                  {/* Citizen Suggestion Snippet */}
                  {item.citizenSuggestions ? (
                    <View style={[styles.suggestionSnippet, isDark && { backgroundColor: '#18181b' }]}>
                      <MaterialIcons name="lightbulb" size={14} color={theme.colors.warningAmber} />
                      <Text style={[styles.suggestionSnippetText, isDark && { color: '#fbbf24' }]} numberOfLines={1}>
                        "{item.citizenSuggestions}"
                      </Text>
                    </View>
                  ) : null}

                  {/* Footer with GPS coords and View action */}
                  <View style={[styles.complaintCardFooter, isDark && { borderTopColor: '#18181b' }]}>
                    <View style={styles.coordsRow}>
                      <MaterialIcons name="gps-fixed" size={12} color={isDark ? '#a1a1aa' : theme.colors.secondary} />
                      <Text style={[styles.coordsText, isDark && { color: '#a1a1aa' }]}>
                        {item.location.latitude.toFixed(4)}°N, {Math.abs(item.location.longitude).toFixed(4)}°W
                      </Text>
                    </View>
                    <View style={styles.viewTimelineLink}>
                      <Text style={styles.viewTimelineText}>View Progress</Text>
                      <MaterialIcons name="chevron-right" size={16} color={theme.colors.primary} />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Citizen Preferences */}
        <View style={[styles.preferencesCard, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7' }]}>
          <Text style={[styles.preferencesTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>Civic & App Preferences</Text>

          {/* 1-Click Theme Switcher Row */}
          <View style={[styles.prefRow, { borderBottomColor: isDark ? '#18181b' : '#e4e4e7' }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.prefLabel, { color: isDark ? '#ffffff' : '#09090b' }]}>App Appearance (White / Black)</Text>
              <Text style={[styles.prefSub, { color: isDark ? '#a1a1aa' : '#52525b' }]}>One-click switch between clean white and deep black interface.</Text>
            </View>
            <HamburgerMenu />
          </View>

          <View style={[styles.prefRow, { borderBottomColor: isDark ? '#18181b' : '#e4e4e7' }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.prefLabel, { color: isDark ? '#ffffff' : '#09090b' }]}>SMS Dispatch Alerts</Text>
              <Text style={[styles.prefSub, { color: isDark ? '#a1a1aa' : '#52525b' }]}>Receive live SMS when a road repair crew is dispatched.</Text>
            </View>
            <Switch 
              value={smsAlerts}
              onValueChange={setSmsAlerts}
              trackColor={{ false: isDark ? '#27272a' : '#e4e4e7', true: theme.colors.primary }}
              thumbColor="#ffffff"
            />
          </View>

          <View style={[styles.prefRow, { borderBottomWidth: 0 }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.prefLabel, { color: isDark ? '#ffffff' : '#09090b' }]}>Auto GPS Watermark</Text>
              <Text style={[styles.prefSub, { color: isDark ? '#a1a1aa' : '#52525b' }]}>Attach Google Geo-Tag coordinates to camera captures.</Text>
            </View>
            <Switch 
              value={autoGps}
              onValueChange={setAutoGps}
              trackColor={{ false: isDark ? '#27272a' : '#e4e4e7', true: theme.colors.primary }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Switch to Admin Mode Button */}
        <TouchableOpacity 
          style={[styles.adminSwitchCard, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7' }]}
          onPress={() => navigation.navigate('AdminTabs')}
        >
          <View style={styles.adminSwitchLeft}>
            <View style={styles.adminIconBox}>
              <MaterialIcons name="admin-panel-settings" size={24} color={theme.colors.onPrimary} />
            </View>
            <View>
              <Text style={[styles.adminSwitchTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>DPW Operations Admin Plane</Text>
              <Text style={[styles.adminSwitchSub, { color: isDark ? '#a1a1aa' : '#52525b' }]}>Access contractor dispatch & complaints inbox</Text>
            </View>
          </View>
          <MaterialIcons name="arrow-forward" size={20} color={theme.colors.primary} />
        </TouchableOpacity>

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
    paddingVertical: 14,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceContainerHigh,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.headlineSm.fontSize,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  headerSubtitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
  },
  switchAdminHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.surfaceContainerLow,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  switchAdminHeaderText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  scrollContent: {
    padding: theme.spacing.gutter,
    gap: 16,
  },
  profileCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.surfaceContainerHigh,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    gap: 16,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.onPrimary,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  userName: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  scoutBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: theme.colors.tertiaryFixedDim + '35',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  scoutBadgeText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.tertiary,
  },
  userWard: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  userContact: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  metricsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  metricBox: {
    flex: 1,
    alignItems: 'center',
  },
  metricVal: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.onSurface,
  },
  metricLabel: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: theme.colors.outlineVariant,
  },
  actionCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.surfaceContainerHigh,
    gap: 12,
  },
  actionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionCardTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  actionCardTag: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.primary,
    backgroundColor: theme.colors.primaryFixed,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  actionCardSub: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 18,
  },
  photoSourceButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  captureBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.colors.primary,
    padding: 12,
    borderRadius: 12,
  },
  captureBtnIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureBtnTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.onPrimary,
  },
  captureBtnSub: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 9,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 1,
  },
  galleryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    padding: 12,
    borderRadius: 12,
  },
  galleryBtnIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryBtnTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  galleryBtnSub: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 9,
    color: theme.colors.onSurfaceVariant,
    marginTop: 1,
  },
  reportsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  sectionHeading: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  sectionSubheading: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    marginTop: 1,
  },
  newReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  newReportBtnText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.onPrimary,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tabChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  tabChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  tabChipText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.onSurfaceVariant,
  },
  tabChipTextActive: {
    color: theme.colors.onPrimary,
  },
  complaintsList: {
    gap: 12,
  },
  complaintItemCard: {
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
  thumbWrapper: {
    width: 80,
    height: 80,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: theme.colors.surfaceContainer,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  thumbGpsBadge: {
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
  thumbGpsText: {
    fontFamily: 'monospace',
    fontSize: 7,
    fontWeight: '700',
    color: '#34d399',
  },
  complaintInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  complaintIdStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  complaintId: {
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
  statusPillDot: {
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
    marginTop: 4,
  },
  locationText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    flex: 1,
  },
  dateText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    color: theme.colors.outline,
    marginTop: 2,
  },
  suggestionSnippet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fffbeb',
    padding: 8,
    borderRadius: 8,
  },
  suggestionSnippetText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontStyle: 'italic',
    color: '#92400e',
    flex: 1,
  },
  complaintCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceContainerHigh,
  },
  coordsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  coordsText: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: theme.colors.onSurfaceVariant,
  },
  viewTimelineLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewTimelineText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  emptyCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  emptySub: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 6,
  },
  emptyActionBtnText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.onPrimary,
  },
  preferencesCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.surfaceContainerHigh,
    gap: 12,
  },
  preferencesTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  prefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceContainerHigh,
    gap: 12,
  },
  prefLabel: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  prefSub: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  adminSwitchCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.primary + '40',
  },
  adminSwitchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  adminIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminSwitchTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  adminSwitchSub: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
  }
});
