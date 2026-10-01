import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  BookOpen,
  Award,
  Menu,
  X,
  Mail,
  MessageCircle,
  LogOut,
  LayoutDashboard,
  Settings,
} from 'lucide-react';
import { LMSProvider, useLMS } from './context/LMSContext';
import { Course, Certificate, Order } from './types/lms';
import { COURSE_CATEGORIES, CATEGORY_IMAGES } from './data/initialCatalog';
import { BrandLogo } from './components/BrandLogo';
import { CourseCard } from './components/CourseCard';
import { AuthModal } from './components/AuthModal';
import { CheckoutModal } from './components/CheckoutModal';
import { CertificateModal, VerifyCertificateView } from './components/CertificateModal';
import { CourseDetailsView } from './components/CourseDetailsView';
import { LearningEnvironment } from './components/LearningEnvironment';
import { StudentDashboard } from './components/StudentDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import {
  CatalogView,
  AboutView,
  FAQView,
  ContactView,
  LegalView,
} from './components/PublicPages';

type ActiveRoute =
  | 'home'
  | 'courses'
  | 'free-learning'
  | 'course-details'
  | 'learn'
  | 'dashboard'
  | 'admin'
  | 'verify-certificate'
  | 'about'
  | 'faq'
  | 'contact'
  | 'privacy'
  | 'terms';

