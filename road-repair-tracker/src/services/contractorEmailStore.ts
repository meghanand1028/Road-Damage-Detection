export interface ContractorProfile {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  specialty: string;
  assignedWards: string;
  rating: number;
  activeCrews: number;
  totalCrews: number;
  slaPercent: number;
  capacity: string;
}

export interface ContractorMessage {
  id: string;
  threadId: string;
  sender: 'admin' | 'contractor';
  senderName: string;
  senderEmail: string;
  recipientName: string;
  recipientEmail: string;
  subject: string;
  body: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'acknowledged' | 'replied';
  priority: 'Emergency' | 'High' | 'Standard';
  complaintId?: string;
  roadLocation?: string;
  constructionUpdate?: {
    statusLabel: string;
    progressPercent: number;
    materialUsed: string;
    crewsOnSite: number;
    completionEta: string;
  };
}

export interface EmailThread {
  threadId: string;
  contractorId: string;
  contractorName: string;
  contractorEmail: string;
  contractorPhone: string;
  subject: string;
  complaintId?: string;
  roadLocation?: string;
  priority: 'Emergency' | 'High' | 'Standard';
  lastUpdated: string;
  status: 'awaiting_reply' | 'contractor_replied' | 'work_completed';
  messages: ContractorMessage[];
}

export const REGISTERED_CONTRACTORS: ContractorProfile[] = [
  {
    id: 'apex-infra',
    name: 'Apex Infrastructure & Asphalt Ltd.',
    contactPerson: 'Rajesh Sharma (Chief Project Engineer)',
    email: 'r.sharma@apexinfrastruct.com',
    phone: '+91 98221 54321',
    specialty: 'Hot-Mix Bitumen Paving & Sub-Base Roller Compaction',
    assignedWards: 'Ward 5 (Makhmalabad) & Ward 8 (Panchavati)',
    rating: 4.9,
    activeCrews: 4,
    totalCrews: 5,
    slaPercent: 98.4,
    capacity: '80% Load'
  },
  {
    id: 'metro-bitumen',
    name: 'Metro Bitumen & Road Works Ltd.',
    contactPerson: 'Amit Deshmukh (Project Operations Director)',
    email: 'a.deshmukh@metrobitumen.in',
    phone: '+91 98224 87654',
    specialty: 'Heavy Milling, Base Course Reinforcement & Joint Sealing',
    assignedWards: 'Ward 7 (Panchavati) & Ward 12 (Panchavati)',
    rating: 4.8,
    activeCrews: 3,
    totalCrews: 4,
    slaPercent: 96.8,
    capacity: '75% Load'
  },
  {
    id: 'shree-tech',
    name: 'Shree Road Tech & Infra Corp',
    contactPerson: 'Vikram Patil (Operations Lead & Dispatcher)',
    email: 'v.patil@shreeroadtech.com',
    phone: '+91 98230 11223',
    specialty: 'Rapid Polymer Cold-Mix Patching & Manhole Leveling',
    assignedWards: 'Ward 3 (Makhmalabad) & Ward 8 (Panchavati)',
    rating: 4.7,
    activeCrews: 2,
    totalCrews: 3,
    slaPercent: 95.2,
    capacity: '65% Load'
  },
  {
    id: 'precision-paving',
    name: 'Precision Road Engineering Pvt Ltd',
    contactPerson: 'Manoj Shinde (Field Supervisor)',
    email: 'm.shinde@precisionpaving.in',
    phone: '+91 98232 99887',
    specialty: 'Crack Micro-Surfacing & Stormwater Drain Shoulder Works',
    assignedWards: 'Ward 4 (North Sector) & Ward 5 (Makhmalabad)',
    rating: 4.9,
    activeCrews: 5,
    totalCrews: 6,
    slaPercent: 99.1,
    capacity: '85% Load'
  }
];

