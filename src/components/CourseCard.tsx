import React, { useState } from 'react';
import { Bookmark, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Course, Enrollment } from '../types/lms';
import { CATEGORY_IMAGES } from '../data/initialCatalog';

interface CourseCardProps {
  course: Course;
  enrollment?: Enrollment;
  isSaved?: boolean;
  onSelectCourse: (course: Course) => void;
  onPrimaryAction: (course: Course) => void;
  onToggleSave?: (courseId: string) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  enrollment,
  isSaved = false,
  onSelectCourse,
  onPrimaryAction,
  onToggleSave,
}) => {
  const [imgError, setImgError] = useState(false);

  const isEnrolled = Boolean(enrollment && enrollment.status !== 'expired');
  const isExpired = Boolean(enrollment && enrollment.status === 'expired');

  const effectivePrice =
    course.salePrice > 0 && course.salePrice < course.regularPrice
      ? course.salePrice
      : course.regularPrice;

  const fallbackImg = CATEGORY_IMAGES[course.category] || CATEGORY_IMAGES['AI & Technology'];

  return (
    <article className="group bg-white border border-[#E2E8F0] rounded-xl overflow-hidden flex flex-col justify-between transition-colors hover:border-[#2563EB]/40">
      <div>
        {/* Thumbnail */}
        <div
          onClick={() => onSelectCourse(course)}
          className="relative aspect-[4/3] w-full bg-[#F8FAFC] overflow-hidden cursor-pointer border-b border-[#E2E8F0]"
        >
          {!imgError ? (
            <img
              src={course.thumbnailUrl || fallbackImg}
              alt={course.title}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#F8FAFC]">
              <span className="text-xs font-medium text-[#2563EB] mb-1">{course.category}</span>
              <span className="text-sm font-semibold text-[#0F172A]">{course.title}</span>
            </div>
          )}

          {onToggleSave && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(course.id);
              }}
              aria-label={isSaved ? 'Remove from saved courses' : 'Save course'}
              className={`absolute top-3 right-3 w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                isSaved
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-white/90 text-[#0F172A] hover:bg-white'
              }`}
            >
              <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Unboxed metadata with middle-dot separators (Zero-Pill Discipline) */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#475569] mb-2">
            <span className="font-medium text-[#2563EB]">{course.category}</span>
            <span aria-hidden="true">·</span>
            <span>{course.difficulty}</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Clock className="w-3 h-3" />
              {course.durationHours}h
            </span>
          </div>

          <h3
            onClick={() => onSelectCourse(course)}
            className="text-lg font-semibold text-[#0F172A] group-hover:text-[#2563EB] transition-colors cursor-pointer line-clamp-2 mb-2"
          >
            {course.title}
          </h3>

          <p className="text-sm text-[#475569] line-clamp-2 mb-4 leading-relaxed">
            {course.shortDescription}
          </p>

          <div className="text-xs text-[#475569] flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
            <span className="truncate max-w-[180px]">Faculty: {course.instructorName}</span>
            <span className="tabular-nums">
              {course.accessType === 'lifetime'
                ? 'Lifetime access'
                : `${course.accessDurationDays}d access`}
            </span>
          </div>
        </div>
      </div>

      {/* Footer: Pricing & Action */}
      <div className="px-5 py-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between gap-3">
        <div>
          {isEnrolled ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#16A34A]">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="tabular-nums">
                {enrollment?.status === 'completed'
                  ? 'Completed (100%)'
                  : `Enrolled · ${enrollment?.progressPercent || 0}%`}
              </span>
            </div>
          ) : course.isFree ? (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[#16A34A]">Free Access</span>
              {course.regularPrice > 0 && (
                <span className="text-xs text-[#475569] line-through tabular-nums">
                  {course.currency} {course.regularPrice.toLocaleString()}
                </span>
              )}
            </div>
          ) : (
            <div className="flex flex-col">
              <span className="text-base font-bold text-[#0F172A] tabular-nums">
                {course.currency} {effectivePrice.toLocaleString()}
              </span>
              {course.salePrice > 0 && course.salePrice < course.regularPrice && (
                <span className="text-xs text-[#475569] line-through tabular-nums">
                  {course.currency} {course.regularPrice.toLocaleString()}
                </span>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => onPrimaryAction(course)}
          className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
            isEnrolled
              ? 'bg-[#16A34A] text-white hover:bg-[#15803D]'
              : course.isFree
              ? 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]'
              : 'bg-[#0F172A] text-white hover:bg-[#2563EB]'
          }`}
        >
          <span>
            {isEnrolled
              ? enrollment?.progressPercent && enrollment.progressPercent > 0
                ? 'Continue Learning'
                : 'Start Learning'
              : isExpired
              ? 'Renew Access'
              : course.isFree
              ? 'Enroll for Free'
              : 'Enroll Now'}
          </span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </article>
  );
};
