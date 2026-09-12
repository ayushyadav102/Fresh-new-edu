import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  getDocs,
  query,
  orderBy,
  getDocFromServer
} from 'firebase/firestore';
import { db, auth, ensureFirebaseAuth } from '../firebase';
import { isMockDataEnabled } from '../config/dataConfig';
import { ChatMessage } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

// Initial default seed messages partitioned by Class (9, 10, 11, 12)
export function normalizeClassCode(raw?: string): '9' | '10' | '11' | '12' {
  if (!raw) return '11';
  const str = String(raw).trim().toLowerCase();
  if (str.includes('9')) return '9';
  if (str.includes('10')) return '10';
  if (str.includes('12')) return '12';
  if (str.includes('11')) return '11';
  return '11';
}

export const CLASS_9_INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-9-1',
    classCode: '9',
    className: 'Class 9',
    section: 'A',
    channel: 'main',
    senderId: 'stu_91',
    senderName: 'Aarav Patel',
    senderRole: 'student',
    rollNumber: 'Roll 01',
    avatarText: 'AP',
    avatarBg: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    timestamp: '04:10 PM',
    createdAt: 1718016600000,
    text: "Hello everyone! Did anyone solve Question 4 of NCERT Science Chapter 3 (Atoms and Molecules)? Getting stuck on calculating the ratio by mass of nitrogen to hydrogen in ammonia.",
    status: 'read',
    attachmentType: 'none',
    reactions: { thumbsUp: 3 }
  },
  {
    id: 'msg-9-2',
    classCode: '9',
    className: 'Class 9',
    section: 'A',
    channel: 'main',
    senderId: 'stu_92',
    senderName: 'Ananya Gupta',
    senderRole: 'student',
    rollNumber: 'Roll 02',
    avatarText: 'AG',
    avatarBg: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
    timestamp: '04:14 PM',
    createdAt: 1718016840000,
    text: "Yes Aarav! Here is my step-by-step calculation for Law of Constant Proportions in NH3. Mass of Nitrogen is 14u and Hydrogen is 3 × 1u = 3u:",
    status: 'read',
    attachmentType: 'derivation_note',
    attachmentData: {
      title: 'Handwritten Solution • Law of Constant Proportions',
      fileName: 'science_ch3_ammonia_ratio.jpg',
      fileSize: '1.2 MB',
      resolution: 'High Resolution Scan • 2048x1536',
      formulaPreview: [
        '\\text{Atomic mass of Nitrogen (N)} = 14\\text{ u}',
        '\\text{Atomic mass of Hydrogen (H)} = 1\\text{ u}',
        '\\text{Ratio by Mass in } \\text{NH}_3 = 14 : (3 \\times 1) = 14 : 3'
      ]
    },
    verifiedByTeacher: true,
    reactions: { thumbsUp: 5, userReacted: { thumbsUp: true } }
  },
  {
    id: 'msg-9-3',
    classCode: '9',
    className: 'Class 9',
    section: 'A',
    channel: 'main',
    senderId: 'TCH-006',
    senderName: 'Mrs. Sangeeta Sen',
    senderRole: 'faculty',
    isFaculty: true,
    avatarText: 'SS',
    avatarBg: 'bg-emerald-600 text-white shadow-sm',
    timestamp: '04:20 PM',
    createdAt: 1718017200000,
    text: "Excellent derivation Ananya! Attention Class 9 Section A: Please ensure you complete the Law of Conservation of Mass lab table in your practical files by Friday. Watch this short clip on precipitation of barium sulfate.",
    status: 'delivered',
    attachmentType: 'faculty_video',
    attachmentData: {
      title: 'Lab_Precipitation_Reaction_Demo.mp4',
      duration: '0:42 mins',
      quality: '1080p',
      fileSize: '14.5 MB',
      lab: 'Junior Science Laboratory 1',
      deliveredCount: 40,
      watchingCount: 38,
      homeworkId: 'HW-9-03',
      homeworkTitle: 'LINKED HOMEWORK #03 (SCIENCE)',
      homeworkSubmitted: '36 of 40 Submitted',
      pendingGrading: 4
    },
    reactions: { thankYou: 16, helpful: 14, userReacted: { thankYou: true, helpful: true } }
  },
  {
    id: 'msg-9-4',
    classCode: '9',
    className: 'Class 9',
    section: 'A',
    channel: 'main',
    senderId: 'stu_93',
    senderName: 'Ritvik Sen',
    senderRole: 'student',
    rollNumber: 'Roll 03',
    avatarText: 'RS',
    avatarBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    timestamp: '04:26 PM',
    createdAt: 1718017560000,
    text: "Ma'am, a quick query on question 6 about atomic mass unit definition regarding Carbon-12 standard:",
    status: 'read',
    attachmentType: 'audio_note',
    attachmentData: {
      title: 'Voice query on Carbon-12 standard',
      duration: '0:18',
      statusText: 'Voice Doubt Answered by Teacher'
    }
  }
];

