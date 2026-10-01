import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  PlayCircle,
  FileText,
  HelpCircle,
  ClipboardCheck,
  Download,
  ChevronLeft,
  ChevronRight,
  Award,
  Menu,
  X,
  AlertCircle,
} from 'lucide-react';
import { Course, CourseLesson, Enrollment, LessonResource } from '../types/lms';
import { useLMS } from '../context/LMSContext';

interface LearningEnvironmentProps {
  course: Course;
  enrollment: Enrollment;
  initialLessonId?: string;
  onExitToDashboard: () => void;
  onOpenCertificate: (certId: string) => void;
  onRenewCourse: (course: Course) => void;
}

export const LearningEnvironment: React.FC<LearningEnvironmentProps> = ({
  course,
  enrollment,
  initialLessonId,
  onExitToDashboard,
  onOpenCertificate,
  onRenewCourse,
}) => {
  const {
    quizAttempts,
    assignmentSubmissions,
    completeLessonAndCheckCourse,
    submitQuizAttempt,
    submitAssignment,
  } = useLMS();

  const allLessons: CourseLesson[] = course.modules.flatMap((m) => m.lessons);

  const [activeLessonId, setActiveLessonId] = useState<string>(
    initialLessonId ||
      enrollment.lastLessonId ||
      allLessons[0]?.id ||
      ''
  );
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizSubmittedResult, setQuizSubmittedResult] = useState<{
    scorePercent: number;
    passed: boolean;
  } | null>(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  // Assignment state
  const [submissionText, setSubmissionText] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [submittingAssignment, setSubmittingAssignment] = useState(false);
  const [assignmentSavedMsg, setAssignmentSavedMsg] = useState('');

  // Completion state
  const [markingComplete, setMarkingComplete] = useState(false);
  const [newlyIssuedCertId, setNewlyIssuedCertId] = useState<string | null>(null);

  const activeLesson =
    allLessons.find((l) => l.id === activeLessonId) || allLessons[0];
  const currentIndex = allLessons.findIndex((l) => l.id === activeLesson?.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < allLessons.length - 1
      ? allLessons[currentIndex + 1]
      : null;

  const isExpired =
    enrollment.accessType !== 'lifetime' &&
    enrollment.expiresAtMs > 0 &&
    enrollment.expiresAtMs < Date.now();

  useEffect(() => {
    setSelectedAnswers({});
    setQuizSubmittedResult(null);
    setAssignmentSavedMsg('');
    const existingSub = assignmentSubmissions.find(
      (s) => s.courseId === course.id && s.lessonId === activeLesson?.id
    );
    if (existingSub) {
      setSubmissionText(existingSub.submissionText);
      setAttachmentUrl(existingSub.attachmentUrl);
    } else {
      setSubmissionText('');
      setAttachmentUrl('');
    }
  }, [activeLessonId, assignmentSubmissions, course.id, activeLesson?.id]);

  if (isExpired) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="p-8 bg-white border border-[#E2E8F0] rounded-xl space-y-4">
          <AlertCircle className="w-10 h-10 text-[#D97706] mx-auto" />
          <h1 className="text-xl font-bold text-[#0F172A]">
            Course Access Period Has Expired
          </h1>
          <p className="text-sm text-[#475569]">
            Your enrollment access window for <strong>{course.title}</strong> expired on{' '}
            {new Date(enrollment.expiresAtMs).toLocaleDateString()}. Your progress (
            {enrollment.progressPercent}%) is safely preserved in your account.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onExitToDashboard}
              className="px-4 py-2 text-xs font-medium border border-[#E2E8F0] rounded-lg text-[#0F172A]"
            >
              Back to Dashboard
            </button>
            <button
              type="button"
              onClick={() => onRenewCourse(course)}
              className="px-5 py-2 text-xs font-semibold bg-[#2563EB] text-white rounded-lg"
            >
              Renew Course Access
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleDownloadResource = (res: LessonResource) => {
    const content = `DANIVO INSTITUTE — OFFICIAL LEARNING RESOURCE
============================================================
Program: ${course.title}
Faculty Lead: ${course.instructorName}
Lesson: ${activeLesson.title}
Resource Title: ${res.title}
Document Type: ${res.type.toUpperCase()}

SUMMARY & EXECUTIVE NOTES
------------------------------------------------------------
${res.contentSummary}

CORE LESSON FRAMEWORK
------------------------------------------------------------
${activeLesson.contentMarkdown}

KEY PROGRAM SKILLS
------------------------------------------------------------
${course.skills.map((s, i) => `${i + 1}. ${s}`).join('\n')}

LEARNING OUTCOMES CHECKLIST
------------------------------------------------------------
${course.outcomes.map((o) => `[ ] ${o}`).join('\n')}

© ${new Date().getFullYear()} DANIVO INSTITUTE. All Rights Reserved.
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${res.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleMarkComplete = async () => {
    if (!activeLesson) return;
    setMarkingComplete(true);
    try {
      const res = await completeLessonAndCheckCourse(
        enrollment.id,
        course,
        activeLesson.id
      );
      if (res.certificateId) {
        setNewlyIssuedCertId(res.certificateId);
      } else if (nextLesson) {
        setActiveLessonId(nextLesson.id);
      }
    } finally {
      setMarkingComplete(false);
    }
  };

  const handleQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLesson?.quizQuestions?.length) return;
    const questions = activeLesson.quizQuestions;
    let correct = 0;
    const answerRecords: string[] = [];

    questions.forEach((q) => {
      const chosen = selectedAnswers[q.id];
      if (chosen === q.correctIndex) correct++;
      answerRecords.push(`${q.id}:${chosen ?? -1}`);
    });

    const scorePercent = Math.round((correct / questions.length) * 100);
    const passingScore = activeLesson.quizPassingScore || course.completionMinQuizScore || 70;
    const passed = scorePercent >= passingScore;

    setSubmittingQuiz(true);
    try {
      const res = await submitQuizAttempt(
        enrollment,
        course,
        activeLesson.id,
        activeLesson.title,
        scorePercent,
        passed,
        answerRecords
      );
      setQuizSubmittedResult({ scorePercent, passed });
      if (res.certificateId) {
        setNewlyIssuedCertId(res.certificateId);
      }
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLesson || !submissionText.trim()) return;
    setSubmittingAssignment(true);
    setAssignmentSavedMsg('');
    try {
      await submitAssignment(
        enrollment,
        course,
        activeLesson.id,
        activeLesson.title,
        submissionText.trim(),
        attachmentUrl.trim()
      );
      setAssignmentSavedMsg(
        'Your practical capstone assignment has been saved and marked complete!'
      );
    } finally {
      setSubmittingAssignment(false);
    }
  };

  const lessonQuizAttempts = quizAttempts.filter(
    (a) => a.courseId === course.id && a.lessonId === activeLesson?.id
  );
  const existingAssignmentSub = assignmentSubmissions.find(
    (s) => s.courseId === course.id && s.lessonId === activeLesson?.id
  );
  const isLessonCompleted = Boolean(
    activeLesson && enrollment.completedLessonIds.includes(activeLesson.id)
  );
  const activeCertId = newlyIssuedCertId || enrollment.certificateId;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Classroom Top Bar */}
      <header className="bg-white border-b border-[#E2E8F0] px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setSidebarOpenMobile(!sidebarOpenMobile)}
            className="lg:hidden p-2 rounded-lg border border-[#E2E8F0] text-[#0F172A]"
            aria-label="Toggle curriculum drawer"
          >
            {sidebarOpenMobile ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onExitToDashboard}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#475569] hover:text-[#0F172A] shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">My Learning</span>
          </button>

          <span className="text-[#E2E8F0]">|</span>

          <h1 className="text-sm font-bold text-[#0F172A] truncate">
            {course.title}
          </h1>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden sm:flex items-center gap-2.5">
            <div className="w-28 h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#16A34A] transition-all"
                style={{ width: `${enrollment.progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-mono font-semibold text-[#0F172A] tabular-nums">
              {enrollment.progressPercent}%
            </span>
          </div>

          {activeCertId && (
            <button
              type="button"
              onClick={() => onOpenCertificate(activeCertId)}
              className="px-3.5 py-1.5 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Certificate</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Split Workspace */}
      <div className="flex-1 flex relative">
        {/* Left Curriculum Sidebar */}
        <aside
          className={`${
            sidebarOpenMobile ? 'fixed inset-y-0 left-0 z-40 w-80 block' : 'hidden'
          } lg:block lg:w-80 xl:w-96 bg-white border-r border-[#E2E8F0] overflow-y-auto shrink-0`}
        >
          <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-[#2563EB]">Course Curriculum</div>
              <div className="text-xs text-[#475569] tabular-nums mt-0.5">
                {enrollment.completedLessonIds.length} of {allLessons.length} lessons completed
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpenMobile(false)}
              className="lg:hidden p-1 text-[#475569]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-[#E2E8F0]">
            {course.modules.map((mod, mIdx) => (
              <div key={mod.id}>
                <div className="px-4 py-3 bg-[#F8FAFC] text-xs font-bold text-[#0F172A]">
                  0{mIdx + 1}. {mod.title}
                </div>
                <div className="divide-y divide-[#E2E8F0]/60">
                  {mod.lessons.map((les) => {
                    const done = enrollment.completedLessonIds.includes(les.id);
                    const active = les.id === activeLesson?.id;
                    return (
                      <button
                        key={les.id}
                        type="button"
                        onClick={() => {
                          setActiveLessonId(les.id);
                          setSidebarOpenMobile(false);
                        }}
                        className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors cursor-pointer ${
                          active
                            ? 'bg-[#2563EB]/5 border-l-2 border-[#2563EB]'
                            : 'hover:bg-[#F8FAFC]'
                        }`}
                      >
                        {done ? (
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
                        <div className="min-w-0 flex-1">
                          <div
                            className={`text-xs font-medium ${
                              active ? 'text-[#2563EB] font-semibold' : 'text-[#0F172A]'
                            }`}
                          >
                            {les.title}
                          </div>
                          <div className="text-[11px] text-[#475569] mt-0.5 tabular-nums capitalize">
                            {les.type} · {les.durationMinutes} min
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Right Lesson Stage */}
        <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-4xl mx-auto w-full space-y-8">
          {activeCertId && (
            <div className="p-5 bg-[#16A34A]/10 border border-[#16A34A]/30 rounded-xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6 text-[#16A34A] shrink-0" />
                <div>
                  <h2 className="text-sm font-bold text-[#0F172A]">
                    Congratulations! You have completed {course.title}
                  </h2>
                  <p className="text-xs text-[#475569]">
                    Your official Certificate of Completion ({activeCertId}) is ready to view and print.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onOpenCertificate(activeCertId)}
                className="px-4 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                Open Certificate of Completion
              </button>
            </div>
          )}

          {activeLesson && (
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E2E8F0]">
                <div>
                  <div className="text-xs font-medium text-[#2563EB] capitalize mb-1">
                    {activeLesson.type} Lesson · {activeLesson.durationMinutes} Minutes
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
                    {activeLesson.title}
                  </h2>
                </div>
                {isLessonCompleted && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16A34A]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Completed</span>
                  </span>
                )}
              </div>

              {/* VIDEO LESSON */}
              {activeLesson.type === 'video' && activeLesson.videoUrl && (
                <div className="rounded-xl overflow-hidden border border-[#E2E8F0] bg-black aspect-video">
                  <video
                    key={activeLesson.videoUrl}
                    controls
                    className="w-full h-full"
                    src={activeLesson.videoUrl}
                  />
                </div>
              )}

              {/* LESSON TEXT / NOTES */}
              <div className="prose max-w-none text-sm text-[#0F172A] leading-relaxed whitespace-pre-line">
                {activeLesson.contentMarkdown}
              </div>

              {/* QUIZ ENGINE */}
              {activeLesson.type === 'quiz' && activeLesson.quizQuestions && (
                <div className="pt-4 border-t border-[#E2E8F0] space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-[#F8FAFC] p-4 rounded-lg border border-[#E2E8F0]">
                    <div className="text-xs text-[#475569]">
                      Passing Requirement:{' '}
                      <strong className="text-[#0F172A] tabular-nums">
                        {activeLesson.quizPassingScore || 70}%
                      </strong>{' '}
                      · Questions: {activeLesson.quizQuestions.length}
                    </div>
                    {lessonQuizAttempts.length > 0 && (
                      <div className="text-xs text-[#475569] tabular-nums">
                        Best Score:{' '}
                        <strong className="text-[#16A34A]">
                          {Math.max(...lessonQuizAttempts.map((a) => a.scorePercent))}%
                        </strong>{' '}
                        ({lessonQuizAttempts.length} attempt
                        {lessonQuizAttempts.length > 1 ? 's' : ''})
                      </div>
                    )}
                  </div>

                  {quizSubmittedResult && (
                    <div
                      className={`p-4 rounded-lg border ${
                        quizSubmittedResult.passed
                          ? 'bg-[#16A34A]/5 border-[#16A34A]/30 text-[#16A34A]'
                          : 'bg-[#D97706]/5 border-[#D97706]/30 text-[#D97706]'
                      }`}
                    >
                      <div className="text-sm font-bold tabular-nums">
                        Quiz Score: {quizSubmittedResult.scorePercent}% —{' '}
                        {quizSubmittedResult.passed
                          ? 'Passed! Competency Verified.'
                          : 'Below Passing Threshold — Review explanations below and retake.'}
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleQuizSubmit} className="space-y-6">
                    {activeLesson.quizQuestions.map((q, qIdx) => (
                      <div
                        key={q.id}
                        className="p-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-3"
                      >
                        <div className="text-sm font-semibold text-[#0F172A]">
                          {qIdx + 1}. {q.question}
                        </div>
                        <div className="space-y-2">
                          {q.options.map((opt, optIdx) => (
                            <label
                              key={optIdx}
                              className={`flex items-start gap-2.5 p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                                selectedAnswers[q.id] === optIdx
                                  ? 'border-[#2563EB] bg-white font-semibold text-[#0F172A]'
                                  : 'border-[#E2E8F0] bg-white text-[#475569] hover:border-[#2563EB]/40'
                              }`}
                            >
                              <input
                                type="radio"
                                name={q.id}
                                required
                                checked={selectedAnswers[q.id] === optIdx}
                                onChange={() =>
                                  setSelectedAnswers((prev) => ({
                                    ...prev,
                                    [q.id]: optIdx,
                                  }))
                                }
                                className="mt-0.5 text-[#2563EB]"
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                        {quizSubmittedResult && (
                          <div className="text-xs text-[#475569] pt-2 border-t border-[#E2E8F0]">
                            <strong className="text-[#0F172A]">Explanation:</strong>{' '}
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    ))}

                    <button
                      type="submit"
                      disabled={submittingQuiz}
                      className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg cursor-pointer"
                    >
                      {submittingQuiz ? 'Grading Quiz...' : 'Submit Quiz for Automatic Grading'}
                    </button>
                  </form>
                </div>
              )}

              {/* ASSIGNMENT ENGINE */}
              {activeLesson.type === 'assignment' && (
                <div className="pt-4 border-t border-[#E2E8F0] space-y-5">
                  <div className="p-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-3">
                    <h3 className="text-sm font-bold text-[#0F172A]">
                      Assignment Prompt & Deliverables
                    </h3>
                    <p className="text-xs text-[#475569] leading-relaxed">
                      {activeLesson.assignmentPrompt}
                    </p>
                    {activeLesson.assignmentDeliverables && (
                      <ul className="space-y-1.5 text-xs text-[#0F172A]">
                        {activeLesson.assignmentDeliverables.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-[#2563EB] font-bold">·</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {existingAssignmentSub && (
                    <div className="p-4 rounded-lg bg-[#2563EB]/5 border border-[#2563EB]/20 text-xs space-y-1">
                      <div className="font-semibold text-[#0F172A]">
                        Submission Status: {existingAssignmentSub.status.toUpperCase()}
                        {existingAssignmentSub.status === 'graded' &&
                          ` · Score: ${existingAssignmentSub.gradePercent}%`}
                      </div>
                      <div className="text-[#475569]">
                        Faculty Feedback: {existingAssignmentSub.feedback}
                      </div>
                    </div>
                  )}

                  {assignmentSavedMsg && (
                    <div className="p-3.5 rounded-lg bg-[#16A34A]/10 text-xs font-semibold text-[#16A34A]">
                      {assignmentSavedMsg}
                    </div>
                  )}

                  <form onSubmit={handleAssignmentSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                        Your Written Implementation Plan / Project Response *
                      </label>
                      <textarea
                        rows={6}
                        required
                        value={submissionText}
                        onChange={(e) => setSubmissionText(e.target.value)}
                        placeholder="Write your structured assignment response here..."
                        className="w-full p-3.5 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                        Supporting Document / Project Link (Google Drive, GitHub, Figma, or Portfolio URL — Optional)
                      </label>
                      <input
                        type="url"
                        value={attachmentUrl}
                        onChange={(e) => setAttachmentUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3.5 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submittingAssignment}
                      className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg cursor-pointer"
                    >
                      {submittingAssignment
                        ? 'Submitting Assignment...'
                        : existingAssignmentSub
                        ? 'Update Assignment Submission'
                        : 'Submit Capstone Assignment'}
                    </button>
                  </form>
                </div>
              )}

              {/* DOWNLOADABLE RESOURCES */}
              {activeLesson.resources && activeLesson.resources.length > 0 && (
                <div className="pt-6 border-t border-[#E2E8F0]">
                  <h3 className="text-xs font-bold text-[#0F172A] mb-3">
                    Downloadable Study Materials & Templates
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeLesson.resources.map((res) => (
                      <div
                        key={res.id}
                        className="p-3.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-[#0F172A] truncate">
                            {res.title}
                          </div>
                          <div className="text-[11px] text-[#475569] tabular-nums">
                            {res.type.toUpperCase()} · {res.sizeLabel}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDownloadResource(res)}
                          className="px-3 py-1.5 bg-white hover:bg-[#2563EB] hover:text-white border border-[#E2E8F0] rounded text-xs font-semibold text-[#0F172A] inline-flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lesson Navigation Controls */}
              <div className="pt-6 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={!prevLesson}
                  onClick={() => prevLesson && setActiveLessonId(prevLesson.id)}
                  className="px-4 py-2 border border-[#E2E8F0] rounded-lg text-xs font-semibold text-[#0F172A] disabled:opacity-40 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous Lesson</span>
                </button>

                <div className="flex items-center gap-3">
                  {activeLesson.type !== 'quiz' && (
                    <button
                      type="button"
                      disabled={markingComplete}
                      onClick={handleMarkComplete}
                      className={`px-5 py-2.5 rounded-lg text-xs font-semibold text-white inline-flex items-center gap-1.5 cursor-pointer ${
                        isLessonCompleted
                          ? 'bg-[#16A34A] hover:bg-[#15803D]'
                          : 'bg-[#2563EB] hover:bg-[#1D4ED8]'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {markingComplete
                          ? 'Saving Progress...'
                          : isLessonCompleted
                          ? nextLesson
                            ? 'Completed · Continue to Next'
                            : 'Lesson Completed'
                          : 'Mark Lesson as Complete'}
                      </span>
                    </button>
                  )}

                  {nextLesson && (
                    <button
                      type="button"
                      onClick={() => setActiveLessonId(nextLesson.id)}
                      className="px-4 py-2 border border-[#E2E8F0] rounded-lg text-xs font-semibold text-[#0F172A] inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