class ContractorEmailStore {
  private threads: EmailThread[] = [
    {
      threadId: 'TH-2026-001',
      contractorId: 'apex-infra',
      contractorName: 'Apex Infrastructure & Asphalt Ltd.',
      contractorEmail: 'r.sharma@apexinfrastruct.com',
      contractorPhone: '+91 98221 54321',
      subject: 'Work Order #WO-892: Urgent Cold-Mix Patch on Makhmalabad Naka',
      complaintId: 'CR-2026-8921',
      roadLocation: '2Q6Q+GPV, Makhmalabad Naka (Goodluck Chowk)',
      priority: 'Emergency',
      lastUpdated: '10:45 AM',
      status: 'contractor_replied',
      messages: [
        {
          id: 'MSG-001',
          threadId: 'TH-2026-001',
          sender: 'admin',
          senderName: 'DPW Chief Road Engineer (Admin)',
          senderEmail: 'admin.roads@nashikmunicipal.gov.in',
          recipientName: 'Rajesh Sharma (Apex Infrastructure)',
          recipientEmail: 'r.sharma@apexinfrastruct.com',
          subject: 'Work Order #WO-892: Urgent Cold-Mix Patch on Makhmalabad Naka',
          body: 'Dear Rajesh Sharma,\n\nCitizen reports with verified Google Geo-Tag image indicate severe pothole clustering near Goodluck Chowk (>12cm depth) creating severe skid hazards for two-wheelers and auto-rickshaws.\n\nPlease mobilize your road crew with hot-mix bitumen (Grade VG-30) and deploy reflective safety barricades immediately. Reply with your site arrival confirmation and construction timeline.',
          timestamp: 'Today, 09:15 AM',
          status: 'replied',
          priority: 'Emergency',
          complaintId: 'CR-2026-8921',
          roadLocation: '2Q6Q+GPV, Makhmalabad Naka (Goodluck Chowk)'
        },
        {
          id: 'MSG-002',
          threadId: 'TH-2026-001',
          sender: 'contractor',
          senderName: 'Rajesh Sharma (Apex Infrastructure)',
          senderEmail: 'r.sharma@apexinfrastruct.com',
          recipientName: 'DPW Chief Road Engineer (Admin)',
          recipientEmail: 'admin.roads@nashikmunicipal.gov.in',
          subject: 'Re: Work Order #WO-892: Urgent Cold-Mix Patch on Makhmalabad Naka',
          body: 'Dear DPW Admin,\n\nAcknowledged and work is in progress. Crew #2 has mobilized to Goodluck Chowk with our 6MT hot-mix carrier and 3-ton vibratory compaction roller. Retro-reflective safety cones have been set up to divert single-lane traffic.\n\nSub-base gravel was cleared and bitumen tack-coat sprayed. Hot asphalt compaction is underway. Road will be fully cured and open before 3:30 PM.',
          timestamp: 'Today, 10:45 AM',
          status: 'acknowledged',
          priority: 'Emergency',
          complaintId: 'CR-2026-8921',
          roadLocation: '2Q6Q+GPV, Makhmalabad Naka (Goodluck Chowk)',
          constructionUpdate: {
            statusLabel: 'Hot-Mix Compaction in Progress',
            progressPercent: 75,
            materialUsed: 'Bitumen VG-30 + Crushed Aggregate',
            crewsOnSite: 6,
            completionEta: 'Today at 3:30 PM'
          }
        }
      ]
    },
    {
      threadId: 'TH-2026-002',
      contractorId: 'shree-tech',
      contractorName: 'Shree Road Tech & Infra Corp',
      contractorEmail: 'v.patil@shreeroadtech.com',
      contractorPhone: '+91 98230 11223',
      subject: 'Inspection & Repair Notice: Sunken Manhole on Makhmalabad Naka',
      complaintId: 'CR-2026-9042',
      roadLocation: 'Makhmalabad Naka, Panchavati',
      priority: 'High',
      lastUpdated: 'Yesterday, 06:20 PM',
      status: 'contractor_replied',
      messages: [
        {
          id: 'MSG-003',
          threadId: 'TH-2026-002',
          sender: 'admin',
          senderName: 'DPW Chief Road Engineer (Admin)',
          senderEmail: 'admin.roads@nashikmunicipal.gov.in',
          recipientName: 'Vikram Patil (Shree Road Tech)',
          recipientEmail: 'v.patil@shreeroadtech.com',
          subject: 'Inspection & Repair Notice: Sunken Manhole on Makhmalabad Naka',
          body: 'Attn: Vikram Patil,\n\nMunicipal road audit flagged an 85mm sunken manhole casing on Makhmalabad Naka opposite Shaniwar Wada. Two-wheelers are experiencing severe impact jolts.\n\nPlease arrange pre-cast concrete leveling rings and high-strength rapid curing epoxy mortar to bring casing flush with asphalt grade.',
          timestamp: 'Yesterday, 03:30 PM',
          status: 'replied',
          priority: 'High',
          complaintId: 'CR-2026-9042',
          roadLocation: 'Makhmalabad Naka, Panchavati'
        },
        {
          id: 'MSG-004',
          threadId: 'TH-2026-002',
          sender: 'contractor',
          senderName: 'Vikram Patil (Shree Road Tech)',
          senderEmail: 'v.patil@shreeroadtech.com',
          recipientName: 'DPW Chief Road Engineer (Admin)',
          recipientEmail: 'admin.roads@nashikmunicipal.gov.in',
          subject: 'Re: Inspection & Repair Notice: Sunken Manhole on Makhmalabad Naka',
          body: 'Sir, our field unit placed heavy-duty rubber barricades around the manhole yesterday at 5:00 PM. Frame has been lifted, reinforced with rapid-setting polymer concrete, and leveled flush.\n\nCold-mix transition apron completed. Curing finished overnight. Site is clear and open for municipal re-inspection.',
          timestamp: 'Yesterday, 06:20 PM',
          status: 'acknowledged',
          priority: 'High',
          complaintId: 'CR-2026-9042',
          roadLocation: 'Makhmalabad Naka, Panchavati',
          constructionUpdate: {
            statusLabel: 'Reinforcement & Leveling Completed',
            progressPercent: 100,
            materialUsed: 'Polymer Concrete + M-40 Grade Rings',
            crewsOnSite: 4,
            completionEta: 'Work Completed'
          }
        }
      ]
    },
    {
      threadId: 'TH-2026-003',
      contractorId: 'metro-bitumen',
      contractorName: 'Metro Bitumen & Road Works Ltd.',
      contractorEmail: 'a.deshmukh@metrobitumen.in',
      contractorPhone: '+91 98224 87654',
      subject: 'Work Order #WO-895: Sub-Base Re-surfacing on Makhmalabad Naka',
      complaintId: 'CR-2026-7811',
      roadLocation: '2Q6Q+GPV, Makhmalabad Naka (Sambhaji Park)',
      priority: 'Standard',
      lastUpdated: 'Today, 11:20 AM',
      status: 'awaiting_reply',
      messages: [
        {
          id: 'MSG-005',
          threadId: 'TH-2026-003',
          sender: 'admin',
          senderName: 'DPW Chief Road Engineer (Admin)',
          senderEmail: 'admin.roads@nashikmunicipal.gov.in',
          recipientName: 'Amit Deshmukh (Metro Bitumen)',
          recipientEmail: 'a.deshmukh@metrobitumen.in',
          subject: 'Work Order #WO-895: Sub-Base Re-surfacing on Makhmalabad Naka',
          body: 'Dear Amit Deshmukh,\n\nPlease review the attached road damage report CR-2026-7811 regarding extensive surface longitudinal cracks on Makhmalabad Naka northbound lane near Sambhaji Park.\n\nSchedule a crack-sealing and micro-surfacing crew for this weekend (night-shift 11:00 PM - 5:00 AM) to avoid disrupting daytime commercial bus traffic. Please confirm your crew allocation.',
          timestamp: 'Today, 11:20 AM',
          status: 'sent',
          priority: 'Standard',
          complaintId: 'CR-2026-7811',
          roadLocation: '2Q6Q+GPV, Makhmalabad Naka (Sambhaji Park)'
        }
      ]
    }
  ];