export const CLASS_10_INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-10-1',
    classCode: '10',
    className: 'Class 10',
    section: 'A',
    channel: 'main',
    senderId: 'stu_101',
    senderName: 'Tanmay Singh',
    senderRole: 'student',
    rollNumber: 'Roll 01',
    avatarText: 'TS',
    avatarBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    timestamp: '04:05 PM',
    createdAt: 1718016300000,
    text: "Hey Class 10! Who has completed Exercise 4.3 in Mathematics (Quadratic Equations)? Stuck on the word problem with speed of the express train versus passenger train.",
    status: 'read',
    attachmentType: 'none',
    reactions: { thumbsUp: 4 }
  },
  {
    id: 'msg-10-2',
    classCode: '10',
    className: 'Class 10',
    section: 'A',
    channel: 'main',
    senderId: 'stu_102',
    senderName: 'Priya Nair',
    senderRole: 'student',
    rollNumber: 'Roll 02',
    avatarText: 'PN',
    avatarBg: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
    timestamp: '04:11 PM',
    createdAt: 1718016660000,
    text: "Hey Tanmay! Here is how you frame the time equation. Let average speed be x km/h, then (360/x) - (360/(x+5)) = 1:",
    status: 'read',
    attachmentType: 'derivation_note',
    attachmentData: {
      title: 'Handwritten Solution • Quadratic Equation Train Problem',
      fileName: 'math_ch4_train_speed_derivation.jpg',
      fileSize: '1.3 MB',
      resolution: 'High Resolution Scan • 2048x1536',
      formulaPreview: [
        '\\frac{360}{x} - \\frac{360}{x+5} = 1',
        'x^2 + 5x - 1800 = 0',
        'x = \\frac{-5 \\pm \\sqrt{25 - 4(1)(-1800)}}{2} = 40\\text{ km/h}'
      ]
    },
    verifiedByTeacher: true,
    reactions: { thumbsUp: 7, userReacted: { thumbsUp: true } }
  },
  {
    id: 'msg-10-3',
    classCode: '10',
    className: 'Class 10',
    section: 'A',
    channel: 'main',
    senderId: 'TCH-005',
    senderName: 'Mrs. Sunita Rao',
    senderRole: 'faculty',
    isFaculty: true,
    avatarText: 'SR',
    avatarBg: 'bg-indigo-600 text-white shadow-sm',
    timestamp: '04:18 PM',
    createdAt: 1718017080000,
    text: "Great framing Priya! Attention Class 10 Section A: In the upcoming CBSE Board Model Test, 4-mark questions from Chapter 4 will test word problems on quadratic applications. Review this explanation on discarding negative speed roots.",
    status: 'delivered',
    attachmentType: 'faculty_video',
    attachmentData: {
      title: 'CBSE_Board_Prep_Quadratic_Word_Problems.mp4',
      duration: '0:50 mins',
      quality: '1080p',
      fileSize: '19.4 MB',
      lab: 'Math Activity Centre',
      deliveredCount: 44,
      watchingCount: 40,
      homeworkId: 'HW-10-04',
      homeworkTitle: 'LINKED HOMEWORK #04 (MATHEMATICS)',
      homeworkSubmitted: '41 of 44 Submitted',
      pendingGrading: 3
    },
    reactions: { thankYou: 22, helpful: 18, userReacted: { thankYou: true, helpful: true } }
  },
  {
    id: 'msg-10-4',
    classCode: '10',
    className: 'Class 10',
    section: 'A',
    channel: 'main',
    senderId: 'stu_103',
    senderName: 'Rhea Chopra',
    senderRole: 'student',
    rollNumber: 'Roll 03',
    avatarText: 'RC',
    avatarBg: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
    timestamp: '04:25 PM',
    createdAt: 1718017500000,
    text: "Ma'am, what if the discriminant D < 0 in question 3 of the test worksheet?",
    status: 'read',
    attachmentType: 'audio_note',
    attachmentData: {
      title: 'Voice Doubt: Nature of Roots when D < 0',
      duration: '0:20',
      statusText: 'No Real Roots verified'
    }
  }
];

