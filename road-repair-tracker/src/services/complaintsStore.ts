export interface Complaint {
  id: string;
  title: string;
  category: 'Pothole' | 'Deep Crack' | 'Faded Markings' | 'Manhole Defect' | 'Sinkhole';
  severity: 'Low' | 'Moderate' | 'Critical';
  status: 'new' | 'under-review' | 'assigned' | 'in-progress' | 'resolved';
  date: string;
  timestamp: string;
  // Geo-tag and location
  location: {
    address: string;
    street: string;
    ward: string;
    latitude: number;
    longitude: number;
    altitudeMeters: number;
    precisionMeters: number;
    googleMapsUrl: string;
    landmark?: string;
  };
  // Geo-tagged image details
  geoTagImage: {
    uri: string;
    timestamp: string;
    cameraSensor: string;
    watermark: string;
  };
  // Citizen Information
  citizen: {
    name: string;
    phone: string;
    email: string;
    isVerified: boolean;
    shareContactWithAdmin: boolean;
    ward: string;
  };
  // Citizen Suggestions & Feedback
  citizenSuggestions: string;
  suggestionTags: string[];
  // Project attributes
  roadType: string;
  estimatedDepth: string;
  trafficDensity: string;
  assignedContractor?: string;
  adminNotes?: string;
}

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'CR-2026-9042',
    title: 'Severe Rim-Damaging Pothole in Bus Lane',
    category: 'Pothole',
    severity: 'Critical',
    status: 'new',
    date: 'Today, 10:42 AM',
    timestamp: '2026-09-18T10:42:00Z',
    location: {
      address: '2Q6Q+GPV, Makhmalabad Naka, Panchavati, Nashik, Maharashtra 422003',
      street: 'Makhmalabad Naka (Eastbound)',
      ward: 'Ward 8 • Panchavati, Nashik',
      latitude: 18.52046,
      longitude: 73.85044,
      altitudeMeters: 560,
      precisionMeters: 1.8,
      googleMapsUrl: 'https://maps.google.com/?q=18.52046,73.85044&t=k&z=19',
      landmark: 'Near Shaniwar Wada & Mutha Riverfront'
    },
    geoTagImage: {
      uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHHYKNb7pG3Z3H1fzvp0NVPQhONNs6ra8CqOmnM1T_eRTL8gLcvz28sjSNN1YXY2hK1AeW1bVOW-0SR8zjyoHVSrgq6Red9VZYD0Gh1JWGYkKFnfObfO5dZCX1DE9MIxehySGCi5vzYgc6lGdny31K8KmI4A_7DdllFR2lrtmnzMyeGdYOpa-TghKsn8Oj5XPSz4Jpg4SBuHsp65Jo-xinhmciKcIKjDaunlPTFpkMtiZXqa7AZXwC',
      timestamp: '2026-09-18 10:41:22 UTC+5:30',
      cameraSensor: 'Sony IMX766 • F/1.8 • 1/250s',
      watermark: 'GPS: 18.5205°N, 73.8504°E | Alt: 560m | 2026-09-18 10:41'
    },
    citizen: {
      name: 'Rahul Patil',
      phone: '+91 98220 14890',
      email: 'rahul.patil@civicportal.org',
      isVerified: true,
      shareContactWithAdmin: true,
      ward: 'Ward 8'
    },
    citizenSuggestions: 'Urgent caution barricade or cold asphalt patch required right away before sunset. School buses and two-wheelers are violently swerving into oncoming traffic.',
    suggestionTags: ['⚠️ Urgent Barricade Needed', '🌧️ Rain Pooling Hazard', '🚲 Cyclist Skid Risk', '🚌 School Bus Route'],
    roadType: 'Arterial Corridor (Bus & Bike Lane)',
    estimatedDepth: '14.2 cm (Deep)',
    trafficDensity: 'High (850 vehicles/hr)'
  },
  {
    id: 'CR-2026-8921',
    title: 'Cluster Pothole & Sub-base Exposure',
    category: 'Pothole',
    severity: 'Critical',
    status: 'assigned',
    date: 'Yesterday, 4:15 PM',
    timestamp: '2026-09-17T16:15:00Z',
    location: {
      address: '2Q6Q+GPV, Makhmalabad Naka, Panchavati, Nashik, Maharashtra 422003',
      street: 'Makhmalabad Naka (Near Goodluck Cafe)',
      ward: 'Ward 4 • Makhmalabad, Nashik',
      latitude: 18.5246,
      longitude: 73.8415,
      altitudeMeters: 562,
      precisionMeters: 1.5,
      googleMapsUrl: 'https://maps.google.com/?q=18.5246,73.8415&t=k&z=19',
      landmark: 'Near Fergusson College Main Gate'
    },
    geoTagImage: {
      uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCEkDUzGA9hWz0SLX-qSbrt_Qtv8cCWDu8P-ADqN1tRWk0XttN9GFySosoEd2_0-hTXpoRwgugSVk3uLuROfTE3b5uInQP40spotBfFeCMCAM_yPVejzU8Va411Rtf9S6JZ0pMT65TjEZo7qZv4Fw21JN4T6_wKPZM5w7Lij3WjILNqXenvRhsMrYgMibOnjl5t9nCTSIeGdI_9zTIMP5pGlwZfrKbLPKeagbDMXKlLiLSvGWeDrbau',
      timestamp: '2026-09-17 16:14:05 UTC+5:30',
      cameraSensor: 'Samsung GN2 • F/1.9 • 1/500s',
      watermark: 'GPS: 18.5246°N, 73.8415°E | Alt: 562m | 2026-09-17 16:14'
    },
    citizen: {
      name: 'Maya Chen',
      phone: '+91 94223 89321',
      email: 'm.chen@nashik.org',
      isVerified: true,
      shareContactWithAdmin: true,
      ward: 'Ward 4'
    },
    citizenSuggestions: 'Suggested hot-mix asphalt overlay across 10 meters. The aggregate is tearing tire sidewalls.',
    suggestionTags: ['🚗 Rim Damage Risk', '👷 Recommend Hot-Mix Overlay'],
    roadType: 'Commercial Main Street',
    estimatedDepth: '11.5 cm',
    trafficDensity: 'Very High (1,200 vehicles/hr)',
    assignedContractor: 'RoadWorks Municipal Crew #4'
  },
  {
    id: 'CR-2026-8840',
    title: 'Longitudinal Asphalt Fissure along Ramp',
    category: 'Deep Crack',
    severity: 'Moderate',
    status: 'under-review',
    date: 'Sep 16, 2026',
    timestamp: '2026-09-16T14:30:00Z',
    location: {
      address: '2Q6Q+GPV, Makhmalabad Naka, Panchavati, Nashik, Maharashtra 422003',
      street: 'Makhmalabad Naka (Opposite Sambhaji Park)',
      ward: 'Ward 5 • Panchavati, Nashik',
      latitude: 18.5222,
      longitude: 73.8482,
      altitudeMeters: 558,
      precisionMeters: 2.1,
      googleMapsUrl: 'https://maps.google.com/?q=18.5222,73.8482&t=k&z=19',
      landmark: 'Near Panchavati Corner & Bus Terminal'
    },
    geoTagImage: {
      uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAKvD7t4mrCjgkGHs4UNDq1CjUyTF6Grrs4ttjnkk6eVdtRZ-_lJqN2DWb6SdPe1dO-SYictmCKbaNoeCs2HB1Ylsw9VFlPAzxm9CAZLTPRgIYKgalYOQxudv1ViWGzORAnypBNEutmOtSthGVPIBWW3gwU8RtToiq71vHt9GfEjXmkOvnHUHoxcY6bUp-L2z-HbonbX2PCmQKiMDVfWuvXabxJqpWfz5DcleeRwv8WtajL3_HGzb5H',
      timestamp: '2026-09-16 14:28:50 UTC+5:30',
      cameraSensor: 'iPhone 15 Pro • F/2.2 • 1/1000s',
      watermark: 'GPS: 18.5222°N, 73.8482°E | Alt: 558m | 2026-09-16 14:28'
    },
    citizen: {
      name: 'David Patel',
      phone: '+91 91580 79014',
      email: 'dpatel@transport.net',
      isVerified: false,
      shareContactWithAdmin: true,
      ward: 'Ward 5'
    },
    citizenSuggestions: 'Crack sealing bitumen should be applied before winter rains broaden the fracture into full potholes.',
    suggestionTags: ['🌧️ Rain Pooling Hazard', '👷 Bitumen Seal Recommended'],
    roadType: 'Highway Exit Ramp',
    estimatedDepth: '4.8 cm',
    trafficDensity: 'High (Speed limit 45mph)'
  },
  {
    id: 'CR-2026-8715',
    title: 'Displaced Storm Drain Manhole Cover',
    category: 'Manhole Defect',
    severity: 'Critical',
    status: 'new',
    date: 'Today, 8:10 AM',
    timestamp: '2026-09-18T08:10:00Z',
    location: {
      address: '2Q6Q+GPV, Makhmalabad Naka, Panchavati, Nashik, Maharashtra 422003',
      street: 'SB Road (Near Symbiosis Campus)',
      ward: 'Ward 7 • SB Road Corridor, Nashik',
      latitude: 18.5314,
      longitude: 73.8296,
      altitudeMeters: 565,
      precisionMeters: 1.2,
      googleMapsUrl: 'https://maps.google.com/?q=18.5314,73.8296&t=k&z=19',
      landmark: 'Near ICC Trade Towers & Symbiosis'
    },
    geoTagImage: {
      uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVRWiKE8SjaWA9pamQH1j8vlPQswLi7Uz1i6f_idxIMg52DhNi3lY7msUOHl7A_zPFQVWFqKVPy5X9DuNCNDOK5zmwYcG5N7YSK9FTXZ0ZoHBe336T_DYdtsHeeUUqz3MyU1mu_Kq-JITRViOmOM3vLAQjtnSQIdAj9yQ3kHoUzA0dbPjnzvFhSPe9NqwcywTSE4SskCI6V1l7ptirtTAUrW_n87HMvQ8tAV2oOrrfUismNKNd7DQo',
      timestamp: '2026-09-18 08:09:12 UTC+5:30',
      cameraSensor: 'Sony IMX890 • F/1.8 • 1/400s',
      watermark: 'GPS: 18.5314°N, 73.8296°E | Alt: 565m | 2026-09-18 08:09'
    },
    citizen: {
      name: 'Sarah Jenkins',
      phone: '+91 97650 94402',
      email: 'sjenkins@downtown.org',
      isVerified: true,
      shareContactWithAdmin: true,
      ward: 'Ward 7'
    },
    citizenSuggestions: 'Lid has shifted 3 inches off center creating an open gap. Pedestrians could easily trip or bicycles fall into drain shaft. Immediate reset and locking ring needed.',
    suggestionTags: ['⚠️ Urgent Barricade Needed', '🚲 Cyclist Skid Risk', '🚶 Pedestrian Fall Danger'],
    roadType: 'Downtown Transit Mall',
    estimatedDepth: '18.0 cm Void',
    trafficDensity: 'High Pedestrian & Transit'
  }
];

