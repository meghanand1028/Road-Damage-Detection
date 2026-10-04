import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Image, 
  Alert 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { complaintsStore, Complaint } from '../services/complaintsStore';
import { useTheme } from '../context/ThemeContext';

export function MyReportsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const [complaints, setComplaints] = useState<Complaint[]>(complaintsStore.getComplaints());
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'under-review' | 'assigned' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubscribe = complaintsStore.subscribe(() => {
      setComplaints([...complaintsStore.getComplaints()]);
    });
    return unsubscribe;
  }, []);

  const totalCount = complaints.length;
  const newCount = complaints.filter(c => c.status === 'new').length;
  const underReviewCount = complaints.filter(c => c.status === 'under-review').length;
  const assignedCount = complaints.filter(c => c.status === 'assigned' || c.status === 'in-progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length;

  const TABS = [
    { id: 'all', label: 'All', count: totalCount },
    { id: 'new', label: 'New', count: newCount },
    { id: 'under-review', label: 'In Review', count: underReviewCount },
    { id: 'assigned', label: 'Assigned', count: assignedCount },
    { id: 'resolved', label: 'Resolved', count: resolvedCount },
  ];

  const filteredComplaints = complaints.filter((c) => {
    // Tab filter
    if (activeTab === 'new' && c.status !== 'new') return false;
    if (activeTab === 'under-review' && c.status !== 'under-review') return false;
    if (activeTab === 'assigned' && !(c.status === 'assigned' || c.status === 'in-progress')) return false;
    if (activeTab === 'resolved' && c.status !== 'resolved') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchId = c.id.toLowerCase().includes(q);
      const matchLoc = c.location.street.toLowerCase().includes(q);
      const matchCat = c.category.toLowerCase().includes(q);
      return matchTitle || matchId || matchLoc || matchCat;
    }

    return true;
  });

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

  const handleCaptureCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Camera Access Needed', 'Please allow camera access to capture road damage photos.');
        return;
      }
      const res = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.85,
        exif: true,
      });
      if (!res.canceled && res.assets?.[0]?.uri) {
        navigation.navigate('Report', { customImageUri: res.assets[0].uri });
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
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.85,
        exif: true,
      });
      if (!res.canceled && res.assets?.[0]?.uri) {
        navigation.navigate('Report', { customImageUri: res.assets[0].uri });
      }
    } catch (e) {
      navigation.navigate('Report');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: isDark ? '#000000' : '#ffffff' }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? '#000000' : '#ffffff', borderBottomColor: isDark ? '#18181b' : '#e4e4e7' }]}>
        <View style={styles.headerTitleRow}>
          <Image
            source={{ uri: 'https://lh3.googleusercontent.com/aida/AEtjO1UxarIZN_0eX1B1jvCWr_tOqn3SzDTrsuG4_P_TZtuYcKL9H0UOfWdKCEzWV1yc3U8HXGlHLH9xHtMH6G4GtVorFGGt19m8qkMPSThU2g_EekKFHWYug_A3CiR0K7TTcfWxLAE5jw5QQrv3d6G9_UHkaCovT4D6PkZHnuPl__4jcCxx1KmtUI0cp6WcZlxnjFp9cGrXj3oK4cRtJawa-IVCn_-XxtPAQYmcVhRHhrmAEnysmrdjSNFL' }}
            style={styles.logoIcon}
          />
          <View>
            <View style={styles.headerTitleContainer}>
              <Text style={[styles.headerTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>CivicRoad</Text>
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>My Reports</Text>
              </View>
            </View>
            <View style={styles.headerLocationContainer}>
              <MaterialIcons name="location-on" size={14} color={theme.colors.primary} />
              <Text style={[styles.headerLocationText, { color: isDark ? '#a1a1aa' : '#52525b' }]}>Metro City • Ward 4 Sector</Text>
            </View>
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
            style={[styles.profileAvatar, isDark && { borderColor: '#27272a' }]}
            onPress={() => navigation.navigate('ProfileTab')}
          >
            <Text style={styles.profileAvatarText}>AR</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <View>
            <Text style={[styles.mainTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>My Reported Hazards</Text>
            <Text style={[styles.subTitle, { color: isDark ? '#a1a1aa' : '#52525b' }]}>Live civic dispatch and repair updates</Text>
          </View>
          <View style={styles.activeRepairBadge}>
            <View style={styles.pulseDot} />
            <Text style={styles.activeRepairText}>{assignedCount} Dispatched</Text>
          </View>
        </View>

        {/* Quick Report Source Bar */}
        <View style={styles.quickCaptureBar}>
          <TouchableOpacity 
            style={styles.quickCaptureBtn}
            onPress={handleCaptureCamera}
            activeOpacity={0.85}
          >
            <MaterialIcons name="photo-camera" size={18} color="#ffffff" />
            <Text style={styles.quickCaptureBtnText}>Capture by Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.quickGalleryBtn, { backgroundColor: isDark ? '#18181b' : '#fafafa', borderColor: isDark ? '#27272a' : '#e4e4e7' }]}
            onPress={handleBrowseGallery}
            activeOpacity={0.85}
          >
            <MaterialIcons name="photo-library" size={18} color={theme.colors.primary} />
            <Text style={[styles.quickGalleryBtnText, { color: isDark ? '#ffffff' : '#09090b' }]}>Browse Gallery</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={[styles.searchBar, { backgroundColor: isDark ? '#000000' : '#fafafa', borderColor: isDark ? '#27272a' : '#e4e4e7' }]}>
            <MaterialIcons name="search" size={20} color={isDark ? '#a1a1aa' : theme.colors.onSurfaceVariant} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: isDark ? '#ffffff' : '#09090b' }]}
              placeholder="Search by #CR-..., street, or category..."
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
        </View>

        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={styles.tabsContent}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tabItem, 
                  isDark && { backgroundColor: '#18181b', borderColor: '#27272a' },
                  isActive && styles.tabItemActive
                ]}
                onPress={() => setActiveTab(tab.id as any)}
              >
                <Text style={[styles.tabLabel, isDark && !isActive && { color: '#a1a1aa' }, isActive && styles.tabLabelActive]}>{tab.label}</Text>
                <View style={[styles.tabBadge, isDark && !isActive && { backgroundColor: '#27272a' }, isActive && styles.tabBadgeActive]}>
                  <Text style={[styles.tabBadgeText, isDark && !isActive && { color: '#ffffff' }, isActive && styles.tabBadgeTextActive]}>{tab.count}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Complaints Feed */}
        <View style={styles.feedContainer}>
          {filteredComplaints.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7' }]}>
              <MaterialIcons name="check-circle-outline" size={48} color={theme.colors.tertiary} />
              <Text style={[styles.emptyTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>No Complaints in this View</Text>
              <Text style={[styles.emptyDesc, { color: isDark ? '#a1a1aa' : '#52525b' }]}>
                {searchQuery ? 'No reports match your search query.' : 'There are currently no complaints in this category.'}
              </Text>
              <TouchableOpacity 
                style={styles.emptyReportBtn}
                onPress={() => navigation.navigate('Report')}
              >
                <MaterialIcons name="add-a-photo" size={16} color="#ffffff" />
                <Text style={styles.emptyReportBtnText}>Submit New Report</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredComplaints.map((item) => {
              const statusColor = getStatusColor(item.status);
              return (
                <TouchableOpacity 
                  key={item.id} 
                  style={[styles.card, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7' }]}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('ComplaintDetail', { complaintId: item.id })}
                >
                  <View style={styles.cardTopRow}>
                    <View style={styles.cardInfo}>
                      <View style={styles.cardHeader}>
                        <Text style={[styles.cardId, { color: isDark ? '#ffffff' : '#09090b' }]}>{item.id}</Text>
                        <Text style={styles.cardDot}>•</Text>
                        <Text style={[styles.cardDate, { color: isDark ? '#a1a1aa' : '#71717a' }]}>{item.date}</Text>
                      </View>
                      <Text style={[styles.cardTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>{item.title}</Text>
                      <View style={styles.cardLocation}>
                        <MaterialIcons
                          name="location-on"
                          size={15}
                          color={theme.colors.primary}
                        />
                        <Text style={[styles.cardLocationText, { color: isDark ? '#a1a1aa' : '#52525b' }]} numberOfLines={1}>
                          {item.location.street} • {item.location.ward}
                        </Text>
                      </View>
                    </View>

                    {/* Geo-Tagged Image Thumbnail */}
                    <View style={styles.cardImageContainer}>
                      <Image source={{ uri: item.geoTagImage.uri }} style={styles.cardImage} />
                      <View style={styles.cardGeoTagBadge}>
                        <MaterialIcons name="satellite-alt" size={9} color="#34d399" />
                        <Text style={styles.cardGeoTagText}>GEO-TAG</Text>
                      </View>
                      <View style={[styles.cardSeverityBadge, { backgroundColor: item.severity === 'Critical' ? theme.colors.error : theme.colors.primary }]}>
                        <Text style={styles.cardSeverityText}>{item.severity.toUpperCase()}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Citizen's Suggestion if present */}
                  {item.citizenSuggestions ? (
                    <View style={[styles.suggestionHighlight, isDark && { backgroundColor: '#18181b' }]}>
                      <MaterialIcons name="lightbulb" size={13} color={theme.colors.warningAmber} />
                      <Text style={[styles.suggestionText, isDark && { color: '#fbbf24' }]} numberOfLines={1}>
                        "{item.citizenSuggestions}"
                      </Text>
                    </View>
                  ) : null}

                  {/* Live Status Stage Pill */}
                  <View style={[styles.statusBannerRow, { backgroundColor: statusColor + '12' }]}>
                    <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                    <Text style={[styles.statusLabelText, { color: statusColor }]}>
                      {getStatusLabel(item.status)}
                    </Text>
                    {item.assignedContractor ? (
                      <Text style={[styles.assignedContractorText, isDark && { color: '#a1a1aa' }]}>• {item.assignedContractor}</Text>
                    ) : (
                      <Text style={[styles.assignedContractorText, isDark && { color: '#a1a1aa' }]}>• Transmitted to DPW Admin Plane</Text>
                    )}
                  </View>

                  {/* Card Bottom: Spot coords and track link */}
                  <View style={[styles.cardBottomRow, isDark && { borderTopColor: '#18181b' }]}>
                    <View style={styles.spotCoordsRow}>
                      <MaterialIcons name="gps-fixed" size={12} color={isDark ? '#a1a1aa' : theme.colors.secondary} />
                      <Text style={[styles.spotCoordsText, isDark && { color: '#a1a1aa' }]}>
                        {item.location.latitude.toFixed(4)}°N, {Math.abs(item.location.longitude).toFixed(4)}°W
                      </Text>
                    </View>
                    <View style={styles.trackLink}>
                      <Text style={styles.trackLinkText}>Inspect & Map</Text>
                      <MaterialIcons name="chevron-right" size={16} color={theme.colors.primary} />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
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
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceContainerHigh,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.spaceSm,
  },
  logoIcon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.spaceXs,
  },
  headerTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.headlineSm.fontSize,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  headerBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: theme.colors.primaryFixed,
    borderRadius: 6,
  },
  headerBadgeText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  headerLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  headerLocationText: {
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
  profileAvatarText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.onPrimary,
  },
  scrollContent: {
    paddingTop: theme.spacing.spaceSm,
  },
  titleSection: {
    paddingHorizontal: theme.spacing.gutter,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.spaceSm,
  },
  mainTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.headlineSm.fontSize,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  subTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.bodySm.fontSize,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  activeRepairBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: theme.colors.tertiaryContainer + '26',
    borderRadius: 999,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.tertiary,
  },
  activeRepairText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: 'bold',
    color: theme.colors.tertiary,
  },
  quickCaptureBar: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: theme.spacing.gutter,
    marginBottom: theme.spacing.spaceSm,
  },
  quickCaptureBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  quickCaptureBtnText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  quickGalleryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    paddingVertical: 10,
    borderRadius: 10,
  },
  quickGalleryBtnText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  searchSection: {
    paddingHorizontal: theme.spacing.gutter,
    marginBottom: theme.spacing.spaceSm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.colors.surfaceContainerHigh,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: theme.typography.fontFamily,
    fontSize: 13,
    color: theme.colors.onSurface,
  },
  tabsScroll: {
    flexGrow: 0,
    marginBottom: theme.spacing.spaceSm,
  },
  tabsContent: {
    paddingHorizontal: theme.spacing.gutter,
    gap: 8,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.surfaceContainerHigh,
  },
  tabItemActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  tabLabel: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.onSurfaceVariant,
  },
  tabLabelActive: {
    color: theme.colors.onPrimary,
  },
  tabBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    backgroundColor: theme.colors.surfaceContainerHighest,
    borderRadius: 999,
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  tabBadgeText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    color: theme.colors.onSurfaceVariant,
  },
  tabBadgeTextActive: {
    color: theme.colors.onPrimary,
  },
  feedContainer: {
    paddingHorizontal: theme.spacing.gutter,
    gap: 12,
  },
  card: {
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
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'center',
    flexShrink: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  cardId: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  cardDot: {
    color: theme.colors.outline,
    fontSize: 10,
  },
  cardDate: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    color: theme.colors.outline,
  },
  cardTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  cardLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  cardLocationText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    flex: 1,
  },
  cardImageContainer: {
    width: 76,
    height: 76,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: theme.colors.surfaceContainer,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardGeoTagBadge: {
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
  cardGeoTagText: {
    fontFamily: 'monospace',
    fontSize: 7,
    fontWeight: '700',
    color: '#34d399',
  },
  cardSeverityBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cardSeverityText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 8,
    fontWeight: '800',
    color: '#ffffff',
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
  statusBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusLabelText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    fontWeight: '800',
  },
  assignedContractorText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    color: theme.colors.onSurfaceVariant,
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
  emptyState: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.surfaceContainerHigh,
    gap: 8,
  },
  emptyTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  emptyDesc: {
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
});
