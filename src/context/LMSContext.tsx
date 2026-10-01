import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  BOOTSTRAPPED_ADMIN_EMAIL,
  handleFirestoreError,
  OperationType,
  sanitizeString,
  sanitizeStringArray,
  sanitizeId,
} from '../lib/firebase';
import {
  SiteSetting,
  Course,
  Instructor,
  UserProfile,
  Order,
  Enrollment,
  QuizAttempt,
  AssignmentSubmission,
  Certificate,
  NotificationItem,
  Inquiry,
  ReviewItem,
  AuditLogItem,
} from '../types/lms';
import {
  DEFAULT_SITE_SETTINGS,
  INITIAL_COURSES,
  INITIAL_INSTRUCTORS,
} from '../data/initialCatalog';

interface LMSContextValue {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  authReady: boolean;
  settings: SiteSetting;
  courses: Course[];
  instructors: Instructor[];
  enrollments: Enrollment[];
  orders: Order[];
  certificates: Certificate[];
  quizAttempts: QuizAttempt[];
  assignmentSubmissions: AssignmentSubmission[];
  notifications: NotificationItem[];
  reviews: ReviewItem[];
  auditLogs: AuditLogItem[];
  allUsers: UserProfile[];
  allInquiries: Inquiry[];
  // Auth methods
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (fullName: string, email: string, pass: string, phone?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  refreshUserVerification: () => Promise<boolean>;
  logout: () => Promise<void>;
  // Student actions
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  toggleSaveCourse: (courseId: string) => Promise<void>;
  enrollInFreeCourse: (course: Course) => Promise<Enrollment>;
  submitCourseOrder: (
    course: Course,
    paymentMethod: 'mpesa' | 'bank_transfer',
    paymentReference: string,
    paymentPhoneOrAccount: string,
    paymentDateStr: string,
    paymentNotes: string
  ) => Promise<Order>;
  completeLessonAndCheckCourse: (
    enrollmentId: string,
    course: Course,
    lessonId: string
  ) => Promise<{ completedCourse: boolean; certificateId?: string }>;
  submitQuizAttempt: (
    enrollment: Enrollment,
    course: Course,
    lessonId: string,
    quizTitle: string,
    scorePercent: number,
    passed: boolean,
    answers: string[]
  ) => Promise<{ completedCourse: boolean; certificateId?: string }>;
  submitAssignment: (
    enrollment: Enrollment,
    course: Course,
    lessonId: string,
    assignmentTitle: string,
    submissionText: string,
    attachmentUrl: string
  ) => Promise<void>;
  submitCourseReview: (
    enrollment: Enrollment,
    course: Course,
    rating: number,
    comment: string
  ) => Promise<void>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  submitInquiry: (name: string, email: string, phone: string, subject: string, message: string) => Promise<void>;
  verifyCertificateById: (certificateId: string) => Promise<Certificate | null>;
  // Admin actions
  saveSiteSettings: (newSettings: SiteSetting) => Promise<void>;
  saveCourse: (course: Course, isNewDoc?: boolean) => Promise<void>;
  deleteCourseById: (courseId: string) => Promise<void>;
  saveInstructor: (instructor: Instructor, isNewDoc?: boolean) => Promise<void>;
  verifyOrderAndEnroll: (
    order: Order,
    newStatus: Order['status'],
    verificationNotes: string
  ) => Promise<void>;
  gradeAssignmentSubmission: (
    submission: AssignmentSubmission,
    gradePercent: number,
    feedback: string,
    status: 'graded' | 'resubmit_requested'
  ) => Promise<void>;
  moderateReview: (review: ReviewItem, status: 'published' | 'hidden') => Promise<void>;
  resolveInquiry: (inquiry: Inquiry) => Promise<void>;
  seedInitialCatalogToFirestore: () => Promise<void>;
}

const LMSContext = createContext<LMSContextValue | undefined>(undefined);

export const LMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [authReady, setAuthReady] = useState<boolean>(false);