const MainLMSApp: React.FC = () => {
  const {
    user,
    profile,
    isAdmin,
    settings,
    courses,
    enrollments,
    orders,
    certificates,
    enrollInFreeCourse,
    toggleSaveCourse,
    logout,
  } = useLMS();

  const [route, setRoute] = useState<ActiveRoute>('home');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | undefined>(undefined);
  const [verifyCertIdParam, setVerifyCertIdParam] = useState<string>('');

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [pendingActionCourse, setPendingActionCourse] = useState<Course | null>(null);
  const [checkoutCourse, setCheckoutCourse] = useState<Course | null>(null);
  const [activeCertificateModal, setActiveCertificateModal] = useState<Certificate | null>(
    null
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const navigateTo = (nextRoute: ActiveRoute) => {
    setRoute(nextRoute);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenCourseDetails = (course: Course) => {
    setSelectedCourse(course);
    navigateTo('course-details');
  };

  // Core Enrollment / Start Learning Action Handler
  const handleCourseAction = async (course: Course, currentUserOverride = user) => {
    const activeUser = currentUserOverride || user;
    if (!activeUser) {
      setPendingActionCourse(course);
      setAuthModalMode('register');
      setAuthModalOpen(true);
      return;
    }

    const existingEnrollment = enrollments.find(
      (e) => e.courseId === course.id && e.userId === activeUser.uid
    );

    if (existingEnrollment && existingEnrollment.status !== 'expired') {
      setSelectedCourse(course);
      setActiveLessonId(existingEnrollment.lastLessonId);
      navigateTo('learn');
      return;
    }

    if (course.isFree) {
      try {
        const enr = await enrollInFreeCourse(course);
        showToast(`Enrolled in ${course.title}! Opening classroom...`);
        setSelectedCourse(course);
        setActiveLessonId(enr.lastLessonId);
        navigateTo('learn');
      } catch (err) {
        showToast(
          err instanceof Error
            ? err.message
            : 'Please verify your email address in your Dashboard to complete enrollment.'
        );
        navigateTo('dashboard');
      }
      return;
    }

    // Paid course -> Open Checkout
    setCheckoutCourse(course);
  };

  const handleOrderSubmitted = (order: Order) => {
    setCheckoutCourse(null);
    showToast(
      `Payment reference ${order.paymentReference} submitted! Track verification status in your Dashboard.`
    );
    navigateTo('dashboard');
  };

  const publishedCourses = courses.filter((c) => c.status === 'published');
  const featuredCourses = publishedCourses.filter((c) => c.featured).slice(0, 6);
  const freeCourses = publishedCourses.filter((c) => c.isFree).slice(0, 3);

  const whatsappDigits = settings.contactWhatsapp.replace(/[^0-9]/g, '');
  const whatsappLink = whatsappDigits.startsWith('0')
    ? `https://wa.me/254${whatsappDigits.slice(1)}`
    : `https://wa.me/${whatsappDigits}`;

  // If currently inside the full-screen Learning Classroom
  if (route === 'learn' && selectedCourse) {
    const enr = enrollments.find(
      (e) => e.courseId === selectedCourse.id && e.userId === user?.uid
    );
    if (enr) {
      return (
        <>
          <LearningEnvironment
            course={selectedCourse}
            enrollment={enr}
            initialLessonId={activeLessonId}
            onExitToDashboard={() => navigateTo('dashboard')}
            onOpenCertificate={(certId) => {
              const found = certificates.find((c) => c.certificateId === certId);
              if (found) setActiveCertificateModal(found);
            }}
            onRenewCourse={(c) => {
              setCheckoutCourse(c);
            }}
          />
          <CertificateModal
            certificate={activeCertificateModal}
            onClose={() => setActiveCertificateModal(null)}
            onOpenPublicVerify={(certId) => {
              setActiveCertificateModal(null);
              setVerifyCertIdParam(certId);
              navigateTo('verify-certificate');
            }}
          />
          <CheckoutModal
            course={checkoutCourse}
            onClose={() => setCheckoutCourse(null)}
            onOrderSubmitted={handleOrderSubmitted}
          />
        </>
      );
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#0F172A]">
      {/* Top Bar Contract: Single-row, 3-zone header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Single Brand Lockup */}
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="text-left focus:outline-none cursor-pointer shrink-0"
          >
            <BrandLogo
              brandName={settings.brandName}
              logoUrl={settings.logoUrl}
              variant="header"
            />
          </button>

          {/* Zone 2: 5 Single-Line Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#475569]">
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className={`hover:text-[#0F172A] transition-colors whitespace-nowrap cursor-pointer ${
                route === 'home' ? 'text-[#2563EB] font-semibold' : ''
              }`}
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedCategoryFilter('all');
                navigateTo('courses');
              }}
              className={`hover:text-[#0F172A] transition-colors whitespace-nowrap cursor-pointer ${
                route === 'courses' ? 'text-[#2563EB] font-semibold' : ''
              }`}
            >
              Courses
            </button>
            <button
              type="button"
              onClick={() => navigateTo('free-learning')}
              className={`hover:text-[#0F172A] transition-colors whitespace-nowrap cursor-pointer ${
                route === 'free-learning' ? 'text-[#2563EB] font-semibold' : ''
              }`}
            >
              Free Learning
            </button>
            <button
              type="button"
              onClick={() => navigateTo('about')}
              className={`hover:text-[#0F172A] transition-colors whitespace-nowrap cursor-pointer ${
                route === 'about' ? 'text-[#2563EB] font-semibold' : ''
              }`}
            >
              About
            </button>
            <button
              type="button"
              onClick={() => navigateTo('contact')}
              className={`hover:text-[#0F172A] transition-colors whitespace-nowrap cursor-pointer ${
                route === 'contact' ? 'text-[#2563EB] font-semibold' : ''
              }`}
            >
              Contact
            </button>
          </nav>

          {/* Zone 3: 1-2 Primary Actions */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {user ? (
              <>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => navigateTo('admin')}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-lg border whitespace-nowrap inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                      route === 'admin'
                        ? 'border-[#2563EB] bg-[#2563EB]/5 text-[#2563EB]'
                        : 'border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Admin CMS</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => navigateTo('dashboard')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg whitespace-nowrap inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>My Learning</span>
                </button>
                <button
                  type="button"
                  onClick={logout}
                  title="Sign Out"
                  className="p-2 text-[#475569] hover:text-[#0F172A] rounded-lg hover:bg-[#F8FAFC] cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setPendingActionCourse(null);
                    setAuthModalMode('login');
                    setAuthModalOpen(true);
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-[#0F172A] hover:text-[#2563EB] whitespace-nowrap cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPendingActionCourse(null);
                    setAuthModalMode('register');
                    setAuthModalOpen(true);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg whitespace-nowrap transition-colors cursor-pointer"
                >
                  Register Account
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile navigation"
            className="md:hidden p-2 rounded-lg border border-[#E2E8F0] text-[#0F172A]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-[#E2E8F0] px-4 py-4 space-y-3">
            <div className="flex flex-col space-y-2 text-sm font-medium text-[#0F172A]">
              <button
                type="button"
                onClick={() => navigateTo('home')}
                className="text-left py-1.5"
              >
                Home
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategoryFilter('all');
                  navigateTo('courses');
                }}
                className="text-left py-1.5"
              >
                Courses ({publishedCourses.length})
              </button>
              <button
                type="button"
                onClick={() => navigateTo('free-learning')}
                className="text-left py-1.5"
              >
                Free Learning
              </button>
              <button
                type="button"
                onClick={() => navigateTo('about')}
                className="text-left py-1.5"
              >
                About {settings.brandName}
              </button>
              <button
                type="button"
                onClick={() => navigateTo('faq')}
                className="text-left py-1.5"
              >
                FAQ
              </button>
              <button
                type="button"
                onClick={() => navigateTo('contact')}
                className="text-left py-1.5"
              >
                Contact
              </button>
              <button
                type="button"
                onClick={() => navigateTo('verify-certificate')}
                className="text-left py-1.5 text-[#2563EB]"
              >
                Verify Certificate
              </button>
            </div>

            <div className="pt-3 border-t border-[#E2E8F0] flex flex-wrap items-center gap-2">
              {user ? (
                <>
                  <button
                    type="button"
                    onClick={() => navigateTo('dashboard')}
                    className="flex-1 py-2 px-4 bg-[#2563EB] text-white text-xs font-semibold rounded-lg"
                  >
                    My Learning Dashboard
                  </button>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => navigateTo('admin')}
                      className="py-2 px-4 border border-[#2563EB] text-[#2563EB] text-xs font-semibold rounded-lg"
                    >
                      Admin CMS
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={logout}
                    className="py-2 px-3 border border-[#E2E8F0] text-xs text-[#475569] rounded-lg"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setAuthModalMode('login');
                      setAuthModalOpen(true);
                    }}
                    className="flex-1 py-2 px-4 border border-[#E2E8F0] text-xs font-semibold text-[#0F172A] rounded-lg"
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setAuthModalMode('register');
                      setAuthModalOpen(true);
                    }}
                    className="flex-1 py-2 px-4 bg-[#2563EB] text-white text-xs font-semibold rounded-lg"
                  >
                    Register
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md bg-[#0F172A] text-white px-5 py-3.5 rounded-xl shadow-md flex items-center gap-3 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Route Viewport */}
      <main className="flex-1">
        {route === 'home' && (
          <div>
            {/* 1. HERO SECTION */}
            <section className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
                  <div className="lg:col-span-7 space-y-6">
                    <div className="text-xs font-semibold text-[#2563EB] tracking-wide">
                      {settings.tagline}
                    </div>

                    <h1
                      className="text-3xl sm:text-5xl font-bold text-[#0F172A] leading-[1.12] tracking-tight"
                      style={{ textWrap: 'balance' }}
                    >
                      {settings.heroHeadline}
                    </h1>

                    <p className="text-base sm:text-lg text-[#475569] leading-relaxed max-w-2xl">
                      {settings.heroSubheadline}
                    </p>

                    <div className="flex flex-wrap items-center gap-3.5 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategoryFilter('all');
                          navigateTo('courses');
                        }}
                        className="px-6 py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold rounded-lg inline-flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer"
                      >
                        <span>{settings.heroCtaPrimary || 'Explore Courses'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => navigateTo('free-learning')}
                        className="px-6 py-3.5 bg-white hover:bg-[#F8FAFC] text-[#0F172A] border border-[#E2E8F0] text-sm font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer"
                      >
                        {settings.heroCtaSecondary || 'Start Free Learning'}
                      </button>
                    </div>

                    <div className="pt-4 border-t border-[#E2E8F0] grid grid-cols-3 gap-4 max-w-lg text-xs text-[#475569]">
                      <div>
                        <div className="text-lg font-bold text-[#0F172A] tabular-nums">
                          {publishedCourses.length} Programs
                        </div>
                        <div>Across 5 Core Faculties</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-[#0F172A] tabular-nums">
                          KES 1,500
                        </div>
                        <div>Accessible Tuition Entry</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-[#0F172A]">Verifiable</div>
                        <div>Certificates of Completion</div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-5">
                    <div className="rounded-xl overflow-hidden border border-[#E2E8F0] bg-white">
                      <img
                        src={
                          settings.heroImageUrl ||
                          CATEGORY_IMAGES['Lifestyle, Communication & Personal Development']
                        }
                        alt={`${settings.brandName} learning campus`}
                        referrerPolicy="no-referrer"
                        className="w-full aspect-[16/10] object-cover"
                      />
                      <div className="p-4 bg-white border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#475569]">
                        <span>Practical Digital Skills & Career Advancement</span>
                        <span className="font-semibold text-[#0F172A]">
                          {settings.contactAddress}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. FIVE ACADEMIC FACULTIES / CATEGORIES */}
            <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold text-[#2563EB] mb-1">
                    Academic Structure & Faculties
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
                    Five Specialized Schools of Practice
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategoryFilter('all');
                    navigateTo('courses');
                  }}
                  className="text-xs font-semibold text-[#2563EB] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>View Complete Course Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {COURSE_CATEGORIES.map((category, idx) => {
                  const count = publishedCourses.filter(
                    (c) => c.category === category
                  ).length;
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => {
                        setSelectedCategoryFilter(category);
                        navigateTo('courses');
                      }}
                      className={`text-left p-6 rounded-xl border border-[#E2E8F0] bg-white hover:border-[#2563EB] transition-colors flex flex-col justify-between cursor-pointer ${
                        idx === 0 ? 'lg:col-span-2 bg-[#F8FAFC]' : ''
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="text-xs font-mono font-semibold text-[#2563EB] tabular-nums">
                          0{idx + 1}. Faculty Track · {count} Courses
                        </div>
                        <h3 className="text-lg font-bold text-[#0F172A]">{category}</h3>
                        <p className="text-xs text-[#475569] leading-relaxed">
                          {idx === 0
                            ? 'Master AI Prompt Engineering, SME Workflow Automation, Web Coding, Cybersecurity Hygiene, No-Code Development, and Cloud Computing.'
                            : idx === 1
                            ? 'Build customer acquisition engines with SEO, Paid Social Media Advertising, Conversion Copywriting, Email Automation, and YouTube Growth.'
                            : idx === 2
                            ? 'Lead operations with Personal Finance, Freelance Business Setup, E-Commerce, Advanced Excel Dashboards, Agile Scrum, and Bookkeeping.'
                            : idx === 3
                            ? 'Create commercial-grade assets across Canva & Photoshop, Short-Form Video Editing, UX/UI Product Design, Podcasting, and Photography.'
                            : 'Elevate human performance through Foreign Languages, Applied Nutrition, Mindfulness, Executive Public Speaking, and Urban Farming.'}
                        </p>
                      </div>
                      <div className="pt-4 mt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs font-semibold text-[#0F172A]">
                        <span>Browse Faculty Programs</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#2563EB]" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 3. FEATURED COURSES */}
            <section className="py-16 bg-[#F8FAFC] border-y border-[#E2E8F0]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold text-[#2563EB] mb-1">
                      Career-Focused Curriculum
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
                      Featured Institute Programs
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategoryFilter('all');
                      navigateTo('courses');
                    }}
                    className="px-4 py-2 bg-white border border-[#E2E8F0] rounded-lg text-xs font-semibold text-[#0F172A] hover:border-[#2563EB] cursor-pointer"
                  >
                    Explore All {publishedCourses.length} Courses
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredCourses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      enrollment={enrollments.find(
                        (e) => e.courseId === course.id && e.userId === user?.uid
                      )}
                      isSaved={Boolean(profile?.savedCourseIds?.includes(course.id))}
                      onSelectCourse={handleOpenCourseDetails}
                      onPrimaryAction={handleCourseAction}
                      onToggleSave={user ? toggleSaveCourse : undefined}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* 4. FREE LEARNING SPOTLIGHT */}
            {freeCourses.length > 0 && (
              <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold text-[#16A34A] mb-1">
                      Zero-Barrier Skill Acquisition
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
                      Start Learning Today with Free Open-Access Courses
                    </h2>
                    <p className="text-sm text-[#475569] mt-1">
                      Enroll immediately without payment, complete real modules and quizzes, and
                      earn your verifiable Certificate of Completion.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigateTo('free-learning')}
                    className="text-xs font-semibold text-[#2563EB] hover:underline shrink-0 cursor-pointer"
                  >
                    View Free Learning Page →
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {freeCourses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      enrollment={enrollments.find(
                        (e) => e.courseId === course.id && e.userId === user?.uid
                      )}
                      isSaved={Boolean(profile?.savedCourseIds?.includes(course.id))}
                      onSelectCourse={handleOpenCourseDetails}
                      onPrimaryAction={handleCourseAction}
                      onToggleSave={user ? toggleSaveCourse : undefined}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* 5. HOW LEARNING WORKS AT DANIVO INSTITUTE */}
            <section className="py-16 bg-[#F8FAFC] border-t border-[#E2E8F0]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                <div className="max-w-2xl">
                  <div className="text-xs font-semibold text-[#2563EB] mb-1">
                    Structured Academic Progression
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
                    How Learning Works at {settings.brandName}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="p-6 bg-white border border-[#E2E8F0] rounded-xl space-y-2">
                    <div className="text-xs font-mono font-bold text-[#2563EB]">Step 01</div>
                    <h3 className="text-base font-bold text-[#0F172A]">
                      Select & Enroll
                    </h3>
                    <p className="text-xs text-[#475569] leading-relaxed">
                      Register your student account and enroll directly in free courses or complete
                      verified M-Pesa ({settings.mpesaPaybillOrNumber}) / Bank Transfer (
                      {settings.bankAccountNumber}) tuition checkout.
                    </p>
                  </div>

                  <div className="p-6 bg-white border border-[#E2E8F0] rounded-xl space-y-2">
                    <div className="text-xs font-mono font-bold text-[#2563EB]">Step 02</div>
                    <h3 className="text-base font-bold text-[#0F172A]">
                      Study Interactive Modules
                    </h3>
                    <p className="text-xs text-[#475569] leading-relaxed">
                      Watch video lectures, study structured reading guides, and download practical
                      checklists and templates. Your progress syncs persistently across all devices.
                    </p>
                  </div>

                  <div className="p-6 bg-white border border-[#E2E8F0] rounded-xl space-y-2">
                    <div className="text-xs font-mono font-bold text-[#2563EB]">Step 03</div>
                    <h3 className="text-base font-bold text-[#0F172A]">
                      Pass Assessments
                    </h3>
                    <p className="text-xs text-[#475569] leading-relaxed">
                      Complete automated competency quizzes with instant explanations and submit
                      practical capstone assignments evaluated by faculty.
                    </p>
                  </div>

                  <div className="p-6 bg-white border border-[#E2E8F0] rounded-xl space-y-2">
                    <div className="text-xs font-mono font-bold text-[#2563EB]">Step 04</div>
                    <h3 className="text-base font-bold text-[#0F172A]">
                      Earn Verifiable Credential
                    </h3>
                    <p className="text-xs text-[#475569] leading-relaxed">
                      Receive your official {settings.brandName} Certificate of Completion with a
                      unique Certificate ID verifiable publicly by employers and clients.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 6. ADMISSIONS & CONTACT CTA */}
            <section className="py-14 bg-white border-t border-[#E2E8F0]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="p-8 sm:p-10 bg-[#0F172A] text-white rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  <div className="space-y-2 max-w-xl">
                    <div className="text-xs font-semibold text-[#60A5FA]">
                      Admissions & Learner Support Desk
                    </div>
                    <h2 className="text-2xl font-bold">
                      Need Guidance Selecting the Right Track or Verifying Tuition?
                    </h2>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Connect directly with our admissions advisors via Email (
                      {settings.contactEmail}) or WhatsApp ({settings.contactWhatsapp}).
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <a
                      href={`mailto:${settings.contactEmail}`}
                      className="px-4 py-2.5 bg-white text-[#0F172A] text-xs font-semibold rounded-lg inline-flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4 text-[#2563EB]" />
                      <span>Email: {settings.contactEmail}</span>
                    </a>
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2.5 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold rounded-lg inline-flex items-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp: {settings.contactWhatsapp}</span>
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {route === 'courses' && (
          <CatalogView
            key={`cat-${selectedCategoryFilter}`}
            initialCategory={selectedCategoryFilter}
            initialFreeOnly={false}
            onSelectCourse={handleOpenCourseDetails}
            onPrimaryAction={handleCourseAction}
          />
        )}

        {route === 'free-learning' && (
          <CatalogView
            key="free-catalog"
            initialCategory="all"
            initialFreeOnly={true}
            onSelectCourse={handleOpenCourseDetails}
            onPrimaryAction={handleCourseAction}
          />
        )}

        {route === 'course-details' && selectedCourse && (
          <CourseDetailsView
            course={
              courses.find((c) => c.id === selectedCourse.id) || selectedCourse
            }
            enrollment={enrollments.find(
              (e) => e.courseId === selectedCourse.id && e.userId === user?.uid
            )}
            pendingOrder={orders.find(
              (o) =>
                o.courseId === selectedCourse.id &&
                o.userId === user?.uid &&
                o.status === 'under_review'
            )}
            onBack={() => navigateTo('courses')}
            onEnrollOrStart={handleCourseAction}
          />
        )}

        {route === 'dashboard' && (
          <StudentDashboard
            onOpenCourseLearn={(course, lessonId) => {
              setSelectedCourse(course);
              setActiveLessonId(lessonId);
              navigateTo('learn');
            }}
            onSelectCourseDetails={handleOpenCourseDetails}
            onOpenCertificateModal={(cert) => setActiveCertificateModal(cert)}
          />
        )}

        {route === 'admin' && (
          <AdminDashboard
            onOpenCertificateModal={(cert) => setActiveCertificateModal(cert)}
          />
        )}

        {route === 'verify-certificate' && (
          <VerifyCertificateView
            initialCertId={verifyCertIdParam}
            onBackHome={() => navigateTo('home')}
          />
        )}

        {route === 'about' && (
          <AboutView onBrowseCourses={() => navigateTo('courses')} />
        )}

        {route === 'faq' && <FAQView />}

        {route === 'contact' && <ContactView />}

        {route === 'privacy' && <LegalView mode="privacy" />}

        {route === 'terms' && <LegalView mode="terms" />}
      </main>

      {/* Quiet Institutional Footer */}
      <footer className="bg-[#F8FAFC] border-t border-[#E2E8F0] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#E2E8F0]">
            <div className="space-y-3">
              <BrandLogo
                brandName={settings.brandName}
                logoUrl={settings.logoUrl}
                variant="footer"
              />
              <p className="text-xs text-[#475569] leading-relaxed">
                {settings.tagline}
              </p>
              <div className="text-xs text-[#475569] space-y-1 pt-1">
                <div>Email: {settings.contactEmail}</div>
                <div className="tabular-nums">WhatsApp: {settings.contactWhatsapp}</div>
                <div>{settings.contactAddress}</div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-[#0F172A] mb-3">
                Academic Programs
              </h3>
              <ul className="space-y-2 text-xs text-[#475569]">
                {COURSE_CATEGORIES.map((cat) => (
                  <li key={cat}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategoryFilter(cat);
                        navigateTo('courses');
                      }}
                      className="hover:text-[#2563EB] text-left cursor-pointer"
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold text-[#0F172A] mb-3">
                Institute Navigation
              </h3>
              <ul className="space-y-2 text-xs text-[#475569]">
                <li>
                  <button
                    type="button"
                    onClick={() => navigateTo('courses')}
                    className="hover:text-[#2563EB] cursor-pointer"
                  >
                    All Courses (30+)
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateTo('free-learning')}
                    className="hover:text-[#2563EB] cursor-pointer"
                  >
                    Free Learning Track
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateTo('verify-certificate')}
                    className="hover:text-[#2563EB] cursor-pointer"
                  >
                    Verify Certificate of Completion
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateTo('about')}
                    className="hover:text-[#2563EB] cursor-pointer"
                  >
                    About {settings.brandName}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateTo('faq')}
                    className="hover:text-[#2563EB] cursor-pointer"
                  >
                    Frequently Asked Questions
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold text-[#0F172A] mb-3">
                Tuition & Legal Policies
              </h3>
              <ul className="space-y-2 text-xs text-[#475569]">
                <li className="tabular-nums">
                  M-Pesa Number: <strong className="text-[#0F172A]">{settings.mpesaPaybillOrNumber}</strong>
                </li>
                <li className="tabular-nums">
                  Bank Account: <strong className="text-[#0F172A]">{settings.bankAccountNumber}</strong>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateTo('privacy')}
                    className="hover:text-[#2563EB] cursor-pointer"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateTo('terms')}
                    className="hover:text-[#2563EB] cursor-pointer"
                  >
                    Terms of Service
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#475569]">
            <div>
              © {new Date().getFullYear()} {settings.brandName}. All Rights Reserved.
            </div>
            <div>
              Professional Online Learning & Digital Skills Platform · Verifiable Certificates of Completion
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        returnCourseTitle={pendingActionCourse?.title}
        onClose={() => {
          setAuthModalOpen(false);
          setPendingActionCourse(null);
        }}
        onSuccess={() => {
          setAuthModalOpen(false);
          if (pendingActionCourse) {
            const target = pendingActionCourse;
            setPendingActionCourse(null);
            setTimeout(() => {
              handleCourseAction(target);
            }, 300);
          }
        }}
      />

      <CheckoutModal
        course={checkoutCourse}
        onClose={() => setCheckoutCourse(null)}
        onOrderSubmitted={handleOrderSubmitted}
      />

      <CertificateModal
        certificate={activeCertificateModal}
        onClose={() => setActiveCertificateModal(null)}
        onOpenPublicVerify={(certId) => {
          setActiveCertificateModal(null);
          setVerifyCertIdParam(certId);
          navigateTo('verify-certificate');
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <LMSProvider>
      <MainLMSApp />
    </LMSProvider>
  );
}