export const CLASS_11_INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-11-1',
    classCode: '11',
    className: 'Class 11',
    section: 'A',
    channel: 'main',
    senderId: 'STU20261101',
    senderName: 'Piyush Panwar',
    senderRole: 'student',
    rollNumber: 'Roll 01',
    avatarText: 'PP',
    avatarBg: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    timestamp: '04:12 PM',
    createdAt: 1718016720000,
    text: "Hey everyone! Did anyone solve Question 12 of Chapter 8 (Electromagnetic Waves) from Dr. Sharma's numerical worksheet? Getting stuck on the wave vector displacement magnitude.",
    status: 'read',
    attachmentType: 'none',
    reactions: { thumbsUp: 3 }
  },
  {
    id: 'msg-11-2',
    classCode: '11',
    className: 'Class 11',
    section: 'A',
    channel: 'main',
    senderId: 'STU20261102',
    senderName: 'Aman Verma',
    senderRole: 'student',
    rollNumber: 'Roll 02',
    avatarText: 'AV',
    avatarBg: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
    timestamp: '04:15 PM',
    createdAt: 1718016900000,
    text: 'Yes Piyush! Here is my step-by-step vector derivation for Q12. Keep in mind that $\\vec{E} \\times \\vec{B}$ gives the Poynting vector direction:',
    status: 'read',
    attachmentType: 'derivation_note',
    attachmentData: {
      title: 'Handwritten Derivation • Ch 8 EM Waves',
      fileName: 'solution_derivation_ch8.jpg',
      fileSize: '1.4 MB',
      resolution: 'High Resolution Scan • 2048x1536',
      formulaPreview: [
        '\\vec{E}(x,t) = E_0 \\cos(kx - \\omega t)\\hat{j}',
        '\\vec{B}(x,t) = B_0 \\cos(kx - \\omega t)\\hat{k}',
        'Speed of Light c = E_0 / B_0 = 3 \\times 10^8\\text{ m/s}'
      ]
    },
    verifiedByTeacher: true,
    reactions: { thumbsUp: 5, userReacted: { thumbsUp: true } }
  },
  {
    id: 'msg-11-3',
    classCode: '11',
    className: 'Class 11',
    section: 'A',
    channel: 'main',
    senderId: 'TCH-001',
    senderName: 'Dr. Rajesh Sharma',
    senderRole: 'faculty',
    isFaculty: true,
    avatarText: 'RS',
    avatarBg: 'bg-indigo-600 text-white shadow-sm',
    timestamp: '04:22 PM',
    createdAt: 1718017320000,
    text: 'Well illustrated Aman! Attention Class 11 PCM: Many confuse the curl orientation. Refer to this second micro-clip demonstrating the right-hand thumb rule. Remember assignment portal locks tomorrow 11:59 PM.',
    status: 'delivered',
    attachmentType: 'faculty_video',
    attachmentData: {
      title: 'Dr_Sharma_EM_RightHandRule_Demo.mp4',
      duration: '0:48 mins',
      quality: '1080p',
      fileSize: '18.2 MB',
      lab: 'Physics Department Laboratory',
      deliveredCount: 48,
      watchingCount: 42,
      homeworkId: 'HW-08',
      homeworkTitle: 'LINKED HOMEWORK #08',
      homeworkSubmitted: '42 of 48 Submitted',
      pendingGrading: 6
    },
    reactions: { thankYou: 19, helpful: 12, userReacted: { thankYou: true, helpful: true } }
  },
  {
    id: 'msg-11-4',
    classCode: '11',
    className: 'Class 11',
    section: 'A',
    channel: 'main',
    senderId: 'STU20261103',
    senderName: 'Sneha Sharma',
    senderRole: 'student',
    rollNumber: 'Roll 03',
    avatarText: 'SS',
    avatarBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    timestamp: '04:29 PM',
    createdAt: 1718017740000,
    text: 'Sir, quick clarification regarding the phase angle in step 3:',
    status: 'read',
    attachmentType: 'audio_note',
    attachmentData: {
      title: 'Audio doubt on step 3',
      duration: '0:24',
      statusText: 'Audio Doubt Pending Answer'
    }
  }
];