  const [settings, setSettings] = useState<SiteSetting>(DEFAULT_SITE_SETTINGS);
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [instructors, setInstructors] = useState<Instructor[]>(INITIAL_INSTRUCTORS);

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [assignmentSubmissions, setAssignmentSubmissions] = useState<AssignmentSubmission[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [allInquiries, setAllInquiries] = useState<Inquiry[]>([]);

  // Ensure initial catalog is seeded into Firestore when a verified user signs in
  const ensureCatalogSeeded = async () => {
    try {
      const siteRef = doc(db, 'settings', 'site_config');
      const siteSnap = await getDoc(siteRef);
      if (!siteSnap.exists()) {
        await setDoc(siteRef, {
          ...DEFAULT_SITE_SETTINGS,
          updatedAt: serverTimestamp(),
        });
      }

      const instSnap = await getDocs(
        query(collection(db, 'instructors'), where('isActive', '==', true))
      );
      if (instSnap.empty) {
        const batch = writeBatch(db);
        for (const inst of INITIAL_INSTRUCTORS) {
          const ref = doc(db, 'instructors', inst.id);
          batch.set(ref, {
            name: sanitizeString(inst.name, 150),
            roleTitle: sanitizeString(inst.roleTitle, 150),
            bio: sanitizeString(inst.bio, 2000),
            photoUrl: sanitizeString(inst.photoUrl, 500),
            expertise: sanitizeStringArray(inst.expertise, 15, 100),
            qualifications: sanitizeString(inst.qualifications, 500),
            linkedinUrl: sanitizeString(inst.linkedinUrl, 300),
            coursesCount: inst.coursesCount,
            isActive: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
        await batch.commit();
      }

      const course1Snap = await getDoc(doc(db, 'courses', 'course_1'));
      if (!course1Snap.exists()) {
        const batch = writeBatch(db);
        for (const c of INITIAL_COURSES) {
          const ref = doc(db, 'courses', c.id);
          batch.set(ref, {
            slug: sanitizeString(c.slug, 150),
            title: sanitizeString(c.title, 200),
            shortDescription: sanitizeString(c.shortDescription, 600),
            description: sanitizeString(c.description, 5000),
            category: sanitizeString(c.category, 100),
            instructorId: sanitizeId(c.instructorId),
            instructorName: sanitizeString(c.instructorName, 150),
            thumbnailUrl: sanitizeString(c.thumbnailUrl, 500),
            isFree: Boolean(c.isFree),
            regularPrice: Number(c.regularPrice),
            salePrice: Number(c.salePrice),
            discountPercentage: Number(c.discountPercentage),
            currency: sanitizeString(c.currency, 10, 'KES'),
            accessType: c.accessType,
            accessDurationDays: Number(c.accessDurationDays),
            difficulty: c.difficulty,
            durationHours: Number(c.durationHours),
            language: sanitizeString(c.language, 50, 'English'),
            status: c.status,
            featured: Boolean(c.featured),
            popular: Boolean(c.popular),
            isNew: Boolean(c.isNew),
            rating: Number(c.rating),
            studentsCount: Number(c.studentsCount),
            outcomes: sanitizeStringArray(c.outcomes, 20, 300),
            requirements: sanitizeStringArray(c.requirements, 20, 300),
            skills: sanitizeStringArray(c.skills, 20, 150),
            modules: c.modules.slice(0, 30),
            completionRequireAllLessons: Boolean(c.completionRequireAllLessons),
            completionRequireQuizzes: Boolean(c.completionRequireQuizzes),
            completionRequireAssignments: Boolean(c.completionRequireAssignments),
            completionMinQuizScore: Number(c.completionMinQuizScore),
            orderIndex: Number(c.orderIndex),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
        await batch.commit();
      }
    } catch (err) {
      console.warn('Catalog seed check skipped or already initialized:', err);
    }
  };

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setProfile(null);
        setIsAdmin(false);
        setAuthReady(true);
        return;
      }

      const bootstrappedAdmin =
        currentUser.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase() &&
        currentUser.emailVerified;

      let adminStatus = bootstrappedAdmin;
      try {
        const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
        if (adminDoc.exists() && currentUser.emailVerified) {
          adminStatus = true;
        }
      } catch {
        // Ignore if not admin
      }
      setIsAdmin(adminStatus);

      // Ensure user profile document exists if email is verified
      if (currentUser.emailVerified) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            const newProfile: Omit<UserProfile, 'createdAt' | 'updatedAt'> = {
              uid: sanitizeId(currentUser.uid),
              fullName: sanitizeString(currentUser.displayName || currentUser.email?.split('@')[0] || 'Learner', 150),
              email: sanitizeString(currentUser.email || 'learner@danivo.ac.ke', 150),
              phone: '',
              photoUrl: sanitizeString(currentUser.photoURL || '', 500),
              bio: '',
              savedCourseIds: [],
              notifyEmail: true,
              notifyCourseUpdates: true,
            };
            await setDoc(userRef, {
              ...newProfile,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            setProfile(newProfile);
          } else {
            setProfile(userSnap.data() as UserProfile);
          }
          // Seed initial catalog if not yet in Firestore
          await ensureCatalogSeeded();
        } catch (err) {
          console.warn('Profile initialization:', err);
        }
      } else {
        setProfile({
          uid: currentUser.uid,
          fullName: currentUser.displayName || 'Learner',
          email: currentUser.email || '',
          phone: '',
          photoUrl: currentUser.photoURL || '',
          bio: '',
          savedCourseIds: [],
          notifyEmail: true,
          notifyCourseUpdates: true,
        });
      }
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // Public listeners: Settings, Courses, Instructors
  useEffect(() => {
    const unsubSettings = onSnapshot(
      doc(db, 'settings', 'site_config'),
      (snap) => {
        if (snap.exists()) {
          setSettings({ ...DEFAULT_SITE_SETTINGS, ...(snap.data() as SiteSetting) });
        }
      },
      () => {
        // Fallback to DEFAULT_SITE_SETTINGS if not yet seeded
      }
    );

    const coursesQuery = isAdmin
      ? collection(db, 'courses')
      : query(collection(db, 'courses'), where('status', '==', 'published'));

    const unsubCourses = onSnapshot(
      coursesQuery,
      (snap) => {
        if (!snap.empty) {
          const loaded = snap.docs.map((d) => ({
            ...(d.data() as Course),
            id: d.id,
          }));
          loaded.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
          setCourses(loaded);
        } else {
          setCourses(INITIAL_COURSES);
        }
      },
      () => {
        setCourses(INITIAL_COURSES);
      }
    );

    const instQuery = isAdmin
      ? collection(db, 'instructors')
      : query(collection(db, 'instructors'), where('isActive', '==', true));

    const unsubInst = onSnapshot(
      instQuery,
      (snap) => {
        if (!snap.empty) {
          const loaded = snap.docs.map((d) => ({
            ...(d.data() as Instructor),
            id: d.id,
          }));
          setInstructors(loaded);
        } else {
          setInstructors(INITIAL_INSTRUCTORS);
        }
      },
      () => {
        setInstructors(INITIAL_INSTRUCTORS);
      }
    );

    const revQuery = isAdmin
      ? collection(db, 'reviews')
      : query(collection(db, 'reviews'), where('status', '==', 'published'));

    const unsubReviews = onSnapshot(
      revQuery,
      (snap) => {
        const items = snap.docs.map((d) => ({ ...(d.data() as ReviewItem), id: d.id }));
        setReviews(items);
      },
      () => {}
    );

    return () => {
      unsubSettings();
      unsubCourses();
      unsubInst();
      unsubReviews();
    };
  }, [isAdmin]);

  // Authenticated user & Admin listeners
  useEffect(() => {
    if (!authReady || !user) {
      setEnrollments([]);
      setOrders([]);
      setCertificates([]);
      setQuizAttempts([]);
      setAssignmentSubmissions([]);
      setNotifications([]);
      setAllUsers([]);
      setAllInquiries([]);
      return;
    }

    const uid = user.uid;

    const unsubUserDoc = onSnapshot(
      doc(db, 'users', uid),
      (snap) => {
        if (snap.exists()) {
          setProfile(snap.data() as UserProfile);
        }
      },
      () => {}
    );

    const enrollQuery = isAdmin
      ? collection(db, 'enrollments')
      : query(collection(db, 'enrollments'), where('userId', '==', uid));
    const unsubEnroll = onSnapshot(
      enrollQuery,
      (snap) => {
        const items = snap.docs.map((d) => ({ ...(d.data() as Enrollment), id: d.id }));
        items.sort((a, b) => (b.enrolledAtMs || 0) - (a.enrolledAtMs || 0));
        setEnrollments(items);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'enrollments')
    );

    const ordersQuery = isAdmin
      ? collection(db, 'orders')
      : query(collection(db, 'orders'), where('userId', '==', uid));
    const unsubOrders = onSnapshot(
      ordersQuery,
      (snap) => {
        const items = snap.docs.map((d) => ({ ...(d.data() as Order), id: d.id }));
        setOrders(items);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'orders')
    );

    const certsQuery = isAdmin
      ? collection(db, 'certificates')
      : query(collection(db, 'certificates'), where('userId', '==', uid));
    const unsubCerts = onSnapshot(
      certsQuery,
      (snap) => {
        const items = snap.docs.map((d) => ({ ...(d.data() as Certificate), id: d.id }));
        setCertificates(items);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'certificates')
    );

    const quizQuery = isAdmin
      ? collection(db, 'quizAttempts')
      : query(collection(db, 'quizAttempts'), where('userId', '==', uid));
    const unsubQuizzes = onSnapshot(
      quizQuery,
      (snap) => {
        const items = snap.docs.map((d) => ({ ...(d.data() as QuizAttempt), id: d.id }));
        setQuizAttempts(items);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'quizAttempts')
    );

    const subQuery = isAdmin
      ? collection(db, 'assignmentSubmissions')
      : query(collection(db, 'assignmentSubmissions'), where('userId', '==', uid));
    const unsubSubs = onSnapshot(
      subQuery,
      (snap) => {
        const items = snap.docs.map((d) => ({ ...(d.data() as AssignmentSubmission), id: d.id }));
        setAssignmentSubmissions(items);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'assignmentSubmissions')
    );

    const notifQuery = query(collection(db, 'notifications'), where('userId', '==', uid));
    const unsubNotifs = onSnapshot(
      notifQuery,
      (snap) => {
        const items = snap.docs.map((d) => ({ ...(d.data() as NotificationItem), id: d.id }));
        setNotifications(items);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'notifications')
    );

    let unsubAllUsers = () => {};
    let unsubInquiries = () => {};
    let unsubAuditLogs = () => {};

    if (isAdmin) {
      unsubAllUsers = onSnapshot(
        collection(db, 'users'),
        (snap) => {
          setAllUsers(snap.docs.map((d) => d.data() as UserProfile));
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'users')
      );
      unsubInquiries = onSnapshot(
        collection(db, 'inquiries'),
        (snap) => {
          setAllInquiries(snap.docs.map((d) => ({ ...(d.data() as Inquiry), id: d.id })));
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'inquiries')
      );
      unsubAuditLogs = onSnapshot(
        collection(db, 'auditLogs'),
        (snap) => {
          setAuditLogs(snap.docs.map((d) => ({ ...(d.data() as AuditLogItem), id: d.id })));
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'auditLogs')
      );
    }

    return () => {
      unsubUserDoc();
      unsubEnroll();
      unsubOrders();
      unsubCerts();
      unsubQuizzes();
      unsubSubs();
      unsubNotifs();
      unsubAllUsers();
      unsubInquiries();
      unsubAuditLogs();
    };
  }, [authReady, user, isAdmin]);

  // Auth methods
  const loginWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const loginWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), pass);
  };

  const registerWithEmail = async (fullName: string, email: string, pass: string, phone = '') => {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    await updateProfile(cred.user, { displayName: fullName.trim() });
    await sendEmailVerification(cred.user);
    setProfile({
      uid: cred.user.uid,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      photoUrl: '',
      bio: '',
      savedCourseIds: [],
      notifyEmail: true,
      notifyCourseUpdates: true,
    });
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  const resendVerificationEmail = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  const refreshUserVerification = async (): Promise<boolean> => {
    if (!auth.currentUser) return false;
    await auth.currentUser.reload();
    const verified = auth.currentUser.emailVerified;
    if (verified) {
      await auth.currentUser.getIdToken(true);
      setUser({ ...auth.currentUser });
    }
    return verified;
  };

  const logout = async () => {
    await signOut(auth);
  };

  // Helper to create notification
  const createNotification = async (
    targetUserId: string,
    title: string,
    message: string,
    type: NotificationItem['type']
  ) => {
    const notifId = `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    try {
      await setDoc(doc(db, 'notifications', notifId), {
        userId: sanitizeId(targetUserId),
        title: sanitizeString(title, 200),
        message: sanitizeString(message, 1000),
        type,
        isRead: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Notification creation warning:', err);
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return;
    const path = `users/${user.uid}`;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        fullName: sanitizeString(updates.fullName ?? profile.fullName, 150),
        phone: sanitizeString(updates.phone ?? profile.phone, 50),
        photoUrl: sanitizeString(updates.photoUrl ?? profile.photoUrl, 500),
        bio: sanitizeString(updates.bio ?? profile.bio, 1000),
        savedCourseIds: sanitizeStringArray(updates.savedCourseIds ?? profile.savedCourseIds, 100, 128),
        notifyEmail: updates.notifyEmail ?? profile.notifyEmail,
        notifyCourseUpdates: updates.notifyCourseUpdates ?? profile.notifyCourseUpdates,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const toggleSaveCourse = async (courseId: string) => {
    if (!user || !profile) return;
    const current = profile.savedCourseIds || [];
    const next = current.includes(courseId)
      ? current.filter((id) => id !== courseId)
      : [...current, courseId];
    await updateUserProfile({ savedCourseIds: next });
  };

  const enrollInFreeCourse = async (course: Course): Promise<Enrollment> => {
    if (!user) throw new Error('Please log in first.');
    await ensureCatalogSeeded();
    const existingEnroll = enrollments.find(
      (e) => e.courseId === course.id && e.userId === user.uid
    );
    if (existingEnroll) return existingEnroll;

    const nowMs = Date.now();
    const expiresAtMs =
      course.accessType === 'lifetime'
        ? nowMs + 3650 * 24 * 60 * 60 * 1000
        : nowMs + (course.accessDurationDays || 90) * 24 * 60 * 60 * 1000;

    const firstLessonId = course.modules[0]?.lessons[0]?.id || 'c1_les_1';
    const enrollId = sanitizeId(`enr_${user.uid.slice(0, 10)}_${course.id}`);
    const payload = {
      userId: sanitizeId(user.uid),
      userName: sanitizeString(profile?.fullName || user.displayName || 'Student', 150),
      userEmail: sanitizeString(user.email || '', 150),
      courseId: sanitizeId(course.id),
      courseTitle: sanitizeString(course.title, 200),
      orderId: 'free_grant',
      enrollmentType: 'free' as const,
      status: 'active' as const,
      progressPercent: 0,
      completedLessonIds: [] as string[],
      passedQuizIds: [] as string[],
      approvedAssignmentIds: [] as string[],
      lastLessonId: sanitizeString(firstLessonId, 128),
      accessType: course.accessType,
      enrolledAtMs: nowMs,
      expiresAtMs,
      completedAtMs: 0,
      certificateId: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, 'enrollments', enrollId), payload);
      await createNotification(
        user.uid,
        `Enrolled in ${course.title}`,
        `Welcome to ${course.title}! Your learning access is active.`,
        'enrollment'
      );
      return { ...payload, id: enrollId };
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `enrollments/${enrollId}`);
    }
  };

  const submitCourseOrder = async (
    course: Course,
    paymentMethod: 'mpesa' | 'bank_transfer',
    paymentReference: string,
    paymentPhoneOrAccount: string,
    paymentDateStr: string,
    paymentNotes: string
  ): Promise<Order> => {
    if (!user) throw new Error('Please log in first.');
    await ensureCatalogSeeded();
    const orderId = sanitizeId(`ord_${Date.now()}_${user.uid.slice(0, 6)}`);
    const finalAmount =
      course.salePrice > 0 && course.salePrice < course.regularPrice
        ? course.salePrice
        : course.regularPrice;
    const discountAmount = Math.max(0, course.regularPrice - finalAmount);

    const payload = {
      userId: sanitizeId(user.uid),
      userName: sanitizeString(profile?.fullName || user.displayName || 'Student', 150),
      userEmail: sanitizeString(user.email || '', 150),
      courseId: sanitizeId(course.id),
      courseTitle: sanitizeString(course.title, 200),
      originalPrice: Number(course.regularPrice),
      discountAmount: Number(discountAmount),
      finalAmount: Number(finalAmount),
      currency: sanitizeString(course.currency || settings.primaryCurrency || 'KES', 10),
      paymentMethod,
      paymentReference: sanitizeString(paymentReference.toUpperCase(), 150),
      paymentPhoneOrAccount: sanitizeString(paymentPhoneOrAccount, 150),
      paymentDateStr: sanitizeString(paymentDateStr || new Date().toISOString().slice(0, 16), 100),
      paymentNotes: sanitizeString(paymentNotes, 500),
      status: 'under_review' as const,
      verifiedBy: '',
      verificationNotes: 'Payment reference submitted and awaiting administrative verification.',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, 'orders', orderId), payload);
      await createNotification(
        user.uid,
        `Payment Reference Received (${payload.paymentReference})`,
        `Your ${paymentMethod === 'mpesa' ? 'M-Pesa' : 'Bank Transfer'} reference for ${course.title} is under verification by the admissions office.`,
        'payment'
      );
      return { ...payload, id: orderId };
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `orders/${orderId}`);
    }
  };

  // Issue certificate when enrollment reaches 100%
  const issueCertificateIfNeeded = async (
    enrollment: Enrollment,
    course: Course
  ): Promise<string> => {
    if (enrollment.certificateId) return enrollment.certificateId;
    const certId = sanitizeId(`CERT-DNV-${Date.now().toString(36).toUpperCase()}`);
    const verificationCode = `DNV-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${new Date().getFullYear()}`;
    const issuedDateStr = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const certPayload = {
      certificateId: certId,
      verificationCode: sanitizeString(verificationCode, 64),
      userId: sanitizeId(enrollment.userId),
      studentName: sanitizeString(enrollment.userName || profile?.fullName || 'Graduate', 150),
      courseId: sanitizeId(course.id),
      courseTitle: sanitizeString(course.title, 200),
      instructorName: sanitizeString(course.instructorName, 150),
      enrollmentId: sanitizeId(enrollment.id),
      issuedDateStr: sanitizeString(issuedDateStr, 50),
      status: 'valid' as const,
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'certificates', certId), certPayload);
    await createNotification(
      enrollment.userId,
      `Certificate of Completion Issued!`,
      `Congratulations! Your official DANIVO INSTITUTE Certificate of Completion (${certId}) for ${course.title} is now available.`,
      'certificate'
    );
    return certId;
  };

  const evaluateCourseCompletion = (
    course: Course,
    completedLessonIds: string[],
    passedQuizIds: string[]
  ): { progressPercent: number; isCompleted: boolean } => {
    const allLessons = course.modules.flatMap((m) => m.lessons);
    const totalLessons = allLessons.length || 1;
    const completedCount = allLessons.filter((l) => completedLessonIds.includes(l.id)).length;
    const progressPercent = Math.min(100, Math.round((completedCount / totalLessons) * 100));

    const quizLessons = allLessons.filter((l) => l.type === 'quiz');
    const allQuizzesPassed =
      !course.completionRequireQuizzes ||
      quizLessons.every((q) => passedQuizIds.includes(q.id));

    const isCompleted = progressPercent === 100 && allQuizzesPassed;
    return { progressPercent, isCompleted };
  };

  const completeLessonAndCheckCourse = async (
    enrollmentId: string,
    course: Course,
    lessonId: string
  ): Promise<{ completedCourse: boolean; certificateId?: string }> => {
    const enrollment = enrollments.find((e) => e.id === enrollmentId);
    if (!enrollment) return { completedCourse: false };

    const nextCompleted = enrollment.completedLessonIds.includes(lessonId)
      ? enrollment.completedLessonIds
      : [...enrollment.completedLessonIds, lessonId];

    const { progressPercent, isCompleted } = evaluateCourseCompletion(
      course,
      nextCompleted,
      enrollment.passedQuizIds
    );

    const nextStatus: Enrollment['status'] = isCompleted ? 'completed' : 'active';
    const nextCompletedAtMs = isCompleted
      ? enrollment.completedAtMs || Date.now()
      : enrollment.completedAtMs;

    try {
      await updateDoc(doc(db, 'enrollments', enrollmentId), {
        status: nextStatus,
        progressPercent,
        completedLessonIds: sanitizeStringArray(nextCompleted, 200, 128),
        passedQuizIds: sanitizeStringArray(enrollment.passedQuizIds, 100, 128),
        approvedAssignmentIds: sanitizeStringArray(enrollment.approvedAssignmentIds, 100, 128),
        lastLessonId: sanitizeString(lessonId, 128),
        completedAtMs: nextCompletedAtMs,
        certificateId: enrollment.certificateId,
        updatedAt: serverTimestamp(),
      });

      if (isCompleted && !enrollment.certificateId) {
        const certId = await issueCertificateIfNeeded(
          { ...enrollment, progressPercent: 100 },
          course
        );
        await updateDoc(doc(db, 'enrollments', enrollmentId), {
          status: 'completed',
          progressPercent: 100,
          completedLessonIds: sanitizeStringArray(nextCompleted, 200, 128),
          passedQuizIds: sanitizeStringArray(enrollment.passedQuizIds, 100, 128),
          approvedAssignmentIds: sanitizeStringArray(enrollment.approvedAssignmentIds, 100, 128),
          lastLessonId: sanitizeString(lessonId, 128),
          completedAtMs: nextCompletedAtMs,
          certificateId: certId,
          updatedAt: serverTimestamp(),
        });
        return { completedCourse: true, certificateId: certId };
      }

      return { completedCourse: isCompleted, certificateId: enrollment.certificateId || undefined };
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `enrollments/${enrollmentId}`);
    }
  };

  const submitQuizAttempt = async (
    enrollment: Enrollment,
    course: Course,
    lessonId: string,
    quizTitle: string,
    scorePercent: number,
    passed: boolean,
    answers: string[]
  ): Promise<{ completedCourse: boolean; certificateId?: string }> => {
    if (!user) return { completedCourse: false };
    const existingAttempts = quizAttempts.filter(
      (a) => a.courseId === course.id && a.lessonId === lessonId && a.userId === user.uid
    );
    const attemptId = sanitizeId(`qz_${Date.now()}_${user.uid.slice(0, 6)}`);

    try {
      await setDoc(doc(db, 'quizAttempts', attemptId), {
        userId: sanitizeId(user.uid),
        courseId: sanitizeId(course.id),
        lessonId: sanitizeString(lessonId, 128),
        quizTitle: sanitizeString(quizTitle, 200),
        scorePercent: Number(scorePercent),
        passed: Boolean(passed),
        attemptNumber: existingAttempts.length + 1,
        answers: sanitizeStringArray(answers, 100, 200),
        createdAt: serverTimestamp(),
      });

      if (passed) {
        const nextPassedQuizzes = enrollment.passedQuizIds.includes(lessonId)
          ? enrollment.passedQuizIds
          : [...enrollment.passedQuizIds, lessonId];
        const nextCompletedLessons = enrollment.completedLessonIds.includes(lessonId)
          ? enrollment.completedLessonIds
          : [...enrollment.completedLessonIds, lessonId];

        const { progressPercent, isCompleted } = evaluateCourseCompletion(
          course,
          nextCompletedLessons,
          nextPassedQuizzes
        );

        const nextStatus: Enrollment['status'] = isCompleted ? 'completed' : 'active';
        const nextCompletedAtMs = isCompleted
          ? enrollment.completedAtMs || Date.now()
          : enrollment.completedAtMs;

        await updateDoc(doc(db, 'enrollments', enrollment.id), {
          status: nextStatus,
          progressPercent,
          completedLessonIds: sanitizeStringArray(nextCompletedLessons, 200, 128),
          passedQuizIds: sanitizeStringArray(nextPassedQuizzes, 100, 128),
          approvedAssignmentIds: sanitizeStringArray(enrollment.approvedAssignmentIds, 100, 128),
          lastLessonId: sanitizeString(lessonId, 128),
          completedAtMs: nextCompletedAtMs,
          certificateId: enrollment.certificateId,
          updatedAt: serverTimestamp(),
        });

        if (isCompleted && !enrollment.certificateId) {
          const certId = await issueCertificateIfNeeded(
            { ...enrollment, progressPercent: 100 },
            course
          );
          await updateDoc(doc(db, 'enrollments', enrollment.id), {
            status: 'completed',
            progressPercent: 100,
            completedLessonIds: sanitizeStringArray(nextCompletedLessons, 200, 128),
            passedQuizIds: sanitizeStringArray(nextPassedQuizzes, 100, 128),
            approvedAssignmentIds: sanitizeStringArray(enrollment.approvedAssignmentIds, 100, 128),
            lastLessonId: sanitizeString(lessonId, 128),
            completedAtMs: nextCompletedAtMs,
            certificateId: certId,
            updatedAt: serverTimestamp(),
          });
          return { completedCourse: true, certificateId: certId };
        }
        return { completedCourse: isCompleted, certificateId: enrollment.certificateId || undefined };
      }

      return { completedCourse: false };
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `quizAttempts/${attemptId}`);
    }
  };

  const submitAssignment = async (
    enrollment: Enrollment,
    course: Course,
    lessonId: string,
    assignmentTitle: string,
    submissionText: string,
    attachmentUrl: string
  ) => {
    if (!user) return;
    const subId = sanitizeId(`asg_${user.uid.slice(0, 8)}_${course.id}_${lessonId}`);
    try {
      await setDoc(doc(db, 'assignmentSubmissions', subId), {
        userId: sanitizeId(user.uid),
        userName: sanitizeString(profile?.fullName || user.displayName || 'Student', 150),
        courseId: sanitizeId(course.id),
        courseTitle: sanitizeString(course.title, 200),
        lessonId: sanitizeString(lessonId, 128),
        assignmentTitle: sanitizeString(assignmentTitle, 200),
        submissionText: sanitizeString(submissionText, 10000),
        attachmentUrl: sanitizeString(attachmentUrl, 500),
        status: 'submitted',
        gradePercent: 0,
        feedback: 'Submitted and awaiting faculty evaluation.',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await completeLessonAndCheckCourse(enrollment.id, course, lessonId);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `assignmentSubmissions/${subId}`);
    }
  };

  const markNotificationRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        isRead: true,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `notifications/${notificationId}`);
    }
  };

  const submitInquiry = async (
    name: string,
    email: string,
    phone: string,
    subject: string,
    message: string
  ) => {
    if (!user) throw new Error('Please sign in to submit an official inquiry ticket, or reach us directly via Email/WhatsApp.');
    const inqId = sanitizeId(`inq_${Date.now()}_${user.uid.slice(0, 6)}`);
    try {
      await setDoc(doc(db, 'inquiries', inqId), {
        userId: sanitizeId(user.uid),
        name: sanitizeString(name, 150),
        email: sanitizeString(email, 150),
        phone: sanitizeString(phone, 50),
        subject: sanitizeString(subject, 200),
        message: sanitizeString(message, 3000),
        status: 'new',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `inquiries/${inqId}`);
    }
  };

  const verifyCertificateById = async (certificateId: string): Promise<Certificate | null> => {
    const cleanId = sanitizeId(certificateId.trim());
    try {
      const snap = await getDoc(doc(db, 'certificates', cleanId));
      if (snap.exists()) {
        return { ...(snap.data() as Certificate), id: snap.id };
      }
      return null;
    } catch {
      return null;
    }
  };

  // Helper to record admin audit log
  const recordAuditLog = async (
    action: string,
    targetType: string,
    targetId: string,
    details: string
  ) => {
    if (!user || !isAdmin) return;
    const logId = sanitizeId(`log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`);
    try {
      await setDoc(doc(db, 'auditLogs', logId), {
        adminUid: sanitizeId(user.uid),
        adminEmail: sanitizeString(user.email || BOOTSTRAPPED_ADMIN_EMAIL, 150),
        action: sanitizeString(action, 150),
        targetType: sanitizeString(targetType, 100),
        targetId: sanitizeString(targetId, 128),
        details: sanitizeString(details, 1000),
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Audit log write warning:', err);
    }
  };

  const submitCourseReview = async (
    enrollment: Enrollment,
    course: Course,
    rating: number,
    comment: string
  ) => {
    if (!user) throw new Error('Please sign in to submit a review.');
    const revId = sanitizeId(`rev_${user.uid.slice(0, 8)}_${course.id}`);
    try {
      await setDoc(doc(db, 'reviews', revId), {
        userId: sanitizeId(user.uid),
        userName: sanitizeString(profile?.fullName || user.displayName || 'Student', 150),
        courseId: sanitizeId(course.id),
        courseTitle: sanitizeString(course.title, 200),
        enrollmentId: sanitizeId(enrollment.id),
        rating: Math.max(1, Math.min(5, Number(rating))),
        comment: sanitizeString(comment, 2000),
        status: 'published',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `reviews/${revId}`);
    }
  };

  const moderateReview = async (review: ReviewItem, status: 'published' | 'hidden') => {
    try {
      await updateDoc(doc(db, 'reviews', review.id), {
        status,
        updatedAt: serverTimestamp(),
      });
      await recordAuditLog(
        `Review ${status}`,
        'review',
        review.id,
        `Moderated review for ${review.courseTitle} by ${review.userName} to ${status}`
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `reviews/${review.id}`);
    }
  };

  // Admin actions
  const saveSiteSettings = async (newSettings: SiteSetting) => {
    const payload = {
      brandName: sanitizeString(newSettings.brandName, 120, 'DANIVO INSTITUTE'),
      tagline: sanitizeString(newSettings.tagline, 300),
      logoUrl: sanitizeString(newSettings.logoUrl, 500),
      heroHeadline: sanitizeString(newSettings.heroHeadline, 300),
      heroSubheadline: sanitizeString(newSettings.heroSubheadline, 1000),
      heroCtaPrimary: sanitizeString(newSettings.heroCtaPrimary, 100),
      heroCtaSecondary: sanitizeString(newSettings.heroCtaSecondary, 100),
      heroImageUrl: sanitizeString(newSettings.heroImageUrl, 500),
      primaryCurrency: sanitizeString(newSettings.primaryCurrency, 10, 'KES'),
      mpesaPaybillOrNumber: sanitizeString(newSettings.mpesaPaybillOrNumber, 100, '0116654805'),
      mpesaInstructions: sanitizeString(newSettings.mpesaInstructions, 1000),
      bankAccountNumber: sanitizeString(newSettings.bankAccountNumber, 100, '7770184960901'),
      bankName: sanitizeString(newSettings.bankName, 150),
      bankBranch: sanitizeString(newSettings.bankBranch, 150),
      bankAccountName: sanitizeString(newSettings.bankAccountName, 150),
      bankInstructions: sanitizeString(newSettings.bankInstructions, 1000),
      contactEmail: sanitizeString(newSettings.contactEmail, 150),
      contactWhatsapp: sanitizeString(newSettings.contactWhatsapp, 50),
      contactAddress: sanitizeString(newSettings.contactAddress, 300),
      announcementText: sanitizeString(newSettings.announcementText, 500),
      isPublic: true,
      updatedAt: serverTimestamp(),
    };
    try {
      await setDoc(doc(db, 'settings', 'site_config'), payload);
      await recordAuditLog(
        'Updated Site CMS & Payment Settings',
        'settings',
        'site_config',
        `Updated brand, hero, contact (${payload.contactEmail}), and payment settings`
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/site_config');
    }
  };

  const saveCourse = async (course: Course, isNewDoc = false) => {
    const docId = sanitizeId(course.id);
    const ref = doc(db, 'courses', docId);
    const existingSnap = await getDoc(ref);
    const baseData = {
      slug: sanitizeString(course.slug || course.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'), 150),
      title: sanitizeString(course.title, 200),
      shortDescription: sanitizeString(course.shortDescription, 600),
      description: sanitizeString(course.description, 5000),
      category: sanitizeString(course.category, 100),
      instructorId: sanitizeId(course.instructorId || 'inst_ai_tech'),
      instructorName: sanitizeString(course.instructorName, 150),
      thumbnailUrl: sanitizeString(course.thumbnailUrl, 500),
      isFree: Boolean(course.isFree),
      regularPrice: Number(course.regularPrice),
      salePrice: Number(course.salePrice),
      discountPercentage: Number(course.discountPercentage),
      currency: sanitizeString(course.currency, 10, 'KES'),
      accessType: course.accessType,
      accessDurationDays: Number(course.accessDurationDays || 90),
      difficulty: course.difficulty,
      durationHours: Number(course.durationHours || 10),
      language: sanitizeString(course.language, 50, 'English'),
      status: course.status,
      featured: Boolean(course.featured),
      popular: Boolean(course.popular),
      isNew: Boolean(course.isNew),
      rating: Number(course.rating || 4.8),
      studentsCount: Number(course.studentsCount || 0),
      outcomes: sanitizeStringArray(course.outcomes, 20, 300),
      requirements: sanitizeStringArray(course.requirements, 20, 300),
      skills: sanitizeStringArray(course.skills, 20, 150),
      modules: (course.modules || []).slice(0, 30),
      completionRequireAllLessons: Boolean(course.completionRequireAllLessons),
      completionRequireQuizzes: Boolean(course.completionRequireQuizzes),
      completionRequireAssignments: Boolean(course.completionRequireAssignments),
      completionMinQuizScore: Number(course.completionMinQuizScore || 70),
      orderIndex: Number(course.orderIndex || 1),
      updatedAt: serverTimestamp(),
    };

    try {
      if (isNewDoc || !existingSnap.exists()) {
        await setDoc(ref, {
          ...baseData,
          createdAt: serverTimestamp(),
        });
      } else {
        await updateDoc(ref, baseData);
      }
      await recordAuditLog(
        isNewDoc ? 'Created Course' : 'Updated Course & Pricing',
        'course',
        docId,
        `${baseData.title} — ${baseData.isFree ? 'FREE' : `${baseData.currency} ${baseData.salePrice}`} (${baseData.status})`
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `courses/${docId}`);
    }
  };

  const deleteCourseById = async (courseId: string) => {
    try {
      await deleteDoc(doc(db, 'courses', courseId));
      await recordAuditLog('Deleted Course', 'course', courseId, `Deleted course ${courseId}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `courses/${courseId}`);
    }
  };

  const saveInstructor = async (instructor: Instructor, isNewDoc = false) => {
    const docId = sanitizeId(instructor.id);
    const ref = doc(db, 'instructors', docId);
    const existingSnap = await getDoc(ref);
    const baseData = {
      name: sanitizeString(instructor.name, 150),
      roleTitle: sanitizeString(instructor.roleTitle, 150),
      bio: sanitizeString(instructor.bio, 2000),
      photoUrl: sanitizeString(instructor.photoUrl, 500),
      expertise: sanitizeStringArray(instructor.expertise, 15, 100),
      qualifications: sanitizeString(instructor.qualifications, 500),
      linkedinUrl: sanitizeString(instructor.linkedinUrl, 300),
      coursesCount: Number(instructor.coursesCount || 1),
      isActive: Boolean(instructor.isActive),
      updatedAt: serverTimestamp(),
    };
    try {
      if (isNewDoc || !existingSnap.exists()) {
        await setDoc(ref, { ...baseData, createdAt: serverTimestamp() });
      } else {
        await updateDoc(ref, baseData);
      }
      await recordAuditLog('Saved Instructor Profile', 'instructor', docId, baseData.name);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `instructors/${docId}`);
    }
  };

