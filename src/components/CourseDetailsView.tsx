import React, { useState } from 'react';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  PlayCircle,
  FileText,
  HelpCircle,
  ClipboardCheck,
  Download,
  Bookmark,
  Star,
  Calendar,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { Course, Enrollment, Order } from '../types/lms';
import { useLMS } from '../context/LMSContext';
import { CATEGORY_IMAGES } from '../data/initialCatalog';

interface CourseDetailsViewProps {
  course: Course;
  enrollment?: Enrollment;
  pendingOrder?: Order;
  onBack: () => void;
  onEnrollOrStart: (course: Course) => void;
}

export const CourseDetailsView: React.FC<CourseDetailsViewProps> = ({
  course,
  enrollment,
  pendingOrder,
  onBack,
  onEnrollOrStart,
}) => {
  const {
    user,
    profile,
    instructors,
    reviews,
    toggleSaveCourse,
    submitCourseReview,
  } = useLMS();

  const [previewLessonId, setPreviewLessonId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');

  const instructor =
    instructors.find((i) => i.id === course.instructorId) || instructors[0];

  const courseReviews = reviews.filter(
    (r) => r.courseId === course.id && r.status === 'published'
  );

  const isSaved = Boolean(profile?.savedCourseIds?.includes(course.id));
  const isEnrolled = Boolean(enrollment && enrollment.status !== 'expired');
  const isExpired = Boolean(enrollment && enrollment.status === 'expired');

  const effectivePrice =
    course.salePrice > 0 && course.salePrice < course.regularPrice
      ? course.salePrice
      : course.regularPrice;

  const allLessons = course.modules.flatMap((m) => m.lessons);
  const previewLesson = allLessons.find((l) => l.id === previewLessonId);

  const totalQuizzes = allLessons.filter((l) => l.type === 'quiz').length;
  const totalAssignments = allLessons.filter((l) => l.type === 'assignment').length;
  const totalResources = allLessons.reduce((acc, l) => acc + (l.resources?.length || 0), 0);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollment || !reviewComment.trim()) return;
    setSubmittingReview(true);
    setReviewMessage('');
    try {
      await submitCourseReview(enrollment, course, reviewRating, reviewComment.trim());
      setReviewComment('');
      setReviewMessage('Thank you! Your course review has been published.');
    } catch (err) {
      setReviewMessage(err instanceof Error ? err.message : 'Could not submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const remainingDays = enrollment
    ? Math.max(0, Math.ceil((enrollment.expiresAtMs - Date.now()) / (1000 * 60 * 60 * 24)))
    : course.accessDurationDays;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-medium text-[#475569] hover:text-[#2563EB] mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Course Catalog</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
        {/* Main Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-10">
          {/* Header Block */}
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#475569] mb-3">
              <span className="font-semibold text-[#2563EB]">{course.category}</span>
              <span aria-hidden="true">·</span>
              <span>{course.difficulty} Level</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{course.durationHours} Hours Total</span>
              <span aria-hidden="true">·</span>
              <span>Language: {course.language}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold text-[#0F172A] mb-4">
              {course.title}
            </h1>

            <p className="text-base text-[#475569] leading-relaxed mb-6">
              {course.shortDescription}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-xs text-[#475569] pt-4 border-t border-[#E2E8F0]">
              <div>
                Faculty Lead:{' '}
                <strong className="text-[#0F172A]">{course.instructorName}</strong>
              </div>
              <div className="tabular-nums">
                Access Duration:{' '}
                <strong className="text-[#0F172A]">
                  {course.accessType === 'lifetime'
                    ? 'Lifetime Access'
                    : `${course.accessDurationDays} Days`}
                </strong>
              </div>
              {courseReviews.length > 0 && (
                <div className="inline-flex items-center gap-1 tabular-nums">
                  <Star className="w-3.5 h-3.5 text-[#D97706]" fill="currentColor" />
                  <strong className="text-[#0F172A]">
                    {(
                      courseReviews.reduce((acc, r) => acc + r.rating, 0) /
                      courseReviews.length
                    ).toFixed(1)}
                  </strong>
                  <span>({courseReviews.length} verified reviews)</span>
                </div>
              )}
            </div>
          </div>

          {/* Learning Outcomes */}
          <section className="p-6 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
            <h2 className="text-lg font-bold text-[#0F172A] mb-4">
              What You Will Achieve (Learning Outcomes)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {course.outcomes.map((outcome, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-sm text-[#0F172A]">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                  <span className="leading-snug">{outcome}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Skills Gained & Program Description */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-[#0F172A]">Program Overview & Skills</h2>
            <div className="text-sm text-[#475569] whitespace-pre-line leading-relaxed">
              {course.description}
            </div>
            <div className="pt-2">
              <div className="text-xs font-semibold text-[#0F172A] mb-2">
                Core Competencies Covered:
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#2563EB] font-medium">
                {course.skills.map((skill, idx) => (
                  <React.Fragment key={skill}>
                    <span>{skill}</span>
                    {idx < course.skills.length - 1 && (
                      <span className="text-[#E2E8F0]" aria-hidden="true">
                        ·
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </section>

          {/* Course Curriculum */}
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-[#0F172A]">Course Curriculum</h2>
              <div className="text-xs text-[#475569] tabular-nums">
                {course.modules.length} Modules · {allLessons.length} Lessons · {totalQuizzes} Quiz ·{' '}
                {totalAssignments} Assignment · {totalResources} Resources
              </div>
            </div>

            <div className="space-y-4">
              {course.modules.map((mod, mIdx) => (
                <div
                  key={mod.id}
                  className="border border-[#E2E8F0] rounded-xl overflow-hidden bg-white"
                >
                  <div className="p-4 bg-[#F8FAFC] border-b border-[#E2E8F0]">
                    <div className="text-xs font-semibold text-[#2563EB] mb-0.5">
                      Module 0{mIdx + 1}
                    </div>
                    <h3 className="text-sm font-bold text-[#0F172A]">{mod.title}</h3>
                    <p className="text-xs text-[#475569] mt-1">{mod.description}</p>
                  </div>

                  <div className="divide-y divide-[#E2E8F0]">
                    {mod.lessons.map((les) => {
                      const isCompleted = enrollment?.completedLessonIds?.includes(les.id);
                      return (
                        <div
                          key={les.id}
                          className="p-4 flex items-center justify-between gap-4 hover:bg-[#F8FAFC]/60"
                        >
                          <div className="flex items-start gap-3">
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                            ) : les.type === 'video' ? (
                              <PlayCircle className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                            ) : les.type === 'quiz' ? (
                              <HelpCircle className="w-4 h-4 text-[#4F46E5] shrink-0 mt-0.5" />
                            ) : les.type === 'assignment' ? (
                              <ClipboardCheck className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                            ) : (
                              <FileText className="w-4 h-4 text-[#475569] shrink-0 mt-0.5" />
                            )}
                            <div>
                              <div className="text-sm font-medium text-[#0F172A]">
                                {les.title}
                              </div>
                              <div className="text-xs text-[#475569] mt-0.5 flex items-center gap-2 tabular-nums">
                                <span className="capitalize">{les.type}</span>
                                <span>·</span>
                                <span>{les.durationMinutes} min</span>
                                {les.resources && les.resources.length > 0 && (
                                  <>
                                    <span>·</span>
                                    <span className="inline-flex items-center gap-1">
                                      <Download className="w-3 h-3" />
                                      {les.resources.length} resource(s)
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {isEnrolled ? (
                              <button
                                type="button"
                                onClick={() => onEnrollOrStart(course)}
                                className="text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer"
                              >
                                Open Lesson
                              </button>
                            ) : les.isPreview ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewLessonId(
                                    previewLessonId === les.id ? null : les.id
                                  )
                                }
                                className="px-3 py-1.5 rounded-lg border border-[#2563EB] text-xs font-semibold text-[#2563EB] hover:bg-[#2563EB]/5 cursor-pointer"
                              >
                                {previewLessonId === les.id ? 'Hide Preview' : 'Free Preview'}
                              </button>
                            ) : (
                              <Lock className="w-4 h-4 text-[#475569]/60" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Free Preview Drawer */}
            {previewLesson && (
              <div className="p-6 bg-[#F8FAFC] border border-[#2563EB]/30 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-[#2563EB]">
                      Free Lesson Preview
                    </span>
                    <h4 className="text-base font-bold text-[#0F172A]">
                      {previewLesson.title}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewLessonId(null)}
                    className="text-xs text-[#475569] hover:text-[#0F172A]"
                  >
                    Close Preview
                  </button>
                </div>
                {previewLesson.videoUrl && (
                  <video
                    controls
                    className="w-full rounded-lg border border-[#E2E8F0] bg-black aspect-video"
                    src={previewLesson.videoUrl}
                  />
                )}
                <div className="text-sm text-[#475569] whitespace-pre-line">
                  {previewLesson.contentMarkdown}
                </div>
              </div>
            )}
          </section>

          {/* Requirements & Completion Policy */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-5 border border-[#E2E8F0] rounded-xl">
              <h3 className="text-sm font-bold text-[#0F172A] mb-3">
                Prerequisites & Requirements
              </h3>
              <ul className="space-y-2 text-xs text-[#475569]">
                {course.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#2563EB] font-bold">·</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 border border-[#E2E8F0] rounded-xl">
              <h3 className="text-sm font-bold text-[#0F172A] mb-3">
                Certificate of Completion Requirements
              </h3>
              <ul className="space-y-2 text-xs text-[#475569]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0 mt-0.5" />
                  <span>Complete 100% of course modules and lessons</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0 mt-0.5" />
                  <span>
                    Pass the competency assessment quiz with at least{' '}
                    {course.completionMinQuizScore}%
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0 mt-0.5" />
                  <span>
                    Receive a verifiable DANIVO INSTITUTE Certificate of Completion
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* Instructor Section */}
          {instructor && (
            <section className="p-6 border border-[#E2E8F0] rounded-xl bg-white">
              <div className="text-xs font-semibold text-[#2563EB] mb-2">
                Program Faculty
              </div>
              <h3 className="text-base font-bold text-[#0F172A]">{instructor.name}</h3>
              <p className="text-xs text-[#475569] mb-3">
                {instructor.roleTitle} · {instructor.qualifications}
              </p>
              <p className="text-sm text-[#475569] leading-relaxed">{instructor.bio}</p>
            </section>
          )}

          {/* Enrolled Student Reviews */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-[#0F172A]">
              Student Reviews ({courseReviews.length})
            </h2>

            {courseReviews.length === 0 ? (
              <p className="text-xs text-[#475569] p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                No verified student reviews have been submitted for this course yet. Only enrolled
                students can submit reviews.
              </p>
            ) : (
              <div className="space-y-3">
                {courseReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 border border-[#E2E8F0] rounded-xl bg-white"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-[#0F172A]">
                        {rev.userName}
                      </span>
                      <span className="text-xs font-semibold text-[#D97706] tabular-nums">
                        {'★'.repeat(rev.rating)} ({rev.rating}/5)
                      </span>
                    </div>
                    <p className="text-xs text-[#475569] leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}

            {isEnrolled && enrollment && (
              <form
                onSubmit={handleReviewSubmit}
                className="p-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-3"
              >
                <h3 className="text-sm font-bold text-[#0F172A]">
                  Submit Your Verified Student Review
                </h3>
                {reviewMessage && (
                  <p className="text-xs text-[#16A34A] font-medium">{reviewMessage}</p>
                )}
                <div className="flex items-center gap-3">
                  <label className="text-xs font-medium text-[#0F172A]">Rating:</label>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="px-3 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded-lg"
                  >
                    <option value={5}>5 Stars — Excellent</option>
                    <option value={4}>4 Stars — Very Good</option>
                    <option value={3}>3 Stars — Good</option>
                    <option value={2}>2 Stars — Fair</option>
                    <option value={1}>1 Star — Needs Improvement</option>
                  </select>
                </div>
                <textarea
                  rows={3}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your honest learning experience with this course..."
                  className="w-full p-3 text-xs bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB]"
                />
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  {submittingReview ? 'Publishing...' : 'Publish Verified Review'}
                </button>
              </form>
            )}
          </section>
        </div>

        {/* Sticky Right Enrollment Card (1/3) */}
        <div className="lg:sticky lg:top-24 bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
          <div className="aspect-[4/3] w-full bg-[#F8FAFC] border-b border-[#E2E8F0] overflow-hidden">
            <img
              src={
                course.thumbnailUrl ||
                CATEGORY_IMAGES[course.category] ||
                CATEGORY_IMAGES['AI & Technology']
              }
              alt={course.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-6 space-y-5">
            {/* Pricing display */}
            <div>
              {isEnrolled ? (
                <div className="p-3.5 rounded-lg bg-[#16A34A]/5 border border-[#16A34A]/20">
                  <div className="text-xs font-bold text-[#16A34A] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Active Enrollment ({enrollment?.progressPercent || 0}% Complete)</span>
                  </div>
                  <div className="text-[11px] text-[#475569] mt-1 tabular-nums">
                    {enrollment?.accessType === 'lifetime'
                      ? 'Lifetime Course Access'
                      : `Remaining Access: ${remainingDays} days`}
                  </div>
                </div>
              ) : pendingOrder && pendingOrder.status === 'under_review' ? (
                <div className="p-3.5 rounded-lg bg-[#D97706]/5 border border-[#D97706]/30">
                  <div className="text-xs font-bold text-[#D97706]">
                    Payment Under Verification
                  </div>
                  <div className="text-[11px] text-[#475569] mt-1">
                    Reference <strong className="font-mono">{pendingOrder.paymentReference}</strong>{' '}
                    is being verified by the admissions office.
                  </div>
                </div>
              ) : course.isFree ? (
                <div>
                  <div className="text-2xl font-bold text-[#16A34A]">Free Access</div>
                  {course.regularPrice > 0 && (
                    <div className="text-xs text-[#475569] line-through tabular-nums">
                      Regular Tuition: {course.currency} {course.regularPrice.toLocaleString()}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="text-2xl font-bold text-[#0F172A] tabular-nums">
                    {course.currency} {effectivePrice.toLocaleString()}
                  </div>
                  {course.salePrice > 0 && course.salePrice < course.regularPrice && (
                    <div className="text-xs text-[#475569] line-through tabular-nums mt-0.5">
                      Regular Price: {course.currency} {course.regularPrice.toLocaleString()}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Primary CTA Button */}
            <button
              type="button"
              onClick={() => onEnrollOrStart(course)}
              className={`w-full py-3 px-4 rounded-lg text-sm font-semibold text-white transition-colors cursor-pointer ${
                isEnrolled
                  ? 'bg-[#16A34A] hover:bg-[#15803D]'
                  : 'bg-[#2563EB] hover:bg-[#1D4ED8]'
              }`}
            >
              {isEnrolled
                ? enrollment?.progressPercent && enrollment.progressPercent > 0
                  ? 'Continue Learning'
                  : 'Start Learning'
                : isExpired
                ? 'Renew Access'
                : course.isFree
                ? 'Enroll for Free'
                : 'Enroll Now'}
            </button>

            {user && (
              <button
                type="button"
                onClick={() => toggleSaveCourse(course.id)}
                className="w-full py-2.5 px-4 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] text-xs font-semibold text-[#0F172A] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Bookmark
                  className="w-4 h-4 text-[#2563EB]"
                  fill={isSaved ? 'currentColor' : 'none'}
                />
                <span>{isSaved ? 'Saved in Bookmarks' : 'Bookmark Course'}</span>
              </button>
            )}

            {/* Program Facts */}
            <div className="pt-4 border-t border-[#E2E8F0] space-y-2.5 text-xs text-[#475569]">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
                  Access Period
                </span>
                <span className="font-semibold text-[#0F172A] tabular-nums">
                  {course.accessType === 'lifetime'
                    ? 'Lifetime'
                    : `${course.accessDurationDays} Days`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
                  Estimated Study Time
                </span>
                <span className="font-semibold text-[#0F172A] tabular-nums">
                  {course.durationHours} Hours
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
                  Credential
                </span>
                <span className="font-semibold text-[#0F172A]">
                  Certificate of Completion
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