class ComplaintsStore {
  private complaints: Complaint[] = [...INITIAL_COMPLAINTS];
  private listeners: Array<() => void> = [];
  private unsubscribeFirestore: (() => void) | null = null;

  constructor() {
    this.initFirestore();
  }

  /** Seed Firestore with initial data and subscribe to real-time updates. */
  private async initFirestore(): Promise<void> {
    try {
      const { seedComplaintsIfEmpty, subscribeToComplaints } = await import('./firestoreService');
      await seedComplaintsIfEmpty(INITIAL_COMPLAINTS);
      this.unsubscribeFirestore = subscribeToComplaints((firestoreComplaints) => {
        if (firestoreComplaints.length > 0) {
          this.complaints = firestoreComplaints;
          this.notify();
        }
      });
    } catch (err) {
      console.warn('[ComplaintsStore] Firestore unavailable, using local data.', err);
    }
  }

  getComplaints(): Complaint[] {
    return this.complaints;
  }

  getComplaintById(id: string): Complaint | undefined {
    return this.complaints.find(c => c.id === id);
  }

  async addComplaint(newComplaint: Complaint): Promise<void> {
    // Optimistic update
    this.complaints = [newComplaint, ...this.complaints];
    this.notify();
    try {
      const { addComplaintToFirestore } = await import('./firestoreService');
      await addComplaintToFirestore(newComplaint);
    } catch (err) {
      console.warn('[ComplaintsStore] Failed to persist complaint to Firestore.', err);
    }
  }

  async updateComplaintStatus(id: string, status: Complaint['status'], assignedContractor?: string): Promise<void> {
    // Optimistic update
    this.complaints = this.complaints.map(c => {
      if (c.id === id) {
        return { ...c, status, ...(assignedContractor ? { assignedContractor } : {}) };
      }
      return c;
    });
    this.notify();
    try {
      const { updateComplaintStatusInFirestore } = await import('./firestoreService');
      await updateComplaintStatusInFirestore(id, status, assignedContractor);
    } catch (err) {
      console.warn('[ComplaintsStore] Failed to update complaint in Firestore.', err);
    }
  }

  async deleteComplaint(id: string): Promise<void> {
    // Optimistic update
    this.complaints = this.complaints.filter(c => c.id !== id);
    this.notify();
    try {
      const { deleteComplaintFromFirestore } = await import('./firestoreService');
      await deleteComplaintFromFirestore(id);
    } catch (err) {
      console.warn('[ComplaintsStore] Failed to delete complaint from Firestore.', err);
    }
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  destroy(): void {
    this.unsubscribeFirestore?.();
  }

  private notify(): void {
    this.listeners.forEach(l => l());
  }
}

export const complaintsStore = new ComplaintsStore();