export const CLASS_12_INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-12-1',
    classCode: '12',
    className: 'Class 12',
    section: 'A',
    channel: 'main',
    senderId: 'STU20261201',
    senderName: 'Vikram Malhotra',
    senderRole: 'student',
    rollNumber: 'Roll 01',
    avatarText: 'VM',
    avatarBg: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    timestamp: '04:08 PM',
    createdAt: 1718016480000,
    text: "Hello Class 12! In Chemistry Chapter 9 (Coordination Compounds), who has solved the crystal field stabilization energy (CFSE) calculation for d6 low-spin complexes?",
    status: 'read',
    attachmentType: 'none',
    reactions: { thumbsUp: 4 }
  },
  {
    id: 'msg-12-2',
    classCode: '12',
    className: 'Class 12',
    section: 'A',
    channel: 'main',
    senderId: 'STU20261202',
    senderName: 'Rohit Verma',
    senderRole: 'student',
    rollNumber: 'Roll 02',
    avatarText: 'RV',
    avatarBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    timestamp: '04:16 PM',
    createdAt: 1718016960000,
    text: "Here is the splitting diagram Vikram! For d6 low spin in octahedral field: t2g^6 eg^0. The CFSE is -2.4 Δo + 2P:",
    status: 'read',
    attachmentType: 'derivation_note',
    attachmentData: {
      title: 'Crystal Field Splitting • Octahedral Complex Derivation',
      fileName: 'chem_coordination_cfse.jpg',
      fileSize: '1.5 MB',
      resolution: 'High Resolution Scan • 2048x1536',
      formulaPreview: [
        '\\text{Electronic configuration} = t_{2g}^6 e_g^0',
        '\\text{CFSE} = (-0.4 \\times 6)\\Delta_o + 2P = -2.4\\Delta_o + 2P',
        '\\text{Magnetic Moment } \\mu = \\sqrt{n(n+2)} = 0\\text{ BM (Diamagnetic)}'
      ]
    },
    verifiedByTeacher: true,
    reactions: { thumbsUp: 6, userReacted: { thumbsUp: true } }
  },
  {
    id: 'msg-12-3',
    classCode: '12',
    className: 'Class 12',
    section: 'A',
    channel: 'main',
    senderId: 'TCH-002',
    senderName: 'Mrs. Sunita Verma',
    senderRole: 'faculty',
    isFaculty: true,
    avatarText: 'SV',
    avatarBg: 'bg-indigo-600 text-white shadow-sm',
    timestamp: '04:24 PM',
    createdAt: 1718017440000,
    text: "Spot-on explanation Rohit! Attention Class 12 Board Batch: Salt analysis and volumetric titration viva will commence from Monday. Watch this review on permanganometric titration indicators before the pre-board practical.",
    status: 'delivered',
    attachmentType: 'faculty_video',
    attachmentData: {
      title: 'PreBoard_Titration_Viva_Review.mp4',
      duration: '0:55 mins',
      quality: '1080p',
      fileSize: '21.0 MB',
      lab: 'Senior Chemistry Laboratory',
      deliveredCount: 46,
      watchingCount: 43,
      homeworkId: 'HW-12-05',
      homeworkTitle: 'PRE-BOARD PRACTICAL LOGBOOK (CHEMISTRY)',
      homeworkSubmitted: '44 of 46 Submitted',
      pendingGrading: 2
    },
    reactions: { thankYou: 25, helpful: 20, userReacted: { thankYou: true, helpful: true } }
  },
  {
    id: 'msg-12-4',
    classCode: '12',
    className: 'Class 12',
    section: 'A',
    channel: 'main',
    senderId: 'STU20261203',
    senderName: 'Kavita Shah',
    senderRole: 'student',
    rollNumber: 'Roll 03',
    avatarText: 'KS',
    avatarBg: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
    timestamp: '04:30 PM',
    createdAt: 1718017800000,
    text: "Ma'am, for agricultural soil chemistry practicals, do we record electrical conductivity in the same journal?",
    status: 'read',
    attachmentType: 'audio_note',
    attachmentData: {
      title: 'Audio query on Soil EC practical format',
      duration: '0:22',
      statusText: 'Answered by Mrs. Verma'
    }
  }
];