  const verifyOrderAndEnroll = async (
    order: Order,
    newStatus: Order['status'],
    verificationNotes: string
  ) => {
    if (!user || !isAdmin) return;
    try {
      await updateDoc(doc(db, 'orders', order.id), {
        status: newStatus,
        verifiedBy: sanitizeId(user.uid),
        verificationNotes: sanitizeString(verificationNotes, 500),
        updatedAt: serverTimestamp(),
      });
      await recordAuditLog(
        `Order ${newStatus.toUpperCase()}`,
        'order',
        order.id,
        `Ref ${order.paymentReference} (${order.currency} ${order.finalAmount}) for ${order.userEmail}: ${verificationNotes}`
      );

      if (newStatus === 'successful') {
        const course = courses.find((c) => c.id === order.courseId) || INITIAL_COURSES[0];
        const nowMs = Date.now();
        const expiresAtMs =
          course.accessType === 'lifetime'
            ? nowMs + 3650 * 24 * 60 * 60 * 1000
            : nowMs + (course.accessDurationDays || 90) * 24 * 60 * 60 * 1000;

        const enrollId = sanitizeId(`enr_${order.userId.slice(0, 10)}_${order.courseId}`);
        const firstLessonId = course.modules[0]?.lessons[0]?.id || 'c1_les_1';

        await setDoc(doc(db, 'enrollments', enrollId), {
          userId: sanitizeId(order.userId),
          userName: sanitizeString(order.userName, 150),
          userEmail: sanitizeString(order.userEmail, 150),
          courseId: sanitizeId(order.courseId),
          courseTitle: sanitizeString(order.courseTitle, 200),
          orderId: sanitizeId(order.id),
          enrollmentType: 'paid',
          status: 'active',
          progressPercent: 0,
          completedLessonIds: [],
          passedQuizIds: [],
          approvedAssignmentIds: [],
          lastLessonId: sanitizeString(firstLessonId, 128),
          accessType: course.accessType,
          enrolledAtMs: nowMs,
          expiresAtMs,
          completedAtMs: 0,
          certificateId: '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        await createNotification(
          order.userId,
          `Payment Verified — Enrolled in ${order.courseTitle}`,
          `Your payment reference (${order.paymentReference}) has been verified. You now have full access to ${order.courseTitle}.`,
          'payment'
        );
      } else {
        await createNotification(
          order.userId,
          `Order Update: ${order.courseTitle}`,
          `Your payment status has been updated to "${newStatus.toUpperCase()}". Note: ${verificationNotes}`,
          'payment'
        );
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${order.id}`);
    }
  };

  const gradeAssignmentSubmission = async (
    submission: AssignmentSubmission,
    gradePercent: number,
    feedback: string,
    status: 'graded' | 'resubmit_requested'
  ) => {
    try {
      await updateDoc(doc(db, 'assignmentSubmissions', submission.id), {
        status,
        gradePercent: Number(gradePercent),
        feedback: sanitizeString(feedback, 2000),
        updatedAt: serverTimestamp(),
      });
      await recordAuditLog(
        'Graded Assignment',
        'assignmentSubmission',
        submission.id,
        `${submission.userName} — ${submission.assignmentTitle}: ${gradePercent}% (${status})`
      );
      await createNotification(
        submission.userId,
        `Assignment Evaluated: ${submission.assignmentTitle}`,
        `Score: ${gradePercent}%. Instructor Feedback: ${feedback}`,
        'assignment'
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `assignmentSubmissions/${submission.id}`);
    }
  };

  const resolveInquiry = async (inquiry: Inquiry) => {
    try {
      await updateDoc(doc(db, 'inquiries', inquiry.id), {
        status: 'resolved',
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `inquiries/${inquiry.id}`);
    }
  };

  const seedInitialCatalogToFirestore = async () => {
    await ensureCatalogSeeded();
  };

  return (
    <LMSContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        authReady,
        settings,
        courses,
        instructors,
        enrollments,
        orders,
        certificates,
        quizAttempts,
        assignmentSubmissions,
        notifications,
        reviews,
        auditLogs,
        allUsers,
        allInquiries,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        resetPassword,
        resendVerificationEmail,
        refreshUserVerification,
        logout,
        updateUserProfile,
        toggleSaveCourse,
        enrollInFreeCourse,
        submitCourseOrder,
        completeLessonAndCheckCourse,
        submitQuizAttempt,
        submitAssignment,
        submitCourseReview,
        markNotificationRead,
        submitInquiry,
        verifyCertificateById,
        saveSiteSettings,
        saveCourse,
        deleteCourseById,
        saveInstructor,
        verifyOrderAndEnroll,
        gradeAssignmentSubmission,
        moderateReview,
        resolveInquiry,
        seedInitialCatalogToFirestore,
      }}
    >
      {children}
    </LMSContext.Provider>
  );
};

export const useLMS = () => {
  const ctx = useContext(LMSContext);
  if (!ctx) throw new Error('useLMS must be used within LMSProvider');
  return ctx;
};
