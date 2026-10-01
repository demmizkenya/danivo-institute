import React, { useState } from 'react';
import {
  BookOpen,
  Award,
  Bookmark,
  Bell,
  User as UserIcon,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  MailCheck,
} from 'lucide-react';
import { Course, Certificate } from '../types/lms';
import { useLMS } from '../context/LMSContext';
import { CourseCard } from './CourseCard';

interface StudentDashboardProps {
  initialTab?: 'courses' | 'orders' | 'certificates' | 'saved' | 'notifications' | 'profile';
  onOpenCourseLearn: (course: Course, lessonId?: string) => void;
  onSelectCourseDetails: (course: Course) => void;
  onOpenCertificateModal: (cert: Certificate) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  initialTab = 'courses',
  onOpenCourseLearn,
  onSelectCourseDetails,
  onOpenCertificateModal,
}) => {
  const {
    user,
    profile,
    courses,
    enrollments,
    orders,
    certificates,
    notifications,
    updateUserProfile,
    toggleSaveCourse,
    markNotificationRead,
    resendVerificationEmail,
    refreshUserVerification,
    resetPassword,
  } = useLMS();

  const [activeTab, setActiveTab] = useState(initialTab);

  // Profile form state
  const [fullName, setFullName] = useState(profile?.fullName || user?.displayName || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [photoUrl, setPhotoUrl] = useState(profile?.photoUrl || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [notifyEmail, setNotifyEmail] = useState(profile?.notifyEmail ?? true);
  const [notifyCourseUpdates, setNotifyCourseUpdates] = useState(
    profile?.notifyCourseUpdates ?? true
  );
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSavedMsg, setProfileSavedMsg] = useState('');
  const [verifyMsg, setVerifyMsg] = useState('');

  const myEnrollments = enrollments.filter((e) => e.userId === user?.uid);
  const myOrders = orders.filter((o) => o.userId === user?.uid);
  const myCertificates = certificates.filter((c) => c.userId === user?.uid);
  const savedCourses = courses.filter((c) => profile?.savedCourseIds?.includes(c.id));

  const currentActiveEnrollment =
    myEnrollments.find((e) => e.status === 'active' && e.progressPercent < 100) ||
    myEnrollments[0];
  const currentCourse = currentActiveEnrollment
    ? courses.find((c) => c.id === currentActiveEnrollment.courseId)
    : undefined;

  const currentLessonTitle =
    currentCourse
      ?.modules.flatMap((m) => m.lessons)
      .find((l) => l.id === currentActiveEnrollment?.lastLessonId)?.title ||
    currentCourse?.modules[0]?.lessons[0]?.title ||
    'Module 1.1 Overview';

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSavedMsg('');
    try {
      await updateUserProfile({
        fullName,
        phone,
        photoUrl,
        bio,
        notifyEmail,
        notifyCourseUpdates,
      });
      setProfileSavedMsg('Your student profile and preferences have been updated.');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Email Verification Alert if needed */}
      {user && !user.emailVerified && (
        <div className="p-4 bg-[#D97706]/10 border border-[#D97706]/30 rounded-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-bold text-[#0F172A]">
                Please Verify Your Email Address ({user.email})
              </h2>
              <p className="text-xs text-[#475569] mt-0.5">
                Email verification is required to enroll in courses and generate official
                certificates. Check your inbox or click refresh once verified.
              </p>
              {verifyMsg && (
                <p className="text-xs font-semibold text-[#16A34A] mt-1">{verifyMsg}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                await resendVerificationEmail();
                setVerifyMsg('Verification link resent to your email.');
              }}
              className="px-3 py-1.5 text-xs font-medium bg-white border border-[#E2E8F0] rounded-lg text-[#0F172A]"
            >
              Resend Email
            </button>
            <button
              type="button"
              onClick={async () => {
                const ok = await refreshUserVerification();
                setVerifyMsg(
                  ok
                    ? 'Email verified! Your account is now active.'
                    : 'Not verified yet — please click the link in your email first.'
                );
              }}
              className="px-3.5 py-1.5 text-xs font-semibold bg-[#2563EB] text-white rounded-lg inline-flex items-center gap-1.5"
            >
              <MailCheck className="w-3.5 h-3.5" />
              <span>I Have Verified My Email</span>
            </button>
          </div>
        </div>
      )}

      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
        <div>
          <div className="text-xs font-semibold text-[#2563EB] mb-1">
            Student Learning Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
            Welcome back, {profile?.fullName || user?.displayName || 'Learner'}
          </h1>
        </div>
        <div className="flex items-center gap-6 text-xs text-[#475569] tabular-nums">
          <div>
            Enrolled Courses:{' '}
            <strong className="text-[#0F172A]">{myEnrollments.length}</strong>
          </div>
          <div>
            Completed:{' '}
            <strong className="text-[#16A34A]">
              {myEnrollments.filter((e) => e.status === 'completed').length}
            </strong>
          </div>
          <div>
            Certificates:{' '}
            <strong className="text-[#2563EB]">{myCertificates.length}</strong>
          </div>
        </div>
      </div>

      {/* Continue Learning Spotlight */}
      {currentActiveEnrollment && currentCourse && (
        <div className="p-6 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="text-xs font-semibold text-[#2563EB]">
              Resume Where You Left Off
            </div>
            <h2 className="text-lg font-bold text-[#0F172A]">
              {currentCourse.title}
            </h2>
            <div className="text-xs text-[#475569]">
              Current Lesson: <strong className="text-[#0F172A]">{currentLessonTitle}</strong>
            </div>
            <div className="flex items-center gap-3 pt-1 max-w-md">
              <div className="flex-1 h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2563EB] transition-all"
                  style={{ width: `${currentActiveEnrollment.progressPercent}%` }}
                />
              </div>
              <span className="text-xs font-mono font-semibold text-[#0F172A] tabular-nums">
                {currentActiveEnrollment.progressPercent}% Complete
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              onOpenCourseLearn(currentCourse, currentActiveEnrollment.lastLessonId)
            }
            className="px-5 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <span>Continue Learning</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 p-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl overflow-x-auto">
        {[
          { id: 'courses', label: `My Courses (${myEnrollments.length})`, icon: BookOpen },
          { id: 'orders', label: `Payments & Orders (${myOrders.length})`, icon: CreditCard },
          { id: 'certificates', label: `Certificates (${myCertificates.length})`, icon: Award },
          { id: 'saved', label: `Saved (${savedCourses.length})`, icon: Bookmark },
          {
            id: 'notifications',
            label: `Notifications (${notifications.filter((n) => !n.isRead).length})`,
            icon: Bell,
          },
          { id: 'profile', label: 'Profile & Settings', icon: UserIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap inline-flex items-center gap-2 transition-colors cursor-pointer ${
                active
                  ? 'bg-white text-[#0F172A] shadow-xs border border-[#E2E8F0]'
                  : 'text-[#475569] hover:text-[#0F172A]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: MY COURSES */}
      {activeTab === 'courses' && (
        <div>
          {myEnrollments.length === 0 ? (
            <div className="p-10 text-center bg-white border border-[#E2E8F0] rounded-xl space-y-3">
              <BookOpen className="w-8 h-8 text-[#475569] mx-auto" />
              <h3 className="text-base font-bold text-[#0F172A]">
                You Have Not Enrolled in Any Courses Yet
              </h3>
              <p className="text-xs text-[#475569] max-w-md mx-auto">
                Explore our catalog of 30+ practical programs in AI, Coding, Digital Marketing,
                Finance, and Media Design to begin learning.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myEnrollments.map((enr) => {
                const course = courses.find((c) => c.id === enr.courseId);
                if (!course) return null;
                const daysLeft = Math.max(
                  0,
                  Math.ceil((enr.expiresAtMs - Date.now()) / (1000 * 60 * 60 * 24))
                );
                return (
                  <div
                    key={enr.id}
                    className="bg-white border border-[#E2E8F0] rounded-xl p-5 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-[#475569]">
                        <span className="font-medium text-[#2563EB]">{course.category}</span>
                        <span className="tabular-nums">
                          {enr.accessType === 'lifetime'
                            ? 'Lifetime Access'
                            : `${daysLeft}d remaining`}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-[#0F172A]">{course.title}</h3>
                      <div className="text-xs text-[#475569] tabular-nums">
                        Enrolled: {new Date(enr.enrolledAtMs).toLocaleDateString()} · Expiry:{' '}
                        {enr.accessType === 'lifetime'
                          ? 'Never'
                          : new Date(enr.expiresAtMs).toLocaleDateString()}
                      </div>
                      <div className="pt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-[#475569]">Course Progress</span>
                          <span className="font-mono font-semibold text-[#0F172A] tabular-nums">
                            {enr.progressPercent}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#16A34A]"
                            style={{ width: `${enr.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenCourseLearn(course, enr.lastLessonId)}
                        className="flex-1 py-2 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg text-center cursor-pointer"
                      >
                        {enr.progressPercent > 0 ? 'Continue Learning' : 'Start Learning'}
                      </button>
                      {enr.certificateId && (
                        <button
                          type="button"
                          onClick={() => {
                            const cert = certificates.find(
                              (c) => c.certificateId === enr.certificateId
                            );
                            if (cert) onOpenCertificateModal(cert);
                          }}
                          className="px-3 py-2 bg-[#16A34A]/10 text-[#16A34A] text-xs font-semibold rounded-lg cursor-pointer"
                        >
                          Certificate
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ORDERS & PAYMENTS */}
      {activeTab === 'orders' && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
          {myOrders.length === 0 ? (
            <div className="p-10 text-center text-xs text-[#475569]">
              No payment orders found in your account.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-xs font-semibold text-[#475569]">
                    <th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Verification Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-xs">
                  {myOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-[#F8FAFC]/60">
                      <td className="py-3.5 px-4 font-semibold text-[#0F172A]">
                        {ord.courseTitle}
                      </td>
                      <td className="py-3.5 px-4 uppercase text-[#475569]">
                        {ord.paymentMethod.replace('_', ' ')}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#0F172A] tabular-nums">
                        {ord.paymentReference}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#0F172A] tabular-nums">
                        {ord.currency} {ord.finalAmount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-semibold">
                        {ord.status === 'successful' ? (
                          <span className="text-[#16A34A]">Verified & Enrolled</span>
                        ) : ord.status === 'under_review' || ord.status === 'pending' ? (
                          <span className="text-[#D97706]">Under Verification</span>
                        ) : (
                          <span className="text-[#DC2626] uppercase">{ord.status}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[#475569] max-w-xs">
                        {ord.verificationNotes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CERTIFICATES */}
      {activeTab === 'certificates' && (
        <div>
          {myCertificates.length === 0 ? (
            <div className="p-10 text-center bg-white border border-[#E2E8F0] rounded-xl space-y-2">
              <Award className="w-8 h-8 text-[#475569] mx-auto" />
              <h3 className="text-sm font-bold text-[#0F172A]">
                No Certificates Earned Yet
              </h3>
              <p className="text-xs text-[#475569]">
                Complete 100% of any enrolled course and pass its assessment quiz to receive your
                verifiable Certificate of Completion.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myCertificates.map((cert) => (
                <div
                  key={cert.id}
                  className="p-6 bg-white border border-[#E2E8F0] rounded-xl flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-[#16A34A]">
                      CERTIFICATE OF COMPLETION
                    </div>
                    <h3 className="text-base font-bold text-[#0F172A]">
                      {cert.courseTitle}
                    </h3>
                    <div className="text-xs text-[#475569] font-mono tabular-nums">
                      ID: {cert.certificateId} · Issued: {cert.issuedDateStr}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenCertificateModal(cert)}
                    className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg shrink-0 cursor-pointer"
                  >
                    View & Print
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SAVED COURSES */}
      {activeTab === 'saved' && (
        <div>
          {savedCourses.length === 0 ? (
            <div className="p-10 text-center bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#475569]">
              You have no bookmarked courses yet. Click the bookmark icon on any course card to save
              it for later.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  enrollment={myEnrollments.find((e) => e.courseId === course.id)}
                  isSaved={true}
                  onSelectCourse={onSelectCourseDetails}
                  onPrimaryAction={onSelectCourseDetails}
                  onToggleSave={toggleSaveCourse}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="p-10 text-center bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#475569]">
              You have no notifications at this time.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 rounded-xl border flex items-start justify-between gap-4 ${
                  n.isRead
                    ? 'bg-white border-[#E2E8F0]'
                    : 'bg-[#2563EB]/5 border-[#2563EB]/30'
                }`}
              >
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-[#0F172A]">{n.title}</div>
                  <p className="text-xs text-[#475569]">{n.message}</p>
                </div>
                {!n.isRead && (
                  <button
                    type="button"
                    onClick={() => markNotificationRead(n.id)}
                    className="text-xs font-semibold text-[#2563EB] hover:underline shrink-0"
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 6: PROFILE & SETTINGS */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8">
          <h2 className="text-lg font-bold text-[#0F172A] mb-1">
            Student Profile & Account Settings
          </h2>
          <p className="text-xs text-[#475569] mb-6">
            Your full name below is used on your official DANIVO INSTITUTE Certificates of
            Completion.
          </p>

          {profileSavedMsg && (
            <div className="mb-4 p-3 rounded-lg bg-[#16A34A]/10 text-xs font-semibold text-[#16A34A] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{profileSavedMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                  Registered Email
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3.5 py-2 text-sm bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0] rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                  Phone / WhatsApp Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0708083643"
                  className="w-full px-3.5 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                  Profile Photo URL (Optional)
                </label>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Professional Bio & Career Goals
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-3 text-sm border border-[#E2E8F0] rounded-lg"
              />
            </div>

            <div className="space-y-2 pt-2">
              <label className="flex items-center gap-2 text-xs text-[#0F172A]">
                <input
                  type="checkbox"
                  checked={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.checked)}
                />
                <span>Receive enrollment and certificate notifications</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-[#0F172A]">
                <input
                  type="checkbox"
                  checked={notifyCourseUpdates}
                  onChange={(e) => setNotifyCourseUpdates(e.target.checked)}
                />
                <span>Receive announcements when new modules or courses are published</span>
              </label>
            </div>

            <div className="pt-4 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                {savingProfile ? 'Saving Changes...' : 'Save Profile Settings'}
              </button>

              {user?.email && (
                <button
                  type="button"
                  onClick={async () => {
                    if (user.email) {
                      await resetPassword(user.email);
                      setProfileSavedMsg(
                        `Password reset email sent to ${user.email}.`
                      );
                    }
                  }}
                  className="text-xs font-semibold text-[#475569] hover:text-[#0F172A]"
                >
                  Send Password Reset Email
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