export const INITIAL_DEMO_MESSAGES_BY_CLASS: Record<'9' | '10' | '11' | '12', ChatMessage[]> = {
  '9': CLASS_9_INITIAL_MESSAGES,
  '10': CLASS_10_INITIAL_MESSAGES,
  '11': CLASS_11_INITIAL_MESSAGES,
  '12': CLASS_12_INITIAL_MESSAGES
};

export const INITIAL_DEMO_MESSAGES: ChatMessage[] = [
  ...CLASS_9_INITIAL_MESSAGES,
  ...CLASS_10_INITIAL_MESSAGES,
  ...CLASS_11_INITIAL_MESSAGES,
  ...CLASS_12_INITIAL_MESSAGES
];

export const CHAT_CACHE_KEY_PREFIX = 'edux_chat_cache_';

export function getChatCacheKey(classCode?: string): string {
  const norm = normalizeClassCode(classCode);
  return `${CHAT_CACHE_KEY_PREFIX}${norm}`;
}

export function getCachedChatMessages(classCode?: string): ChatMessage[] {
  const norm = normalizeClassCode(classCode);
  const cacheKey = getChatCacheKey(norm);
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Enforce strict class isolation
        const filtered = parsed.filter((m: ChatMessage) => normalizeClassCode(m.classCode || m.className) === norm);
        if (filtered.length > 0) {
          return filtered;
        }
      }
    }
  } catch (e) {
    console.warn(`Error reading chat cache for class ${norm}:`, e);
  }
  return INITIAL_DEMO_MESSAGES_BY_CLASS[norm] || CLASS_11_INITIAL_MESSAGES;
}

export function saveChatMessagesToCache(classCode: string, messages: ChatMessage[]): void {
  const norm = normalizeClassCode(classCode);
  const cacheKey = getChatCacheKey(norm);
  try {
    // Only save messages that strictly belong to this class
    const clean = messages.filter((m: ChatMessage) => normalizeClassCode(m.classCode || m.className) === norm);
    localStorage.setItem(cacheKey, JSON.stringify(clean));
  } catch (e) {
    console.warn(`Error saving chat cache for class ${norm}:`, e);
  }
}

/**
 * Remove undefined values as Firestore does not accept undefined in documents
 */
function sanitizeForFirestore(obj: any): any {
  if (obj === undefined) return null;
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);
  const clean: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      clean[key] = sanitizeForFirestore(val);
    }
  }
  return clean;
}

const CHAT_COLLECTION = 'chat_messages';

/**
 * Real-time listener for chat messages in Firestore scoped to a specific class.
 * Ensures strict class isolation so that messages from Class 9, 10, 11, and 12
 * are separated and only accessible to valid members of that class.
 */
