import React, { useState } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  CreditCard,
  Users,
  Award,
  ClipboardCheck,
  MessageSquare,
  Globe,
  ShieldCheck,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  Database,
  Image as ImageIcon,
} from 'lucide-react';
import { Course, CourseModule, SiteSetting, Certificate } from '../types/lms';
import { useLMS } from '../context/LMSContext';
import { COURSE_CATEGORIES, CATEGORY_IMAGES } from '../data/initialCatalog';

interface AdminDashboardProps {
  onOpenCertificateModal: (cert: Certificate) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onOpenCertificateModal,
}) => {
  const {
    isAdmin,
    settings,
    courses,
    instructors,
    enrollments,
    orders,
    certificates,
    assignmentSubmissions,
    reviews,
    allUsers,
    allInquiries,
    auditLogs,
    saveSiteSettings,
    saveCourse,
    deleteCourseById,
    verifyOrderAndEnroll,
    gradeAssignmentSubmission,
    moderateReview,
    resolveInquiry,
    seedInitialCatalogToFirestore,
  } = useLMS();

  const [activeSection, setActiveSection] = useState<
    | 'overview'
    | 'courses'
    | 'payments'
    | 'students'
    | 'assignments'
    | 'reviews'
    | 'cms'
    | 'media'
    | 'audit'
  >('overview');

  const [courseSearch, setCourseSearch] = useState('');
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isNewCourse, setIsNewCourse] = useState(false);
  const [savingCourseState, setSavingCourseState] = useState(false);

  // CMS Settings state
  const [cmsForm, setCmsForm] = useState<SiteSetting>(settings);
  const [savingCms, setSavingCms] = useState(false);
  const [statusBanner, setStatusBanner] = useState('');

  // Grading modal state
  const [gradingNotes, setGradingNotes] = useState<Record<string, string>>({});
  const [gradingScores, setGradingScores] = useState<Record<string, number>>({});

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="p-8 bg-white border border-[#E2E8F0] rounded-xl space-y-3">
          <ShieldCheck className="w-10 h-10 text-[#DC2626] mx-auto" />
          <h1 className="text-xl font-bold text-[#0F172A]">
            Administrator Authorization Required
          </h1>
          <p className="text-xs text-[#475569]">
            This control center is restricted to verified DANIVO INSTITUTE administrators.
          </p>
        </div>
      </div>
    );
  }

  // Real calculated analytics from Firestore state
  const publishedCoursesCount = courses.filter((c) => c.status === 'published').length;
  const freeCoursesCount = courses.filter((c) => c.isFree).length;
  const paidCoursesCount = courses.length - freeCoursesCount;
  const pendingOrders = orders.filter(
    (o) => o.status === 'under_review' || o.status === 'pending'
  );
  const successfulOrders = orders.filter((o) => o.status === 'successful');
  const totalVerifiedRevenue = successfulOrders.reduce(
    (acc, o) => acc + (o.finalAmount || 0),
    0
  );

  const filteredCourses = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
      c.category.toLowerCase().includes(courseSearch.toLowerCase())
  );

  const handleOpenNewCourse = () => {
    const nextIdx = courses.length + 1;
    const blankCourse: Course = {
      id: `course_${Date.now()}`,
      slug: `new-program-${nextIdx}`,
      title: '',
      shortDescription: '',
      description: '',
      category: COURSE_CATEGORIES[0],
      instructorId: instructors[0]?.id || 'inst_ai_tech',
      instructorName: instructors[0]?.name || 'Dr. David Ochieng, PhD',
      thumbnailUrl: CATEGORY_IMAGES[COURSE_CATEGORIES[0]],
      isFree: false,
      regularPrice: 2000,
      salePrice: 2000,
      discountPercentage: 0,
      currency: settings.primaryCurrency || 'KES',
      accessType: 'fixed_days',
      accessDurationDays: 90,
      difficulty: 'Beginner',
      durationHours: 12,
      language: 'English',
      status: 'published',
      featured: false,
      popular: false,
      isNew: true,
      rating: 5.0,
      studentsCount: 0,
      outcomes: ['Apply structured industry workflows to real-world projects'],
      requirements: ['Computer or smartphone with internet access'],
      skills: ['Core Execution', 'Applied Strategy'],
      modules: [
        {
          id: `mod_${Date.now()}_1`,
          title: 'Module 1: Core Foundations & Practical Setup',
          description: 'Foundational concepts and implementation standards.',
          lessons: [
            {
              id: `les_${Date.now()}_1`,
              title: '1.1 Program Introduction & Core Framework',
              type: 'video',
              durationMinutes: 15,
              isPreview: true,
              videoUrl:
                'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
              contentMarkdown: 'Welcome to this program at DANIVO INSTITUTE.',
              resources: [],
            },
          ],
        },
      ],
      completionRequireAllLessons: true,
      completionRequireQuizzes: false,
      completionRequireAssignments: false,
      completionMinQuizScore: 70,
      orderIndex: nextIdx,
    };
    setEditingCourse(blankCourse);
    setIsNewCourse(true);
  };

  const handleCourseSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;
    setSavingCourseState(true);
    setStatusBanner('');
    try {
      await saveCourse(editingCourse, isNewCourse);
      setStatusBanner(`Saved course "${editingCourse.title}" to Firestore.`);
      setEditingCourse(null);
    } finally {
      setSavingCourseState(false);
    }
  };

  const handleCmsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCms(true);
    setStatusBanner('');
    try {
      await saveSiteSettings(cmsForm);
      setStatusBanner(
        'Website CMS, Branding, Contact, and Payment Settings saved to Firestore.'
      );
    } finally {
      setSavingCms(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row">
      {/* Left Admin Sidebar */}
      <aside className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-[#E2E8F0] shrink-0">
        <div className="p-5 border-b border-[#E2E8F0]">
          <div className="text-xs font-bold text-[#2563EB]">LMS & CMS Control Center</div>
          <div className="text-sm font-bold text-[#0F172A] mt-0.5">
            {settings.brandName} Admin
          </div>
        </div>

        <nav className="p-3 flex lg:flex-col gap-1 overflow-x-auto">
          {[
            { id: 'overview', label: 'Analytics & Overview', icon: LayoutDashboard },
            { id: 'courses', label: `Courses CMS (${courses.length})`, icon: BookOpen },
            {
              id: 'payments',
              label: `Payments & Orders (${pendingOrders.length} Pending)`,
              icon: CreditCard,
            },
            { id: 'students', label: `Students & Enrollments`, icon: Users },
            {
              id: 'assignments',
              label: `Assignments (${assignmentSubmissions.length})`,
              icon: ClipboardCheck,
            },
            {
              id: 'reviews',
              label: `Reviews & Inquiries`,
              icon: MessageSquare,
            },
            { id: 'cms', label: 'Website CMS & Payments', icon: Globe },
            { id: 'media', label: 'Media & Faculty', icon: ImageIcon },
            { id: 'audit', label: `Audit Logs (${auditLogs.length})`, icon: ShieldCheck },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveSection(item.id as typeof activeSection);
                  setCmsForm(settings);
                }}
                className={`px-3.5 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-2.5 transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#2563EB] text-white'
                    : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 max-w-6xl w-full space-y-6">
        {statusBanner && (
          <div className="p-4 rounded-xl bg-[#16A34A]/10 border border-[#16A34A]/30 text-xs font-semibold text-[#16A34A] flex items-center justify-between">
            <span>{statusBanner}</span>
            <button
              type="button"
              onClick={() => setStatusBanner('')}
              className="text-[#0F172A] underline ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 1. OVERVIEW & ANALYTICS */}
        {activeSection === 'overview' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-[#0F172A]">
                  Executive LMS Analytics & Operations
                </h1>
                <p className="text-xs text-[#475569] mt-0.5">
                  All metrics are calculated directly from live Firestore collections.
                </p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  await seedInitialCatalogToFirestore();
                  setStatusBanner('Verified 30 initial courses, faculty, and site settings in Firestore.');
                }}
                className="px-4 py-2 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-xs font-semibold text-[#0F172A] rounded-lg inline-flex items-center gap-2 cursor-pointer"
              >
                <Database className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Verify / Sync Initial Catalog in Database</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 bg-white border border-[#E2E8F0] rounded-xl">
                <div className="text-xs text-[#475569]">Total Courses</div>
                <div className="text-2xl font-bold text-[#0F172A] mt-1 tabular-nums">
                  {courses.length}
                </div>
                <div className="text-[11px] text-[#475569] mt-1 tabular-nums">
                  {publishedCoursesCount} Published · {freeCoursesCount} Free · {paidCoursesCount}{' '}
                  Paid
                </div>
              </div>

              <div className="p-5 bg-white border border-[#E2E8F0] rounded-xl">
                <div className="text-xs text-[#475569]">Registered Learners</div>
                <div className="text-2xl font-bold text-[#0F172A] mt-1 tabular-nums">
                  {allUsers.length}
                </div>
                <div className="text-[11px] text-[#475569] mt-1 tabular-nums">
                  {enrollments.length} Total Course Enrollments
                </div>
              </div>

              <div className="p-5 bg-white border border-[#E2E8F0] rounded-xl">
                <div className="text-xs text-[#475569]">Verified Tuition Revenue</div>
                <div className="text-2xl font-bold text-[#16A34A] mt-1 tabular-nums">
                  {settings.primaryCurrency} {totalVerifiedRevenue.toLocaleString()}
                </div>
                <div className="text-[11px] text-[#D97706] mt-1 tabular-nums">
                  {pendingOrders.length} Payment(s) Awaiting Review
                </div>
              </div>

              <div className="p-5 bg-white border border-[#E2E8F0] rounded-xl">
                <div className="text-xs text-[#475569]">Certificates Issued</div>
                <div className="text-2xl font-bold text-[#2563EB] mt-1 tabular-nums">
                  {certificates.length}
                </div>
                <div className="text-[11px] text-[#475569] mt-1 tabular-nums">
                  {enrollments.filter((e) => e.status === 'completed').length} Course Completions
                </div>
              </div>
            </div>

            {/* Quick Pending Payment Verification Queue */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-[#0F172A]">
                  Payment References Awaiting Verification ({pendingOrders.length})
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveSection('payments')}
                  className="text-xs font-semibold text-[#2563EB] hover:underline"
                >
                  Open Full Payment Queue →
                </button>
              </div>

              {pendingOrders.length === 0 ? (
                <p className="text-xs text-[#475569]">
                  All submitted M-Pesa and Bank Transfer references have been processed.
                </p>
              ) : (
                <div className="space-y-3">
                  {pendingOrders.slice(0, 5).map((ord) => (
                    <div
                      key={ord.id}
                      className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg flex flex-wrap items-center justify-between gap-4"
                    >
                      <div>
                        <div className="text-xs font-bold text-[#0F172A]">
                          {ord.userName} ({ord.userEmail}) — {ord.courseTitle}
                        </div>
                        <div className="text-xs text-[#475569] font-mono tabular-nums mt-0.5">
                          Method: {ord.paymentMethod.toUpperCase()} · Ref: {ord.paymentReference} ·
                          Sender: {ord.paymentPhoneOrAccount} · Amount: {ord.currency}{' '}
                          {ord.finalAmount.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            verifyOrderAndEnroll(
                              ord,
                              'successful',
                              'Verified by Admissions Office. Enrollment activated.'
                            )
                          }
                          className="px-3.5 py-1.5 bg-[#16A34A] text-white text-xs font-semibold rounded-lg cursor-pointer"
                        >
                          Approve & Enroll
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            verifyOrderAndEnroll(
                              ord,
                              'failed',
                              'Reference code could not be matched in statement.'
                            )
                          }
                          className="px-3.5 py-1.5 bg-[#DC2626] text-white text-xs font-semibold rounded-lg cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. COURSES CMS */}
        {activeSection === 'courses' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-[#0F172A]">
                  Course Catalog & Curriculum CMS
                </h1>
                <p className="text-xs text-[#475569] mt-0.5">
                  Edit pricing (KES), toggle Free/Paid status, configure course-specific access
                  days, and manage modules and lessons.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenNewCourse}
                className="px-4 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Course</span>
              </button>
            </div>

            {/* Course Editor Form Drawer */}
            {editingCourse && (
              <form
                onSubmit={handleCourseSave}
                className="bg-white border-2 border-[#2563EB] rounded-xl p-6 space-y-5"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                  <h2 className="text-lg font-bold text-[#0F172A]">
                    {isNewCourse ? 'Create New Course' : `Edit Course: ${editingCourse.title}`}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setEditingCourse(null)}
                    className="text-xs text-[#475569] hover:text-[#0F172A]"
                  >
                    Close Editor
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                      Course Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingCourse.title}
                      onChange={(e) =>
                        setEditingCourse({ ...editingCourse, title: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                      Category *
                    </label>
                    <select
                      value={editingCourse.category}
                      onChange={(e) =>
                        setEditingCourse({ ...editingCourse, category: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg bg-white"
                    >
                      {COURSE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                      Pricing Model
                    </label>
                    <select
                      value={editingCourse.isFree ? 'free' : 'paid'}
                      onChange={(e) => {
                        const free = e.target.value === 'free';
                        setEditingCourse({
                          ...editingCourse,
                          isFree: free,
                          salePrice: free ? 0 : editingCourse.regularPrice,
                        });
                      }}
                      className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg bg-white"
                    >
                      <option value="paid">PAID</option>
                      <option value="free">FREE</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                      Regular Price (KES)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editingCourse.regularPrice}
                      onChange={(e) =>
                        setEditingCourse({
                          ...editingCourse,
                          regularPrice: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg font-mono tabular-nums"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                      Sale Price (KES)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editingCourse.salePrice}
                      onChange={(e) =>
                        setEditingCourse({
                          ...editingCourse,
                          salePrice: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg font-mono tabular-nums"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                      Access Policy
                    </label>
                    <select
                      value={editingCourse.accessType}
                      onChange={(e) =>
                        setEditingCourse({
                          ...editingCourse,
                          accessType: e.target.value as 'fixed_days' | 'lifetime',
                        })
                      }
                      className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg bg-white"
                    >
                      <option value="fixed_days">Fixed Days</option>
                      <option value="lifetime">Lifetime Access</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                      Access Days
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={3650}
                      value={editingCourse.accessDurationDays}
                      onChange={(e) =>
                        setEditingCourse({
                          ...editingCourse,
                          accessDurationDays: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg font-mono tabular-nums"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                      Difficulty
                    </label>
                    <select
                      value={editingCourse.difficulty}
                      onChange={(e) =>
                        setEditingCourse({
                          ...editingCourse,
                          difficulty: e.target.value as Course['difficulty'],
                        })
                      }
                      className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg bg-white"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                      Duration (Hours)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={editingCourse.durationHours}
                      onChange={(e) =>
                        setEditingCourse({
                          ...editingCourse,
                          durationHours: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg font-mono tabular-nums"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                      Publication Status
                    </label>
                    <select
                      value={editingCourse.status}
                      onChange={(e) =>
                        setEditingCourse({
                          ...editingCourse,
                          status: e.target.value as Course['status'],
                        })
                      }
                      className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg bg-white"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                    Short Description
                  </label>
                  <textarea
                    rows={2}
                    value={editingCourse.shortDescription}
                    onChange={(e) =>
                      setEditingCourse({ ...editingCourse, shortDescription: e.target.value })
                    }
                    className="w-full p-3 text-sm border border-[#E2E8F0] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                    Full Academic & Practical Description
                  </label>
                  <textarea
                    rows={3}
                    value={editingCourse.description}
                    onChange={(e) =>
                      setEditingCourse({ ...editingCourse, description: e.target.value })
                    }
                    className="w-full p-3 text-sm border border-[#E2E8F0] rounded-lg"
                  />
                </div>

                {/* Module & Lesson Quick Editor */}
                <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0F172A]">
                      Curriculum Modules ({editingCourse.modules.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const newMod: CourseModule = {
                          id: `mod_${Date.now()}`,
                          title: `Module ${editingCourse.modules.length + 1}: New Module`,
                          description: 'Module learning goals and practical exercises.',
                          lessons: [
                            {
                              id: `les_${Date.now()}`,
                              title: 'New Lesson',
                              type: 'text',
                              durationMinutes: 20,
                              isPreview: false,
                              videoUrl: '',
                              contentMarkdown: 'Enter lesson instructional content here.',
                              resources: [],
                            },
                          ],
                        };
                        setEditingCourse({
                          ...editingCourse,
                          modules: [...editingCourse.modules, newMod],
                        });
                      }}
                      className="px-3 py-1 bg-white border border-[#E2E8F0] rounded text-xs font-semibold text-[#2563EB]"
                    >
                      + Add Module
                    </button>
                  </div>

                  {editingCourse.modules.map((mod, mIdx) => (
                    <div
                      key={mod.id}
                      className="p-3 bg-white border border-[#E2E8F0] rounded-lg space-y-2"
                    >
                      <input
                        type="text"
                        value={mod.title}
                        onChange={(e) => {
                          const updated = [...editingCourse.modules];
                          updated[mIdx] = { ...mod, title: e.target.value };
                          setEditingCourse({ ...editingCourse, modules: updated });
                        }}
                        className="w-full px-2.5 py-1.5 text-xs font-bold border border-[#E2E8F0] rounded"
                      />
                      <div className="text-[11px] text-[#475569]">
                        Contains {mod.lessons.length} lessons (Video, Reading, Quiz, Assignment)
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
                  <button
                    type="button"
                    onClick={() => setEditingCourse(null)}
                    className="px-4 py-2 text-xs font-semibold text-[#475569]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingCourseState}
                    className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    {savingCourseState ? 'Saving to Database...' : 'Save & Publish Course'}
                  </button>
                </div>
              </form>
            )}

            {/* Search & Courses Table */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
              <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-[#475569] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    placeholder="Filter courses by title or category..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-[#E2E8F0] rounded-lg"
                  />
                </div>
                <span className="text-xs text-[#475569] tabular-nums">
                  Showing {filteredCourses.length} of {courses.length} courses
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-xs font-semibold text-[#475569]">
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">Course Title</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4 text-right">Price (KES)</th>
                      <th className="py-3 px-4">Access Window</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-xs">
                    {filteredCourses.map((c) => (
                      <tr key={c.id} className="hover:bg-[#F8FAFC]/60">
                        <td className="py-3 px-4 font-mono text-[#475569] tabular-nums">
                          {c.orderIndex}
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#0F172A]">{c.title}</td>
                        <td className="py-3 px-4 text-[#475569]">{c.category}</td>
                        <td className="py-3 px-4 font-semibold">
                          {c.isFree ? (
                            <span className="text-[#16A34A]">FREE</span>
                          ) : (
                            <span className="text-[#2563EB]">PAID</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-[#0F172A] tabular-nums">
                          {c.regularPrice.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-[#475569] tabular-nums">
                          {c.accessType === 'lifetime'
                            ? 'Lifetime'
                            : `${c.accessDurationDays} days`}
                        </td>
                        <td className="py-3 px-4 capitalize text-[#0F172A]">{c.status}</td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCourse(c);
                              setIsNewCourse(false);
                            }}
                            className="p-1.5 text-[#2563EB] hover:bg-[#2563EB]/10 rounded mr-1"
                            title="Edit course"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteCourseById(c.id)}
                            className="p-1.5 text-[#DC2626] hover:bg-[#DC2626]/10 rounded"
                            title="Delete course"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. PAYMENTS & ORDERS VERIFICATION */}
        {activeSection === 'payments' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-[#0F172A]">
                Payment Reference Verification & Order Management
              </h1>
              <p className="text-xs text-[#475569] mt-0.5">
                Verify M-Pesa ({settings.mpesaPaybillOrNumber}) and Bank Transfer (
                {settings.bankAccountNumber}) transaction references to grant paid course access.
              </p>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
              {orders.length === 0 ? (
                <div className="p-10 text-center text-xs text-[#475569]">
                  No payment orders have been submitted yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-xs font-semibold text-[#475569]">
                        <th className="py-3 px-4">Student</th>
                        <th className="py-3 px-4">Course</th>
                        <th className="py-3 px-4">Method & Sender</th>
                        <th className="py-3 px-4">Reference</th>
                        <th className="py-3 px-4 text-right">Amount</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Verification Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0] text-xs">
                      {orders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-[#F8FAFC]/60">
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-[#0F172A]">{ord.userName}</div>
                            <div className="text-[11px] text-[#475569]">{ord.userEmail}</div>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-[#0F172A]">
                            {ord.courseTitle}
                          </td>
                          <td className="py-3.5 px-4 text-[#475569]">
                            <span className="uppercase font-semibold text-[#0F172A]">
                              {ord.paymentMethod}
                            </span>{' '}
                            · {ord.paymentPhoneOrAccount}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-[#0F172A] tabular-nums">
                            {ord.paymentReference}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#0F172A] tabular-nums">
                            {ord.currency} {ord.finalAmount.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 font-semibold">
                            {ord.status === 'successful' ? (
                              <span className="text-[#16A34A]">Successful</span>
                            ) : ord.status === 'under_review' || ord.status === 'pending' ? (
                              <span className="text-[#D97706]">Under Review</span>
                            ) : (
                              <span className="text-[#DC2626] uppercase">{ord.status}</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            {ord.status !== 'successful' && (
                              <button
                                type="button"
                                onClick={() =>
                                  verifyOrderAndEnroll(
                                    ord,
                                    'successful',
                                    'Verified by Admin. Course access activated.'
                                  )
                                }
                                className="px-3 py-1.5 bg-[#16A34A] hover:bg-[#15803D] text-white rounded text-xs font-semibold mr-2 inline-flex items-center gap-1 cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                            )}
                            {ord.status !== 'failed' && (
                              <button
                                type="button"
                                onClick={() =>
                                  verifyOrderAndEnroll(
                                    ord,
                                    'failed',
                                    'Payment reference could not be verified.'
                                  )
                                }
                                className="px-3 py-1.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. STUDENTS, ENROLLMENTS & CERTIFICATES */}
        {activeSection === 'students' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-[#0F172A]">
              Students, Active Enrollments & Issued Certificates
            </h1>

            <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
              <div className="p-4 bg-[#F8FAFC] border-b border-[#E2E8F0] text-xs font-bold text-[#0F172A]">
                All Course Enrollments ({enrollments.length})
              </div>
              {enrollments.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#475569]">
                  No active enrollments yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#E2E8F0] text-xs font-semibold text-[#475569]">
                        <th className="py-3 px-4">Student</th>
                        <th className="py-3 px-4">Course</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Progress</th>
                        <th className="py-3 px-4">Expires</th>
                        <th className="py-3 px-4">Certificate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0] text-xs">
                      {enrollments.map((enr) => (
                        <tr key={enr.id}>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-[#0F172A]">{enr.userName}</div>
                            <div className="text-[11px] text-[#475569]">{enr.userEmail}</div>
                          </td>
                          <td className="py-3 px-4 font-medium text-[#0F172A]">
                            {enr.courseTitle}
                          </td>
                          <td className="py-3 px-4 uppercase text-[#475569]">
                            {enr.enrollmentType}
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold text-[#0F172A] tabular-nums">
                            {enr.progressPercent}% ({enr.status})
                          </td>
                          <td className="py-3 px-4 text-[#475569] tabular-nums">
                            {enr.accessType === 'lifetime'
                              ? 'Lifetime'
                              : new Date(enr.expiresAtMs).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            {enr.certificateId ? (
                              <button
                                type="button"
                                onClick={() => {
                                  const cert = certificates.find(
                                    (c) => c.certificateId === enr.certificateId
                                  );
                                  if (cert) onOpenCertificateModal(cert);
                                }}
                                className="text-xs font-mono font-semibold text-[#16A34A] hover:underline"
                              >
                                {enr.certificateId}
                              </button>
                            ) : (
                              <span className="text-[#475569]">In Progress</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. ASSIGNMENTS GRADING */}
        {activeSection === 'assignments' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-[#0F172A]">
              Student Assignment Submissions & Faculty Grading
            </h1>
            {assignmentSubmissions.length === 0 ? (
              <div className="p-10 bg-white border border-[#E2E8F0] rounded-xl text-center text-xs text-[#475569]">
                No student capstone assignments have been submitted yet.
              </div>
            ) : (
              <div className="space-y-4">
                {assignmentSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-6 bg-white border border-[#E2E8F0] rounded-xl space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-semibold text-[#2563EB]">
                          {sub.courseTitle}
                        </span>
                        <h3 className="text-sm font-bold text-[#0F172A]">
                          {sub.assignmentTitle} — Submitted by {sub.userName}
                        </h3>
                      </div>
                      <span className="text-xs font-semibold uppercase text-[#475569]">
                        Status: {sub.status} ({sub.gradePercent}%)
                      </span>
                    </div>

                    <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] whitespace-pre-line">
                      {sub.submissionText}
                    </div>

                    {sub.attachmentUrl && (
                      <div className="text-xs">
                        Attachment URL:{' '}
                        <a
                          href={sub.attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#2563EB] underline"
                        >
                          {sub.attachmentUrl}
                        </a>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        placeholder="Score (0-100)"
                        value={gradingScores[sub.id] ?? sub.gradePercent ?? 85}
                        onChange={(e) =>
                          setGradingScores({
                            ...gradingScores,
                            [sub.id]: Number(e.target.value),
                          })
                        }
                        className="px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg font-mono"
                      />
                      <input
                        type="text"
                        placeholder="Faculty feedback..."
                        value={gradingNotes[sub.id] ?? sub.feedback}
                        onChange={(e) =>
                          setGradingNotes({ ...gradingNotes, [sub.id]: e.target.value })
                        }
                        className="sm:col-span-2 px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          gradeAssignmentSubmission(
                            sub,
                            gradingScores[sub.id] ?? 90,
                            gradingNotes[sub.id] || 'Well-structured practical execution.',
                            'graded'
                          )
                        }
                        className="px-4 py-1.5 bg-[#16A34A] text-white text-xs font-semibold rounded-lg"
                      >
                        Approve & Save Grade
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          gradeAssignmentSubmission(
                            sub,
                            gradingScores[sub.id] ?? 50,
                            gradingNotes[sub.id] || 'Please expand your implementation metrics.',
                            'resubmit_requested'
                          )
                        }
                        className="px-4 py-1.5 bg-[#D97706] text-white text-xs font-semibold rounded-lg"
                      >
                        Request Resubmission
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 6. REVIEWS & INQUIRIES MODERATION */}
        {activeSection === 'reviews' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-bold text-[#0F172A] mb-3">
                Student Course Reviews Moderation ({reviews.length})
              </h2>
              {reviews.length === 0 ? (
                <div className="p-6 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#475569]">
                  No course reviews submitted yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 bg-white border border-[#E2E8F0] rounded-xl flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="text-xs font-bold text-[#0F172A]">
                          {rev.userName} on {rev.courseTitle} ({rev.rating}/5 ★) —{' '}
                          <span className="uppercase">{rev.status}</span>
                        </div>
                        <p className="text-xs text-[#475569] mt-1">{rev.comment}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          moderateReview(
                            rev,
                            rev.status === 'published' ? 'hidden' : 'published'
                          )
                        }
                        className="px-3 py-1.5 border border-[#E2E8F0] rounded-lg text-xs font-semibold text-[#0F172A]"
                      >
                        {rev.status === 'published' ? 'Hide Review' : 'Publish Review'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#0F172A] mb-3">
                Contact Page Inquiries ({allInquiries.length})
              </h2>
              {allInquiries.length === 0 ? (
                <div className="p-6 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#475569]">
                  No contact inquiries submitted yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {allInquiries.map((inq) => (
                    <div
                      key={inq.id}
                      className="p-4 bg-white border border-[#E2E8F0] rounded-xl flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="text-xs font-bold text-[#0F172A]">
                          {inq.subject} — {inq.name} ({inq.email} · {inq.phone})
                        </div>
                        <p className="text-xs text-[#475569] mt-1">{inq.message}</p>
                      </div>
                      {inq.status === 'new' ? (
                        <button
                          type="button"
                          onClick={() => resolveInquiry(inq)}
                          className="px-3 py-1.5 bg-[#16A34A] text-white rounded-lg text-xs font-semibold"
                        >
                          Mark Resolved
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-[#16A34A]">Resolved</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 7. WEBSITE CMS, BRANDING & PAYMENT SETTINGS */}
        {activeSection === 'cms' && (
          <form
            onSubmit={handleCmsSave}
            className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 space-y-6"
          >
            <div>
              <h1 className="text-xl font-bold text-[#0F172A]">
                Website CMS, Branding, Contact & Payment Configuration
              </h1>
              <p className="text-xs text-[#475569] mt-1">
                Changes saved here persist in Firestore and update the live platform across all
                devices and browsers immediately.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                  Institute Brand Name *
                </label>
                <input
                  type="text"
                  required
                  value={cmsForm.brandName}
                  onChange={(e) => setCmsForm({ ...cmsForm, brandName: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                  Custom Logo Image URL (Leave blank for official DANIVO crest)
                </label>
                <input
                  type="text"
                  value={cmsForm.logoUrl}
                  onChange={(e) => setCmsForm({ ...cmsForm, logoUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Brand Tagline (Displayed on Homepage & Certificates) *
              </label>
              <input
                type="text"
                required
                value={cmsForm.tagline}
                onChange={(e) => setCmsForm({ ...cmsForm, tagline: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-[#E2E8F0] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Homepage Hero Headline *
              </label>
              <input
                type="text"
                required
                value={cmsForm.heroHeadline}
                onChange={(e) => setCmsForm({ ...cmsForm, heroHeadline: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-[#E2E8F0] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Homepage Hero Subheadline *
              </label>
              <textarea
                rows={3}
                required
                value={cmsForm.heroSubheadline}
                onChange={(e) => setCmsForm({ ...cmsForm, heroSubheadline: e.target.value })}
                className="w-full p-3 text-sm border border-[#E2E8F0] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Announcement Banner Text
              </label>
              <input
                type="text"
                value={cmsForm.announcementText}
                onChange={(e) =>
                  setCmsForm({ ...cmsForm, announcementText: e.target.value })
                }
                className="w-full px-3.5 py-2 text-sm border border-[#E2E8F0] rounded-lg"
              />
            </div>

            {/* Contact Settings */}
            <div className="pt-4 border-t border-[#E2E8F0]">
              <h2 className="text-sm font-bold text-[#0F172A] mb-3">
                Official Contact Channels
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                    Official Email
                  </label>
                  <input
                    type="email"
                    value={cmsForm.contactEmail}
                    onChange={(e) =>
                      setCmsForm({ ...cmsForm, contactEmail: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                    Official WhatsApp Number
                  </label>
                  <input
                    type="text"
                    value={cmsForm.contactWhatsapp}
                    onChange={(e) =>
                      setCmsForm({ ...cmsForm, contactWhatsapp: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                    Campus / Location Label
                  </label>
                  <input
                    type="text"
                    value={cmsForm.contactAddress}
                    onChange={(e) =>
                      setCmsForm({ ...cmsForm, contactAddress: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Payment Settings */}
            <div className="pt-4 border-t border-[#E2E8F0] space-y-4">
              <h2 className="text-sm font-bold text-[#0F172A]">
                M-Pesa & Bank Transfer Checkout Configuration
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                    Primary Currency
                  </label>
                  <input
                    type="text"
                    value={cmsForm.primaryCurrency}
                    onChange={(e) =>
                      setCmsForm({ ...cmsForm, primaryCurrency: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-sm border border-[#E2E8F0] rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                    M-Pesa Payment Number
                  </label>
                  <input
                    type="text"
                    value={cmsForm.mpesaPaybillOrNumber}
                    onChange={(e) =>
                      setCmsForm({ ...cmsForm, mpesaPaybillOrNumber: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-sm border border-[#E2E8F0] rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                    Bank Account Number
                  </label>
                  <input
                    type="text"
                    value={cmsForm.bankAccountNumber}
                    onChange={(e) =>
                      setCmsForm({ ...cmsForm, bankAccountNumber: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-sm border border-[#E2E8F0] rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                    Bank Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={cmsForm.bankName}
                    onChange={(e) => setCmsForm({ ...cmsForm, bankName: e.target.value })}
                    placeholder="Configure bank name..."
                    className="w-full px-3.5 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                    Bank Branch (Optional)
                  </label>
                  <input
                    type="text"
                    value={cmsForm.bankBranch}
                    onChange={(e) => setCmsForm({ ...cmsForm, bankBranch: e.target.value })}
                    placeholder="Configure branch..."
                    className="w-full px-3.5 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                    Bank Account Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={cmsForm.bankAccountName}
                    onChange={(e) =>
                      setCmsForm({ ...cmsForm, bankAccountName: e.target.value })
                    }
                    placeholder="Configure account holder name..."
                    className="w-full px-3.5 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E2E8F0]">
              <button
                type="submit"
                disabled={savingCms}
                className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                {savingCms ? 'Saving Configuration...' : 'Save Website CMS & Payment Settings'}
              </button>
            </div>
          </form>
        )}

        {/* 8. MEDIA & FACULTY */}
        {activeSection === 'media' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-[#0F172A]">
              Faculty Profiles & Platform Media Assets
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {instructors.map((inst) => (
                <div
                  key={inst.id}
                  className="p-5 bg-white border border-[#E2E8F0] rounded-xl space-y-2"
                >
                  <div className="text-sm font-bold text-[#0F172A]">{inst.name}</div>
                  <div className="text-xs text-[#2563EB] font-medium">{inst.roleTitle}</div>
                  <p className="text-xs text-[#475569]">{inst.bio}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 9. AUDIT LOGS */}
        {activeSection === 'audit' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-[#0F172A]">
                Administrative Audit Trail & Security Configuration
              </h1>
              <p className="text-xs text-[#475569] mt-0.5">
                Every administrative price change, course update, payment verification, and CMS
                update is recorded immutably in Firestore.
              </p>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
              {auditLogs.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#475569]">
                  No administrative mutations recorded in this session yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-xs font-semibold text-[#475569]">
                        <th className="py-3 px-4">Administrator</th>
                        <th className="py-3 px-4">Action</th>
                        <th className="py-3 px-4">Target</th>
                        <th className="py-3 px-4">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0] text-xs">
                      {auditLogs.map((log) => (
                        <tr key={log.id}>
                          <td className="py-3 px-4 font-mono text-[#0F172A]">
                            {log.adminEmail}
                          </td>
                          <td className="py-3 px-4 font-semibold text-[#2563EB]">
                            {log.action}
                          </td>
                          <td className="py-3 px-4 font-mono text-[#475569]">
                            {log.targetType}/{log.targetId}
                          </td>
                          <td className="py-3 px-4 text-[#0F172A]">{log.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
