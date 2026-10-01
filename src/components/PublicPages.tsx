import React, { useState, useMemo } from 'react';
import {
  Search,
  Mail,
  MessageCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from 'lucide-react';
import { Course } from '../types/lms';
import { useLMS } from '../context/LMSContext';
import { COURSE_CATEGORIES } from '../data/initialCatalog';
import { CourseCard } from './CourseCard';

interface CatalogViewProps {
  initialCategory?: string;
  initialFreeOnly?: boolean;
  onSelectCourse: (course: Course) => void;
  onPrimaryAction: (course: Course) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  initialCategory = 'all',
  initialFreeOnly = false,
  onSelectCourse,
  onPrimaryAction,
}) => {
  const { courses, enrollments, profile, user, toggleSaveCourse } = useLMS();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [pricingFilter, setPricingFilter] = useState<'all' | 'free' | 'paid'>(
    initialFreeOnly ? 'free' : 'all'
  );
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc' | 'duration'>(
    'default'
  );

  const publishedCourses = useMemo(
    () => courses.filter((c) => c.status === 'published'),
    [courses]
  );

  const filteredCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = publishedCourses.filter((c) => {
      if (selectedCategory !== 'all' && c.category !== selectedCategory) return false;
      if (pricingFilter === 'free' && !c.isFree) return false;
      if (pricingFilter === 'paid' && c.isFree) return false;
      if (difficultyFilter !== 'all' && c.difficulty !== difficultyFilter) return false;

      if (q) {
        const hay = `${c.title} ${c.shortDescription} ${c.description} ${c.category} ${
          c.instructorName
        } ${c.skills.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const sorted = [...list];
    if (sortBy === 'price_asc') {
      sorted.sort((a, b) => a.salePrice - b.salePrice);
    } else if (sortBy === 'price_desc') {
      sorted.sort((a, b) => b.salePrice - a.salePrice);
    } else if (sortBy === 'duration') {
      sorted.sort((a, b) => a.durationHours - b.durationHours);
    } else {
      sorted.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
    }
    return sorted;
  }, [publishedCourses, searchQuery, selectedCategory, pricingFilter, difficultyFilter, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPricingFilter('all');
    setDifficultyFilter('all');
    setSortBy('default');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-[#E2E8F0] pb-6">
        <div className="text-xs font-semibold text-[#2563EB] mb-1">
          {pricingFilter === 'free'
            ? 'Open-Access Scholarship & Free Learning Track'
            : 'Academic & Professional Course Catalog'}
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-[#0F172A]">
          {pricingFilter === 'free'
            ? 'Free Learning Programs at DANIVO INSTITUTE'
            : 'Explore All 30+ Career-Focused Courses'}
        </h1>
        <p className="text-sm text-[#475569] mt-2 max-w-2xl">
          Practical digital, technology, finance, and communication programs engineered for
          students, professionals, and entrepreneurs across Kenya, Africa, and the world.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-[#475569] absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by course title, skill, category, or faculty..."
              className="w-full pl-10 pr-4 py-2 bg-white text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            aria-label="Filter by difficulty"
            className="px-3.5 py-2 bg-white text-xs font-medium text-[#0F172A] border border-[#E2E8F0] rounded-lg"
          >
            <option value="all">All Difficulty Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            aria-label="Sort courses"
            className="px-3.5 py-2 bg-white text-xs font-medium text-[#0F172A] border border-[#E2E8F0] rounded-lg"
          >
            <option value="default">Sort: Institute Curriculum Order</option>
            <option value="price_asc">Sort: Tuition (Low to High)</option>
            <option value="price_desc">Sort: Tuition (High to Low)</option>
            <option value="duration">Sort: Duration (Shortest First)</option>
          </select>
        </div>

        {/* Category & Pricing Segmented Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E2E8F0]">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-white text-[#475569] border border-[#E2E8F0] hover:text-[#0F172A]'
              }`}
            >
              All Faculties
            </button>
            {COURSE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-white text-[#475569] border border-[#E2E8F0] hover:text-[#0F172A]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 p-1 bg-white border border-[#E2E8F0] rounded-lg">
            {(['all', 'free', 'paid'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setPricingFilter(mode)}
                className={`px-3 py-1 rounded text-xs font-semibold capitalize cursor-pointer ${
                  pricingFilter === mode
                    ? 'bg-[#0F172A] text-white'
                    : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                {mode === 'all' ? 'All Tuition' : mode === 'free' ? 'Free Only' : 'Paid Only'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-[#475569]">
        <span className="tabular-nums">
          Showing <strong className="text-[#0F172A]">{filteredCourses.length}</strong> of{' '}
          {publishedCourses.length} courses
        </span>
        {(searchQuery ||
          selectedCategory !== 'all' ||
          pricingFilter !== 'all' ||
          difficultyFilter !== 'all') && (
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1 text-[#2563EB] font-semibold hover:underline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        )}
      </div>

      {/* Course Grid */}
      {filteredCourses.length === 0 ? (
        <div className="p-12 text-center bg-white border border-[#E2E8F0] rounded-xl space-y-3">
          <h3 className="text-base font-bold text-[#0F172A]">
            No Courses Match Your Current Filter Criteria
          </h3>
          <p className="text-xs text-[#475569] max-w-md mx-auto">
            Try clearing your search keyword or switching faculty categories to view all 30+
            available courses.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="px-4 py-2 bg-[#2563EB] text-white text-xs font-semibold rounded-lg"
          >
            Show All Courses
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              enrollment={enrollments.find(
                (e) => e.courseId === course.id && e.userId === user?.uid
              )}
              isSaved={Boolean(profile?.savedCourseIds?.includes(course.id))}
              onSelectCourse={onSelectCourse}
              onPrimaryAction={onPrimaryAction}
              onToggleSave={user ? toggleSaveCourse : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const AboutView: React.FC<{ onBrowseCourses: () => void }> = ({
  onBrowseCourses,
}) => {
  const { settings, instructors } = useLMS();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="border-b border-[#E2E8F0] pb-8">
        <div className="text-xs font-semibold text-[#2563EB] mb-2">
          Institutional Profile & Academic Philosophy
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mb-4">
          About {settings.brandName}
        </h1>
        <p className="text-base text-[#475569] leading-relaxed">
          {settings.tagline}. {settings.brandName} is a modern online learning institute and
          digital-skills academy dedicated to equipping African and global learners with practical,
          career-focused competencies in artificial intelligence, software engineering, digital
          growth, business finance, and creative media.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-2">
          <div className="text-xs font-bold text-[#2563EB]">01. Our Mission</div>
          <h2 className="text-base font-bold text-[#0F172A]">
            Accessible, Practical Mastery
          </h2>
          <p className="text-xs text-[#475569] leading-relaxed">
            To bridge the gap between traditional theoretical education and fast-moving industry
            demands by delivering structured, hands-on digital and business training at accessible
            tuition rates.
          </p>
        </div>

        <div className="p-6 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-2">
          <div className="text-xs font-bold text-[#2563EB]">02. Our Vision</div>
          <h2 className="text-base font-bold text-[#0F172A]">
            Africa’s Premier Skills Catalyst
          </h2>
          <p className="text-xs text-[#475569] leading-relaxed">
            To serve as a trusted professional learning platform empowering students, job seekers,
            freelancers, and business owners across Kenya, Africa, and international markets.
          </p>
        </div>

        <div className="p-6 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-2">
          <div className="text-xs font-bold text-[#2563EB]">03. Our Methodology</div>
          <h2 className="text-base font-bold text-[#0F172A]">
            Competency & Deliverable Driven
          </h2>
          <p className="text-xs text-[#475569] leading-relaxed">
            Every course combines structured lectures, downloadable templates, graded competency
            quizzes, and practical capstone assignments culminating in a verifiable Certificate of
            Completion.
          </p>
        </div>
      </div>

      {/* Faculty Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-[#0F172A]">
          Institute Faculty & Program Directors
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {instructors.map((inst) => (
            <div
              key={inst.id}
              className="p-6 bg-white border border-[#E2E8F0] rounded-xl space-y-3"
            >
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">{inst.name}</h3>
                <div className="text-xs font-semibold text-[#2563EB] mt-0.5">
                  {inst.roleTitle}
                </div>
                <div className="text-xs text-[#475569] mt-0.5">{inst.qualifications}</div>
              </div>
              <p className="text-xs text-[#475569] leading-relaxed">{inst.bio}</p>
              <div className="text-xs text-[#0F172A] pt-2 border-t border-[#E2E8F0]">
                <strong>Expertise:</strong> {inst.expertise.join(' · ')}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Transparent Educational Positioning Notice */}
      <section className="p-6 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-2">
        <h3 className="text-sm font-bold text-[#0F172A]">
          Institutional Transparency & Credential Scope
        </h3>
        <p className="text-xs text-[#475569] leading-relaxed">
          {settings.brandName} operates as an independent professional learning and practical
          skills-development platform. Upon satisfying all course lesson and assessment
          requirements, graduates receive an official, publicly verifiable{' '}
          <strong>CERTIFICATE OF COMPLETION</strong>. Programs are designed for practical skill
          acquisition and professional advancement and do not represent government or statutory
          university degree accreditation.
        </p>
        <div className="pt-2">
          <button
            type="button"
            onClick={onBrowseCourses}
            className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg cursor-pointer"
          >
            Browse Our 30+ Courses
          </button>
        </div>
      </section>
    </div>
  );
};

export const FAQView: React.FC = () => {
  const { settings } = useLMS();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: `How do I enroll in a course at ${settings.brandName}?`,
      a: `Browse the course catalog, select your desired course, and click "Enroll for Free" (for open-access courses) or "Enroll Now" (for paid courses). If you do not have an account yet, you will be prompted to register or sign in with Google, and then returned directly to your selected course.`,
    },
    {
      q: `How do M-Pesa and Bank Transfer payments work?`,
      a: `During checkout for a paid course, you can choose M-Pesa (Payment Number: ${settings.mpesaPaybillOrNumber}) or Bank Transfer (Account Number: ${settings.bankAccountNumber}). After transferring the exact KES tuition amount, submit your transaction reference code in the checkout form. Once our admissions desk verifies the transaction, your enrollment is activated immediately.`,
    },
    {
      q: `How long do I have access to a course after enrolling?`,
      a: `Each course has a clearly stated access period configured by the institute (for example, 60 days, 90 days, 120 days, 180 days, or Lifetime access). Your exact enrollment date, expiry date, and remaining days are displayed on your Student Dashboard.`,
    },
    {
      q: `How do I earn my Certificate of Completion?`,
      a: `To receive your Certificate of Completion, complete all lessons in the course modules and pass the required competency quiz (minimum 70% score). Once completed, your certificate is automatically generated with a unique Certificate ID and public verification URL.`,
    },
    {
      q: `Can employers or clients verify my certificate publicly?`,
      a: `Yes. Every Certificate of Completion includes a unique Certificate ID (e.g. CERT-DNV-...) that anyone can verify on our public Verification Registry page without needing to log in.`,
    },
    {
      q: `How can I contact student support or admissions?`,
      a: `You can reach ${settings.brandName} directly via email at ${settings.contactEmail} or on WhatsApp at ${settings.contactWhatsapp}, or by submitting a ticket on our Contact page.`,
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div>
        <div className="text-xs font-semibold text-[#2563EB] mb-1">
          Admissions & Student Support
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-[#475569] mt-2">
          Clear answers about enrollment, tuition payment verification, course access windows, and
          certificates.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-[#F8FAFC] cursor-pointer"
              >
                <span className="text-sm font-bold text-[#0F172A]">{item.q}</span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-[#2563EB] shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#475569] shrink-0" />
                )}
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-xs text-[#475569] leading-relaxed border-t border-[#E2E8F0] pt-4">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const ContactView: React.FC = () => {
  const { settings, user, profile, submitInquiry } = useLMS();
  const [name, setName] = useState(profile?.fullName || user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const whatsappDigits = settings.contactWhatsapp.replace(/[^0-9]/g, '');
  const whatsappLink = whatsappDigits.startsWith('0')
    ? `https://wa.me/254${whatsappDigits.slice(1)}`
    : `https://wa.me/${whatsappDigits}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    try {
      await submitInquiry(name, email, phone, subject, message);
      setSentSuccess(true);
      setSubject('');
      setMessage('');
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Please sign in with a verified email to submit a ticket, or contact us directly via Email or WhatsApp.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div>
        <div className="text-xs font-semibold text-[#2563EB] mb-1">
          Direct Admissions & Learner Support
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
          Contact {settings.brandName}
        </h1>
        <p className="text-sm text-[#475569] mt-2">
          Reach our academic support and admissions team directly via Email, WhatsApp, or our
          platform inquiry form.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Direct Channels */}
        <div className="space-y-4">
          <div className="p-6 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-3">
            <Mail className="w-5 h-5 text-[#2563EB]" />
            <div className="text-xs text-[#475569]">Official Email Support</div>
            <div className="text-sm font-bold text-[#0F172A] break-all">
              {settings.contactEmail}
            </div>
            <a
              href={`mailto:${settings.contactEmail}?subject=DANIVO%20INSTITUTE%20Inquiry`}
              className="inline-flex items-center justify-center w-full py-2 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg"
            >
              Send Email Now
            </a>
          </div>

          <div className="p-6 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-3">
            <MessageCircle className="w-5 h-5 text-[#16A34A]" />
            <div className="text-xs text-[#475569]">Official WhatsApp Desk</div>
            <div className="text-sm font-bold text-[#0F172A] font-mono tabular-nums">
              {settings.contactWhatsapp}
            </div>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center w-full py-2 px-4 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold rounded-lg"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>

        {/* Inquiry Form */}
        <div className="md:col-span-2 bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8">
          <h2 className="text-lg font-bold text-[#0F172A] mb-1">
            Submit an Admissions or Support Inquiry
          </h2>
          <p className="text-xs text-[#475569] mb-6">
            Inquiries submitted here are stored securely in the {settings.brandName} database for
            administrative review.
          </p>

          {sentSuccess && (
            <div className="mb-4 p-4 rounded-lg bg-[#16A34A]/10 border border-[#16A34A]/30 text-xs font-semibold text-[#16A34A] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                Your inquiry has been recorded in our admissions database. You may also reach us
                immediately on WhatsApp ({settings.contactWhatsapp}).
              </span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-lg bg-[#DC2626]/10 text-xs text-[#DC2626]">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-[#E2E8F0] rounded-lg"
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
                  placeholder="0708083643"
                  className="w-full px-3.5 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Course enrollment, payment verification, etc."
                  className="w-full px-3.5 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Message *
              </label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3.5 text-sm border border-[#E2E8F0] rounded-lg"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg cursor-pointer"
            >
              {submitting ? 'Submitting Inquiry...' : 'Submit Official Inquiry'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export const LegalView: React.FC<{ mode: 'privacy' | 'terms' }> = ({ mode }) => {
  const { settings } = useLMS();
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
        {mode === 'privacy'
          ? `${settings.brandName} — Privacy Policy`
          : `${settings.brandName} — Terms of Service & Academic Policy`}
      </h1>
      {mode === 'privacy' ? (
        <div className="space-y-4 text-sm text-[#475569] leading-relaxed">
          <p>
            {settings.brandName} respects your privacy and protects your personal learning records.
            We collect only the information necessary to manage your student profile, verify course
            tuition payments, track your lesson and quiz progress, and issue verifiable Certificates
            of Completion.
          </p>
          <h2 className="text-base font-bold text-[#0F172A]">
            1. Data Isolation & Security
          </h2>
          <p>
            Your personal profile, payment references, and enrollment history are stored in isolated
            cloud database records accessible only to your authenticated account and authorized
            institute administrators.
          </p>
          <h2 className="text-base font-bold text-[#0F172A]">
            2. Public Certificate Verification
          </h2>
          <p>
            When you complete a course and earn a Certificate of Completion, your full name,
            completed course title, completion date, and unique Certificate ID can be verified via
            the public verification registry by anyone holding your Certificate ID.
          </p>
          <p>
            For privacy inquiries, contact: <strong>{settings.contactEmail}</strong>.
          </p>
        </div>
      ) : (
        <div className="space-y-4 text-sm text-[#475569] leading-relaxed">
          <p>
            By registering an account or enrolling in a course on {settings.brandName}, you agree to
            the following institutional terms:
          </p>
          <h2 className="text-base font-bold text-[#0F172A]">
            1. Educational Scope & Certificate of Completion
          </h2>
          <p>
            {settings.brandName} is an independent professional learning and practical
            skills-development platform. Courses award a <strong>CERTIFICATE OF COMPLETION</strong>{' '}
            upon satisfying lesson and assessment requirements. We do not claim statutory university
            accreditation, government licensing, or guaranteed employment outcomes.
          </p>
          <h2 className="text-base font-bold text-[#0F172A]">
            2. Tuition Payments & Access Duration
          </h2>
          <p>
            Paid course enrollments are activated upon verification of official M-Pesa (
            {settings.mpesaPaybillOrNumber}) or Bank Transfer ({settings.bankAccountNumber}) payment
            references. Each course grants access for its stated duration (or lifetime where
            configured).
          </p>
          <p>
            For questions regarding these terms, contact: <strong>{settings.contactEmail}</strong>{' '}
            or WhatsApp <strong>{settings.contactWhatsapp}</strong>.
          </p>
        </div>
      )}
    </div>
  );
};