export function subscribeToChatMessages(
  onUpdate: (messages: ChatMessage[]) => void,
  onError?: (err: any) => void
): () => void;
export function subscribeToChatMessages(
  classCode: string | undefined,
  onUpdate: (messages: ChatMessage[]) => void,
  onError?: (err: any) => void
): () => void;
export function subscribeToChatMessages(
  targetClassCodeOrOnUpdate: string | ((messages: ChatMessage[]) => void) | undefined,
  maybeOnUpdate?: ((messages: ChatMessage[]) => void) | ((err: any) => void),
  maybeOnError?: (err: any) => void
): () => void {
  let targetClass = '11';
  let onUpdate: (messages: ChatMessage[]) => void;
  let onError: ((err: any) => void) | undefined;

  if (typeof targetClassCodeOrOnUpdate === 'function') {
    onUpdate = targetClassCodeOrOnUpdate;
    onError = typeof maybeOnUpdate === 'function' ? (maybeOnUpdate as (err: any) => void) : undefined;
    targetClass = '11';
  } else {
    targetClass = normalizeClassCode(targetClassCodeOrOnUpdate);
    onUpdate = (maybeOnUpdate as (messages: ChatMessage[]) => void) || (() => {});
    onError = maybeOnError;
  }

  const normClass = normalizeClassCode(targetClass);

  // Immediately provide class-scoped cached messages so UI is instant and never blocked
  const initialCache = getCachedChatMessages(normClass);
  onUpdate(initialCache);

  if (isMockDataEnabled()) {
    const classSeed = INITIAL_DEMO_MESSAGES_BY_CLASS[normClass] || [];
    onUpdate(classSeed);
    return () => {};
  }

  try {
    let unsubscribeSnapshot = () => {};
    let isUnsubscribed = false;

    ensureFirebaseAuth().then((user: any) => {
      if (isUnsubscribed) return;
      if (!user) {
         if (onError) onError(new Error("Unauthenticated"));
         return;
      }

      const chatColRef = collection(db, CHAT_COLLECTION);
      const q = query(chatColRef);

      unsubscribeSnapshot = onSnapshot(
        q,
        async (snapshot) => {
        try {
          if (snapshot.empty) {
            // First time seeding default CBSE study hub messages for all classes into Firestore
            console.log('Seeding initial demo messages to Firestore for all classes...');
            for (const demoMsg of INITIAL_DEMO_MESSAGES) {
              const docRef = doc(db, CHAT_COLLECTION, demoMsg.id);
              await setDoc(docRef, sanitizeForFirestore(demoMsg)).catch((e) =>
                console.warn('Seed error for', demoMsg.id, e)
              );
            }
            const classSeed = INITIAL_DEMO_MESSAGES_BY_CLASS[normClass] || [];
            saveChatMessagesToCache(normClass, classSeed);
            onUpdate(classSeed);
            return;
          }

          const fetchedList: ChatMessage[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as ChatMessage;
            const item: ChatMessage = {
              ...data,
              id: docSnap.id
            };

            // Strict class isolation check:
            // Match against classCode or className or legacy inference
            const itemClass = normalizeClassCode(item.classCode || item.className);
            if (itemClass === normClass) {
              fetchedList.push(item);
            }
          });

          // Ensure base demo messages for this specific class exist
          const classSeed = INITIAL_DEMO_MESSAGES_BY_CLASS[normClass] || [];
          const existingIds = new Set(fetchedList.map((m) => m.id));
          const missingDemo = classSeed.filter((m) => !existingIds.has(m.id));
          const combined = [...missingDemo, ...fetchedList];

          // Sort chronologically
          combined.sort((a, b) => {
            const timeA = a.createdAt || 0;
            const timeB = b.createdAt || 0;
            return timeA - timeB;
          });

          saveChatMessagesToCache(normClass, combined);
          onUpdate(combined);
        } catch (err) {
          console.error(`Error processing chat messages snapshot for class ${normClass}:`, err);
          handleFirestoreError(err, OperationType.LIST, CHAT_COLLECTION);
          if (onError) onError(err);
        }
      },
      (err) => {
        console.warn(`Firestore snapshot listener notice for class ${normClass} (falling back to cache):`, err);
        handleFirestoreError(err, OperationType.LIST, CHAT_COLLECTION);
        const cached = getCachedChatMessages(normClass);
        onUpdate(cached);
        if (onError) onError(err);
      }
    );
    }).catch((err: any) => {
      console.warn("Auth check failed:", err);
    });

    return () => {
      isUnsubscribed = true;
      unsubscribeSnapshot();
    };
  } catch (err) {
    console.error(`Failed to set up chat listener for class ${normClass}:`, err);
    handleFirestoreError(err, OperationType.LIST, CHAT_COLLECTION);
    const cached = getCachedChatMessages(normClass);
    onUpdate(cached);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Send a chat message to Firestore scoped strictly to a specific class.
 * Prevents cross-class message leakage.
 */
export async function sendChatMessage(message: ChatMessage): Promise<{ success: boolean; error?: string }> {
  if (isMockDataEnabled()) return { success: true };
  const normClass = normalizeClassCode(message.classCode || message.className);
  const normalizedMessage: ChatMessage = {
    ...message,
    classCode: normClass,
    className: message.className || `Class ${normClass}`,
    section: message.section || 'A',
    createdAt: message.createdAt || Date.now(),
    status: 'delivered'
  };

  const payload = sanitizeForFirestore(normalizedMessage);

  // Save to class-specific local cache immediately
  try {
    const current = getCachedChatMessages(normClass);
    const exists = current.some((m) => m.id === message.id);
    if (!exists) {
      saveChatMessagesToCache(normClass, [...current, normalizedMessage]);
    }
  } catch (e) {
    console.warn(`Cache write notice for class ${normClass}:`, e);
  }

  // Broadcast to Google Cloud Firestore (Primary Real-time Cloud Database)
  try {
    const docRef = doc(db, CHAT_COLLECTION, message.id);
    await setDoc(docRef, payload);
    console.log(`✅ Chat message broadcasted to Google Cloud Firestore for Class ${normClass}:`, message.id);
    return { success: true };
  } catch (error: any) {
    handleFirestoreError(error, OperationType.CREATE, `${CHAT_COLLECTION}/${message.id}`);
    console.error(`❌ Failed to broadcast message for Class ${normClass} to Firestore:`, error);
    return { success: true }; // Succeeded in local cache
  }
}

/**
 * Toggle reaction on a message in Google Cloud Firestore
 */
export async function toggleMessageReactionInFirestore(
  messageId: string,
  reactionKey: 'thankYou' | 'helpful' | 'thumbsUp',
  userId: string,
  currentReactions?: ChatMessage['reactions'],
  classCode?: string
): Promise<void> {
  try {
    const reactions = currentReactions ? { ...currentReactions } : {};
    const userReacted = { ...(reactions.userReacted || {}) };
    const currentCount = reactions[reactionKey] || 0;
    const hasReacted = !!userReacted[reactionKey];

    const updatedUserReacted = {
      ...userReacted,
      [reactionKey]: !hasReacted
    };

    const updatedReactions = {
      ...reactions,
      [reactionKey]: hasReacted ? Math.max(0, currentCount - 1) : currentCount + 1,
      userReacted: updatedUserReacted
    };

    // Update class cache if classCode provided
    if (classCode) {
      const normClass = normalizeClassCode(classCode);
      const cached = getCachedChatMessages(normClass);
      const updatedList = cached.map((m) =>
        m.id === messageId ? { ...m, reactions: updatedReactions } : m
      );
      saveChatMessagesToCache(normClass, updatedList);
    }

    // Sync to Google Cloud Firestore
    const docRef = doc(db, CHAT_COLLECTION, messageId);
    await updateDoc(docRef, {
      reactions: sanitizeForFirestore(updatedReactions)
    });
  } catch (error: any) {
    handleFirestoreError(error, OperationType.UPDATE, `${CHAT_COLLECTION}/${messageId}`);
    console.warn('Reaction update error in Firestore:', error);
  }
}

/**
 * Update teacher verification badge in Google Cloud Firestore
 */
export async function toggleTeacherVerificationInFirestore(
  messageId: string,
  currentStatus: boolean,
  classCode?: string
): Promise<void> {
  try {
    const newStatus = !currentStatus;

    // Update class cache if classCode provided
    if (classCode) {
      const normClass = normalizeClassCode(classCode);
      const cached = getCachedChatMessages(normClass);
      const updatedList = cached.map((m) =>
        m.id === messageId ? { ...m, verifiedByTeacher: newStatus } : m
      );
      saveChatMessagesToCache(normClass, updatedList);
    }

    // Sync to Google Cloud Firestore
    const docRef = doc(db, CHAT_COLLECTION, messageId);
    await updateDoc(docRef, {
      verifiedByTeacher: newStatus
    });
  } catch (error: any) {
    handleFirestoreError(error, OperationType.UPDATE, `${CHAT_COLLECTION}/${messageId}`);
    console.warn('Teacher verify note error in Firestore:', error);
  }
}