  private listeners: Array<() => void> = [];
  private unsubscribeFirestore: (() => void) | null = null;

  constructor() {
    this.initFirestore();
  }

  /** Seed Firestore with initial data and subscribe to real-time updates. */
  private async initFirestore(): Promise<void> {
    try {
      const {
        seedContractorsIfEmpty,
        seedThreadsIfEmpty,
        subscribeToThreads,
      } = await import('./firestoreService');
      await Promise.all([
        seedContractorsIfEmpty(REGISTERED_CONTRACTORS),
        seedThreadsIfEmpty(this.threads),
      ]);
      this.unsubscribeFirestore = subscribeToThreads((firestoreThreads) => {
        if (firestoreThreads.length > 0) {
          this.threads = firestoreThreads;
          this.notify();
        }
      });
    } catch (err) {
      console.warn('[ContractorEmailStore] Firestore unavailable, using local data.', err);
    }
  }

  getThreads(): EmailThread[] {
    return this.threads;
  }

  getThreadById(threadId: string): EmailThread | undefined {
    return this.threads.find(t => t.threadId === threadId);
  }

  getContractors(): ContractorProfile[] {
    return REGISTERED_CONTRACTORS;
  }

  getContractorById(id: string): ContractorProfile | undefined {
    return REGISTERED_CONTRACTORS.find(c => c.id === id);
  }

