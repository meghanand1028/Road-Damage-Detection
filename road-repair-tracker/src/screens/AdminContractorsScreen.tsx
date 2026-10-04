
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Modal, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useTheme } from '../context/ThemeContext';
import { REGISTERED_CONTRACTORS, ContractorProfile } from '../services/contractorEmailStore';

export function AdminContractorsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const filteredContractors = REGISTERED_CONTRACTORS.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.assignedWards.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: isDark ? '#000000' : '#ffffff' }]}>
      <View style={[styles.header, { backgroundColor: isDark ? '#000000' : '#ffffff', borderBottomColor: isDark ? '#18181b' : '#e4e4e7', borderBottomWidth: 1 }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.headerTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>Contractor Directory</Text>
            <View style={styles.headerSubtitleRow}>
              <View style={styles.tertiaryDot} />
              <Text style={[styles.headerSubtitle, { color: isDark ? '#a1a1aa' : '#71717a' }]}>
                {REGISTERED_CONTRACTORS.length} Registered Municipal Road Contractors
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity 
              style={[styles.registerBtn, { backgroundColor: theme.colors.primary }]} 
              onPress={() => navigation.navigate('AdminEmails')}
            >
              <MaterialIcons name="mail" size={16} color="#ffffff" />
              <Text style={styles.registerBtnText}>Emails</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: isDark ? '#18181b' : '#f4f4f5', borderColor: isDark ? '#27272a' : '#e4e4e7', borderWidth: 1 }]}>
          <MaterialIcons name="search" size={20} color={isDark ? '#a1a1aa' : theme.colors.outline} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: isDark ? '#ffffff' : '#09090b' }]}
            placeholder="Search contractor, road specialty or ward..."
            placeholderTextColor={isDark ? '#71717a' : theme.colors.outline}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Metric Tiles */}
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7', borderWidth: 1 }]}>
            <View style={styles.metricHeader}>
              <Text style={[styles.metricLabel, { color: isDark ? '#a1a1aa' : '#71717a' }]} numberOfLines={1}>Firms Active</Text>
              <MaterialIcons name="business" size={18} color={theme.colors.primary} />
            </View>
            <Text style={[styles.metricValue, { color: isDark ? '#ffffff' : '#09090b' }]}>{REGISTERED_CONTRACTORS.length}</Text>
            <View style={styles.metricTrend}>
              <MaterialIcons name="verified" size={12} color={theme.colors.tertiary} />
              <Text style={styles.metricTrendText}>DPW Certified</Text>
            </View>
          </View>
          
          <View style={[styles.metricCard, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7', borderWidth: 1 }]}>
            <View style={styles.metricHeader}>
              <Text style={[styles.metricLabel, { color: isDark ? '#a1a1aa' : '#71717a' }]} numberOfLines={1}>Avg SLA</Text>
              <MaterialIcons name="speed" size={18} color={theme.colors.tertiary} />
            </View>
            <Text style={[styles.metricValue, { color: isDark ? '#ffffff' : '#09090b' }]}>97.4%</Text>
            <View style={styles.metricTrend}>
              <Text style={[styles.metricTrendText, { color: isDark ? '#a1a1aa' : theme.colors.onSurfaceVariant }]}>High compliance</Text>
            </View>
          </View>

          <View style={[styles.metricCard, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7', borderWidth: 1 }]}>
            <View style={styles.metricHeader}>
              <Text style={[styles.metricLabel, { color: isDark ? '#a1a1aa' : '#71717a' }]} numberOfLines={1}>Crews On-Duty</Text>
              <MaterialIcons name="groups" size={18} color={theme.colors.secondary} />
            </View>
            <Text style={[styles.metricValue, { color: isDark ? '#ffffff' : '#09090b' }]}>14<Text style={[styles.metricValueSmall, { color: isDark ? '#71717a' : theme.colors.onSurfaceVariant }]}>/18</Text></Text>
            <View style={styles.metricTrend}>
              <Text style={[styles.metricTrendText, { color: isDark ? '#a1a1aa' : theme.colors.onSurfaceVariant }]}>4 Standby</Text>
            </View>
          </View>
        </View>

        {/* Contractor Cards */}
        <View style={styles.cardContainer}>
          {filteredContractors.map((c) => (
            <View 
              key={c.id}
              style={[styles.contractorCard, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7', borderWidth: 1 }]}
            >
              <View style={styles.cardTop}>
                <View style={[styles.contractorIconBox, { backgroundColor: theme.colors.primary }]}>
                  <MaterialIcons name="engineering" size={22} color="#ffffff" />
                </View>
                <View style={styles.cardInfo}>
                  <View style={styles.cardTitleRow}>
                    <Text style={[styles.cardTitle, { color: isDark ? '#ffffff' : '#09090b' }]} numberOfLines={1}>{c.name}</Text>
                    <MaterialIcons name="verified" size={16} color={theme.colors.primary} />
                  </View>
                  <View style={styles.cardSubtitleRow}>
                    <View style={styles.statusBadgeBusy}>
                      <Text style={styles.statusBadgeBusyText}>{c.capacity}</Text>
                    </View>
                    <Text style={[styles.activeCount, { color: isDark ? '#a1a1aa' : theme.colors.onSurfaceVariant }]}>
                      {c.activeCrews}/{c.totalCrews} Crews Active
                    </Text>
                  </View>
                </View>
              </View>

              <View style={[styles.tradeTag, { backgroundColor: isDark ? '#18181b' : '#f4f4f5' }]}>
                <MaterialIcons name="layers" size={15} color={theme.colors.primary} />
                <Text style={[styles.tradeTagText, { color: isDark ? '#ffffff' : '#09090b' }]}>{c.specialty}</Text>
              </View>

              <View style={[styles.detailGrid, { backgroundColor: isDark ? '#09090b' : '#f4f4f5' }]}>
                <View style={styles.detailItem}>
                  <MaterialIcons name="location-on" size={16} color={isDark ? '#a1a1aa' : theme.colors.outline} />
                  <Text style={[styles.detailText, { color: isDark ? '#a1a1aa' : theme.colors.onSurfaceVariant }]} numberOfLines={1}>{c.assignedWards}</Text>
                </View>
                <View style={styles.detailItem}>
                  <MaterialIcons name="person" size={16} color={isDark ? '#a1a1aa' : theme.colors.outline} />
                  <Text style={[styles.detailText, { color: isDark ? '#a1a1aa' : theme.colors.onSurfaceVariant }]} numberOfLines={1}>{c.contactPerson.split('(')[0]}</Text>
                </View>
                <View style={styles.detailItem}>
                  <MaterialIcons name="star" size={16} color={theme.colors.tertiary} />
                  <Text style={[styles.detailTextBold, { color: isDark ? '#ffffff' : '#09090b' }]}>★ {c.rating}</Text>
                </View>
                <View style={styles.detailItem}>
                  <MaterialIcons name="verified-user" size={16} color={theme.colors.primary} />
                  <Text style={[styles.detailTextBold, { color: isDark ? '#ffffff' : '#09090b' }]}>{c.slaPercent}% SLA</Text>
                </View>
              </View>

              {/* Action Row */}
              <View style={styles.actionRow}>
                <TouchableOpacity 
                  style={[styles.primaryActionBtn, { backgroundColor: theme.colors.primary }]}
                  onPress={() => navigation.navigate('AdminEmails', { prefillContractorId: c.id })}
                >
                  <MaterialIcons name="email" size={16} color="#ffffff" />
                  <Text style={styles.primaryActionText}>Email Work Order</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.secondaryActionBtn, { backgroundColor: isDark ? '#18181b' : '#f4f4f5' }]}
                  onPress={() => navigation.navigate('AdminContractorDetail', { contractorId: c.id })}
                >
                  <MaterialIcons name="analytics" size={16} color={isDark ? '#ffffff' : theme.colors.onSurface} />
                  <Text style={[styles.secondaryActionText, { color: isDark ? '#ffffff' : theme.colors.onSurface }]}>Details</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.iconActionBtn, { backgroundColor: isDark ? '#18181b' : '#f4f4f5' }]}
                  onPress={() => Linking.openURL(`tel:${c.phone}`).catch(() => {})}
                >
                  <MaterialIcons name="call" size={18} color={isDark ? '#ffffff' : theme.colors.onSurface} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Registration Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#000000' : '#ffffff', borderTopColor: isDark ? '#18181b' : '#e4e4e7', borderTopWidth: 1 }]}>
            <View style={[styles.modalHeader, { borderBottomColor: isDark ? '#18181b' : '#e4e4e7' }]}>
              <View style={styles.modalHeaderLeft}>
                <View style={[styles.modalIconBox, { backgroundColor: isDark ? '#18181b' : theme.colors.primary + '1A' }]}>
                  <MaterialIcons name="engineering" size={20} color={theme.colors.primary} />
                </View>
                <View>
                  <Text style={[styles.modalTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>Onboard Contractor</Text>
                  <Text style={[styles.modalSubtitle, { color: isDark ? '#a1a1aa' : '#71717a' }]}>Register new road maintenance provider</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setIsModalVisible(false)} style={[styles.modalCloseBtn, { backgroundColor: isDark ? '#18181b' : '#f4f4f5' }]}>
                <MaterialIcons name="close" size={20} color={isDark ? '#ffffff' : theme.colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: isDark ? '#a1a1aa' : '#71717a' }]}>Company / Crew Name</Text>
                <TextInput 
                  style={[styles.input, { backgroundColor: isDark ? '#18181b' : '#f4f4f5', color: isDark ? '#ffffff' : '#09090b', borderColor: isDark ? '#27272a' : '#e4e4e7', borderWidth: 1 }]} 
                  placeholder="e.g. Keystone Roadways LLC" 
                  placeholderTextColor={isDark ? '#71717a' : undefined}
                />
              </View>
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.label, { color: isDark ? '#a1a1aa' : '#71717a' }]}>License #</Text>
                  <TextInput 
                    style={[styles.input, { backgroundColor: isDark ? '#18181b' : '#f4f4f5', color: isDark ? '#ffffff' : '#09090b', borderColor: isDark ? '#27272a' : '#e4e4e7', borderWidth: 1 }]} 
                    placeholder="MC-2024-981" 
                    placeholderTextColor={isDark ? '#71717a' : undefined}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.label, { color: isDark ? '#a1a1aa' : '#71717a' }]}>Assigned Wards</Text>
                  <TextInput 
                    style={[styles.input, { backgroundColor: isDark ? '#18181b' : '#f4f4f5', color: isDark ? '#ffffff' : '#09090b', borderColor: isDark ? '#27272a' : '#e4e4e7', borderWidth: 1 }]} 
                    placeholder="Ward 2, 3, 6" 
                    placeholderTextColor={isDark ? '#71717a' : undefined}
                  />
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: isDark ? '#a1a1aa' : '#71717a' }]}>Dispatch Lead Phone</Text>
                <TextInput 
                  style={[styles.input, { backgroundColor: isDark ? '#18181b' : '#f4f4f5', color: isDark ? '#ffffff' : '#09090b', borderColor: isDark ? '#27272a' : '#e4e4e7', borderWidth: 1 }]} 
                  placeholder="+1 (555) 000-0000" 
                  keyboardType="phone-pad" 
                  placeholderTextColor={isDark ? '#71717a' : undefined}
                />
              </View>
              
              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalCancelBtn, { backgroundColor: isDark ? '#18181b' : '#f4f4f5' }]} onPress={() => setIsModalVisible(false)}>
                  <Text style={[styles.modalCancelText, { color: isDark ? '#ffffff' : '#09090b' }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalSubmitBtn} onPress={() => setIsModalVisible(false)}>
                  <Text style={styles.modalSubmitText}>Complete Registration</Text>
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
    paddingHorizontal: theme.spacing.gutter,
    paddingBottom: theme.spacing.spaceSm,
    backgroundColor: theme.colors.surface,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  headerTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.headlineMd.fontSize,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  headerSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  tertiaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.tertiary,
  },
  headerSubtitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  registerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  registerBtnText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onPrimary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceContainerLowest,
    height: 48,
    borderRadius: 12,
    marginTop: 16,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
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
  scrollContent: {
    padding: theme.spacing.gutter,
    gap: theme.spacing.spaceMd,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  metricLabel: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    flex: 1,
  },
  metricValue: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  metricValueSmall: {
    fontSize: 12,
    fontWeight: 'normal',
    color: theme.colors.onSurfaceVariant,
  },
  metricTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  metricTrendText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    fontWeight: '500',
    color: theme.colors.tertiary,
  },
  cardContainer: {
    gap: 16,
  },
  contractorCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  cardTop: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  cardAvatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  contractorIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitleRow: {
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
  cardSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  statusBadgeBusy: {
    backgroundColor: theme.colors.secondaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusBadgeBusyText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: 'bold',
    color: theme.colors.onSecondaryContainer,
  },
  activeCount: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  moreBtn: {
    padding: 4,
  },
  tradeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.surfaceContainer,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  tradeTagText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.onSurface,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: theme.colors.surfaceContainerLow,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  detailItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    flex: 1,
  },
  detailTextBold: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  detailTextSmall: {
    fontSize: 11,
    fontWeight: 'normal',
  },
  capacityTrack: {
    height: 6,
    backgroundColor: theme.colors.surfaceContainer,
    borderRadius: 3,
    overflow: 'hidden',
  },
  capacityFill: {
    height: '100%',
    borderRadius: 3,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  primaryActionBtn: {
    flex: 1,
    height: 40,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  primaryActionText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onPrimary,
  },
  secondaryActionBtn: {
    height: 40,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.surfaceContainerHigh,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  secondaryActionText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  iconActionBtn: {
    width: 40,
    height: 40,
    backgroundColor: theme.colors.surfaceContainerHigh,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(45,49,51,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: theme.spacing.gutter,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceContainer,
    paddingBottom: 12,
    marginBottom: 16,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary + '1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  modalSubtitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 4,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
  },
  input: {
    height: 44,
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontFamily: theme.typography.fontFamily,
    fontSize: 14,
    color: theme.colors.onSurface,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalCancelBtn: {
    flex: 1,
    height: 48,
    backgroundColor: theme.colors.surfaceContainerHigh,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  modalSubmitBtn: {
    flex: 1,
    height: 48,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubmitText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.onPrimary,
  }
});
