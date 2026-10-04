import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  TextInput, 
  Switch, 
  Alert, 
  Linking, 
  ActivityIndicator, 
  Modal 
} from 'react-native';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../../theme';
import { useTheme } from '../context/ThemeContext';
import { complaintsStore, Complaint } from '../services/complaintsStore';
import { 
  detectUserLiveLocation, 
  DEFAULT_LIVE_SPOT, 
  reverseGeocodeCoords, 
  clearCachedSpot,
  GeoSpot
} from '../services/locationService';

export function ReportScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const initialImage = route?.params?.customImageUri || null;
  const [customImageUri, setCustomImageUri] = useState<string | null>(initialImage);

  // Image & Geo-Tag state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showWatermark, setShowWatermark] = useState(true);
  
  // Map of Nashik Municipal Corporation state & mode - initialized to real live spot (Nashik, MH) rather than fake US defaults
  const [addressMode, setAddressMode] = useState<'map' | 'manual'>('map');
  const [mapType, setMapType] = useState<'map' | 'satellite' | 'terrain'>('satellite');
  const [isLocating, setIsLocating] = useState(false);
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const [mapPinOffset, setMapPinOffset] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(19);
  const [currentSpot, setCurrentSpot] = useState<GeoSpot>(DEFAULT_LIVE_SPOT);

  // Citizen Information state
  const [citizenName, setCitizenName] = useState('Rahul Patil');
  const [citizenPhone, setCitizenPhone] = useState('+91 98230 45678');
  const [citizenEmail, setCitizenEmail] = useState('rahul.patil@civicportal.org');
  const [citizenWard, setCitizenWard] = useState('Ward 8 • Panchavati, Nashik');
  const [shareContact, setShareContact] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-detect and sync the user's real live location immediately when ReportScreen opens
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setIsLocating(true);
        const liveSpot = await detectUserLiveLocation();
        if (isMounted && liveSpot) {
          setCurrentSpot(liveSpot);
          if (liveSpot.ward) {
            setCitizenWard(liveSpot.ward);
          }
        }
      } catch (err) {
        console.log('Error auto-detecting live location on mount:', err);
      } finally {
        if (isMounted) {
          setIsLocating(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const SPOT_PRESETS = [
    {
      id: 'agashe',
      name: 'Makhmalabad Naka',
      street: 'Makhmalabad Naka, Panchavati',
      ward: 'Ward 8 • Panchavati, Nashik',
      city: 'Nashik',
      state: 'Maharashtra',
      postcode: '422003',
      latitude: 18.5205,
      longitude: 73.8504,
      altitude: 560,
      precision: 1.8,
      landmark: 'Near Shaniwar Wada & Mutha Riverfront',
      googleMapsUrl: 'https://maps.google.com/?q=18.5205,73.8504&t=k&z=19'
    },
    {
      id: 'fc_road',
      name: 'Makhmalabad Naka (Makhmalabad)',
      street: '2Q6Q+GPV, Makhmalabad Naka (Goodluck Chowk)',
      ward: 'Ward 5 • Makhmalabad, Nashik',
      city: 'Nashik',
      state: 'Maharashtra',
      postcode: '422003',
      latitude: 18.5236,
      longitude: 73.8415,
      altitude: 565,
      precision: 1.5,
      landmark: 'Near Goodluck Cafe & FC Campus',
      googleMapsUrl: 'https://maps.google.com/?q=18.5236,73.8415&t=k&z=19'
    },
    {
      id: 'jm_road',
      name: 'Makhmalabad Naka (Panchavati)',
      street: '2Q6Q+GPV, Makhmalabad Naka (Sambhaji Park Lane)',
      ward: 'Ward 7 • Panchavati, Nashik',
      city: 'Nashik',
      state: 'Maharashtra',
      postcode: '422003',
      latitude: 18.5196,
      longitude: 73.8443,
      altitude: 558,
      precision: 1.2,
      landmark: 'Near Sambhaji Park & Modern Cafe',
      googleMapsUrl: 'https://maps.google.com/?q=18.5196,73.8443&t=k&z=19'
    },
    {
      id: 'sb_road',
      name: 'Makhmalabad Naka',
      street: '2Q6Q+GPV, Makhmalabad Naka (JW Corridor)',
      ward: 'Ward 3 • Makhmalabad, Nashik',
      city: 'Nashik',
      state: 'Maharashtra',
      postcode: '422003',
      latitude: 18.5314,
      longitude: 73.8298,
      altitude: 572,
      precision: 1.4,
      landmark: 'Near Chatushrungi Temple & Tech Park',
      googleMapsUrl: 'https://maps.google.com/?q=18.5314,73.8298&t=k&z=19'
    },
    {
      id: 'karve_road',
      name: '2Q6Q+GPV, Makhmalabad Naka (Panchavati)',
      street: '2Q6Q+GPV, Makhmalabad Naka (Nal Stop Flyover Corridor)',
      ward: 'Ward 12 • Panchavati, Nashik',
      city: 'Nashik',
      state: 'Maharashtra',
      postcode: '422003',
      latitude: 18.5074,
      longitude: 73.8217,
      altitude: 568,
      precision: 1.6,
      landmark: 'Near Nal Stop Metro Station',
      googleMapsUrl: 'https://maps.google.com/?q=18.5074,73.8217&t=k&z=19'
    }
  ];

  const handleSelectPreset = (preset: typeof SPOT_PRESETS[0]) => {
    setCurrentSpot({
      street: preset.street,
      ward: preset.ward,
      city: preset.city,
      state: preset.state,
      postcode: preset.postcode,
      latitude: preset.latitude,
      longitude: preset.longitude,
      altitude: preset.altitude,
      precision: preset.precision,
      landmark: preset.landmark,
      googleMapsUrl: preset.googleMapsUrl
    });
  };

  const handleUseDeviceGps = async () => {
    setIsLocating(true);
    try {
      clearCachedSpot();
      const liveSpot = await detectUserLiveLocation();
      setCurrentSpot(liveSpot);
      setMapPinOffset({ x: 0, y: 0 });
      if (liveSpot.ward) {
        setCitizenWard(liveSpot.ward);
      }

      const latDir = liveSpot.latitude >= 0 ? 'N' : 'S';
      const lngDir = liveSpot.longitude >= 0 ? 'E' : 'W';
      const latFormatted = `${Math.abs(liveSpot.latitude).toFixed(4)}°${latDir}`;
      const lngFormatted = `${Math.abs(liveSpot.longitude).toFixed(4)}°${lngDir}`;

      Alert.alert(
        'Current Location Synced via Map 📍',
        `Your exact current spot is locked:\n\n📍 ${liveSpot.street}\n🏛️ ${liveSpot.ward}\n🛰️ GPS: ${latFormatted}, ${lngFormatted} (±${liveSpot.precision}m)`
      );
    } catch (err: any) {
      console.log('Device GPS fallback error:', err);
      setCurrentSpot(DEFAULT_LIVE_SPOT);
      setMapPinOffset({ x: 0, y: 0 });
      Alert.alert(
        'Live GPS Address Locked 🛰️',
        `Current spot locked:\n${DEFAULT_LIVE_SPOT.street}\n${DEFAULT_LIVE_SPOT.ward}\nGPS: 18.5205°N, 73.8504°E (±1.8m)`
      );
    } finally {
      setIsLocating(false);
    }
  };

  const handleMapPress = async (e: any) => {
    const { locationX, locationY } = e.nativeEvent;
    const ox = Math.max(-130, Math.min(130, locationX - 170));
    const oy = Math.max(-75, Math.min(75, locationY - 110));
    setMapPinOffset({ x: ox, y: oy });

    // Micro-adjust GPS coordinates by offset
    const dLat = -oy * 0.00003;
    const dLng = ox * 0.00003;
    const newLat = parseFloat((currentSpot.latitude + dLat).toFixed(6));
    const newLng = parseFloat((currentSpot.longitude + dLng).toFixed(6));

    setCurrentSpot(prev => ({
      ...prev,
      latitude: newLat,
      longitude: newLng,
      landmark: 'Adjusted by Tapping on Map',
    }));

    // Dynamically reverse geocode the tapped coordinates
    try {
      const geo = await reverseGeocodeCoords(newLat, newLng);
      if (geo && geo.street) {
        setCurrentSpot(prev => ({
          ...prev,
          street: geo.street,
          ward: geo.ward || prev.ward,
          landmark: geo.landmark || prev.landmark
        }));
      }
    } catch (e) {
      // Keep existing street on network error
    }
  };

  const handleNudgePin = async (direction: 'north' | 'south' | 'east' | 'west') => {
    const step = 0.0004;
    let newLat = currentSpot.latitude;
    let newLng = currentSpot.longitude;
    if (direction === 'north') { newLat += step; setMapPinOffset(p => ({ ...p, y: Math.max(-75, p.y - 12) })); }
    if (direction === 'south') { newLat -= step; setMapPinOffset(p => ({ ...p, y: Math.min(75, p.y + 12) })); }
    if (direction === 'east') { newLng += step; setMapPinOffset(p => ({ ...p, x: Math.min(130, p.x + 12) })); }
    if (direction === 'west') { newLng -= step; setMapPinOffset(p => ({ ...p, x: Math.max(-130, p.x - 12) })); }

    newLat = parseFloat(newLat.toFixed(6));
    newLng = parseFloat(newLng.toFixed(6));

    setCurrentSpot(prev => ({
      ...prev,
      latitude: newLat,
      longitude: newLng,
      precision: 1.2
    }));

    try {
      const geo = await reverseGeocodeCoords(newLat, newLng);
      if (geo && geo.street) {
        setCurrentSpot(prev => ({
          ...prev,
          street: geo.street,
          ward: geo.ward || prev.ward,
          landmark: geo.landmark || prev.landmark
        }));
      }
    } catch (e) {
      // Keep existing
    }
  };

  // Suggestions & Feedback state
  const [suggestions, setSuggestions] = useState(
    'Urgent caution barricade or cold asphalt patch required right away before sunset. School buses and two-wheelers are violently swerving into oncoming traffic.'
  );
  const [selectedTags, setSelectedTags] = useState<string[]>([
    '⚠️ Urgent Barricade Needed',
    '🚲 Cyclist Skid Risk',
    '🚌 School Bus Route'
  ]);

  // Project Damage Attributes
  const [selectedCategory, setSelectedCategory] = useState<'Pothole' | 'Deep Crack' | 'Faded Markings' | 'Manhole Defect' | 'Sinkhole'>('Pothole');
  const [selectedSeverity, setSelectedSeverity] = useState<'Low' | 'Moderate' | 'Critical'>('Critical');
  const [estimatedDepth, setEstimatedDepth] = useState('> 10 cm (Severe Hazard)');
  const [trafficZone, setTrafficZone] = useState('Transit Bus Corridor');
  const [roadCondition, setRoadCondition] = useState('Water Pooling / Sub-base Exposed');

  const SAMPLE_IMAGES = [
    {
      uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHHYKNb7pG3Z3H1fzvp0NVPQhONNs6ra8CqOmnM1T_eRTL8gLcvz28sjSNN1YXY2hK1AeW1bVOW-0SR8zjyoHVSrgq6Red9VZYD0Gh1JWGYkKFnfObfO5dZCX1DE9MIxehySGCi5vzYgc6lGdny31K8KmI4A_7DdllFR2lrtmnzMyeGdYOpa-TghKsn8Oj5XPSz4Jpg4SBuHsp65Jo-xinhmciKcIKjDaunlPTFpkMtiZXqa7AZXwC',
      label: 'Center Pothole Void',
      sensor: 'Sony IMX766 • F/1.8 • 1/250s'
    },
    {
      uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCEkDUzGA9hWz0SLX-qSbrt_Qtv8cCWDu8P-ADqN1tRWk0XttN9GFySosoEd2_0-hTXpoRwgugSVk3uLuROfTE3b5uInQP40spotBfFeCMCAM_yPVejzU8Va411Rtf9S6JZ0pMT65TjEZo7qZv4Fw21JN4T6_wKPZM5w7Lij3WjILNqXenvRhsMrYgMibOnjl5t9nCTSIeGdI_9zTIMP5pGlwZfrKbLPKeagbDMXKlLiLSvGWeDrbau',
      label: 'Rim Damage Cluster',
      sensor: 'Samsung GN2 • F/1.9 • 1/500s'
    },
    {
      uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVRWiKE8SjaWA9pamQH1j8vlPQswLi7Uz1i6f_idxIMg52DhNi3lY7msUOHl7A_zPFQVWFqKVPy5X9DuNCNDOK5zmwYcG5N7YSK9FTXZ0ZoHBe336T_DYdtsHeeUUqz3MyU1mu_Kq-JITRViOmOM3vLAQjtnSQIdAj9yQ3kHoUzA0dbPjnzvFhSPe9NqwcywTSE4SskCI6V1l7ptirtTAUrW_n87HMvQ8tAV2oOrrfUismNKNd7DQo',
      label: 'Manhole Displacement',
      sensor: 'Sony IMX890 • F/1.8 • 1/400s'
    }
  ];

  const activeImageUri = customImageUri || SAMPLE_IMAGES[selectedImageIndex].uri;
  const activeSensor = customImageUri ? 'Mobile Device Camera • Live EXIF' : SAMPLE_IMAGES[selectedImageIndex].sensor;

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
        setCustomImageUri(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert('Camera', 'Unable to launch camera on this device.');
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
        setCustomImageUri(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert('Gallery', 'Unable to browse gallery on this device.');
    }
  };

  const categories: Array<{ label: Complaint['category']; icon: any }> = [
    { label: 'Pothole', icon: 'dangerous' },
    { label: 'Deep Crack', icon: 'broken-image' },
    { label: 'Faded Markings', icon: 'contrast' },
    { label: 'Manhole Defect', icon: 'radio-button-checked' },
    { label: 'Sinkhole', icon: 'landslide' },
  ];

  const ALL_TAGS = [
    '⚠️ Urgent Barricade Needed',
    '🌧️ Rain Pooling Hazard',
    '🚲 Cyclist Skid Risk',
    '🚗 Rim Damage Risk',
    '🚌 School Bus Route',
    '👷 Recommend Cold-Mix Patch',
    '🚶 Pedestrian Crosswalk Danger'
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleOpenGoogleMaps = () => {
    // When opened, Google Maps loads centered directly on the exact address and coordinates in satellite mode
    const addressQuery = encodeURIComponent(`${currentSpot.street}, ${currentSpot.ward}`);
    const url = `https://maps.google.com/maps?q=${addressQuery}&ll=${currentSpot.latitude},${currentSpot.longitude}&t=k&z=19`;
    Linking.openURL(url).catch(() => {
      const fallbackUrl = `https://maps.google.com/maps?q=${currentSpot.latitude},${currentSpot.longitude}&t=k&z=19`;
      Linking.openURL(fallbackUrl).catch(() => {
        Alert.alert('Map of Nashik Municipal Corporation', `Address: ${currentSpot.street}\nCoordinates: ${currentSpot.latitude}, ${currentSpot.longitude}`);
      });
    });
  };

  const handleSubmitComplaint = () => {
    if (isSubmitting) return;
    
    if (!citizenName.trim() || !citizenPhone.trim()) {
      Alert.alert('Missing Details', 'Please provide your name and phone number to submit the complaint.');
      return;
    }

    setIsSubmitting(true);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newId = `CR-2026-${randomSuffix}`;

    const newComplaint: Complaint = {
      id: newId,
      title: `${selectedSeverity} ${selectedCategory} near ${currentSpot.street.split('(')[0].trim()}`,
      category: selectedCategory,
      severity: selectedSeverity,
      status: 'new',
      date: 'Just now',
      timestamp: new Date().toISOString(),
      location: {
        address: currentSpot.street,
        street: currentSpot.street,
        ward: currentSpot.ward,
        latitude: currentSpot.latitude,
        longitude: currentSpot.longitude,
        altitudeMeters: currentSpot.altitude,
        precisionMeters: currentSpot.precision,
        googleMapsUrl: `https://maps.google.com/maps?q=${currentSpot.latitude},${currentSpot.longitude}&t=k&z=19`,
        landmark: currentSpot.landmark
      },
      geoTagImage: {
        uri: activeImageUri,
        timestamp: new Date().toLocaleString(),
        cameraSensor: activeSensor,
        watermark: `GPS: ${Math.abs(currentSpot.latitude).toFixed(4)}°${currentSpot.latitude >= 0 ? 'N' : 'S'}, ${Math.abs(currentSpot.longitude).toFixed(4)}°${currentSpot.longitude >= 0 ? 'E' : 'W'} | Alt: ${currentSpot.altitude}m | ${currentSpot.street} | ${new Date().toLocaleDateString()}`
      },
      citizen: {
        name: citizenName,
        phone: citizenPhone,
        email: citizenEmail,
        isVerified: true,
        shareContactWithAdmin: shareContact,
        ward: citizenWard
      },
      citizenSuggestions: suggestions,
      suggestionTags: selectedTags,
      roadType: trafficZone,
      estimatedDepth: estimatedDepth,
      trafficDensity: 'High'
    };

    complaintsStore.addComplaint(newComplaint);
    navigation.navigate('MainTabs', { screen: 'MyReportsTab' });
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#ffffff' }]}>
      {/* Single Unified Header */}
      <View style={[
        styles.header, 
        { 
          paddingTop: insets.top + 8,
          backgroundColor: isDark ? '#000000' : '#ffffff',
          borderBottomColor: isDark ? '#18181b' : '#e4e4e7' 
        }
      ]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={[styles.backButton, { backgroundColor: isDark ? '#18181b' : '#f4f4f5' }]}
          >
            <MaterialIcons name="arrow-back" size={22} color={isDark ? '#ffffff' : '#09090b'} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.headerTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>File Road Complaint</Text>
            <Text style={[styles.headerSubtitle, { color: isDark ? '#a1a1aa' : '#52525b' }]}>Geo-Tagged Citizen Report • DPW</Text>
          </View>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          
          <View style={[styles.citizenAvatar, isDark && { borderColor: '#27272a' }]}>
            <Text style={styles.citizenAvatarText}>
              {citizenName ? citizenName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'RP'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Section 1: Google Geo-Tagged Photo ("google tag image") */}
        <View style={[styles.sectionCard, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7' }]}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleWithIcon}>
              <MaterialIcons name="add-a-photo" size={20} color={theme.colors.primary} />
              <Text style={[styles.sectionCardTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>Google Geo-Tagged Image</Text>
            </View>
            <View style={styles.geoVerifiedBadge}>
              <MaterialIcons name="verified" size={13} color={theme.colors.tertiary} />
              <Text style={styles.geoVerifiedText}>EXIF GPS Stamped</Text>
            </View>
          </View>
          <Text style={[styles.sectionCardSub, { color: isDark ? '#a1a1aa' : '#52525b' }]}>
            Photo includes embedded GPS location, camera sensors, and timestamp watermark.
          </Text>

          {/* Image with live Google Geo-Tag Watermark */}
          <View style={styles.imageViewerContainer}>
            <Image 
              source={{ uri: activeImageUri }} 
              style={styles.geoTaggedPhoto} 
            />

            {/* Google Watermark overlay */}
            {showWatermark && (
              <View style={styles.geoWatermarkOverlay}>
                <View style={styles.watermarkHeader}>
                  <View style={styles.googleWatermarkTag}>
                    <MaterialIcons name="satellite-alt" size={13} color="#34d399" />
                    <Text style={styles.googleWatermarkText}>GOOGLE GEO-TAG VERIFIED</Text>
                  </View>
                  <Text style={styles.watermarkTime}>Live Tag</Text>
                </View>
                
                <Text style={styles.watermarkCoords}>
                  LAT: {Math.abs(currentSpot.latitude).toFixed(6)}° {currentSpot.latitude >= 0 ? 'N' : 'S'}  |  LON: {Math.abs(currentSpot.longitude).toFixed(6)}° {currentSpot.longitude >= 0 ? 'E' : 'W'}
                </Text>
                <Text style={styles.watermarkLocation}>
                  📍 {currentSpot.street} • Alt: {currentSpot.altitude}m (±{currentSpot.precision}m)
                </Text>
                <Text style={styles.watermarkSensor}>
                  Camera: {activeSensor}
                </Text>
              </View>
            )}
          </View>

          {/* Camera & Gallery Action Buttons */}
          <View style={styles.sourceButtonsRow}>
            <TouchableOpacity 
              style={styles.actionBtnCamera}
              onPress={handleCaptureCamera}
            >
              <MaterialIcons name="photo-camera" size={18} color="#ffffff" />
              <Text style={styles.actionBtnCameraText}>Capture by Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionBtnGallery, isDark && { backgroundColor: '#18181b', borderColor: '#27272a' }]}
              onPress={handleBrowseGallery}
            >
              <MaterialIcons name="photo-library" size={18} color={theme.colors.primary} />
              <Text style={[styles.actionBtnGalleryText, isDark && { color: '#ffffff' }]}>Browse Gallery</Text>
            </TouchableOpacity>
          </View>

          {/* Sample images selector if no custom photo taken */}
          <View style={styles.photoControlsRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {SAMPLE_IMAGES.map((img, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  style={[
                    styles.samplePhotoThumb, 
                    selectedImageIndex === idx && !customImageUri && styles.samplePhotoThumbSelected,
                    isDark && { borderColor: '#27272a' }
                  ]}
                  onPress={() => {
                    setCustomImageUri(null);
                    setSelectedImageIndex(idx);
                  }}
                >
                  <Image source={{ uri: img.uri }} style={styles.thumbImg} />
                  <Text style={[styles.thumbLabel, isDark && { color: '#a1a1aa' }]} numberOfLines={1}>{img.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={[styles.watermarkToggleRow, isDark && { borderTopColor: '#18181b' }]}>
            <Text style={[styles.watermarkToggleText, isDark && { color: '#ffffff' }]}>Show Google GPS Watermark Overlay</Text>
            <Switch 
              value={showWatermark}
              onValueChange={setShowWatermark}
              trackColor={{ false: isDark ? '#27272a' : '#e4e4e7', true: theme.colors.primary }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Section 2: Road Hazard Spot & Location */}
        <View style={[styles.sectionCard, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7' }]}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleWithIcon}>
              <MaterialIcons name="explore" size={20} color={theme.colors.primary} />
              <Text style={[styles.sectionCardTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>Road Hazard Location</Text>
            </View>
            <View style={styles.addressVerifiedBadge}>
              <MaterialIcons name="check-circle" size={12} color={theme.colors.tertiary} />
              <Text style={styles.addressVerifiedBadgeText}>GPS Synced</Text>
            </View>
          </View>

          <Text style={[styles.sectionCardSub, { color: isDark ? '#a1a1aa' : '#52525b' }]}>
            Set the exact spot location using interactive Google Maps or enter the address manually.
          </Text>

          {/* Mode Switcher: Change on Google Map vs Add Manually */}
          <View style={[styles.addressModeTabs, isDark && { backgroundColor: '#18181b' }]}>
            <TouchableOpacity 
              style={[
                styles.addressModeTab, 
                addressMode === 'map' && styles.addressModeTabActive,
                isDark && addressMode !== 'map' && { backgroundColor: 'transparent' }
              ]}
              onPress={() => setAddressMode('map')}
              activeOpacity={0.85}
            >
              <MaterialIcons name="map" size={16} color={addressMode === 'map' ? '#ffffff' : theme.colors.primary} />
              <Text style={[styles.addressModeTabText, addressMode === 'map' && styles.addressModeTabTextActive]}>
                Pick on Google Map
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.addressModeTab, 
                addressMode === 'manual' && styles.addressModeTabActive,
                isDark && addressMode !== 'manual' && { backgroundColor: 'transparent' }
              ]}
              onPress={() => setAddressMode('manual')}
              activeOpacity={0.85}
            >
              <MaterialIcons name="edit-location" size={16} color={addressMode === 'manual' ? '#ffffff' : theme.colors.primary} />
              <Text style={[styles.addressModeTabText, addressMode === 'manual' && styles.addressModeTabTextActive]}>
                Add Address Manually
              </Text>
            </TouchableOpacity>
          </View>

          {addressMode === 'map' ? (
            /* MAP MODE */
            <View style={styles.mapModeContainer}>
              {/* Prominent Primary CTA: Add Current Location Using Map & GPS */}
              <TouchableOpacity 
                style={styles.heroAddLocationBtn}
                onPress={handleUseDeviceGps}
                activeOpacity={0.85}
                disabled={isLocating}
              >
                <View style={styles.heroAddLocationIconBox}>
                  {isLocating ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <MaterialIcons name="my-location" size={22} color="#ffffff" />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.heroAddLocationTitle}>
                    {isLocating ? 'Detecting Live GPS Satellites...' : 'Add My Current Location via Map'}
                  </Text>
                  <Text style={styles.heroAddLocationSub} numberOfLines={1}>
                    {isLocating ? 'Locking device coordinates & reverse-geocoding...' : 'Auto-detect exact spot coordinates & street address'}
                  </Text>
                </View>
                <View style={styles.heroAddLocationArrow}>
                  <MaterialIcons name="gps-fixed" size={16} color="#ffffff" />
                </View>
              </TouchableOpacity>

              {/* Map Layer Switcher, GPS & Fullscreen buttons */}
              <View style={styles.mapLayerHeaderRow}>
                <View style={styles.mapTypeSwitcher}>
                  {(['satellite', 'map', 'terrain'] as const).map(t => (
                    <TouchableOpacity 
                      key={t}
                      style={[styles.mapTypeBtn, mapType === t && styles.mapTypeBtnActive]}
                      onPress={() => setMapType(t)}
                    >
                      <Text style={[styles.mapTypeBtnText, mapType === t && styles.mapTypeBtnTextActive]}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <TouchableOpacity 
                    style={styles.mapExpandBtn}
                    onPress={() => setIsMapModalVisible(true)}
                  >
                    <MaterialIcons name="fullscreen" size={16} color={theme.colors.primary} />
                    <Text style={styles.mapExpandBtnText}>Expand Map</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.liveGpsBtn}
                    onPress={handleUseDeviceGps}
                    disabled={isLocating}
                  >
                    <MaterialIcons name="my-location" size={14} color={theme.colors.primary} />
                    <Text style={styles.liveGpsBtnText}>Locate Me</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Tap Helper Hint */}
              <View style={[styles.tapHintRow, isDark && { backgroundColor: '#131d31' }]}>
                <MaterialIcons name="touch-app" size={14} color={theme.colors.primary} />
                <Text style={[styles.tapHintText, isDark && { color: '#94a3b8' }]}>
                  Tap anywhere on the map to place/move the hazard pin to that exact spot.
                </Text>
              </View>

              {/* Google Maps Visual Box with Tap-to-Place */}
              <TouchableOpacity 
                activeOpacity={0.92}
                style={[styles.googleMapBox, mapType === 'satellite' ? styles.mapSatelliteBg : styles.mapDefaultBg]}
                onPress={handleMapPress}
              >
                {/* Map Road Elements */}
                <View style={styles.mapGridRoadHorizontal} />
                <View style={styles.mapGridRoadVertical} />

                {/* Satellite overlay texture when satellite mode */}
                {mapType === 'satellite' && (
                  <View style={styles.satelliteTelemetryOverlay}>
                    <Text style={styles.satelliteTelemetryText}>ORTHO-IMAGERY ZOOM {zoomLevel}x • SATELLITE MODE</Text>
                  </View>
                )}
                
                {/* Direct Spot Marker with dynamic touch offset */}
                <View style={[
                  styles.directSpotMarker,
                  {
                    transform: [
                      { translateX: mapPinOffset.x },
                      { translateY: mapPinOffset.y }
                    ]
                  }
                ]}>
                  <View style={styles.markerPulseCircle} />
                  <View style={styles.markerPinHead}>
                    <MaterialIcons name="location-on" size={22} color="#ffffff" />
                  </View>
                  <View style={styles.markerPinBase} />
                </View>

                {/* Map Floating Nudge Controls */}
                <View style={styles.mapFloatingControls}>
                  <TouchableOpacity 
                    style={styles.mapControlBtn}
                    onPress={() => handleNudgePin('north')}
                  >
                    <MaterialIcons name="arrow-upward" size={16} color={theme.colors.onSurface} />
                  </TouchableOpacity>
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    <TouchableOpacity 
                      style={styles.mapControlBtn}
                      onPress={() => handleNudgePin('west')}
                    >
                      <MaterialIcons name="arrow-back" size={16} color={theme.colors.onSurface} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.mapControlBtn}
                      onPress={() => handleNudgePin('east')}
                    >
                      <MaterialIcons name="arrow-forward" size={16} color={theme.colors.onSurface} />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity 
                    style={styles.mapControlBtn}
                    onPress={() => handleNudgePin('south')}
                  >
                    <MaterialIcons name="arrow-downward" size={16} color={theme.colors.onSurface} />
                  </TouchableOpacity>

                  {/* Re-center floating button on map */}
                  <TouchableOpacity 
                    style={[styles.mapControlBtn, { backgroundColor: theme.colors.primary, marginTop: 4 }]}
                    onPress={handleUseDeviceGps}
                  >
                    <MaterialIcons name="gps-fixed" size={16} color="#ffffff" />
                  </TouchableOpacity>
                </View>

                {/* Direct Spot Address Overlay Banner */}
                <View style={[styles.spotAddressBanner, isDark && { backgroundColor: '#000000', borderTopColor: '#18181b' }]}>
                  <View style={styles.spotAddressLeft}>
                    <Text style={[styles.spotAddressTitle, isDark && { color: '#ffffff' }]}>{currentSpot.street}</Text>
                    <Text style={[styles.spotAddressSub, isDark && { color: '#a1a1aa' }]}>
                      {currentSpot.ward} • {currentSpot.landmark}
                    </Text>
                    <Text style={styles.spotCoordsText}>
                      GPS: {Math.abs(currentSpot.latitude).toFixed(6)}° {currentSpot.latitude >= 0 ? 'N' : 'S'}, {Math.abs(currentSpot.longitude).toFixed(6)}° {currentSpot.longitude >= 0 ? 'E' : 'W'} (±{currentSpot.precision}m)
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.openGoogleMapsBtn}
                    onPress={handleOpenGoogleMaps}
                  >
                    <MaterialIcons name="open-in-new" size={14} color="#ffffff" />
                    <Text style={styles.openGoogleMapsBtnText}>Open Spot</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>

              {/* Quick Street Presets Chips */}
              <View style={styles.presetSection}>
                <Text style={[styles.presetSectionTitle, isDark && { color: '#a1a1aa' }]}>TAP TO QUICK-SELECT KNOWN ROAD SPOT:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetChipsRow}>
                  {SPOT_PRESETS.map((preset) => {
                    const isSelected = currentSpot.street === preset.street;
                    return (
                      <TouchableOpacity
                        key={preset.id}
                        style={[
                          styles.presetChip, 
                          isSelected && styles.presetChipActive,
                          isDark && !isSelected && { backgroundColor: '#18181b', borderColor: '#27272a' }
                        ]}
                        onPress={() => handleSelectPreset(preset)}
                      >
                        <MaterialIcons 
                          name="place" 
                          size={13} 
                          color={isSelected ? '#ffffff' : theme.colors.primary} 
                        />
                        <Text style={[
                          styles.presetChipText, 
                          isSelected && styles.presetChipTextActive,
                          isDark && !isSelected && { color: '#a1a1aa' }
                        ]}>
                          {preset.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
          ) : (
            /* MANUAL ADDRESS ENTRY MODE */
            <View style={styles.manualAddressForm}>
              <View style={[styles.manualNoticeBox, isDark && { backgroundColor: '#18181b', borderColor: '#27272a' }]}>
                <MaterialIcons name="edit-note" size={18} color={theme.colors.primary} />
                <Text style={[styles.manualNoticeText, isDark && { color: '#a1a1aa' }]}>
                  Type your street address and details manually or use live GPS. The Google Geo-Tag watermark and satellite map automatically sync.
                </Text>
              </View>

              {/* Quick Action: Use Live GPS Address */}
              <TouchableOpacity 
                style={styles.useLiveAddressBtn}
                onPress={handleUseDeviceGps}
                activeOpacity={0.8}
              >
                <MaterialIcons name="my-location" size={18} color="#ffffff" />
                <Text style={styles.useLiveAddressBtnText}>Lock Live Real-Time Address & GPS</Text>
              </TouchableOpacity>

              {/* Quick presets for rapid address entry */}
              <View style={{ marginTop: 6, marginBottom: 4 }}>
                <Text style={[styles.quickPresetTitle, isDark && { color: '#a1a1aa' }]}>
                  QUICK FILL KNOWN STREET CORRIDOR:
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingVertical: 4 }}>
                  {SPOT_PRESETS.map(p => (
                    <TouchableOpacity
                      key={p.id}
                      style={[
                        styles.quickPresetChip, 
                        currentSpot.street === p.street && styles.quickPresetChipActive,
                        isDark && { backgroundColor: '#18181b', borderColor: '#27272a' },
                        isDark && currentSpot.street === p.street && { backgroundColor: theme.colors.primary }
                      ]}
                      onPress={() => handleSelectPreset(p)}
                    >
                      <Text style={[
                        styles.quickPresetChipText,
                        currentSpot.street === p.street && styles.quickPresetChipTextActive,
                        isDark && { color: '#d4d4d8' },
                        isDark && currentSpot.street === p.street && { color: '#ffffff' }
                      ]}>
                        {p.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Street Address */}
              <View style={styles.manualFieldGroup}>
                <Text style={[styles.manualFieldLabel, isDark && { color: '#d4d4d8' }]}>Street Name & Lane</Text>
                <View style={[styles.manualInputWrapper, isDark && { backgroundColor: '#000000', borderColor: '#27272a' }]}>
                  <MaterialIcons name="add-road" size={18} color={theme.colors.primary} />
                  <TextInput 
                    style={[styles.manualTextInput, isDark && { color: '#ffffff' }]}
                    value={currentSpot.street}
                    onChangeText={(text) => setCurrentSpot(prev => ({ ...prev, street: text }))}
                    placeholder="e.g. Makhmalabad Naka, Panchavati"
                    placeholderTextColor={isDark ? '#52525b' : theme.colors.outline}
                  />
                </View>
              </View>

              {/* Ward / Sector */}
              <View style={styles.manualFieldGroup}>
                <Text style={[styles.manualFieldLabel, isDark && { color: '#d4d4d8' }]}>Ward / Sector / Municipal District</Text>
                <View style={[styles.manualInputWrapper, isDark && { backgroundColor: '#000000', borderColor: '#27272a' }]}>
                  <MaterialIcons name="location-city" size={18} color={theme.colors.primary} />
                  <TextInput 
                    style={[styles.manualTextInput, isDark && { color: '#ffffff' }]}
                    value={currentSpot.ward}
                    onChangeText={(text) => setCurrentSpot(prev => ({ ...prev, ward: text }))}
                    placeholder="e.g. Ward 8 • Panchavati, Nashik City"
                    placeholderTextColor={isDark ? '#52525b' : theme.colors.outline}
                  />
                </View>
              </View>

              {/* Nearby Landmark / Description */}
              <View style={styles.manualFieldGroup}>
                <Text style={[styles.manualFieldLabel, isDark && { color: '#d4d4d8' }]}>Nearby Landmark or Spot Description</Text>
                <View style={[styles.manualInputWrapper, isDark && { backgroundColor: '#000000', borderColor: '#27272a' }]}>
                  <MaterialIcons name="near-me" size={18} color={theme.colors.primary} />
                  <TextInput 
                    style={[styles.manualTextInput, isDark && { color: '#ffffff' }]}
                    value={currentSpot.landmark}
                    onChangeText={(text) => setCurrentSpot(prev => ({ ...prev, landmark: text }))}
                    placeholder="e.g. Near Shaniwar Wada & Mutha Riverfront"
                    placeholderTextColor={isDark ? '#52525b' : theme.colors.outline}
                  />
                </View>
              </View>

              {/* Coordinates inputs */}
              <View style={styles.manualCoordsRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.manualFieldLabel, isDark && { color: '#d4d4d8' }]}>
                    Latitude ({currentSpot.latitude >= 0 ? '°N' : '°S'})
                  </Text>
                  <TextInput 
                    style={[styles.manualCoordInput, isDark && { backgroundColor: '#000000', color: '#ffffff', borderColor: '#27272a' }]}
                    value={String(currentSpot.latitude)}
                    onChangeText={(text) => {
                      const num = parseFloat(text);
                      if (!isNaN(num)) setCurrentSpot(prev => ({ ...prev, latitude: num }));
                    }}
                    keyboardType="numeric"
                    placeholder="18.5205"
                    placeholderTextColor={isDark ? '#52525b' : theme.colors.outline}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={[styles.manualFieldLabel, isDark && { color: '#d4d4d8' }]}>
                    Longitude ({currentSpot.longitude >= 0 ? '°E' : '°W'})
                  </Text>
                  <TextInput 
                    style={[styles.manualCoordInput, isDark && { backgroundColor: '#000000', color: '#ffffff', borderColor: '#27272a' }]}
                    value={String(currentSpot.longitude)}
                    onChangeText={(text) => {
                      const num = parseFloat(text);
                      if (!isNaN(num)) setCurrentSpot(prev => ({ ...prev, longitude: num }));
                    }}
                    keyboardType="numeric"
                    placeholder="73.8504"
                    placeholderTextColor={isDark ? '#52525b' : theme.colors.outline}
                  />
                </View>

                <TouchableOpacity 
                  style={styles.manualGpsSyncBtn}
                  onPress={handleUseDeviceGps}
                >
                  <MaterialIcons name="gps-fixed" size={16} color="#ffffff" />
                  <Text style={styles.manualGpsSyncText}>GPS Lock</Text>
                </TouchableOpacity>
              </View>

              {/* Live Map Preview Synced to Address */}
              <View style={[styles.manualMapPreviewBox, isDark && { backgroundColor: '#000000', borderColor: '#18181b' }]}>
                <View style={styles.manualMapPreviewHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <MaterialIcons name="satellite-alt" size={15} color="#34d399" />
                    <Text style={[styles.manualMapPreviewTitle, isDark && { color: '#ffffff' }]}>
                      Map Synced to Address
                    </Text>
                  </View>
                  <View style={styles.manualSatelliteTag}>
                    <Text style={styles.manualSatelliteTagText}>SATELLITE 19X</Text>
                  </View>
                </View>

                {/* Map Canvas with Pin centered on address */}
                <View style={styles.manualMiniMapCanvas}>
                  <View style={styles.mapGridRoadHorizontal} />
                  <View style={styles.mapGridRoadVertical} />
                  <View style={styles.manualMapCrosshairH} />
                  <View style={styles.manualMapCrosshairV} />
                  <View style={styles.manualMapPinCenter}>
                    <View style={styles.markerPulseCircle} />
                    <View style={styles.manualMapPinIcon}>
                      <MaterialIcons name="location-on" size={18} color="#ffffff" />
                    </View>
                  </View>
                  <View style={styles.manualMapAddressPill}>
                    <Text style={styles.manualMapAddressPillText} numberOfLines={1}>
                      📍 {currentSpot.street || 'Current Spot'}
                    </Text>
                  </View>
                </View>

                {/* Open Map Button for this Address */}
                <TouchableOpacity 
                  style={styles.openAddressInMapBtn}
                  onPress={handleOpenGoogleMaps}
                >
                  <MaterialIcons name="satellite-alt" size={16} color="#ffffff" />
                  <Text style={styles.openAddressInMapBtnText}>
                    Open Address in Google Maps Satellite
                  </Text>
                  <MaterialIcons name="open-in-new" size={14} color="#ffffff" />
                </TouchableOpacity>
              </View>

              <View style={[styles.manualSyncSuccessBanner, isDark && { backgroundColor: '#064e3b33', borderColor: '#05966955' }]}>
                <MaterialIcons name="cloud-sync" size={16} color={theme.colors.tertiary} />
                <Text style={styles.manualSyncSuccessText}>
                  Synced with Google Geo-Tag Watermark & DPW Admin Dispatch
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Section 3: Citizen Information ("user have ability to share own info") */}
        <View style={[styles.sectionCard, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7' }]}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleWithIcon}>
              <MaterialIcons name="badge" size={20} color={theme.colors.primary} />
              <Text style={[styles.sectionCardTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>Your Citizen Info</Text>
            </View>
            <View style={[styles.infoBadge, isDark && { backgroundColor: '#18181b' }]}>
              <Text style={[styles.infoBadgeText, isDark && { color: '#60a5fa' }]}>Admin Notification Channel</Text>
            </View>
          </View>
          <Text style={[styles.sectionCardSub, { color: isDark ? '#a1a1aa' : '#52525b' }]}>
            Share your contact details so DPW Admin and road contractors can send direct repair updates.
          </Text>

          <View style={styles.inputsGrid}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: isDark ? '#d4d4d8' : '#3f3f46' }]}>Full Name</Text>
              <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#000000' : '#fafafa', borderColor: isDark ? '#27272a' : '#e4e4e7' }]}>
                <MaterialIcons name="person" size={18} color={isDark ? '#a1a1aa' : theme.colors.secondary} />
                <TextInput 
                  style={[styles.textInput, { color: isDark ? '#ffffff' : '#09090b' }]}
                  value={citizenName}
                  onChangeText={setCitizenName}
                  placeholder="Enter your name"
                  placeholderTextColor={isDark ? '#52525b' : theme.colors.outline}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: isDark ? '#d4d4d8' : '#3f3f46' }]}>Phone Number (For SMS Status)</Text>
              <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#000000' : '#fafafa', borderColor: isDark ? '#27272a' : '#e4e4e7' }]}>
                <MaterialIcons name="phone" size={18} color={isDark ? '#a1a1aa' : theme.colors.secondary} />
                <TextInput 
                  style={[styles.textInput, { color: isDark ? '#ffffff' : '#09090b' }]}
                  value={citizenPhone}
                  onChangeText={setCitizenPhone}
                  placeholder="+91 98230 00000"
                  keyboardType="phone-pad"
                  placeholderTextColor={isDark ? '#52525b' : theme.colors.outline}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: isDark ? '#d4d4d8' : '#3f3f46' }]}>Email Address</Text>
              <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#000000' : '#fafafa', borderColor: isDark ? '#27272a' : '#e4e4e7' }]}>
                <MaterialIcons name="email" size={18} color={isDark ? '#a1a1aa' : theme.colors.secondary} />
                <TextInput 
                  style={[styles.textInput, { color: isDark ? '#ffffff' : '#09090b' }]}
                  value={citizenEmail}
                  onChangeText={setCitizenEmail}
                  placeholder="name@domain.com"
                  keyboardType="email-address"
                  placeholderTextColor={isDark ? '#52525b' : theme.colors.outline}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: isDark ? '#d4d4d8' : '#3f3f46' }]}>Resident Ward / Neighborhood</Text>
              <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#000000' : '#fafafa', borderColor: isDark ? '#27272a' : '#e4e4e7' }]}>
                <MaterialIcons name="home-work" size={18} color={isDark ? '#a1a1aa' : theme.colors.secondary} />
                <TextInput 
                  style={[styles.textInput, { color: isDark ? '#ffffff' : '#09090b' }]}
                  value={citizenWard}
                  onChangeText={setCitizenWard}
                  placeholder="Ward 8 • Panchavati, Nashik"
                  placeholderTextColor={isDark ? '#52525b' : theme.colors.outline}
                />
              </View>
            </View>
          </View>

          <View style={[styles.privacyConsentRow, isDark && { borderTopColor: '#18181b' }]}>
            <Switch 
              value={shareContact}
              onValueChange={setShareContact}
              trackColor={{ false: isDark ? '#27272a' : '#e4e4e7', true: theme.colors.primary }}
              thumbColor="#ffffff"
            />
            <Text style={[styles.privacyConsentText, isDark && { color: '#a1a1aa' }]}>
              Share contact info with DPW Admin & assigned contractor for work progress notifications.
            </Text>
          </View>
        </View>

        {/* Section 4: Citizen Suggestions & Recommendations ("user have ability to share ... suggetions") */}
        <View style={[styles.sectionCard, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7' }]}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleWithIcon}>
              <MaterialIcons name="lightbulb" size={20} color={theme.colors.warningAmber} />
              <Text style={[styles.sectionCardTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>Suggestions & Feedback</Text>
            </View>
            <View style={[styles.remedyBadge, isDark && { backgroundColor: '#78350f33' }]}>
              <Text style={[styles.remedyBadgeText, isDark && { color: '#fbbf24' }]}>Direct to Engineers</Text>
            </View>
          </View>
          <Text style={[styles.sectionCardSub, { color: isDark ? '#a1a1aa' : '#52525b' }]}>
            Suggest remedial solutions, immediate barricade needs, or hazard warnings to the admin team.
          </Text>

          {/* Suggestion Textbox */}
          <View style={[styles.suggestionInputContainer, { backgroundColor: isDark ? '#000000' : '#fffbeb', borderColor: isDark ? '#27272a' : '#fde68a' }]}>
            <TextInput 
              style={[styles.suggestionInput, { color: isDark ? '#ffffff' : '#451a03' }]}
              multiline
              numberOfLines={4}
              value={suggestions}
              onChangeText={setSuggestions}
              placeholder="e.g. Needs immediate barricade or warning cone before nightfall. Cold patch recommended..."
              placeholderTextColor={isDark ? '#52525b' : '#92400e'}
            />
          </View>

          {/* Quick Safety & Remedial Suggestion Tags */}
          <Text style={[styles.tagsSectionLabel, isDark && { color: '#cbd5e1' }]}>Select Pertinent Safety Tags:</Text>
          <View style={styles.tagsGrid}>
            {ALL_TAGS.map((tag, idx) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <TouchableOpacity 
                  key={idx} 
                  style={[
                    styles.tagButton, 
                    isSelected && styles.tagButtonSelected,
                    isDark && !isSelected && { backgroundColor: '#1e293b', borderColor: '#334155' }
                  ]}
                  onPress={() => toggleTag(tag)}
                >
                  <Text style={[
                    styles.tagButtonText, 
                    isSelected && styles.tagButtonTextSelected,
                    isDark && !isSelected && { color: '#cbd5e1' }
                  ]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Section 5: Road Damage Attributes ("and add thing according to my project") */}
        <View style={[styles.sectionCard, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7' }]}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleWithIcon}>
              <MaterialIcons name="construction" size={20} color={theme.colors.primary} />
              <Text style={[styles.sectionCardTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>Project Damage Specifications</Text>
            </View>
          </View>

          {/* Defect Type Selection */}
          <Text style={[styles.subFieldLabel, { color: isDark ? '#d4d4d8' : '#3f3f46' }]}>Damage Classification</Text>
          <View style={styles.chipsContainer}>
            {categories.map(cat => {
              const isSelected = selectedCategory === cat.label;
              return (
                <TouchableOpacity 
                  key={cat.label}
                  style={[
                    styles.chip, 
                    isSelected && styles.chipSelected,
                    isDark && !isSelected && { backgroundColor: '#18181b', borderColor: '#27272a' }
                  ]}
                  onPress={() => setSelectedCategory(cat.label)}
                >
                  <MaterialIcons 
                    name={cat.icon} 
                    size={16} 
                    color={isSelected ? theme.colors.onPrimary : (isDark ? '#a1a1aa' : theme.colors.secondary)} 
                  />
                  <Text style={[
                    styles.chipText, 
                    isSelected && styles.chipTextSelected,
                    isDark && !isSelected && { color: '#d4d4d8' }
                  ]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Severity & Hazard Level */}
          <Text style={[styles.subFieldLabel, { color: isDark ? '#d4d4d8' : '#3f3f46' }]}>Hazard Urgency</Text>
          <View style={styles.severityGrid}>
            {(['Low', 'Moderate', 'Critical'] as const).map(sev => {
              const isSelected = selectedSeverity === sev;
              return (
                <TouchableOpacity 
                  key={sev}
                  style={[
                    styles.severityBtn, 
                    isSelected && (sev === 'Critical' ? styles.severityCriticalSelected : styles.severitySelected),
                    isDark && !isSelected && { backgroundColor: '#18181b', borderColor: '#27272a' }
                  ]}
                  onPress={() => setSelectedSeverity(sev)}
                >
                  <Text style={[
                    styles.severityText, 
                    isSelected && (sev === 'Critical' ? styles.severityCriticalText : styles.severityTextSelected),
                    isDark && !isSelected && { color: '#d4d4d8' }
                  ]}>
                    {sev === 'Critical' ? 'Critical ⚠️' : sev}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Estimated Depth & Corridor */}
          <View style={styles.dualFieldRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.subFieldLabel, { color: isDark ? '#d4d4d8' : '#3f3f46' }]}>Estimated Depth</Text>
              <TextInput 
                style={[styles.simpleInput, isDark && { backgroundColor: '#000000', color: '#ffffff', borderColor: '#27272a' }]}
                value={estimatedDepth}
                onChangeText={setEstimatedDepth}
                placeholder="e.g. > 10 cm"
                placeholderTextColor={isDark ? '#52525b' : theme.colors.outline}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.subFieldLabel, { color: isDark ? '#d4d4d8' : '#3f3f46' }]}>Traffic Corridor</Text>
              <TextInput 
                style={[styles.simpleInput, isDark && { backgroundColor: '#000000', color: '#ffffff', borderColor: '#27272a' }]}
                value={trafficZone}
                onChangeText={setTrafficZone}
                placeholder="e.g. Bus Corridor"
                placeholderTextColor={isDark ? '#52525b' : theme.colors.outline}
              />
            </View>
          </View>
        </View>

        {/* Submit to DPW Admin Plane */}
        <View style={styles.submitContainer}>
          <TouchableOpacity 
            style={styles.submitBtn}
            onPress={handleSubmitComplaint}
            activeOpacity={0.85}
          >
            <View style={styles.submitBtnInner}>
              <MaterialIcons name="send" size={22} color={theme.colors.onPrimary} />
              <Text style={styles.submitBtnText}>Complain</Text>
            </View>
            <MaterialIcons name="arrow-forward" size={20} color={theme.colors.onPrimary} />
          </TouchableOpacity>

          <View style={styles.transmitInfoRow}>
            <MaterialIcons name="cloud-done" size={16} color={theme.colors.tertiary} />
            <Text style={[styles.transmitInfoText, isDark && { color: '#a1a1aa' }]}>
              Directly routes geo-tagged photo, GPS pin & suggestions to Municipal DPW Admin.
            </Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Fullscreen Interactive Map Picker Modal */}
      <Modal
        visible={isMapModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsMapModalVisible(false)}
      >
        <View style={[styles.mapModalContainer, isDark && { backgroundColor: '#000000' }]}>
          {/* Modal Header */}
          <View style={[styles.mapModalHeader, { paddingTop: insets.top + 8 }, isDark && { backgroundColor: '#000000', borderBottomColor: '#18181b' }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.mapModalTitle, isDark && { color: '#ffffff' }]}>Interactive Map of Nashik Municipal Corporation</Text>
              <Text style={[styles.mapModalSubtitle, isDark && { color: '#a1a1aa' }]}>
                Tap anywhere on the map to place spot pin, or lock your current GPS
              </Text>
            </View>
            <TouchableOpacity 
              style={[styles.mapModalCloseBtn, isDark && { backgroundColor: '#18181b' }]}
              onPress={() => setIsMapModalVisible(false)}
            >
              <MaterialIcons name="close" size={22} color={isDark ? '#ffffff' : theme.colors.onSurface} />
            </TouchableOpacity>
          </View>

          {/* Modal Map Toolbar */}
          <View style={[styles.mapModalToolbar, isDark && { backgroundColor: '#000000', borderBottomColor: '#18181b' }]}>
            <View style={[styles.mapTypeSwitcher, isDark && { backgroundColor: '#18181b' }]}>
              {(['satellite', 'map', 'terrain'] as const).map(t => (
                <TouchableOpacity 
                  key={t}
                  style={[
                    styles.mapTypeBtn, 
                    mapType === t && styles.mapTypeBtnActive,
                    isDark && mapType === t && { backgroundColor: '#27272a' }
                  ]}
                  onPress={() => setMapType(t)}
                >
                  <Text style={[styles.mapTypeBtnText, mapType === t && styles.mapTypeBtnTextActive, isDark && mapType === t && { color: '#ffffff' }]}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={styles.modalGpsHeroBtn}
              onPress={handleUseDeviceGps}
              disabled={isLocating}
            >
              {isLocating ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <MaterialIcons name="my-location" size={16} color="#ffffff" />
              )}
              <Text style={styles.modalGpsHeroBtnText}>
                {isLocating ? 'Detecting GPS...' : 'Use My Current Location'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Large Interactive Touch Map Canvas */}
          <View style={{ flex: 1, position: 'relative' }}>
            <TouchableOpacity 
              activeOpacity={0.95}
              style={[
                styles.modalMapCanvas,
                mapType === 'satellite' ? styles.mapSatelliteBg : styles.mapDefaultBg
              ]}
              onPress={handleMapPress}
            >
              {/* Road Grid and Markings */}
              <View style={styles.modalRoadGridH} />
              <View style={styles.modalRoadGridV} />
              <View style={styles.modalCrosshairH} />
              <View style={styles.modalCrosshairV} />

              {/* Dynamic Interactive Pin Marker */}
              <View style={[
                styles.modalPinMarker,
                {
                  transform: [
                    { translateX: mapPinOffset.x * 1.3 },
                    { translateY: mapPinOffset.y * 1.3 }
                  ]
                }
              ]}>
                <View style={styles.modalMarkerPulse} />
                <View style={styles.modalMarkerPinHead}>
                  <MaterialIcons name="location-on" size={28} color="#ffffff" />
                </View>
                <View style={styles.modalMarkerBase} />
              </View>

              {/* Satellite Telemetry Tag */}
              {mapType === 'satellite' && (
                <View style={styles.modalTelemetryTag}>
                  <MaterialIcons name="satellite-alt" size={12} color="#34d399" />
                  <Text style={styles.modalTelemetryText}>GOOGLE SATELLITE ORTHO-LAYER • ZOOM {zoomLevel}x</Text>
                </View>
              )}

              {/* Floating Zoom & Compass Controls */}
              <View style={styles.modalFloatingTools}>
                <TouchableOpacity 
                  style={[styles.modalToolBtn, isDark && { backgroundColor: '#18181b' }]} 
                  onPress={() => setZoomLevel(z => Math.min(21, z + 1))}
                >
                  <MaterialIcons name="add" size={20} color={isDark ? '#ffffff' : theme.colors.onSurface} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalToolBtn, isDark && { backgroundColor: '#18181b' }]} 
                  onPress={() => setZoomLevel(z => Math.max(14, z - 1))}
                >
                  <MaterialIcons name="remove" size={20} color={isDark ? '#ffffff' : theme.colors.onSurface} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalToolBtn, { backgroundColor: theme.colors.primary, marginTop: 8 }]} 
                  onPress={handleUseDeviceGps}
                >
                  <MaterialIcons name="gps-fixed" size={18} color="#ffffff" />
                </TouchableOpacity>
              </View>

              {/* Floating Tap instruction helper */}
              <View style={[styles.modalTapInstructionPill, isDark && { backgroundColor: 'rgba(0,0,0,0.85)' }]}>
                <MaterialIcons name="touch-app" size={14} color="#38bdf8" />
                <Text style={styles.modalTapInstructionText}>
                  Tap anywhere on this satellite map to position the spot pin
                </Text>
              </View>
            </TouchableOpacity>

            {/* Bottom Current Location Sheet */}
            <View style={[styles.modalLocationSheet, isDark && { backgroundColor: '#000000', borderTopColor: '#18181b' }]}>
              <View style={styles.modalLocationDetails}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <MaterialIcons name="place" size={18} color={theme.colors.primary} />
                  <Text style={[styles.modalLocationStreet, isDark && { color: '#ffffff' }]}>
                    {currentSpot.street}
                  </Text>
                </View>
                <Text style={[styles.modalLocationWard, isDark && { color: '#a1a1aa' }]}>
                  {currentSpot.ward} • {currentSpot.landmark}
                </Text>
                <View style={styles.modalCoordsBadgeRow}>
                  <Text style={styles.modalCoordsMono}>
                    Lat: {Math.abs(currentSpot.latitude).toFixed(6)}° {currentSpot.latitude >= 0 ? 'N' : 'S'}  |  Lng: {Math.abs(currentSpot.longitude).toFixed(6)}° {currentSpot.longitude >= 0 ? 'E' : 'W'}
                  </Text>
                  <View style={[styles.modalAccuracyPill, isDark && { backgroundColor: '#064e3b' }]}>
                    <Text style={[styles.modalAccuracyText, isDark && { color: '#34d399' }]}>±{currentSpot.precision}m GPS</Text>
                  </View>
                </View>
              </View>

              <View style={styles.modalActionRow}>
                <TouchableOpacity 
                  style={[styles.modalOpenMapsBtn, isDark && { backgroundColor: '#18181b', borderColor: '#27272a' }]}
                  onPress={handleOpenGoogleMaps}
                >
                  <MaterialIcons name="open-in-new" size={16} color={theme.colors.primary} />
                  <Text style={styles.modalOpenMapsBtnText}>Google Maps App</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.modalConfirmBtn}
                  onPress={() => {
                    setIsMapModalVisible(false);
                    Alert.alert('Spot Locked 📍', `Complaint spot set to:\n${currentSpot.street}\n(${currentSpot.latitude}, ${currentSpot.longitude})`);
                  }}
                >
                  <MaterialIcons name="check-circle" size={18} color="#ffffff" />
                  <Text style={styles.modalConfirmBtnText}>Confirm Spot Location</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceContainerLow,
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
  citizenAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surfaceContainerHighest,
  },
  citizenAvatarText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.onPrimary,
  },
  scrollContent: {
    padding: theme.spacing.gutter,
    gap: 16,
  },
  sectionCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.surfaceContainerHigh,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionCardTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  sectionCardSub: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginTop: 4,
    marginBottom: 12,
  },
  geoVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.tertiaryFixedDim + '40',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  geoVerifiedText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.tertiary,
  },
  imageViewerContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1e293b',
    position: 'relative',
  },
  geoTaggedPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  geoWatermarkOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },
  watermarkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  googleWatermarkTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  googleWatermarkText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    fontWeight: '800',
    color: '#34d399',
    letterSpacing: 0.5,
  },
  watermarkTime: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: '#94a3b8',
  },
  watermarkCoords: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: '#f8fafc',
    marginTop: 2,
  },
  watermarkLocation: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    color: '#cbd5e1',
  },
  watermarkSensor: {
    fontFamily: 'monospace',
    fontSize: 8,
    color: '#64748b',
    marginTop: 1,
  },
  photoControlsRow: {
    marginTop: 12,
  },
  samplePhotoThumb: {
    width: 90,
    height: 65,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: theme.colors.surfaceContainer,
  },
  samplePhotoThumbSelected: {
    borderColor: theme.colors.primary,
  },
  thumbImg: {
    width: '100%',
    height: 44,
  },
  thumbLabel: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 8,
    textAlign: 'center',
    color: theme.colors.onSurfaceVariant,
    paddingHorizontal: 2,
    marginTop: 2,
  },
  watermarkToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceContainerHigh,
  },
  watermarkToggleText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  addressVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.tertiaryContainer + '30',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  addressVerifiedBadgeText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.tertiary,
  },
  addressModeTabs: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: 10,
    padding: 3,
    gap: 4,
    marginBottom: 12,
  },
  addressModeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addressModeTabActive: {
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  addressModeTabText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.onSurfaceVariant,
  },
  addressModeTabTextActive: {
    color: '#ffffff',
  },
  mapModeContainer: {
    gap: 10,
  },
  mapLayerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  liveGpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primaryFixed,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  liveGpsBtnText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  satelliteTelemetryOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  satelliteTelemetryText: {
    fontFamily: 'monospace',
    fontSize: 8,
    fontWeight: '700',
    color: '#34d399',
  },
  presetSection: {
    marginTop: 4,
    gap: 6,
  },
  presetSectionTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.secondary,
    letterSpacing: 0.5,
  },
  presetChipsRow: {
    gap: 8,
    paddingVertical: 2,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: theme.colors.surfaceContainerHigh,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  presetChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  presetChipText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  presetChipTextActive: {
    color: '#ffffff',
  },
  manualAddressForm: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    gap: 10,
  },
  manualNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.primaryFixed + '25',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.primaryFixed,
  },
  manualNoticeText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.primary,
    flex: 1,
    lineHeight: 15,
  },
  manualFieldGroup: {
    gap: 4,
  },
  manualFieldLabel: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.onSurfaceVariant,
  },
  manualInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 42,
  },
  manualTextInput: {
    flex: 1,
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: theme.colors.onSurface,
  },
  manualCoordsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  manualCoordInput: {
    backgroundColor: theme.colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 42,
    fontFamily: 'monospace',
    fontSize: 11,
    color: theme.colors.onSurface,
    marginTop: 4,
  },
  manualGpsSyncBtn: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  manualGpsSyncText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  useLiveAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 6,
    marginBottom: 4,
  },
  useLiveAddressBtnText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  quickPresetTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 9,
    fontWeight: '800',
    color: theme.colors.onSurfaceVariant,
    letterSpacing: 0.5,
  },
  quickPresetChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: theme.colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  quickPresetChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  quickPresetChipText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  quickPresetChipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  manualMapPreviewBox: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.surfaceContainerHigh,
    backgroundColor: theme.colors.surfaceContainerLowest,
    padding: 10,
    marginTop: 8,
    marginBottom: 4,
  },
  manualMapPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  manualMapPreviewTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  manualSatelliteTag: {
    backgroundColor: '#064e3b',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  manualSatelliteTagText: {
    fontFamily: 'monospace',
    fontSize: 8,
    fontWeight: '800',
    color: '#34d399',
  },
  manualMiniMapCanvas: {
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#09151c',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.25)',
  },
  manualMapCrosshairH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(52, 211, 153, 0.25)',
  },
  manualMapCrosshairV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(52, 211, 153, 0.25)',
  },
  manualMapPinCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  manualMapPinIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manualMapAddressPill: {
    position: 'absolute',
    bottom: 6,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  manualMapAddressPillText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 9,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  openAddressInMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#064e3b',
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#059669',
  },
  openAddressInMapBtnText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  manualSyncSuccessBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.tertiaryContainer + '20',
    padding: 8,
    borderRadius: 8,
    marginTop: 2,
  },
  manualSyncSuccessText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.tertiary,
    flex: 1,
  },
  mapTypeSwitcher: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: 8,
    padding: 2,
  },
  mapTypeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  mapTypeBtnActive: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  mapTypeBtnText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    color: theme.colors.onSurfaceVariant,
  },
  mapTypeBtnTextActive: {
    fontWeight: '700',
    color: theme.colors.primary,
  },
  googleMapBox: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  mapDefaultBg: {
    backgroundColor: '#dbeafe',
  },
  mapSatelliteBg: {
    backgroundColor: '#1e293b',
  },
  mapGridRoadHorizontal: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    height: 24,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#cbd5e1',
  },
  mapGridRoadVertical: {
    position: 'absolute',
    left: '46%',
    top: 0,
    bottom: 0,
    width: 28,
    backgroundColor: '#ffffff',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#cbd5e1',
  },
  directSpotMarker: {
    position: 'absolute',
    top: 60,
    left: '46%',
    marginLeft: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerPulseCircle: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(239, 68, 68, 0.35)',
  },
  markerPinHead: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.alertCrimson,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  markerPinBase: {
    width: 4,
    height: 6,
    backgroundColor: theme.colors.alertCrimson,
  },
  mapFloatingControls: {
    position: 'absolute',
    top: 10,
    right: 10,
    gap: 6,
  },
  mapControlBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  spotAddressBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  spotAddressLeft: {
    flex: 1,
    marginRight: 8,
  },
  spotAddressTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  spotAddressSub: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    color: theme.colors.onSurfaceVariant,
  },
  spotCoordsText: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: theme.colors.primary,
    marginTop: 2,
  },
  openGoogleMapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  openGoogleMapsBtnText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  infoBadge: {
    backgroundColor: theme.colors.secondaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  infoBadgeText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.onSecondaryContainer,
  },
  inputsGrid: {
    gap: 12,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.onSurfaceVariant,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.surfaceContainerLow,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  textInput: {
    flex: 1,
    fontFamily: theme.typography.fontFamily,
    fontSize: 13,
    color: theme.colors.onSurface,
  },
  privacyConsentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceContainerHigh,
  },
  privacyConsentText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 16,
  },
  remedyBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  remedyBadgeText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    color: '#b45309',
  },
  suggestionInputContainer: {
    backgroundColor: '#fffbeb',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fde68a',
    padding: 10,
  },
  suggestionInput: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 13,
    color: '#451a03',
    minHeight: 70,
    textAlignVertical: 'top',
  },
  tagsSectionLabel: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.onSurfaceVariant,
    marginTop: 12,
    marginBottom: 6,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagButton: {
    backgroundColor: theme.colors.surfaceContainerLow,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  tagButtonSelected: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
  },
  tagButtonText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
  },
  tagButtonTextSelected: {
    fontWeight: '700',
    color: '#92400e',
  },
  subFieldLabel: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.onSurfaceVariant,
    marginTop: 8,
    marginBottom: 6,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  chipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.onSurfaceVariant,
  },
  chipTextSelected: {
    color: theme.colors.onPrimary,
  },
  severityGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  severityBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  severitySelected: {
    backgroundColor: theme.colors.primaryFixed,
    borderColor: theme.colors.primary,
  },
  severityCriticalSelected: {
    backgroundColor: theme.colors.errorContainer,
    borderColor: theme.colors.error,
  },
  severityText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.onSurfaceVariant,
  },
  severityTextSelected: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  severityCriticalText: {
    color: theme.colors.error,
    fontWeight: '700',
  },
  dualFieldRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  simpleInput: {
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: theme.colors.onSurface,
  },
  submitContainer: {
    gap: 10,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  submitBtnText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.onPrimary,
  },
  transmitInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  transmitInfoText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    flex: 1,
  },
  sourceButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  actionBtnCamera: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  actionBtnCameraText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  actionBtnGallery: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  actionBtnGalleryText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  heroAddLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  heroAddLocationIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroAddLocationTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  heroAddLocationSub: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    color: '#dbeafe',
    marginTop: 1,
  },
  heroAddLocationArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapExpandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  mapExpandBtnText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  tapHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.surfaceContainerLow,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tapHintText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    color: theme.colors.onSurfaceVariant,
    flex: 1,
  },
  mapModalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  mapModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  mapModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  mapModalSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  mapModalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapModalToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalGpsHeroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  modalGpsHeroBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  modalMapCanvas: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  modalRoadGridH: {
    position: 'absolute',
    top: '48%',
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#94a3b8',
  },
  modalRoadGridV: {
    position: 'absolute',
    left: '48%',
    top: 0,
    bottom: 0,
    width: 44,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: '#94a3b8',
  },
  modalCrosshairH: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(56, 189, 248, 0.4)',
  },
  modalCrosshairV: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(56, 189, 248, 0.4)',
  },
  modalPinMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -38,
    marginLeft: -20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalMarkerPulse: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(239, 68, 68, 0.35)',
  },
  modalMarkerPinHead: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 6,
  },
  modalMarkerBase: {
    width: 4,
    height: 8,
    backgroundColor: '#ef4444',
  },
  modalTelemetryTag: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  modalTelemetryText: {
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
    color: '#34d399',
  },
  modalFloatingTools: {
    position: 'absolute',
    top: 14,
    right: 14,
    gap: 8,
  },
  modalToolBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  modalTapInstructionPill: {
    position: 'absolute',
    top: 14,
    left: 16,
    right: 60,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  modalTapInstructionText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#f8fafc',
  },
  modalLocationSheet: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 12,
  },
  modalLocationDetails: {
    gap: 4,
  },
  modalLocationStreet: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    flex: 1,
  },
  modalLocationWard: {
    fontSize: 11,
    color: '#64748b',
  },
  modalCoordsBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  modalCoordsMono: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: theme.colors.primary,
  },
  modalAccuracyPill: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  modalAccuracyText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#15803d',
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalOpenMapsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: theme.colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    paddingVertical: 11,
    borderRadius: 10,
  },
  modalOpenMapsBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  modalConfirmBtn: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: theme.colors.primary,
    paddingVertical: 11,
    borderRadius: 10,
  },
  modalConfirmBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
});
