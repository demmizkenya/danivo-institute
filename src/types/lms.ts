export interface SiteSetting {
  brandName: string;
  tagline: string;
  logoUrl: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroCtaPrimary: string;
  heroCtaSecondary: string;
  heroImageUrl: string;
  primaryCurrency: string;
  mpesaPaybillOrNumber: string;
  mpesaInstructions: string;
  bankAccountNumber: string;
  bankName: string;
  bankBranch: string;
  bankAccountName: string;
  bankInstructions: string;
  contactEmail: string;
  contactWhatsapp: string;
  contactAddress: string;
  announcementText: string;
  isPublic: boolean;
  updatedAt?: unknown;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false';
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LessonResource {
  id: string;
  title: string;
  type: 'pdf' | 'template' | 'worksheet' | 'guide';
  sizeLabel: string;
  contentSummary: string;
}

export interface CourseLesson {
  id: string;
  title: string;
  type: 'video' | 'text' | 'quiz' | 'assignment';
  durationMinutes: number;
  isPreview: boolean;
  videoUrl: string;
  contentMarkdown: string;
  resources: LessonResource[];
  quizQuestions?: QuizQuestion[];
  quizPassingScore?: number;
  quizMaxAttempts?: number;
  assignmentPrompt?: string;
  assignmentDeliverables?: string[];
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  lessons: CourseLesson[];
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  category: string;
  instructorId: string;
  instructorName: string;
  thumbnailUrl: string;
  isFree: boolean;
  regularPrice: number;
  salePrice: number;
  discountPercentage: number;
  currency: string;
  accessType: 'fixed_days' | 'lifetime';
  accessDurationDays: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  durationHours: number;
  language: string;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  popular: boolean;
  isNew: boolean;
  rating: number;
  studentsCount: number;
  outcomes: string[];
  requirements: string[];
  skills: string[];
  modules: CourseModule[];
  completionRequireAllLessons: boolean;
  completionRequireQuizzes: boolean;
  completionRequireAssignments: boolean;
  completionMinQuizScore: number;
  orderIndex: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Instructor {
  id: string;
  name: string;
  roleTitle: string;
  bio: string;
  photoUrl: string;
  expertise: string[];
  qualifications: string;
  linkedinUrl: string;
  coursesCount: number;
  isActive: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  photoUrl: string;
  bio: string;
  savedCourseIds: string[];
  notifyEmail: boolean;
  notifyCourseUpdates: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  courseId: string;
  courseTitle: string;
  originalPrice: number;
  discountAmount: number;
  finalAmount: number;
  currency: string;
  paymentMethod: 'mpesa' | 'bank_transfer' | 'free';
  paymentReference: string;
  paymentPhoneOrAccount: string;
  paymentDateStr: string;
  paymentNotes: string;
  status: 'pending' | 'under_review' | 'successful' | 'failed' | 'cancelled' | 'refunded';
  verifiedBy: string;
  verificationNotes: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Enrollment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  courseId: string;
  courseTitle: string;
  orderId: string;
  enrollmentType: 'free' | 'paid';
  status: 'active' | 'completed' | 'expired';
  progressPercent: number;
  completedLessonIds: string[];
  passedQuizIds: string[];
  approvedAssignmentIds: string[];
  lastLessonId: string;
  accessType: 'fixed_days' | 'lifetime';
  enrolledAtMs: number;
  expiresAtMs: number;
  completedAtMs: number;
  certificateId: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  courseId: string;
  lessonId: string;
  quizTitle: string;
  scorePercent: number;
  passed: boolean;
  attemptNumber: number;
  answers: string[];
  createdAt?: unknown;
}

export interface AssignmentSubmission {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  lessonId: string;
  assignmentTitle: string;
  submissionText: string;
  attachmentUrl: string;
  status: 'submitted' | 'graded' | 'resubmit_requested';
  gradePercent: number;
  feedback: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Certificate {
  id: string;
  certificateId: string;
  verificationCode: string;
  userId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  instructorName: string;
  enrollmentId: string;
  issuedDateStr: string;
  status: 'valid' | 'revoked';
  createdAt?: unknown;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'enrollment' | 'payment' | 'certificate' | 'system' | 'assignment';
  isRead: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Inquiry {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'new' | 'resolved';
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ReviewItem {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  enrollmentId: string;
  rating: number;
  comment: string;
  status: 'published' | 'hidden';
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface AuditLogItem {
  id: string;
  adminUid: string;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  createdAt?: unknown;
}
