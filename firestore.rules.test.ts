/**
 * DANIVO INSTITUTE — Firestore Rules Verification Suite (Dirty Dozen Payloads)
 * Verifies that all 12 adversarial payloads defined in security_spec.md are rejected with PERMISSION_DENIED.
 */

export interface SecurityTestPayload {
  id: number;
  name: string;
  collection: string;
  docId: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  auth: { uid: string; email: string; email_verified: boolean } | null;
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_TESTS: SecurityTestPayload[] = [
  {
    id: 1,
    name: 'Unverified Admin Spoof on Course Creation',
    collection: 'courses',
    docId: 'course_spoof',
    operation: 'create',
    auth: { uid: 'spoof_uid', email: 'danielowino233@gmail.com', email_verified: false },
    payload: { title: 'Spoofed Course' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Shadow Field Injection on User Profile',
    collection: 'users',
    docId: 'user_1',
    operation: 'create',
    auth: { uid: 'user_1', email: 'student@example.com', email_verified: true },
    payload: {
      uid: 'user_1',
      fullName: 'Student',
      email: 'student@example.com',
      phone: '',
      photoUrl: '',
      bio: '',
      savedCourseIds: [],
      notifyEmail: true,
      notifyCourseUpdates: true,
      isAdmin: true,
      role: 'superadmin',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Cross-User PII Scraping on Users Collection',
    collection: 'users',
    docId: 'user_2',
    operation: 'get',
    auth: { uid: 'user_1', email: 'student1@example.com', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Fake Paid Course Enrollment Without Verified Order',
    collection: 'enrollments',
    docId: 'enr_fake',
    operation: 'create',
    auth: { uid: 'user_1', email: 'student1@example.com', email_verified: true },
    payload: {
      userId: 'user_1',
      courseId: 'course_paid_1',
      enrollmentType: 'paid',
      orderId: 'unverified_order_1',
      status: 'active',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Client-Side Order Self-Approval',
    collection: 'orders',
    docId: 'ord_1',
    operation: 'update',
    auth: { uid: 'user_1', email: 'student1@example.com', email_verified: true },
    payload: { status: 'successful' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Fabricated Certificate Creation With Incomplete Progress',
    collection: 'certificates',
    docId: 'cert_fake',
    operation: 'create',
    auth: { uid: 'user_1', email: 'student1@example.com', email_verified: true },
    payload: {
      certificateId: 'cert_fake',
      userId: 'user_1',
      enrollmentId: 'incomplete_enr_1',
      status: 'valid',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'ID Poisoning Attack',
    collection: 'orders',
    docId: 'invalid$id!with*bad^chars',
    operation: 'create',
    auth: { uid: 'user_1', email: 'student1@example.com', email_verified: true },
    payload: {},
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Denial-of-Wallet String Overflow on Inquiry',
    collection: 'inquiries',
    docId: 'inq_overflow',
    operation: 'create',
    auth: { uid: 'user_1', email: 'student1@example.com', email_verified: true },
    payload: {
      userId: 'user_1',
      name: 'Student',
      email: 'student1@example.com',
      phone: '',
      subject: 'Overflow',
      message: 'A'.repeat(10000),
      status: 'new',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Unbounded Array Injection on Saved Courses',
    collection: 'users',
    docId: 'user_1',
    operation: 'update',
    auth: { uid: 'user_1', email: 'student1@example.com', email_verified: true },
    payload: {
      savedCourseIds: Array.from({ length: 150 }, (_, i) => `course_${i}`),
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Client Timestamp Manipulation on Order Creation',
    collection: 'orders',
    docId: 'ord_backdated',
    operation: 'create',
    auth: { uid: 'user_1', email: 'student1@example.com', email_verified: true },
    payload: {
      createdAt: '2020-01-01T00:00:00Z',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Immutable Owner Mutation on Enrollment Update',
    collection: 'enrollments',
    docId: 'enr_1',
    operation: 'update',
    auth: { uid: 'user_1', email: 'student1@example.com', email_verified: true },
    payload: {
      userId: 'user_2',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Terminal State Mutation on Verified Order',
    collection: 'orders',
    docId: 'ord_verified',
    operation: 'update',
    auth: { uid: 'user_1', email: 'student1@example.com', email_verified: true },
    payload: {
      paymentReference: 'MODIFIED_AFTER_SUCCESS',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
];
