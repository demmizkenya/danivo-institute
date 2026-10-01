# DANIVO INSTITUTE — Firestore Zero-Trust Security Specification

## 1. Data Invariants

1. **Identity & Verification Invariant**: Every standard write operation requires an authenticated user with a verified email (`request.auth != null && request.auth.token.email_verified == true`).
2. **Admin Privilege Invariant**: Admin status is strictly derived from `/admins/$(request.auth.uid)` or the bootstrapped verified owner email (`danielowino233@gmail.com` with `email_verified == true`). Users cannot self-assign admin roles in `/users/{userId}`.
3. **PII Isolation Invariant**: `/users/{userId}`, `/orders/{orderId}`, `/enrollments/{enrollmentId}`, `/quizAttempts/{attemptId}`, `/assignmentSubmissions/{submissionId}`, and `/notifications/{notificationId}` contain personal user data and may only be read (`get`/`list`) by the document owner (`userId == request.auth.uid`) or an administrator (`isAdmin()`).
4. **Payment & Paid Enrollment Invariant**: A student cannot self-enroll in a paid course (`isFree == false`) without a verified successful order (`/orders/$(incoming().orderId).status == 'successful'`) belonging to that student, or direct administrative enrollment.
5. **Order Terminal State & Verification Lock**: Only administrators (`isAdmin()`) may transition an order's `status` to `'successful'`, `'failed'`, or `'refunded'`. Students creating an order for a paid course may only create it with `status == 'under_review'` or `'pending'`.
6. **Certificate Authenticity Invariant**: A certificate in `/certificates/{certificateId}` can only be created if an administrator issues it or if the authenticated student references a valid `/enrollments/{enrollmentId}` belonging to them that has reached `progressPercent == 100`.
7. **Temporal Integrity Invariant**: All `createdAt` and `updatedAt` fields must equal `request.time` on creation, and `updatedAt` must equal `request.time` on update while `createdAt` remains immutable.

---

## 2. The "Dirty Dozen" Payloads

1. **Unverified Admin Spoof**: Authenticated token with `email: "danielowino233@gmail.com"` and `email_verified: false` attempting to write to `/courses/course_1`.
2. **Shadow Field Injection on User Profile**: Creating `/users/user_1` with an extra unauthorized field `{"isAdmin": true, "role": "superadmin"}`.
3. **Cross-User PII Scraping**: Authenticated `user_A` attempting `list` or `get` on `/users/user_B` or `/orders` without filtering by `userId == request.auth.uid`.
4. **Fake Paid Course Enrollment**: Authenticated `user_A` attempting to `create` `/enrollments/enr_1` with `enrollmentType: "paid"` for a paid course where the referenced order has `status: "under_review"`.
5. **Client-Side Order Self-Approval**: Authenticated `user_A` attempting to `update` `/orders/ord_1` to set `status: "successful"`.
6. **Fabricated Certificate Creation**: Authenticated `user_A` attempting to `create` `/certificates/cert_1` for an enrollment where `progressPercent` is `20`.
7. **ID Poisoning Attack**: Attempting to `create` `/orders/invalid$id!with*bad^chars` or a 500-character document ID.
8. **Denial-of-Wallet String Overflow**: Attempting to `create` `/inquiries/inq_1` with a `message` string of 50,000 characters (exceeding max 3,000).
9. **Unbounded Array Injection**: Attempting to `update` `/users/user_1` with `savedCourseIds` containing 500 elements (exceeding max 100).
10. **Timestamp Manipulation**: Attempting to `create` `/orders/ord_1` with a backdated client timestamp `createdAt` != `request.time`.
11. **Immutable Owner Mutation**: Attempting to `update` `/enrollments/enr_1` to change `userId` or `courseId` after creation.
12. **Terminal State Mutation**: Student attempting to `update` an `/orders/ord_1` document after its status has reached terminal state `'successful'`.

---

## 3. Security Rules Test Suite Reference

See `firestore.rules.test.ts` for the automated test runner specifications verifying that all 12 Dirty Dozen payloads return `PERMISSION_DENIED`.
