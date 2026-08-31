import { useState, useMemo, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useDeviceType from "../../../hooks/useDeviceType";
import WeeklySchedule from "../../../components/ui/WeeklySchedule";
import WeeklyScheduleAgenda from "../../../components/ui/schedule/WeeklyScheduleAgenda.phone";
import ModelOverlay from "../../../components/ui/ModelOverlay";
import DateInput from "../../../components/form/DateInput";
import TimeInput from "../../../components/form/TimeInput";
import { CalendarIcon } from "../../../components/ui/icons";
import { autoSchedule, getAvailableSlots, updateExam, fetchExams, deleteExam } from "../services/adminSchedulingApi";
import { useError } from '../../../contexts/ErrorContext.jsx';
import { getLocalizedField } from '../../../utils/getLocalizedField';

function to12Hour(t) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function parseMin(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function fmtLabel(slot, t) {
  if (!slot.startTime || !slot.endTime) return t ? t('examScheduler.noTimeSet') : "No time set";
  return `${to12Hour(slot.startTime)} - ${to12Hour(slot.endTime)}`;
}

function overlaps(a, b) {
  return parseMin(a.startTime) < parseMin(b.endTime) && parseMin(b.startTime) < parseMin(a.endTime);
}

function nextSlotId(defs) {
  const max = defs.reduce((m, s) => Math.max(m, +(s.id.split("_")[1] || 0)), -1);
  return `slot_${max + 1}`;
}

function getDateLabel(dateStr, locale = "en") {
  const d = new Date(dateStr + "T00:00:00");
  const localeMap = { en: "en-US", ar: "ar-SA" };
  return new Intl.DateTimeFormat(localeMap[locale] || locale, {
    weekday: "short", day: "numeric", month: "numeric",
  }).format(d);
}

function getDayKey(dateStr) {
  return "d" + dateStr.replace(/-/g, "");
}

function AutoScheduleDialog({ onClose, onConfirm }) {
  const { t } = useTranslation('admin');
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [examType, setExamType] = useState(0);
  const [slotDefs, setSlotDefs] = useState([{ id: "slot_0", startTime: "", endTime: "" }]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = useCallback((defs) => {
    const errs = {};
    for (const s of defs) {
      if (parseMin(s.startTime) >= parseMin(s.endTime)) {
        errs[s.id] = t('examScheduler.errorStartBeforeEnd');
      }
    }
    for (let i = 0; i < defs.length; i++) {
      for (let j = i + 1; j < defs.length; j++) {
        if (overlaps(defs[i], defs[j])) {
          errs[defs[i].id] = errs[defs[i].id] || t('examScheduler.errorOverlap');
          errs[defs[j].id] = errs[defs[j].id] || t('examScheduler.errorOverlap');
        }
      }
    }
    return errs;
  }, []);

  const handleAdd = () => {
    const id = nextSlotId(slotDefs);
    const newSlot = { id, startTime: "", endTime: "" };
    const next = [...slotDefs, newSlot];
    setSlotDefs(next);
    setErrors(validate(next));
  };

  const handleChange = (id, field, value) => {
    const next = slotDefs.map(s => s.id === id ? { ...s, [field]: value } : s);
    setSlotDefs(next);
    setErrors(validate(next));
  };

  const handleRemove = (id) => {
    const next = slotDefs.filter(s => s.id !== id);
    setSlotDefs(next);
    setErrors(validate(next));
  };

  const hasErrors = Object.keys(errors).length > 0 && slotDefs.some(s => errors[s.id]);
  const dailySlots = slotDefs.filter(s => s.startTime && s.endTime);
  const validDailySlots = dailySlots.filter(s => !errors[s.id]);

  const handleSchedule = async () => {
    if (!startDate || !endDate || validDailySlots.length === 0) return;
    setLoading(true);
    try {
      await onConfirm({
        scheduleFrom: startDate,
        scheduleTo: endDate,
        examType,
        dailySlots: validDailySlots.map(s => ({
          startTime: s.startTime + ":00",
          endTime: s.endTime + ":00",
        })),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-2xl shadow-2xl max-w-2xl w-full mx-auto overflow-hidden">
      <div className="bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark border-b border-border-primary-default-light dark:border-border-primary-default-dark px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] text-indigo-400 font-semibold uppercase tracking-wider">{t('manageExams.autoSchedule')}</p>
          <h3 className="text-base font-semibold text-text-primary-default-light dark:text-text-primary-default-dark mt-0.5">{t('examScheduler.configureSchedule')}</h3>
        </div>
        <button onClick={onClose} className="bg-transparent border-none text-text-secondary-default-light dark:text-text-secondary-default-dark cursor-pointer text-lg p-1 hover:text-text-primary-default-light dark:hover:text-text-primary-default-dark">✕</button>
      </div>

      <div className="p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DateInput
            label={t('examScheduler.startDate')}
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
          <DateInput
            label={t('examScheduler.endDate')}
            value={endDate}
            minDate={startDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-text-secondary-default-light dark:text-text-secondary-default-dark mb-2 block">{t('examScheduler.examType')}</label>
          <select
            value={examType}
            onChange={e => setExamType(Number(e.target.value))}
            className="w-full rounded-md border border-border-primary-default-light dark:border-border-primary-default-dark px-3 py-2 bg-bg-fill-primary-default-light dark:bg-bg-fill-primary-default-dark text-sm"
          >
            <option value={0}>{t('manageExams.midterm')}</option>
            <option value={1}>{t('manageExams.final')}</option>
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('examScheduler.timeSlots')}</label>
            {slotDefs.length >= 5 ? (
              <span className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('examScheduler.maxSlotsReached')}</span>
            ) : (
              <button
                onClick={handleAdd}
                className="text-xs font-semibold cursor-pointer bg-transparent border border-border-primary-default-light dark:border-border-primary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark px-3 py-1 rounded-lg hover:bg-bg-fill-secondary-default-light dark:hover:bg-bg-fill-secondary-default-dark transition-colors"
              >
                {t('manageExams.addSlot')}
              </button>
            )}
          </div>
          <div className="space-y-2 border border-border-primary-default-light dark:border-border-primary-default-dark rounded-lg p-3">
            {slotDefs.map(s => (
              <div key={s.id} className="flex items-center gap-2">
                <TimeInput
                  value={s.startTime}
                  onChange={e => handleChange(s.id, "startTime", e.target.value)}
                  className="flex-1"
                />
                <span className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('examScheduler.to')}</span>
                <TimeInput
                  value={s.endTime}
                  onChange={e => handleChange(s.id, "endTime", e.target.value)}
                  className="flex-1"
                />
                <span className="text-[11px] text-text-secondary-default-light dark:text-text-secondary-default-dark w-28 text-start whitespace-nowrap">{fmtLabel(s, t)}</span>
                <button
                  onClick={() => handleRemove(s.id)}
                  className="bg-transparent border-none text-red-400 cursor-pointer text-base p-1 hover:text-red-300"
                  disabled={slotDefs.length <= 1}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          {hasErrors && (
            <div className="mt-2 space-y-0.5">
              {Object.entries(errors).map(([id, msg]) => {
                if (!msg) return null;
                const s = slotDefs.find(x => x.id === id);
                return (
                  <p key={id} className="text-[11px] text-red-400 m-0">
                    {fmtLabel(s, t)}: {msg}
                  </p>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border-primary-default-light dark:border-border-primary-default-dark">
          <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">
            {startDate && endDate ? t('examScheduler.slotCount', { count: validDailySlots.length }) : t('examScheduler.selectDates')}
          </p>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer bg-bg-fill-secondary-default-light dark:bg-bg-fill-secondary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark hover:bg-bg-fill-secondary-active-light dark:hover:bg-bg-fill-secondary-active-dark transition-colors">{t('manageExams.cancel')}</button>
            <button
              onClick={handleSchedule}
              disabled={!startDate || !endDate || validDailySlots.length === 0 || hasErrors || loading}
              className="px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark text-text-accent-active-light dark:text-text-accent-active-dark border border-border-primary-default-light dark:border-border-primary-default-dark hover:bg-bg-fill-primary-hover-light dark:hover:bg-bg-fill-primary-hover-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? t('examScheduler.scheduling') : t('examScheduler.schedule')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const ROWS_PER_PAGE = 8;

function MovePanel({ exam, scheduleFrom, scheduleTo, dailySlots, onMove, onClose }) {
  const { t, i18n } = useTranslation('admin');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [moving, setMoving] = useState(false);
  const [page, setPage] = useState(0);

  const { data: slots = [], isLoading: loading } = useQuery({
    queryKey: ["availableSlots", exam.courseId, exam.examId, scheduleFrom, scheduleTo, dailySlots],
    queryFn: () => getAvailableSlots({
      courseId: exam.courseId,
      scheduleFrom,
      scheduleTo,
      dailySlots,
      excludeExamId: exam.examId,
    }),
    staleTime: 30_000,
  });

  const handleConfirmMove = async () => {
    if (!selectedSlot) return;
    setMoving(true);
    try {
      const startParts = selectedSlot.startTime.split(":");
      const endParts = selectedSlot.endTime.split(":");
      const startMin = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
      const endMin = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
      const duration = endMin - startMin;

      await onMove(exam.examId, selectedSlot.date, selectedSlot.startTime, duration);
      onClose();
    } finally {
      setMoving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-2xl shadow-2xl max-w-3xl w-full mx-auto overflow-hidden p-12 text-center text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">
        {t('examScheduler.loadingSlots')}
      </div>
    );
  }

  const slotMap = {};
  slots.forEach(s => {
    const key = `${s.startTime.substring(0, 5)} - ${s.endTime.substring(0, 5)}`;
    if (!slotMap[key]) slotMap[key] = [];
    slotMap[key].push(s);
  });

  const timeSlots = Object.keys(slotMap).sort((a, b) => {
    const aStart = parseMin(a.split(" - ")[0]);
    const bStart = parseMin(b.split(" - ")[0]);
    return aStart - bStart;
  });

  const dateLabels = {};
  slots.forEach(s => {
    dateLabels[s.date] = getDateLabel(s.date, i18n.language);
  });
  const uniqueDates = [...new Set(slots.map(s => s.date))].sort();
  const totalPages = Math.ceil(uniqueDates.length / ROWS_PER_PAGE);
  const paginatedDates = uniqueDates.slice(page * ROWS_PER_PAGE, (page + 1) * ROWS_PER_PAGE);

  return (
    <div className="bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-2xl shadow-2xl max-w-3xl w-full mx-auto overflow-hidden max-h-[90vh] flex flex-col">
      <div className="bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark border-b border-border-primary-default-light dark:border-border-primary-default-dark px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          <p className="text-[11px] text-indigo-400 font-semibold uppercase tracking-wider">{t('examScheduler.moveExam')}</p>
          <h3 className="text-base font-semibold text-text-primary-default-light dark:text-text-primary-default-dark mt-0.5">
            {getLocalizedField(exam, 'courseName', i18n.language)} <span className="font-normal text-text-secondary-default-light dark:text-text-secondary-default-dark text-xs">({getLocalizedField(exam, 'courseCode', i18n.language)})</span>
          </h3>
          <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark mt-0.5">
            {t('examScheduler.currentLabel')} {exam.date} · {to12Hour(exam.startTime.substring(0, 5))} - {to12Hour(exam.endTime.substring(0, 5))}
          </p>
        </div>
        <button onClick={onClose} className="bg-transparent border-none text-text-secondary-default-light dark:text-text-secondary-default-dark cursor-pointer text-lg p-1 hover:text-text-primary-default-light dark:hover:text-text-primary-default-dark">✕</button>
      </div>

      <div className="p-6 overflow-y-auto flex-1 min-h-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[480px]">
            <thead>
              <tr>
                <th className="bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark px-2.5 py-2 text-xs font-semibold text-text-secondary-default-light dark:text-text-secondary-default-dark text-center border-b border-border-primary-default-light dark:border-border-primary-default-dark whitespace-nowrap"></th>
                {timeSlots.map(ts => (
                  <th key={ts} className="bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark px-2.5 py-2 text-xs font-semibold text-text-secondary-default-light dark:text-text-secondary-default-dark text-center border-b border-border-primary-default-light dark:border-border-primary-default-dark whitespace-nowrap">{ts}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedDates.map(date => (
                <tr key={date}>
                  <td className="px-3 py-2 border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark text-xs font-semibold text-text-secondary-default-light dark:text-text-secondary-default-dark whitespace-nowrap">{dateLabels[date]}</td>
                  {timeSlots.map(ts => {
                    const slotInfo = slotMap[ts]?.find(s => s.date === date);
                    if (!slotInfo) return <td key={ts} className="p-1.5 border border-border-primary-default-light dark:border-border-primary-default-dark"><div className="rounded-lg p-2 text-center min-h-[54px] flex items-center justify-center"><span className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark">—</span></div></td>;
                    const { isAvailable, conflicts } = slotInfo;
                    const isSelected = selectedSlot?.date === date && selectedSlot?.startTime === slotInfo.startTime;

                    let cellStyle, label, labelColor;
                    if (isSelected) {
                      cellStyle = "bg-indigo-500/20 border-2 border-indigo-400 cursor-pointer";
                      label = t('examScheduler.clickToConfirm');
                      labelColor = "text-indigo-300";
                    } else if (!isAvailable) {
                      cellStyle = "bg-red-500/10 border border-red-500/40 cursor-not-allowed";
                      label = t('examScheduler.conflictCount', { count: conflicts.length });
                      labelColor = "text-red-400";
                    } else {
                      cellStyle = "bg-emerald-500/5 border border-emerald-500/20 cursor-pointer hover:bg-emerald-500/10";
                      label = t('examScheduler.available');
                      labelColor = "text-emerald-400";
                    }

                    return (
                      <td key={ts} className="p-1.5 border border-border-primary-default-light dark:border-border-primary-default-dark align-top min-w-[140px]">
                        <div
                          onClick={() => isAvailable && setSelectedSlot(isSelected ? null : slotInfo)}
                          className={`rounded-lg p-2 text-center min-h-[54px] flex flex-col items-center justify-center transition-all duration-150 ${cellStyle}`}
                        >
                          <span className={`text-xs font-semibold leading-tight ${labelColor}`}>{label}</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer bg-bg-fill-secondary-default-light dark:bg-bg-fill-secondary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark hover:bg-bg-fill-secondary-active-light dark:hover:bg-bg-fill-secondary-active-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {t('examScheduler.prev')}
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors border ${
                  i === page
                    ? "bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark text-text-accent-active-light dark:text-text-accent-active-dark border-border-accent-default-light dark:border-border-accent-default-dark"
                    : "bg-bg-fill-secondary-default-light dark:bg-bg-fill-secondary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark border-border-primary-default-light dark:border-border-primary-default-dark hover:bg-bg-fill-secondary-active-light dark:hover:bg-bg-fill-secondary-active-dark"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer bg-bg-fill-secondary-default-light dark:bg-bg-fill-secondary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark hover:bg-bg-fill-secondary-active-light dark:hover:bg-bg-fill-secondary-active-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {t('examScheduler.next')}
            </button>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-border-primary-default-light dark:border-border-primary-default-dark">
          {selectedSlot && (
            <button
              onClick={handleConfirmMove}
              disabled={moving}
              className="px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark text-text-accent-active-light dark:text-text-accent-active-dark border border-border-primary-default-light dark:border-border-primary-default-dark hover:bg-bg-fill-primary-hover-light dark:hover:bg-bg-fill-primary-hover-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {moving ? t('examScheduler.moving') : t('examScheduler.confirmMove')}
            </button>
          )}
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer bg-bg-fill-secondary-default-light dark:bg-bg-fill-secondary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark hover:bg-bg-fill-secondary-active-light dark:hover:bg-bg-fill-secondary-active-dark transition-colors">{t('manageExams.cancel')}</button>
        </div>
      </div>
    </div>
  );
}

const CONFIG_STORAGE_KEY = "exam_scheduler_config";

function deriveConfigFromExams(scheduled) {
  if (!scheduled || scheduled.length === 0) return null;
  const dates = [...new Set(scheduled.map(e => e.date))].sort();
  const slotMap = new Map();
  scheduled.forEach(e => {
    const key = `${e.startTime.substring(0, 5)};${e.endTime.substring(0, 5)}`;
    if (!slotMap.has(key)) {
      slotMap.set(key, { startTime: e.startTime, endTime: e.endTime });
    }
  });
  const dailySlots = [...slotMap.values()]
    .sort((a, b) => parseMin(a.startTime) - parseMin(b.startTime));
  return {
    scheduleFrom: dates[0],
    scheduleTo: dates[dates.length - 1],
    dailySlots,
  };
}

const ExamScheduler = forwardRef(function ExamScheduler({ onScheduleChange }, ref) {
  const { t, i18n } = useTranslation('admin');
  const { isMobile } = useDeviceType();
  const { showError } = useError();
  const queryClient = useQueryClient();
  const [scheduleOverride, setScheduleOverride] = useState(null);
  const [lastAutoConfig, setLastAutoConfig] = useState(() => {
    const savedConfig = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (savedConfig) {
      try { return JSON.parse(savedConfig); } catch { /* ignore */ }
    }
    return null;
  });
  const [showAutoDialog, setShowAutoDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data: initialExams, isPending: examsPending } = useQuery({
    queryKey: ["scheduledExams"],
    queryFn: async () => {
      const exams = await fetchExams();
      if (exams && exams.length > 0) {
        return exams.map(exam => ({
          courseId: exam.courseId,
          courseCode: exam.courseCode || "",
          courseName: exam.courseName || exam.title,
          examId: exam.examId,
          date: exam.date.split("T")[0],
          startTime: exam.time.substring(0, 8),
          endTime: (() => {
            const [h, m] = exam.time.split(":").map(Number);
            const total = h * 60 + m + exam.durationMinutes;
            const endH = Math.floor(total / 60);
            const endM = total % 60;
            return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}:00`;
          })(),
          studentCount: 0,
        }));
      }
      return null;
    },
    staleTime: 5 * 60 * 1000,
  });

  const scheduleResult = useMemo(() => {
    if (scheduleOverride) return scheduleOverride;
    if (initialExams) return { success: true, scheduled: initialExams, unscheduledCourseIds: [] };
    return null;
  }, [initialExams, scheduleOverride]);

  const schedule = useMemo(() => {
    if (!scheduleResult?.scheduled) return [];
    return scheduleResult.scheduled.map(exam => ({
      id: String(exam.examId),
      day: getDayKey(exam.date),
      startTime: to12Hour(exam.startTime.substring(0, 5)),
      endTime: to12Hour(exam.endTime.substring(0, 5)),
      title: `${exam.courseCode} - ${exam.courseName}`,
      type: "exam",
    }));
  }, [scheduleResult]);

  const examDays = useMemo(() => {
    if (!scheduleResult?.scheduled) return [];
    const dateSet = new Set(scheduleResult.scheduled.map(exam => exam.date));
    return Array.from(dateSet).sort().map(date => ({
      key: getDayKey(date),
      label: getDateLabel(date, i18n.language),
    }));
  }, [scheduleResult, i18n.language]);

  const ready = schedule.length > 0;

  useEffect(() => { onScheduleChange?.(ready); }, [ready, onScheduleChange]);

  const derivedConfig = useMemo(() => {
    if (!initialExams || lastAutoConfig) return null;
    return deriveConfigFromExams(initialExams);
  }, [initialExams, lastAutoConfig]);

  const effectiveConfig = lastAutoConfig || derivedConfig;

  const handleAutoClick = useCallback(() => {
    setShowAutoDialog(true);
  }, []);

  const autoScheduleMutation = useMutation({
    mutationFn: autoSchedule,
    onSuccess: (result, request) => {
      setScheduleOverride(result);
      if (result?.scheduled) {
        queryClient.setQueryData(["scheduledExams"], result.scheduled);
      }
      const config = {
        scheduleFrom: request.scheduleFrom,
        scheduleTo: request.scheduleTo,
        dailySlots: request.dailySlots,
      };
      setLastAutoConfig(config);
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
      setShowAutoDialog(false);
    },
    onError: (err) => showError(err.message),
    onSettled: () => setLoading(false),
  });

  const handleAutoConfirm = useCallback((request) => {
    setLoading(true);
    autoScheduleMutation.mutate(request);
  }, [autoScheduleMutation]);

  const resetMutation = useMutation({
    mutationFn: async () => {
      const exams = await fetchExams();
      await Promise.all(exams.map(e => deleteExam(e.examId)));
    },
    onSuccess: () => {
      setScheduleOverride(null);
      setLastAutoConfig(null);
      localStorage.removeItem(CONFIG_STORAGE_KEY);
      setEditing(null);
      queryClient.setQueryData(["scheduledExams"], null);
      queryClient.invalidateQueries({ queryKey: ["scheduledExams"] });
    },
    onError: (err) => showError(err.message),
    onSettled: () => setLoading(false),
  });

  const handleReset = useCallback(() => {
    setLoading(true);
    resetMutation.mutate();
  }, [resetMutation]);

  const handleEventClick = useCallback((ev) => {
    const exam = scheduleResult?.scheduled?.find(e => String(e.examId) === ev.id);
    if (exam) setEditing(exam);
  }, [scheduleResult]);

  const handleMoveExam = useCallback(async (examId, date, startTime, durationMinutes) => {
    await updateExam(examId, {
      date: `${date}T00:00:00`,
      time: startTime,
      durationMinutes,
    });
    const endTime = (() => {
      const [h, m] = startTime.split(":");
      const total = parseInt(h) * 60 + parseInt(m) + durationMinutes;
      const endH = Math.floor(total / 60);
      const endM = total % 60;
      return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}:00`;
    })();
    setScheduleOverride(prev => {
      const current = prev || (initialExams ? { success: true, scheduled: initialExams, unscheduledCourseIds: [] } : null);
      if (!current) return null;
      return {
        ...current,
        scheduled: current.scheduled.map(e =>
          e.examId === examId ? { ...e, date, startTime, endTime } : e
        ),
      };
    });
    queryClient.setQueryData(["scheduledExams"], (prev) => {
      if (!prev) return prev;
      return prev.map(e => e.examId === examId ? { ...e, date, startTime, endTime } : e);
    });
  }, [initialExams, queryClient]);

  useImperativeHandle(ref, () => ({
    handleAuto: handleAutoClick,
    handleReset,
    hasSchedule: ready,
    getScheduleData: () => {
      if (!scheduleResult?.scheduled) return [];
      return scheduleResult.scheduled.map(exam => ({
        Code: exam.courseCode,
        Name: exam.courseName,
        Date: exam.date,
        "Start Time": to12Hour(exam.startTime.substring(0, 5)),
        "End Time": to12Hour(exam.endTime.substring(0, 5)),
        Students: exam.studentCount,
      }));
    },
  }), [handleAutoClick, handleReset, ready, scheduleResult]);

  return (
    <div className="relative">

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-text-secondary-default-light dark:text-text-secondary-default-dark">
          <span className="text-5xl"><CalendarIcon size={64} /></span>
          <p className="text-sm m-0">{t('examScheduler.generating')}</p>
          <p className="text-xs m-0">{t('examScheduler.generatingSub')}</p>
        </div>
      )}

      {!loading && !ready && examsPending && (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-text-secondary-default-light dark:text-text-secondary-default-dark">
          <span className="text-5xl animate-pulse"><CalendarIcon size={64} /></span>
          <p className="text-sm m-0">{t('examScheduler.generating')}</p>
        </div>
      )}

      {!loading && !ready && !examsPending && (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-text-secondary-default-light dark:text-text-secondary-default-dark">
          <span className="text-5xl"><CalendarIcon size={64} /></span>
          <p className="text-sm m-0">{t('examScheduler.noSchedule')}</p>
          <p className="text-xs m-0">{t('examScheduler.noScheduleHint')}</p>
        </div>
      )}

      {!loading && ready && (
        isMobile ? (
          <WeeklyScheduleAgenda days={examDays} schedule={schedule} variant="exam" onEventClick={handleEventClick} />
        ) : (
          <WeeklySchedule schedule={schedule} isMobile={false} variant="exam" examDays={examDays} onEventClick={handleEventClick} />
        )
      )}

      {showAutoDialog && !loading && (
        <ModelOverlay onClose={() => setShowAutoDialog(false)} maxWidth="max-w-2xl">
          <AutoScheduleDialog
            onClose={() => setShowAutoDialog(false)}
            onConfirm={handleAutoConfirm}
          />
        </ModelOverlay>
      )}

      {editing && effectiveConfig && (
        <ModelOverlay onClose={() => setEditing(null)}>
          <MovePanel
            exam={editing}
            scheduleFrom={effectiveConfig.scheduleFrom}
            scheduleTo={effectiveConfig.scheduleTo}
            dailySlots={effectiveConfig.dailySlots}
            onMove={handleMoveExam}
            onClose={() => setEditing(null)}
          />
        </ModelOverlay>
      )}
    </div>
  );
});

export default ExamScheduler;