  sendAdminEmail(params: {
    contractorId: string;
    subject: string;
    body: string;
    complaintId?: string;
    roadLocation?: string;
    priority?: 'Emergency' | 'High' | 'Standard';
  }): EmailThread {
    const contractor = this.getContractorById(params.contractorId) || REGISTERED_CONTRACTORS[0];
    const newMsgId = `MSG-${Math.floor(100 + Math.random() * 900)}`;
    const newThreadId = `TH-2026-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: ContractorMessage = {
      id: newMsgId,
      threadId: newThreadId,
      sender: 'admin',
      senderName: 'DPW Chief Road Engineer (Admin)',
      senderEmail: 'admin.roads@nashikmunicipal.gov.in',
      recipientName: contractor.contactPerson,
      recipientEmail: contractor.email,
      subject: params.subject,
      body: params.body,
      timestamp: `Today, ${timeFormatted}`,
      status: 'sent',
      priority: params.priority || 'Standard',
      complaintId: params.complaintId,
      roadLocation: params.roadLocation
    };

    const newThread: EmailThread = {
      threadId: newThreadId,
      contractorId: contractor.id,
      contractorName: contractor.name,
      contractorEmail: contractor.email,
      contractorPhone: contractor.phone,
      subject: params.subject,
      complaintId: params.complaintId,
      roadLocation: params.roadLocation,
      priority: params.priority || 'Standard',
      lastUpdated: timeFormatted,
      status: 'awaiting_reply',
      messages: [newMsg]
    };

    this.threads.unshift(newThread);
    this.notify();
    // Persist to Firestore asynchronously
    import('./firestoreService')
      .then(({ addThreadToFirestore }) => addThreadToFirestore(newThread))
      .catch((err) => console.warn('[ContractorEmailStore] Failed to save thread to Firestore.', err));
    return newThread;
  }

  replyAsContractor(params: {
    threadId: string;
    replyBody: string;
    statusLabel?: string;
    progressPercent?: number;
    materialUsed?: string;
    crewsOnSite?: number;
    completionEta?: string;
  }): ContractorMessage | null {
    const thread = this.threads.find(t => t.threadId === params.threadId);
    if (!thread) return null;

    const contractor = this.getContractorById(thread.contractorId) || REGISTERED_CONTRACTORS[0];
    const newMsgId = `MSG-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const replyMsg: ContractorMessage = {
      id: newMsgId,
      threadId: thread.threadId,
      sender: 'contractor',
      senderName: contractor.contactPerson,
      senderEmail: contractor.email,
      recipientName: 'DPW Chief Road Engineer (Admin)',
      recipientEmail: 'admin.roads@nashikmunicipal.gov.in',
      subject: thread.subject.startsWith('Re: ') ? thread.subject : `Re: ${thread.subject}`,
      body: params.replyBody,
      timestamp: `Today, ${timeFormatted}`,
      status: 'acknowledged',
      priority: thread.priority,
      complaintId: thread.complaintId,
      roadLocation: thread.roadLocation,
      constructionUpdate: {
        statusLabel: params.statusLabel || 'Crew Mobilized & Work Underway',
        progressPercent: params.progressPercent || 50,
        materialUsed: params.materialUsed || 'Bitumen Grade VG-30 Hot-Mix',
        crewsOnSite: params.crewsOnSite || 5,
        completionEta: params.completionEta || 'Today before evening peak'
      }
    };

    thread.messages.push(replyMsg);
    thread.lastUpdated = timeFormatted;
    thread.status = (params.progressPercent && params.progressPercent >= 100) ? 'work_completed' : 'contractor_replied';

    this.notify();
    // Persist updated thread to Firestore asynchronously
    import('./firestoreService')
      .then(({ updateThreadInFirestore }) => updateThreadInFirestore(thread))
      .catch((err) => console.warn('[ContractorEmailStore] Failed to update thread in Firestore.', err));
    return replyMsg;
  }

  deleteThread(threadId: string) {
    this.threads = this.threads.filter(t => t.threadId !== threadId);
    this.notify();
    // Delete from Firestore asynchronously
    import('./firestoreService')
      .then(({ deleteThreadFromFirestore }) => deleteThreadFromFirestore(threadId))
      .catch((err) => console.warn('[ContractorEmailStore] Failed to delete thread from Firestore.', err));
  }

  destroy(): void {
    this.unsubscribeFirestore?.();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }
}

export const contractorEmailStore = new ContractorEmailStore();
