import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Modal, 
  Alert, 
  Linking,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import * as MailComposer from 'expo-mail-composer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useTheme } from '../context/ThemeContext';
import { 
  contractorEmailStore, 
  EmailThread, 
  ContractorProfile, 
  REGISTERED_CONTRACTORS 
} from '../services/contractorEmailStore';
import { complaintsStore } from '../services/complaintsStore';

export function AdminEmailsScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();

  const [threads, setThreads] = useState<EmailThread[]>(contractorEmailStore.getThreads());
  const [selectedThread, setSelectedThread] = useState<EmailThread | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'awaiting' | 'replied' | 'emergency'>('all');

  // Compose Modal State
  const [isComposeVisible, setIsComposeVisible] = useState(false);
  const [composeContractorId, setComposeContractorId] = useState(REGISTERED_CONTRACTORS[0].id);
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composePriority, setComposePriority] = useState<'Emergency' | 'High' | 'Standard'>('High');
  const [composeComplaintId, setComposeComplaintId] = useState('');
  const [composeRoadLocation, setComposeRoadLocation] = useState('');

  // Contractor Reply State (inside thread modal)
  const [replyBody, setReplyBody] = useState('');
  const [replyStatusLabel, setReplyStatusLabel] = useState('Hot-Mix Patching & Roller Compaction in Progress');
  const [replyProgress, setReplyProgress] = useState(75);
  const [replyMaterial, setReplyMaterial] = useState('Bitumen VG-30 + Crushed Aggregate Base');
  const [replyCrews, setReplyCrews] = useState(6);
  const [replyEta, setReplyEta] = useState('Today before evening peak (4:30 PM)');
  const [replyMode, setReplyMode] = useState<'contractor' | 'admin'>('contractor');

  // Pre-load from navigation route if opened from a contractor card or complaint screen
  useEffect(() => {
    if (route?.params?.prefillContractorId) {
      setComposeContractorId(route.params.prefillContractorId);
      setIsComposeVisible(true);
    }
    if (route?.params?.prefillComplaintId) {
      const comp = complaintsStore.getComplaintById(route.params.prefillComplaintId);
      if (comp) {
        setComposeComplaintId(comp.id);
        setComposeRoadLocation(comp.location.street);
        setComposeSubject(`Work Order #${comp.id}: Urgent Repair on ${comp.location.street.split('(')[0].trim()}`);
        setComposeBody(`Dear Contractor,\n\nMunicipal inspection confirms a verified road defect (${comp.title}) at ${comp.location.street}.\n\nPlease review the geo-tagged coordinates and dispatch a crew with hot-mix patch materials immediately.\n\nCoordinates: ${comp.location.latitude}, ${comp.location.longitude}`);
        setIsComposeVisible(true);
      }
    }
  }, [route?.params]);

  useEffect(() => {
    const unsubscribe = contractorEmailStore.subscribe(() => {
      setThreads([...contractorEmailStore.getThreads()]);
      if (selectedThread) {
        const updated = contractorEmailStore.getThreadById(selectedThread.threadId);
        if (updated) setSelectedThread({ ...updated });
      }
    });
    return unsubscribe;
  }, [selectedThread]);

  const activeComplaints = complaintsStore.getComplaints();

  // Metrics
  const totalThreads = threads.length;
  const awaitingCount = threads.filter(t => t.status === 'awaiting_reply').length;
  const repliedCount = threads.filter(t => t.status === 'contractor_replied' || t.status === 'work_completed').length;
  const emergencyCount = threads.filter(t => t.priority === 'Emergency').length;

  // Filtered Threads
  const filteredThreads = threads.filter(t => {
    const matchesSearch = 
      t.contractorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.complaintId && t.complaintId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.roadLocation && t.roadLocation.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (activeFilter === 'awaiting') return t.status === 'awaiting_reply';
    if (activeFilter === 'replied') return t.status === 'contractor_replied' || t.status === 'work_completed';
    if (activeFilter === 'emergency') return t.priority === 'Emergency';
    return true;
  });

  const handleSendAdminEmail = async () => {
    if (!composeSubject.trim() || !composeBody.trim()) {
      Alert.alert('Required Fields', 'Please enter both an email subject line and body.');
      return;
    }

    const contractor = contractorEmailStore.getContractorById(composeContractorId);
    if (!contractor) return;

    // Check if mail composer is available on this device
    const isAvailable = await MailComposer.isAvailableAsync();

    if (isAvailable) {
      // Open the device mail app pre-filled (Gmail / Outlook / Mail)
      const result = await MailComposer.composeAsync({
        recipients: [contractor.email],
        subject: composeSubject.trim(),
        body: [
          composeBody.trim(),
          '',
          '---',
          `📍 Location: ${composeRoadLocation || 'Nashik Municipal Zone'}`,
          composeComplaintId ? `📋 Complaint ID: ${composeComplaintId}` : '',
          `⚡ Priority: ${composePriority}`,
          '',
          'Sent via PMC Road Repair Portal',
          'Nashik Municipal Corporation — Department of Public Works',
          'admin.roads@nashikmunicipal.gov.in',
        ].filter(Boolean).join('\n'),
        isHtml: false,
      });

      if (result.status === MailComposer.MailComposerStatus.SENT) {
        // Mail was sent — save to in-app store
        contractorEmailStore.sendAdminEmail({
          contractorId: composeContractorId,
          subject: composeSubject.trim(),
          body: composeBody.trim(),
          complaintId: composeComplaintId || undefined,
          roadLocation: composeRoadLocation || undefined,
          priority: composePriority
        });
        setIsComposeVisible(false);
        setComposeSubject('');
        setComposeBody('');
        setComposeComplaintId('');
        setComposeRoadLocation('');
        Alert.alert('✅ Email Sent!', `Work order delivered to ${contractor.name} at ${contractor.email}.`);
      } else if (result.status === MailComposer.MailComposerStatus.SAVED) {
        // User saved as draft
        contractorEmailStore.sendAdminEmail({
          contractorId: composeContractorId,
          subject: composeSubject.trim(),
          body: composeBody.trim(),
          complaintId: composeComplaintId || undefined,
          roadLocation: composeRoadLocation || undefined,
          priority: composePriority
        });
        setIsComposeVisible(false);
        setComposeSubject('');
        setComposeBody('');
        Alert.alert('📥 Saved as Draft', 'Email saved as draft. Thread recorded in the portal.');
      } else {
        // Cancelled — just record in portal anyway
        Alert.alert('Cancelled', 'Email was not sent. You can try again or use the portal thread only.');
      }
    } else {
      // Mail app not available — fall back to mailto link
      const subject = encodeURIComponent(composeSubject.trim());
      const body = encodeURIComponent(composeBody.trim());
      const mailtoUrl = `mailto:${contractor.email}?subject=${subject}&body=${body}`;
      Linking.openURL(mailtoUrl).catch(() => {
        Alert.alert(
          'No Mail App Found',
          `Please install Gmail or Outlook to send emails.\n\nContractor email: ${contractor.email}`,
        );
      });
      // Still record the thread in the app
      contractorEmailStore.sendAdminEmail({
        contractorId: composeContractorId,
        subject: composeSubject.trim(),
        body: composeBody.trim(),
        complaintId: composeComplaintId || undefined,
        roadLocation: composeRoadLocation || undefined,
        priority: composePriority
      });
      setIsComposeVisible(false);
    }
  };

  const handleSendContractorReply = async () => {
    if (!selectedThread) return;
    if (!replyBody.trim()) {
      Alert.alert('Missing Message', 'Please enter the contractor reply message before submitting.');
      return;
    }

    const isAvailable = await MailComposer.isAvailableAsync();

    const fullReplyBody = [
      replyBody.trim(),
      '',
      '--- Construction Progress Update ---',
      `📊 Status: ${replyStatusLabel}`,
      `⚙️  Progress: ${replyProgress}%`,
      `🏗️  Material: ${replyMaterial}`,
      `👷 Crews On-Site: ${replyCrews}`,
      `⏰ Completion ETA: ${replyEta}`,
      '',
      `Re: ${selectedThread.subject}`,
      `Complaint Ref: ${selectedThread.complaintId || 'N/A'}`,
      `Location: ${selectedThread.roadLocation || 'Nashik Municipal Zone'}`,
    ].join('\n');

    if (isAvailable) {
      const result = await MailComposer.composeAsync({
        recipients: ['admin.roads@nashikmunicipal.gov.in'],
        subject: `Re: ${selectedThread.subject}`,
        body: fullReplyBody,
        isHtml: false,
      });

      if (result.status === MailComposer.MailComposerStatus.SENT ||
          result.status === MailComposer.MailComposerStatus.SAVED) {
        contractorEmailStore.replyAsContractor({
          threadId: selectedThread.threadId,
          replyBody: replyBody.trim(),
          statusLabel: replyStatusLabel,
          progressPercent: replyProgress,
          materialUsed: replyMaterial,
          crewsOnSite: replyCrews,
          completionEta: replyEta
        });
        setReplyBody('');
        Alert.alert(
          result.status === MailComposer.MailComposerStatus.SENT ? '✅ Reply Sent!' : '📥 Draft Saved',
          `Contractor update recorded: ${replyProgress}% progress reported.`
        );
      } else {
        Alert.alert('Cancelled', 'Reply was not sent. No changes recorded.');
      }
    } else {
      // Fallback: record in app only
      contractorEmailStore.replyAsContractor({
        threadId: selectedThread.threadId,
        replyBody: replyBody.trim(),
        statusLabel: replyStatusLabel,
        progressPercent: replyProgress,
        materialUsed: replyMaterial,
        crewsOnSite: replyCrews,
        completionEta: replyEta
      });
      setReplyBody('');
      Alert.alert(
        '👷 Reply Recorded in Portal',
        `No mail app found. Update saved in-app with ${replyProgress}% progress.`
      );
    }
  };

  const handleOpenNativeMail = async (thread: EmailThread) => {
    const isAvailable = await MailComposer.isAvailableAsync();
    const body = [
      `Regarding: ${thread.subject}`,
      '',
      `📋 Complaint Reference: ${thread.complaintId || 'Municipal Dispatch'}`,
      `📍 Location: ${thread.roadLocation || 'Nashik Municipal Corridors'}`,
      `⚡ Priority: ${thread.priority}`,
    ].join('\n');

    if (isAvailable) {
      await MailComposer.composeAsync({
        recipients: [thread.contractorEmail],
        subject: thread.subject,
        body,
        isHtml: false,
      });
    } else {
      const subject = encodeURIComponent(thread.subject);
      const encodedBody = encodeURIComponent(body);
      const mailtoUrl = `mailto:${thread.contractorEmail}?subject=${subject}&body=${encodedBody}`;
      Linking.openURL(mailtoUrl).catch(() => {
        Alert.alert('Email Client', `No mail app found. Contractor email: ${thread.contractorEmail}`);
      });
    }
  };

  const SUBJECT_TEMPLATES = [
    'Work Order: Urgent Cold-Mix Patch & Barricade',
    'Inspection Notice: Sunken Manhole Frame & Leveling',
    'Inquiry: Asphalt Curing Status & Traffic Clearance',
    'Quality Audit: Bitumen Density & Compaction Test',
    'Emergency Alert: Road Shoulder Cavity & Warning Cones'
  ];

  const STATUS_PRESETS = [
    { label: 'Hot-Mix Patching & Roller Compaction in Progress', progress: 75, material: 'Bitumen VG-30 + Crushed Stone' },
    { label: 'Site Cleared & Bitumen Tack Coat Sprayed', progress: 40, material: 'Rapid Setting Emulsion RS-1' },
    { label: 'Barricades Deployed & Single Lane Diverted', progress: 20, material: 'Reflective Cones + Caution Boards' },
    { label: 'Work 100% Completed & Ready for Audit', progress: 100, material: 'Asphalt Concrete Cured Flush' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: isDark ? '#000000' : '#ffffff' }]}>
      
      {/* Screen Header */}
      <View style={[styles.header, { backgroundColor: isDark ? '#000000' : '#ffffff', borderBottomColor: isDark ? '#18181b' : '#e4e4e7' }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: isDark ? '#18181b' : '#f4f4f5' }]}>
            <MaterialIcons name="arrow-back" size={20} color={isDark ? '#ffffff' : '#09090b'} />
          </TouchableOpacity>
          <View>
            <View style={styles.titleRow}>
              <Text style={[styles.headerTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>Contractor Communications</Text>
              <View style={styles.officialBadge}>
                <Text style={styles.officialBadgeText}>DPW DISPATCH</Text>
              </View>
            </View>
            <Text style={[styles.headerSubtitle, { color: isDark ? '#a1a1aa' : '#52525b' }]}>
              Official Email Work Orders & Contractor Replies
            </Text>
          </View>
        </View>


      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* KPI Strip */}
        <View style={styles.statsStrip}>
          <View style={[styles.statBox, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7' }]}>
            <Text style={[styles.statNum, { color: isDark ? '#ffffff' : '#09090b' }]}>{totalThreads}</Text>
            <Text style={[styles.statLabel, { color: isDark ? '#a1a1aa' : '#52525b' }]}>Total Orders</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7' }]}>
            <Text style={[styles.statNum, { color: theme.colors.warningAmber }]}>{awaitingCount}</Text>
            <Text style={[styles.statLabel, { color: isDark ? '#a1a1aa' : '#52525b' }]}>Awaiting Reply</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7' }]}>
            <Text style={[styles.statNum, { color: theme.colors.tertiary }]}>{repliedCount}</Text>
            <Text style={[styles.statLabel, { color: isDark ? '#a1a1aa' : '#52525b' }]}>Replied / Active</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7' }]}>
            <Text style={[styles.statNum, { color: theme.colors.error }]}>{emergencyCount}</Text>
            <Text style={[styles.statLabel, { color: isDark ? '#a1a1aa' : '#52525b' }]}>Emergency</Text>
          </View>
        </View>

        {/* Search Input */}
        <View style={[styles.searchBar, { backgroundColor: isDark ? '#18181b' : '#f4f4f5', borderColor: isDark ? '#27272a' : '#e4e4e7' }]}>
          <MaterialIcons name="search" size={20} color={isDark ? '#a1a1aa' : '#71717a'} />
          <TextInput 
            style={[styles.searchInput, { color: isDark ? '#ffffff' : '#09090b' }]}
            placeholder="Search contractor, road, or subject..."
            placeholderTextColor={isDark ? '#71717a' : '#a1a1aa'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={18} color={isDark ? '#a1a1aa' : '#71717a'} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter Pills */}
        <View style={styles.filterPillsRow}>
          {[
            { id: 'all', label: 'All Correspondence' },
            { id: 'awaiting', label: `Awaiting Reply (${awaitingCount})` },
            { id: 'replied', label: `Replied (${repliedCount})` },
            { id: 'emergency', label: `Emergency (${emergencyCount})` }
          ].map(f => (
            <TouchableOpacity 
              key={f.id}
              style={[
                styles.filterPill, 
                activeFilter === f.id && styles.filterPillActive,
                isDark && activeFilter !== f.id && { backgroundColor: '#18181b', borderColor: '#27272a' }
              ]}
              onPress={() => setActiveFilter(f.id as any)}
            >
              <Text style={[
                styles.filterPillText, 
                activeFilter === f.id && styles.filterPillTextActive,
                isDark && activeFilter !== f.id && { color: '#a1a1aa' }
              ]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Email Threads List */}
        <View style={styles.threadsContainer}>
          {filteredThreads.length === 0 ? (
            <View style={[styles.emptyBox, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7' }]}>
              <MaterialIcons name="mail-outline" size={42} color={theme.colors.secondary} />
              <Text style={[styles.emptyTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>No Correspondence Found</Text>
              <Text style={[styles.emptySub, { color: isDark ? '#a1a1aa' : '#52525b' }]}>
                Send a work order or road repair inquiry to any municipal road contractor.
              </Text>
              <TouchableOpacity 
                style={styles.emptyComposeBtn}
                onPress={() => setIsComposeVisible(true)}
              >
                <MaterialIcons name="send" size={16} color="#ffffff" />
                <Text style={styles.emptyComposeBtnText}>Send Work Order Email</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredThreads.map(thread => {
              const lastMsg = thread.messages[thread.messages.length - 1];
              const isContractorLast = lastMsg.sender === 'contractor';

              return (
                <TouchableOpacity 
                  key={thread.threadId}
                  style={[
                    styles.threadCard, 
                    { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7' }
                  ]}
                  activeOpacity={0.85}
                  onPress={() => setSelectedThread(thread)}
                >
                  <View style={styles.threadCardTop}>
                    <View style={styles.contractorHeaderRow}>
                      <View style={styles.contractorAvatar}>
                        <MaterialIcons name="business" size={18} color="#ffffff" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.threadContractorName, { color: isDark ? '#ffffff' : '#09090b' }]} numberOfLines={1}>
                          {thread.contractorName}
                        </Text>
                        <Text style={[styles.threadContractorEmail, { color: isDark ? '#a1a1aa' : '#52525b' }]}>
                          {thread.contractorEmail}
                        </Text>
                      </View>

                      {/* Priority Tag */}
                      <View style={[
                        styles.priorityPill,
                        thread.priority === 'Emergency' ? styles.priorityEmergency :
                        thread.priority === 'High' ? styles.priorityHigh : styles.priorityStandard
                      ]}>
                        <Text style={styles.priorityPillText}>{thread.priority.toUpperCase()}</Text>
                      </View>
                    </View>

                    {/* Subject */}
                    <Text style={[styles.threadSubject, { color: isDark ? '#ffffff' : '#09090b' }]}>
                      {thread.subject}
                    </Text>

                    {/* Linked Complaint & Location */}
                    {thread.roadLocation ? (
                      <View style={[styles.locationChip, { backgroundColor: isDark ? '#18181b' : '#f4f4f5' }]}>
                        <MaterialIcons name="place" size={13} color={theme.colors.primary} />
                        <Text style={[styles.locationChipText, { color: isDark ? '#a1a1aa' : '#52525b' }]} numberOfLines={1}>
                          {thread.complaintId ? `${thread.complaintId} • ` : ''}{thread.roadLocation}
                        </Text>
                      </View>
                    ) : null}

                    {/* Latest Message Snippet */}
                    <View style={[styles.lastMessageSnippetBox, { backgroundColor: isDark ? '#09090b' : '#fafafa' }]}>
                      <View style={styles.snippetHeaderRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <MaterialIcons 
                            name={isContractorLast ? "engineering" : "admin-panel-settings"} 
                            size={14} 
                            color={isContractorLast ? theme.colors.tertiary : theme.colors.primary} 
                          />
                          <Text style={[
                            styles.snippetSenderName, 
                            { color: isContractorLast ? theme.colors.tertiary : theme.colors.primary }
                          ]}>
                            {isContractorLast ? 'Contractor Reply:' : 'Admin Sent:'}
                          </Text>
                        </View>
                        <Text style={[styles.snippetTime, { color: isDark ? '#71717a' : '#a1a1aa' }]}>
                          {lastMsg.timestamp}
                        </Text>
                      </View>
                      <Text style={[styles.snippetBodyText, { color: isDark ? '#d4d4d8' : '#3f3f46' }]} numberOfLines={2}>
                        {lastMsg.body}
                      </Text>
                    </View>

                    {/* Contractor Construction Update Banner if present */}
                    {lastMsg.constructionUpdate ? (
                      <View style={[styles.constructionTelemetryPill, { backgroundColor: isDark ? '#064e3b22' : '#ecfdf5', borderColor: '#05966933' }]}>
                        <MaterialIcons name="construction" size={14} color="#10b981" />
                        <Text style={styles.constructionTelemetryText} numberOfLines={1}>
                          Progress: {lastMsg.constructionUpdate.progressPercent}% • {lastMsg.constructionUpdate.statusLabel}
                        </Text>
                      </View>
                    ) : null}

                    {/* Footer Actions */}
                    <View style={[styles.threadFooter, { borderTopColor: isDark ? '#18181b' : '#e4e4e7' }]}>
                      <View style={styles.statusIndicatorRow}>
                        <View style={[
                          styles.statusDot, 
                          { backgroundColor: thread.status === 'awaiting_reply' ? theme.colors.warningAmber : theme.colors.tertiary }
                        ]} />
                        <Text style={[
                          styles.statusIndicatorText,
                          { color: thread.status === 'awaiting_reply' ? theme.colors.warningAmber : theme.colors.tertiary }
                        ]}>
                          {thread.status === 'awaiting_reply' ? 'Awaiting Contractor Reply' : 
                           thread.status === 'work_completed' ? 'Work 100% Completed' : 'Contractor Replied'}
                        </Text>
                      </View>

                      <View style={{ flexDirection: 'row', gap: 6 }}>
                        <TouchableOpacity 
                          style={[styles.threadNativeMailBtn, { backgroundColor: isDark ? '#18181b' : '#f4f4f5' }]}
                          onPress={() => handleOpenNativeMail(thread)}
                        >
                          <MaterialIcons name="mail" size={14} color={theme.colors.primary} />
                          <Text style={styles.threadNativeMailBtnText}>Email Client</Text>
                        </TouchableOpacity>

                        <View style={styles.openThreadBtn}>
                          <Text style={styles.openThreadBtnText}>Open Thread</Text>
                          <MaterialIcons name="chevron-right" size={16} color={theme.colors.primary} />
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* THREAD DETAIL MODAL (Correspondence & Contractor Reply) */}
      <Modal
        visible={!!selectedThread}
        animationType="slide"
        onRequestClose={() => setSelectedThread(null)}
      >
        {selectedThread && (
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={[styles.modalContainer, { backgroundColor: isDark ? '#000000' : '#ffffff' }]}
          >
            {/* Modal Header */}
            <View style={[styles.modalHeader, { paddingTop: insets.top + 8, backgroundColor: isDark ? '#000000' : '#ffffff', borderBottomColor: isDark ? '#18181b' : '#e4e4e7' }]}>
              <TouchableOpacity onPress={() => setSelectedThread(null)} style={[styles.modalBackBtn, { backgroundColor: isDark ? '#18181b' : '#f4f4f5' }]}>
                <MaterialIcons name="arrow-back" size={20} color={isDark ? '#ffffff' : '#09090b'} />
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalHeaderTitle, { color: isDark ? '#ffffff' : '#09090b' }]} numberOfLines={1}>
                  {selectedThread.contractorName}
                </Text>
                <Text style={[styles.modalHeaderSub, { color: isDark ? '#a1a1aa' : '#52525b' }]} numberOfLines={1}>
                  {selectedThread.subject}
                </Text>
              </View>
              <TouchableOpacity 
                style={[styles.mailClientHeaderBtn, { backgroundColor: isDark ? '#18181b' : '#f4f4f5' }]}
                onPress={() => handleOpenNativeMail(selectedThread)}
              >
                <MaterialIcons name="open-in-new" size={16} color={theme.colors.primary} />
                <Text style={styles.mailClientHeaderText}>Mail</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
              
              {/* Thread Metadata Banner */}
              <View style={[styles.threadMetaBanner, { backgroundColor: isDark ? '#09090b' : '#f4f4f5', borderColor: isDark ? '#18181b' : '#e4e4e7' }]}>
                <View style={styles.metaRow}>
                  <Text style={[styles.metaLabel, { color: isDark ? '#71717a' : '#52525b' }]}>Contractor:</Text>
                  <Text style={[styles.metaVal, { color: isDark ? '#ffffff' : '#09090b' }]}>{selectedThread.contractorName}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={[styles.metaLabel, { color: isDark ? '#71717a' : '#52525b' }]}>Contact Email:</Text>
                  <Text style={[styles.metaVal, { color: theme.colors.primary }]}>{selectedThread.contractorEmail}</Text>
                </View>
                {selectedThread.roadLocation ? (
                  <View style={styles.metaRow}>
                    <Text style={[styles.metaLabel, { color: isDark ? '#71717a' : '#52525b' }]}>Road Location:</Text>
                    <Text style={[styles.metaVal, { color: isDark ? '#ffffff' : '#09090b' }]}>{selectedThread.roadLocation}</Text>
                  </View>
                ) : null}
                {selectedThread.complaintId ? (
                  <View style={styles.metaRow}>
                    <Text style={[styles.metaLabel, { color: isDark ? '#71717a' : '#52525b' }]}>Complaint Ref:</Text>
                    <Text style={[styles.metaVal, { color: theme.colors.primary, fontWeight: '700' }]}>{selectedThread.complaintId}</Text>
                  </View>
                ) : null}
              </View>

              {/* Message History List */}
              <Text style={[styles.sectionHeading, { color: isDark ? '#a1a1aa' : '#52525b' }]}>
                EMAIL CORRESPONDENCE TIMELINE
              </Text>

              {selectedThread.messages.map((msg, idx) => {
                const isAdmin = msg.sender === 'admin';

                return (
                  <View 
                    key={msg.id || idx}
                    style={[
                      styles.messageBubbleCard,
                      isAdmin ? styles.adminBubble : styles.contractorBubble,
                      { 
                        backgroundColor: isAdmin 
                          ? (isDark ? '#0f172a' : '#eff6ff') 
                          : (isDark ? '#064e3b22' : '#f0fdf4'),
                        borderColor: isAdmin
                          ? (isDark ? '#1e3a8a' : '#bfdbfe')
                          : (isDark ? '#065f46' : '#bbf7d0')
                      }
                    ]}
                  >
                    {/* Message Header */}
                    <View style={styles.bubbleHeaderRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                        <View style={[
                          styles.bubbleSenderAvatar, 
                          { backgroundColor: isAdmin ? theme.colors.primary : '#10b981' }
                        ]}>
                          <MaterialIcons 
                            name={isAdmin ? "admin-panel-settings" : "engineering"} 
                            size={14} 
                            color="#ffffff" 
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.bubbleSenderName, { color: isDark ? '#ffffff' : '#09090b' }]} numberOfLines={1}>
                            {msg.senderName}
                          </Text>
                          <Text style={[styles.bubbleSenderEmail, { color: isDark ? '#94a3b8' : '#64748b' }]} numberOfLines={1}>
                            {msg.senderEmail}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.bubbleTimestamp, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                        {msg.timestamp}
                      </Text>
                    </View>

                    {/* Subject Line in Message */}
                    <Text style={[styles.bubbleSubject, { color: isDark ? '#ffffff' : '#09090b' }]}>
                      {msg.subject}
                    </Text>

                    {/* Message Body */}
                    <Text style={[styles.bubbleBodyText, { color: isDark ? '#f1f5f9' : '#1e293b' }]}>
                      {msg.body}
                    </Text>

                    {/* Contractor Construction Telemetry Box */}
                    {msg.constructionUpdate ? (
                      <View style={[styles.telemetryBox, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#05966955' : '#86efac' }]}>
                        <View style={styles.telemetryHeaderRow}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 }}>
                            <MaterialIcons name="traffic" size={16} color="#10b981" />
                            <Text style={[styles.telemetryTitle, { flexShrink: 1 }]} numberOfLines={2}>Contractor Construction Telemetry</Text>
                          </View>
                          <View style={styles.progressPill}>
                            <Text style={styles.progressPillText}>{msg.constructionUpdate.progressPercent}% Completed</Text>
                          </View>
                        </View>

                        <Text style={[styles.telemetryStatusLabel, { color: isDark ? '#ffffff' : '#09090b' }]}>
                          📍 {msg.constructionUpdate.statusLabel}
                        </Text>

                        <View style={styles.telemetryDetailsGrid}>
                          <View style={styles.telemetryDetailItem}>
                            <Text style={styles.telemetryDetailLabel}>Materials Used</Text>
                            <Text style={[styles.telemetryDetailVal, { color: isDark ? '#cbd5e1' : '#334155' }]}>
                              {msg.constructionUpdate.materialUsed}
                            </Text>
                          </View>
                          <View style={styles.telemetryDetailItem}>
                            <Text style={styles.telemetryDetailLabel}>Field Crew</Text>
                            <Text style={[styles.telemetryDetailVal, { color: isDark ? '#cbd5e1' : '#334155' }]}>
                              {msg.constructionUpdate.crewsOnSite} Workers Active
                            </Text>
                          </View>
                          <View style={styles.telemetryDetailItem}>
                            <Text style={styles.telemetryDetailLabel}>Estimated Completion</Text>
                            <Text style={[styles.telemetryDetailVal, { color: isDark ? '#cbd5e1' : '#334155' }]}>
                              {msg.constructionUpdate.completionEta}
                            </Text>
                          </View>
                        </View>
                      </View>
                    ) : null}
                  </View>
                );
              })}

              {/* REPLY SECTION: Contractor Reply Portal & Admin Follow-up */}
              <View style={[styles.replySectionCard, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? '#18181b' : '#e4e4e7' }]}>
                <View style={styles.replyCardHeaderRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 }}>
                    <MaterialIcons name="reply" size={20} color={theme.colors.primary} />
                    <Text style={[styles.replyCardTitle, { color: isDark ? '#ffffff' : '#09090b', flexShrink: 1 }]} numberOfLines={2}>
                      Submit Contractor Reply to Admin
                    </Text>
                  </View>
                  <View style={styles.interactivePill}>
                    <Text style={styles.interactivePillText}>Interactive Portal</Text>
                  </View>
                </View>
                <Text style={[styles.replyCardSub, { color: isDark ? '#a1a1aa' : '#52525b' }]}>
                  The road contractor responds directly to the DPW Admin with site arrival, asphalt compaction progress, and schedule updates.
                </Text>

                {/* Quick Construction Status Presets */}
                <Text style={[styles.presetRowTitle, { color: isDark ? '#d4d4d8' : '#3f3f46' }]}>
                  QUICK STATUS UPDATE PRESETS:
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, marginBottom: 12 }}>
                  {STATUS_PRESETS.map((p, idx) => (
                    <TouchableOpacity 
                      key={idx}
                      style={[
                        styles.statusPresetChip,
                        replyStatusLabel === p.label && styles.statusPresetChipActive,
                        isDark && { backgroundColor: '#18181b', borderColor: '#27272a' }
                      ]}
                      onPress={() => {
                        setReplyStatusLabel(p.label);
                        setReplyProgress(p.progress);
                        setReplyMaterial(p.material);
                        setReplyBody(`To DPW Admin:\n\n${p.label}. Material: ${p.material}. Safety cones deployed for single-lane flow. Expected clearance: ${replyEta}.`);
                      }}
                    >
                      <Text style={[
                        styles.statusPresetChipText,
                        replyStatusLabel === p.label && styles.statusPresetChipTextActive,
                        isDark && { color: '#a1a1aa' }
                      ]}>
                        {p.progress}% • {p.label.split('&')[0]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Progress Selector Chips */}
                <View style={styles.progressRow}>
                  <Text style={[styles.fieldLabel, { color: isDark ? '#d4d4d8' : '#3f3f46' }]}>
                    Construction Progress: {replyProgress}%
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {[25, 50, 75, 100].map(pct => (
                      <TouchableOpacity 
                        key={pct}
                        style={[
                          styles.pctBtn,
                          replyProgress === pct && styles.pctBtnActive,
                          isDark && replyProgress !== pct && { backgroundColor: '#18181b', borderColor: '#27272a' }
                        ]}
                        onPress={() => setReplyProgress(pct)}
                      >
                        <Text style={[
                          styles.pctBtnText,
                          replyProgress === pct && styles.pctBtnTextActive,
                          isDark && replyProgress !== pct && { color: '#a1a1aa' }
                        ]}>
                          {pct}%
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Construction details inputs */}
                <View style={styles.dualFieldRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.fieldLabel, { color: isDark ? '#d4d4d8' : '#3f3f46' }]}>Material Specs</Text>
                    <TextInput 
                      style={[styles.smallInput, { backgroundColor: isDark ? '#18181b' : '#f4f4f5', color: isDark ? '#ffffff' : '#09090b', borderColor: isDark ? '#27272a' : '#e4e4e7' }]}
                      value={replyMaterial}
                      onChangeText={setReplyMaterial}
                      placeholder="e.g. Bitumen VG-30"
                      placeholderTextColor={isDark ? '#71717a' : '#a1a1aa'}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={[styles.fieldLabel, { color: isDark ? '#d4d4d8' : '#3f3f46' }]}>Completion ETA</Text>
                    <TextInput 
                      style={[styles.smallInput, { backgroundColor: isDark ? '#18181b' : '#f4f4f5', color: isDark ? '#ffffff' : '#09090b', borderColor: isDark ? '#27272a' : '#e4e4e7' }]}
                      value={replyEta}
                      onChangeText={setReplyEta}
                      placeholder="e.g. Today at 4:30 PM"
                      placeholderTextColor={isDark ? '#71717a' : '#a1a1aa'}
                    />
                  </View>
                </View>

                {/* Reply Message Body */}
                <Text style={[styles.fieldLabel, { color: isDark ? '#d4d4d8' : '#3f3f46', marginTop: 10 }]}>
                  Contractor Response Message
                </Text>
                <TextInput 
                  style={[styles.replyTextInput, { backgroundColor: isDark ? '#18181b' : '#f4f4f5', color: isDark ? '#ffffff' : '#09090b', borderColor: isDark ? '#27272a' : '#e4e4e7' }]}
                  multiline
                  numberOfLines={4}
                  value={replyBody}
                  onChangeText={setReplyBody}
                  placeholder="Type contractor response about road work status, crew arrival, or asphalt curing..."
                  placeholderTextColor={isDark ? '#71717a' : '#a1a1aa'}
                />

                {/* Submit Contractor Reply Button */}
                <TouchableOpacity 
                  style={styles.submitReplyBtn}
                  onPress={handleSendContractorReply}
                  activeOpacity={0.85}
                >
                  <MaterialIcons name="send" size={18} color="#ffffff" />
                  <Text style={styles.submitReplyBtnText}>
                    Send Contractor Reply to Admin
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={{ height: 40 }} />
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </Modal>

      {/* COMPOSE NEW WORK ORDER EMAIL MODAL */}
      <Modal
        visible={isComposeVisible}
        animationType="slide"
        onRequestClose={() => setIsComposeVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[styles.modalContainer, { backgroundColor: isDark ? '#000000' : '#ffffff' }]}
        >
          {/* Modal Header */}
          <View style={[styles.modalHeader, { paddingTop: insets.top + 8, backgroundColor: isDark ? '#000000' : '#ffffff', borderBottomColor: isDark ? '#18181b' : '#e4e4e7' }]}>
            <TouchableOpacity onPress={() => setIsComposeVisible(false)} style={[styles.modalBackBtn, { backgroundColor: isDark ? '#18181b' : '#f4f4f5' }]}>
              <MaterialIcons name="close" size={20} color={isDark ? '#ffffff' : '#09090b'} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={[styles.modalHeaderTitle, { color: isDark ? '#ffffff' : '#09090b' }]}>
                Compose Work Order Email
              </Text>
              <Text style={[styles.modalHeaderSub, { color: isDark ? '#a1a1aa' : '#52525b' }]}>
                Direct transmission from DPW Admin to Road Contractor
              </Text>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
            
            {/* Contractor Selection */}
            <Text style={[styles.fieldLabel, { color: isDark ? '#d4d4d8' : '#3f3f46' }]}>
              Select Road Contractor Firm:
            </Text>
            <View style={styles.contractorChipsGrid}>
              {REGISTERED_CONTRACTORS.map(c => {
                const isSelected = composeContractorId === c.id;
                return (
                  <TouchableOpacity 
                    key={c.id}
                    style={[
                      styles.contractorSelectChip,
                      isSelected && styles.contractorSelectChipActive,
                      isDark && !isSelected && { backgroundColor: '#18181b', borderColor: '#27272a' }
                    ]}
                    onPress={() => setComposeContractorId(c.id)}
                  >
                    <View style={styles.contractorSelectIconBox}>
                      <MaterialIcons name="business" size={16} color={isSelected ? '#ffffff' : theme.colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.contractorSelectName, isSelected && { color: '#ffffff' }, isDark && !isSelected && { color: '#ffffff' }]} numberOfLines={1}>
                        {c.name}
                      </Text>
                      <Text style={[styles.contractorSelectSub, isSelected && { color: '#bfdbfe' }, isDark && !isSelected && { color: '#a1a1aa' }]}>
                        {c.contactPerson.split('(')[0]} • {c.capacity}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Link Active Road Defect / Complaint */}
            <Text style={[styles.fieldLabel, { color: isDark ? '#d4d4d8' : '#3f3f46', marginTop: 12 }]}>
              Link Road Incident / Complaint (Optional):
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
              {activeComplaints.map(comp => {
                const isSelected = composeComplaintId === comp.id;
                return (
                  <TouchableOpacity 
                    key={comp.id}
                    style={[
                      styles.complaintLinkChip,
                      isSelected && styles.complaintLinkChipActive,
                      isDark && !isSelected && { backgroundColor: '#18181b', borderColor: '#27272a' }
                    ]}
                    onPress={() => {
                      if (isSelected) {
                        setComposeComplaintId('');
                        setComposeRoadLocation('');
                      } else {
                        setComposeComplaintId(comp.id);
                        setComposeRoadLocation(comp.location.street);
                        setComposeSubject(`Work Order #${comp.id}: Urgent Patch on ${comp.location.street.split('(')[0].trim()}`);
                        setComposeBody(`Dear Contractor,\n\nVerified road damage (${comp.title}) reported at ${comp.location.street}.\n\nCategory: ${comp.category}\nSeverity: ${comp.severity}\nLocation: ${comp.location.street}, ${comp.location.ward}\nCoordinates: ${comp.location.latitude}, ${comp.location.longitude}\n\nPlease dispatch your road repair crew immediately with cold/hot-mix asphalt.`);
                      }
                    }}
                  >
                    <MaterialIcons name="assignment" size={14} color={isSelected ? '#ffffff' : theme.colors.primary} />
                    <Text style={[styles.complaintLinkText, isSelected && { color: '#ffffff' }, isDark && !isSelected && { color: '#a1a1aa' }]}>
                      {comp.id}: {comp.category} ({comp.location.street.split('(')[0].trim().slice(0, 15)}...)
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Priority Selection */}
            <View style={{ marginTop: 12 }}>
              <Text style={[styles.fieldLabel, { color: isDark ? '#d4d4d8' : '#3f3f46' }]}>Priority Level</Text>
              <View style={styles.prioritySelectorRow}>
                {(['Emergency', 'High', 'Standard'] as const).map(p => (
                  <TouchableOpacity 
                    key={p}
                    style={[
                      styles.prioritySelectBtn,
                      composePriority === p && (
                        p === 'Emergency' ? styles.priorityEmergencyBtnActive :
                        p === 'High' ? styles.priorityHighBtnActive : styles.priorityStandardBtnActive
                      ),
                      isDark && composePriority !== p && { backgroundColor: '#18181b', borderColor: '#27272a' }
                    ]}
                    onPress={() => setComposePriority(p)}
                  >
                    <Text style={[
                      styles.prioritySelectBtnText,
                      composePriority === p && { color: '#ffffff', fontWeight: '700' },
                      isDark && composePriority !== p && { color: '#a1a1aa' }
                    ]}>
                      {p === 'Emergency' ? '🚨 Emergency' : p === 'High' ? '⚠️ High' : 'Standard'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Quick Subject Templates */}
            <Text style={[styles.fieldLabel, { color: isDark ? '#d4d4d8' : '#3f3f46', marginTop: 14 }]}>
              Quick Subject Templates:
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {SUBJECT_TEMPLATES.map((tmpl, idx) => (
                <TouchableOpacity 
                  key={idx}
                  style={[styles.templateChip, isDark && { backgroundColor: '#18181b', borderColor: '#27272a' }]}
                  onPress={() => setComposeSubject(tmpl)}
                >
                  <Text style={[styles.templateChipText, isDark && { color: '#a1a1aa' }]}>{tmpl}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Subject Input */}
            <Text style={[styles.fieldLabel, { color: isDark ? '#d4d4d8' : '#3f3f46', marginTop: 12 }]}>
              Email Subject Line
            </Text>
            <TextInput 
              style={[styles.subjectInput, { backgroundColor: isDark ? '#18181b' : '#f4f4f5', color: isDark ? '#ffffff' : '#09090b', borderColor: isDark ? '#27272a' : '#e4e4e7' }]}
              value={composeSubject}
              onChangeText={setComposeSubject}
              placeholder="e.g. Work Order: Immediate Hot-Mix Patch on Makhmalabad Naka"
              placeholderTextColor={isDark ? '#71717a' : '#a1a1aa'}
            />

            {/* Email Body */}
            <Text style={[styles.fieldLabel, { color: isDark ? '#d4d4d8' : '#3f3f46', marginTop: 12 }]}>
              Official Email Body & Instructions
            </Text>
            <TextInput 
              style={[styles.composeBodyInput, { backgroundColor: isDark ? '#18181b' : '#f4f4f5', color: isDark ? '#ffffff' : '#09090b', borderColor: isDark ? '#27272a' : '#e4e4e7' }]}
              multiline
              numberOfLines={6}
              value={composeBody}
              onChangeText={setComposeBody}
              placeholder="Write detailed work order instructions, material specifications, and required road completion timeline..."
              placeholderTextColor={isDark ? '#71717a' : '#a1a1aa'}
            />

            {/* Dispatch Button */}
            <TouchableOpacity 
              style={styles.dispatchSubmitBtn}
              onPress={handleSendAdminEmail}
              activeOpacity={0.85}
            >
              <MaterialIcons name="send" size={20} color="#ffffff" />
              <Text style={styles.dispatchSubmitBtnText}>Dispatch Official Email to Contractor</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  officialBadge: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  officialBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  composeHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  composeHeaderBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  scrollContent: {
    padding: 16,
    gap: 14,
  },
  statsStrip: {
    flexDirection: 'row',
    gap: 8,
  },
  statBox: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  statNum: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f4f4f5',
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  filterPillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#71717a',
  },
  filterPillTextActive: {
    color: '#ffffff',
  },
  threadsContainer: {
    gap: 12,
  },
  emptyBox: {
    padding: 32,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 6,
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 280,
  },
  emptyComposeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  emptyComposeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  threadCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  threadCardTop: {
    gap: 8,
  },
  contractorHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  contractorAvatar: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  threadContractorName: {
    fontSize: 14,
    fontWeight: '700',
  },
  threadContractorEmail: {
    fontSize: 11,
  },
  priorityPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityEmergency: {
    backgroundColor: '#dc2626',
  },
  priorityHigh: {
    backgroundColor: '#ea580c',
  },
  priorityStandard: {
    backgroundColor: '#0284c7',
  },
  priorityPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  threadSubject: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  locationChipText: {
    fontSize: 11,
    fontWeight: '500',
  },
  lastMessageSnippetBox: {
    borderRadius: 8,
    padding: 10,
    gap: 4,
  },
  snippetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  snippetSenderName: {
    fontSize: 11,
    fontWeight: '700',
  },
  snippetTime: {
    fontSize: 10,
  },
  snippetBodyText: {
    fontSize: 12,
    lineHeight: 16,
  },
  constructionTelemetryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  constructionTelemetryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10b981',
  },
  threadFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    marginTop: 2,
  },
  statusIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusIndicatorText: {
    fontSize: 11,
    fontWeight: '600',
  },
  threadNativeMailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  threadNativeMailBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  openThreadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  openThreadBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  modalBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  modalHeaderSub: {
    fontSize: 11,
  },
  mailClientHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  mailClientHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  modalScrollContent: {
    padding: 16,
    gap: 14,
  },
  threadMetaBanner: {
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 11,
  },
  metaVal: {
    fontSize: 11,
    fontWeight: '600',
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: 4,
    textAlign: 'center',
  },
  messageBubbleCard: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    gap: 8,
  },
  adminBubble: {
    marginLeft: 16,
  },
  contractorBubble: {
    marginRight: 16,
  },
  bubbleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bubbleSenderAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleSenderName: {
    fontSize: 12,
    fontWeight: '700',
  },
  bubbleSenderEmail: {
    fontSize: 10,
  },
  bubbleTimestamp: {
    fontSize: 10,
  },
  bubbleSubject: {
    fontSize: 13,
    fontWeight: '700',
  },
  bubbleBodyText: {
    fontSize: 13,
    lineHeight: 18,
  },
  telemetryBox: {
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    gap: 8,
    marginTop: 6,
  },
  telemetryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  telemetryTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10b981',
  },
  progressPill: {
    backgroundColor: '#059669',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  progressPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
  },
  telemetryStatusLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  telemetryDetailsGrid: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  telemetryDetailItem: {
    flex: 1,
    minWidth: 120,
    gap: 2,
  },
  telemetryDetailLabel: {
    fontSize: 10,
    color: '#10b981',
    fontWeight: '600',
  },
  telemetryDetailVal: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Reply Section Card
  replySectionCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    marginTop: 10,
  },
  replyCardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  replyCardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  interactivePill: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  interactivePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ffffff',
  },
  replyCardSub: {
    fontSize: 11,
    marginTop: 4,
    marginBottom: 12,
  },
  presetRowTitle: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 6,
  },
  statusPresetChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#f4f4f5',
    borderColor: '#e4e4e7',
  },
  statusPresetChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  statusPresetChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#52525b',
  },
  statusPresetChipTextActive: {
    color: '#ffffff',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
    flexWrap: 'wrap',
    gap: 8,
  },
  pctBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#f4f4f5',
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  pctBtnActive: {
    backgroundColor: theme.colors.tertiary,
    borderColor: theme.colors.tertiary,
  },
  pctBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#71717a',
  },
  pctBtnTextActive: {
    color: '#ffffff',
  },
  dualFieldRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 4,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  smallInput: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 12,
  },
  replyTextInput: {
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    fontSize: 13,
    textAlignVertical: 'top',
    minHeight: 80,
    marginBottom: 12,
  },
  submitReplyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 10,
  },
  submitReplyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },

  // Compose Modal Styles
  contractorChipsGrid: {
    gap: 6,
  },
  contractorSelectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: '#f4f4f5',
    borderColor: '#e4e4e7',
  },
  contractorSelectChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  contractorSelectIconBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contractorSelectName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#09090b',
  },
  contractorSelectSub: {
    fontSize: 11,
    color: '#71717a',
  },
  complaintLinkChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#f4f4f5',
    borderColor: '#e4e4e7',
  },
  complaintLinkChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  complaintLinkText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#52525b',
  },
  prioritySelectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  prioritySelectBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#f4f4f5',
    borderColor: '#e4e4e7',
  },
  priorityEmergencyBtnActive: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  priorityHighBtnActive: {
    backgroundColor: '#ea580c',
    borderColor: '#ea580c',
  },
  priorityStandardBtnActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7',
  },
  prioritySelectBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#52525b',
  },
  templateChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#f4f4f5',
    borderColor: '#e4e4e7',
  },
  templateChipText: {
    fontSize: 11,
    color: '#52525b',
  },
  subjectInput: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 13,
  },
  composeBodyInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 13,
    textAlignVertical: 'top',
    minHeight: 120,
    marginBottom: 16,
  },
  dispatchSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingVertical: 13,
    borderRadius: 10,
  },
  dispatchSubmitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
