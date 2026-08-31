import { useCallback, useEffect, useState, useRef } from "react";
import { useNavigate, useOutletContext, useParams, useRouteLoaderData } from "react-router-dom";
import { useTranslation } from "react-i18next";
import QrScanner from "qr-scanner";

import Button from "../../../components/ui/Button";
import ModelOverlay from "../../../components/ui/ModelOverlay";
import Table from "../../../components/ui/Table";
import { AngleDownIcon, ArrowRightIcon, CalendarIcon, ClockIcon, DownloadIcon, PlusIcon, QRCodeIcon, UsersIcon, WarningIcon, XIcon } from "../../../components/ui/icons";

import {
    fetchSessionAttendance,
    fetchClassesByCourse,
    getSessionsByClass,
    getSessionById,
    createSession,
    recordManualAttendance,
    scanAttendanceQr,
} from "../../../feature/instructor/components/attendance/instructorAttendanceApi";
import { CourseAttendanceSkeleton, CourseAttendanceDetailSkeleton } from "../../../feature/instructor/SkeletonLoader";
import { useError } from '../../../contexts/ErrorContext.jsx';
import { useToast } from '../../../contexts/ToastContext.jsx';
import { getLocalizedField } from '../../../utils/getLocalizedField';
import useArabicDigits from '../../../hooks/useArabicDigits.js';

function formatTime(value, language = 'en') {
    if (!value) return null;

    const normalized = typeof value === "string" ? value.trim() : String(value);
    if (!normalized) return null;

    const parsed = new Date(`1970-01-01T${normalized}`);
    if (Number.isNaN(parsed.getTime())) return normalized;

    return parsed.toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', { hour: "numeric", minute: "2-digit" });
}

function getClassTypeStyles(classType) {
    const type = String(classType || "").toLowerCase();

    if (type.includes("lecture")) {
        return {
            badge: "bg-bg-surface-blue-default-light text-text-accent-default-light dark:bg-bg-surface-blue-default-dark dark:text-text-accent-default-dark",
            accent: "from-blue-500/15 via-sky-400/10 to-transparent",
            pill: "border-border-accent-default-light/30 bg-bg-fill-primary-default-light text-text-accent-default-light dark:border-border-accent-default-dark/30 dark:bg-bg-fill-primary-default-dark dark:text-text-accent-default-dark",
        };
    }

    if (type.includes("lab")) {
        return {
            badge: "bg-bg-surface-green-default-light text-text-success-default-light dark:bg-bg-surface-green-default-dark dark:text-text-success-default-dark",
            accent: "from-emerald-500/15 via-green-400/10 to-transparent",
            pill: "border-border-success-default-light/30 bg-bg-fill-success-default-light text-text-success-default-light dark:border-border-success-default-dark/30 dark:bg-bg-fill-success-default-dark dark:text-text-success-default-dark",
        };
    }

    return {
        badge: "bg-bg-surface-amber-default-light text-text-warning-default-light dark:bg-bg-surface-amber-default-dark dark:text-text-warning-default-dark",
        accent: "from-amber-500/15 via-orange-400/10 to-transparent",
        pill: "border-border-warning-default-light/30 bg-bg-fill-warning-default-light text-text-warning-default-light dark:border-border-warning-default-dark/30 dark:bg-bg-fill-warning-default-dark dark:text-text-warning-default-dark",
    };
}

function translateSessionType(t, type) {
    const lower = String(type || "").toLowerCase();
    if (lower.includes("lecture")) return t('attendance.typeLecture');
    if (lower.includes("lab")) return t('attendance.typeLab');
    if (lower.includes("section")) return t('attendance.typeSection');
    if (lower.includes("workshop")) return t('attendance.typeWorkshop');
    if (lower.includes("seminar")) return t('attendance.typeSeminar');
    return type || "";
}

export default function InstructorCourseAttendance() {
    const { t, i18n } = useTranslation('instructor');
    const { convert: ar, localizeTime } = useArabicDigits();
    const outlet = useOutletContext() || {};
    const params = useParams();
    const navigate = useNavigate();
    const authUser = useRouteLoaderData("root");
    const courseId = outlet.courseId || outlet.course?.id || params.courseId;
    const course = outlet.course || null;
    const isInactive = course?.isInactive;
    const courseName = getLocalizedField(course, 'courseName', i18n.language) || course?.name || t('attendance.selectedCourse');
    const currentInstructorId = authUser?.userId || authUser?.id;

    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [selectedSessionId, setSelectedSessionId] = useState(null);
    const [report, setReport] = useState(null);

    const [isLoadingClasses, setIsLoadingClasses] = useState(true);
    const [isLoadingSessions, setIsLoadingSessions] = useState(false);
    const [isLoadingReport, setIsLoadingReport] = useState(false);
    const { showError } = useError();
    const { showToast } = useToast();
    const sessionInUrl = params.sessionId ? Number(params.sessionId) : null;

    const [creatingSession, setCreatingSession] = useState(false);
    const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);
    const [newSession, setNewSession] = useState({ topic: "", description: "" });

    const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [manualId, setManualId] = useState("");
    const [recentScans, setRecentScans] = useState([]);
    const [scanTab, setScanTab] = useState("qr");
    const qrContainerRef = useRef(null);
    const qrScannerRef = useRef(null);
    const processingScanRef = useRef(false);

    const loadClasses = useCallback(async () => {
        if (!courseId || !currentInstructorId) {
            showError(t('attendance.noCourseContext'));
            setIsLoadingClasses(false);
            return;
        }

        setIsLoadingClasses(true);
        try {
            const data = await fetchClassesByCourse(courseId);
            const allClasses = Array.isArray(data) ? data : [];
            const filteredClasses = allClasses.filter(cls => {
                const clsInstructorId = cls.instructorId || cls.InstructorId;
                return clsInstructorId === currentInstructorId;
            });
            setClasses(filteredClasses);

            // If a session is in the URL, resolve its classId first
            if (sessionInUrl) {
                try {
                    const session = await getSessionById(sessionInUrl);
                    if (session?.classId) {
                        setSelectedClassId(Number(session.classId));
                    }
                } catch (err) {
                    showError(err.message || t('attendance.loadSessionDetailsFailed'));
                }
            } else if (filteredClasses.length > 0 && !selectedClassId) {
                setSelectedClassId(filteredClasses[0].classId || filteredClasses[0].id);
            }
        } catch (err) {
            showError(err.message || t('attendance.loadClassesFailed'));
            setClasses([]);
        } finally {
            setIsLoadingClasses(false);
        }
    }, [courseId, currentInstructorId, sessionInUrl]);

    const loadSessions = useCallback(async (classId) => {
        if (!classId) {
            setSessions([]);
            return;
        }

        setIsLoadingSessions(true);
        try {
            const data = await getSessionsByClass(classId);
            const normalized = Array.isArray(data) ? data : [];
            setSessions(normalized);
        } catch (err) {
            setSessions([]);
            showError(err.message || t('attendance.loadSessionsFailed'));
        } finally {
            setIsLoadingSessions(false);
        }
    }, []);

    const loadAttendanceReport = useCallback(async (sessionId) => {
        if (!sessionId) { setReport(null); return; }
        setIsLoadingReport(true);
        setSelectedSessionId(sessionId);
        try {
            const data = await fetchSessionAttendance(sessionId);
            setReport(data);
        } catch (err) {
            showError(err.message || t('attendance.loadAttendanceFailed'));
            setReport(null);
        } finally {
            setIsLoadingReport(false);
        }
    }, []);

    useEffect(() => {
        loadClasses();
    }, [loadClasses]);

    useEffect(() => {
        loadSessions(selectedClassId);
    }, [selectedClassId, loadSessions]);

    useEffect(() => {
        if (sessionInUrl) {
            loadAttendanceReport(sessionInUrl);
        } else {
            setSelectedSessionId(null);
            setReport(null);
            loadSessions(selectedClassId);
        }
    }, [sessionInUrl, loadAttendanceReport, loadSessions, selectedClassId]);

    const handleCreateSession = async () => {
        if (!newSession.topic.trim()) {
            showError(t('attendance.sessionTitleRequired'));
            return;
        }
        if (!selectedClassId) {
            showError(t('attendance.selectClassFirst'));
            return;
        }
        setCreatingSession(true);
        try {
            const topic = newSession.description.trim()
                ? `${newSession.topic.trim()} - ${newSession.description.trim()}`
                : newSession.topic.trim();
            const now = new Date();
            const timeString = now.toTimeString().slice(0, 8);
            const payload = {
                classId: Number(selectedClassId),
                date: now.toISOString(),
                topic,
                startTime: timeString,
            };
            const created = await createSession(payload);
            setIsCreateSessionOpen(false);
            setNewSession({ topic: "", description: "" });
            navigate(`/instructor/courses/${courseId}/attendance/${created.sessionId}`, { replace: true });
        } catch (err) {
            showError(err.message || t('attendance.createSessionFailed'));
        } finally {
            setCreatingSession(false);
        }
    };

    const stopScanner = async () => {
        setScanning(false);
        processingScanRef.current = false;
        if (qrScannerRef.current) {
            try {
                qrScannerRef.current.stop();
                qrScannerRef.current.destroy();
            } catch {
            }
            qrScannerRef.current = null;
        }
    };

    const startScanner = async () => {
        if (!selectedSessionId) {
            showError(t('attendance.selectSessionToScan'));
            return;
        }
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            showError(t('attendance.cameraNotAvailable'));
            return;
        }

        await stopScanner();
        const videoEl = qrContainerRef.current;
        if (!videoEl) return;

        try {
            const qrScanner = new QrScanner(
                videoEl,
                async (result) => {
                    if (processingScanRef.current) return;
                    processingScanRef.current = true;
                    try {
                        await handleScanned(result.data);
                    } finally {
                        setTimeout(() => { processingScanRef.current = false; }, 1500);
                    }
                },
                {
                    onDecodeError: () => {},
                    highlightScanRegion: true,
                    highlightCodeOutline: true,
                    preferredCamera: "environment",
                    maxScansPerSecond: 30,
                    returnDetailedScanResult: true,
                }
            );
            qrScannerRef.current = qrScanner;
            setScanning(true);
            await qrScanner.start();
        } catch (err) {
            setScanning(false);
            qrScannerRef.current = null;
            console.error("QR Scanner error:", err);
            showError(err?.message || t('attendance.qrStartFailed'));
        }
    };

    const handleScanned = async (value) => {
        const timestamp = new Date().toLocaleTimeString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' });
        try {
            const result = await scanAttendanceQr({
                sessionId: Number(selectedSessionId),
                qrPayload: String(value),
                status: 0,
            });
            const displayId = result?.studentCode || result?.studentName || value;
            setRecentScans(prev => [{ id: displayId, name: result?.studentName, timestamp, status: 'success' }, ...prev.slice(0, 9)]);
            const data = await fetchSessionAttendance(selectedSessionId);
            setReport(data);
        } catch (err) {
            setRecentScans(prev => [{ id: value, timestamp, status: 'error' }, ...prev.slice(0, 9)]);
            showError(err.message || t('attendance.scanFailed'));
        }
    };

    const submitManualAttendance = async () => {
        if (!selectedSessionId) {             showError(t('attendance.selectSessionFirst')); return; }
        if (!manualId.trim()) {             showError(t('attendance.enterStudentCode')); return; }
        const timestamp = new Date().toLocaleTimeString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' });
        try {
            const result = await recordManualAttendance({
                sessionId: Number(selectedSessionId),
                studentCode: manualId.trim(),
                status: 0,
            });
            const displayId = result?.studentCode || manualId.trim();
            setRecentScans(prev => [{ id: displayId, name: result?.studentName, timestamp, status: 'success' }, ...prev.slice(0, 9)]);
            setManualId('');
            const data = await fetchSessionAttendance(selectedSessionId);
            setReport(data);
            showToast({ title: t('attendance.success'), message: t('attendance.recordSuccess', { name: result?.studentName || manualId.trim() }), type: 'success' });
        } catch (err) {
            showError(err.message || t('attendance.recordFailed'));
        }
    };

    useEffect(() => {
        return () => { stopScanner(); };
    }, []);

    const downloadReport = () => {
        if (!report) return;
        const csvContent = [
            [t('attendance.csvSession') + " " + t('attendance.title')],
            [`${t('attendance.csvSession')}: ${report.topic || t('attendance.na')}`],
            [`${t('attendance.csvDate')}: ${new Date(report.date).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`],
            [`${t('attendance.csvClass')}: ${report.className || t('attendance.na')}`],
            [],
            [t('attendance.csvStudentCode'), t('attendance.csvStudentName'), t('attendance.csvStatus'), t('attendance.csvCheckinTime')],
            ...report.students.map((s) => [
                s.studentCode || t('attendance.na'),
                s.studentName || s.studentFullName || getLocalizedField(s, 'fullName', i18n.language) || s.name || t('attendance.na'),
                s.status === "NotRecorded" ? t('attendance.notRecorded') : s.status,
                s.checkInTime ? new Date(s.checkInTime).toLocaleTimeString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' }) : "—",
            ]),
        ].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `session_${report.sessionId}_attendance.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isLoadingClasses) return <CourseAttendanceSkeleton />;

    // ─── SESSION DETAIL VIEW ───
    if (sessionInUrl) {
        if (isLoadingReport) return <CourseAttendanceDetailSkeleton />;
        if (!report) return <p className="text-sm text-text-danger-default-light dark:text-text-danger-default-dark">{t('attendance.noData')}</p>;

        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(`/instructor/courses/${courseId}/attendance`)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-primary-default-light bg-bg-surface-secondary-default-light text-icon-secondary-default-light transition-colors hover:bg-bg-surface-secondary-hover-light dark:border-border-primary-default-dark dark:bg-bg-surface-secondary-default-dark dark:text-icon-secondary-default-dark dark:hover:bg-bg-surface-secondary-hover-dark"
                            aria-label={t('attendance.backToSessions')}
                        >
                            <AngleDownIcon className={`h-4 w-4 ${i18n.language === 'ar' ? '-rotate-90' : 'rotate-90'}`} />
                        </button>
                        <h2 className="text-xl font-bold text-text-primary-default-light dark:text-text-primary-default-dark">{t('attendance.attendanceReport')}</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        {!isInactive && (
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setIsAttendanceOpen(true)}
                                startIcon={<QRCodeIcon size={16} />}
                            >
                                <span className="hidden sm:inline">{t('attendance.takeAttendance')}</span>
                            </Button>
                        )}
                        <Button type="button" variant="secondary" onClick={downloadReport} startIcon={<DownloadIcon size={18} />}><span className="hidden sm:inline">{t('attendance.downloadReport')}</span></Button>
                    </div>
                </div>

                {isAttendanceOpen && (
                    <ModelOverlay onClose={() => { setIsAttendanceOpen(false); stopScanner(); setManualId(''); setRecentScans([]); }} maxWidth="max-w-2xl">
                        <div className="relative flex w-full max-h-[90vh] flex-col overflow-hidden rounded-3xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark shadow-[0_32px_80px_-12px_rgba(0,0,0,0.28)]">
                            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border-primary-default-light px-6 py-5 dark:border-border-primary-default-dark">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-bg-fill-primary-default-light dark:bg-bg-fill-primary-default-dark">
                                            <QRCodeIcon className="h-6 w-6 text-text-accent-default-light dark:text-text-accent-default-dark" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-text-primary-default-light dark:text-text-primary-default-dark">{t('attendance.takeAttendance')}</h3>
                                            <p className="mt-1 text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('attendance.takeAttendanceDesc')}</p>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => { setIsAttendanceOpen(false); stopScanner(); setManualId(''); setRecentScans([]); }}
                                    className="rounded-lg border border-border-primary-default-light bg-bg-surface-secondary-default-light p-2.5 text-icon-secondary-default-light transition-colors hover:bg-bg-surface-secondary-hover-light dark:border-border-primary-default-dark dark:bg-bg-surface-secondary-default-dark dark:text-icon-secondary-default-dark dark:hover:bg-bg-surface-secondary-hover-dark"
                                    aria-label={t('ui:header.close')}
                                >
                                    <XIcon className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto px-6 py-6">
                                <div className="mb-6 flex border-b border-border-primary-default-light dark:border-border-primary-default-dark">
                                    <button
                                        type="button"
                                        onClick={() => { setScanTab("qr"); }}
                                        className={`relative flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors ${
                                            scanTab === "qr"
                                                ? "text-text-accent-default-light dark:text-text-accent-default-dark"
                                                : "text-text-secondary-default-light hover:text-text-primary-default-light dark:text-text-secondary-default-dark dark:hover:text-text-primary-default-dark"
                                        }`}
                                    >
                                        <QRCodeIcon className="h-4 w-4" />
                                        <span>{t('attendance.qrScanner')}</span>
                                        {scanTab === "qr" && (
                                            <span className="absolute bottom-0 start-0 end-0 h-0.5 bg-text-accent-default-light dark:bg-text-accent-default-dark rounded-full" />
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setScanTab("manual"); stopScanner(); }}
                                        className={`relative flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors ${
                                            scanTab === "manual"
                                                ? "text-text-accent-default-light dark:text-text-accent-default-dark"
                                                : "text-text-secondary-default-light hover:text-text-primary-default-light dark:text-text-secondary-default-dark dark:hover:text-text-primary-default-dark"
                                        }`}
                                    >
                                        <UsersIcon className="h-4 w-4" />
                                        <span>{t('attendance.manualEntry')}</span>
                                        {scanTab === "manual" && (
                                            <span className="absolute bottom-0 start-0 end-0 h-0.5 bg-text-accent-default-light dark:bg-text-accent-default-dark rounded-full" />
                                        )}
                                    </button>
                                </div>

                                {scanTab === "qr" && (
                                    <div className="space-y-5">
                                        <div className="relative overflow-hidden rounded-2xl border border-border-primary-default-light bg-black dark:border-border-primary-default-dark" style={{ height: "clamp(320px, 52vh, 480px)" }}>
                                            <video ref={qrContainerRef} className="h-full w-full object-cover" />
                                        {!scanning ? (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
                                                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-white/20 bg-white/10">
                                                    <QRCodeIcon className="h-10 w-10 text-white/80" />
                                                </div>
                                                <p className="mt-5 text-sm font-medium text-white/80">{t('attendance.cameraOff')}</p>
                                                <p className="mt-1 text-xs text-white/50">{t('attendance.cameraInstruction')}</p>
                                            </div>
                                            ) : (
                                                <div className="absolute bottom-4 start-1/2 -translate-x-1/2">
                                                    <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-medium text-white/70 backdrop-blur-sm">
                                                        <span className="h-2 w-2 animate-ping rounded-full bg-green-400" />
                                                        <span className="h-2 w-2 -ms-4 rounded-full bg-green-500" />
                                                        {t('attendance.scanning')}
                                                        <div className="ms-2 flex items-center gap-1">
                                                            <span className="inline-block h-1 w-1 rounded-full bg-white/50 animate-bounce" />
                                                            <span className="inline-block h-1 w-1 rounded-full bg-white/50 animate-bounce delay-75" />
                                                            <span className="inline-block h-1 w-1 rounded-full bg-white/50 animate-bounce delay-150" />
                                                        </div>
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-3">
                                            <Button
                                                type="button"
                                                variant={scanning ? "secondary" : "primary"}
                                                onClick={() => startScanner()}
                                                disabled={scanning}
                                                className="flex-1"
                                                startIcon={!scanning ? <QRCodeIcon size={16} /> : undefined}
                                            >
                                                {scanning ? t('attendance.scannerRunning') : t('attendance.startScanner')}
                                            </Button>
                                            {scanning && (
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    onClick={stopScanner}
                                                    className="flex-1"
                                                >
                                                    {t('attendance.stopScanner')}
                                                </Button>
                                            )}
                                        </div>

                                        {recentScans.length > 0 && (
                                            <div className="space-y-3 border-t border-border-primary-default-light pt-4 dark:border-border-primary-default-dark">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
                                                        {t('attendance.recentScans')}
                                                    </h4>
                                                    <span className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                                        {t('attendance.recordedCount', { count: recentScans.filter(s => s.status === 'success').length })}
                                                    </span>
                                                </div>
                                                <div className="max-h-44 space-y-2 overflow-y-auto pe-1">
                                                    {recentScans.map((scan, idx) => (
                                                        <div
                                                            key={idx}
                                                            className={`flex items-center justify-between rounded-xl border px-4 py-2.5 transition-all ${
                                                                scan.status === "success"
                                                                    ? "border-border-success-default-light bg-bg-surface-green-default-light/15 dark:border-border-success-default-dark dark:bg-bg-surface-green-default-dark/15"
                                                                    : "border-border-danger-default-light bg-bg-surface-red-default-light/15 dark:border-border-danger-default-dark dark:bg-bg-surface-red-default-dark/15"
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                                                                    scan.status === "success"
                                                                        ? "bg-bg-surface-green-default-light text-text-success-default-light dark:bg-bg-surface-green-default-dark dark:text-text-success-default-dark"
                                                                        : "bg-bg-surface-red-default-light text-text-danger-default-light dark:bg-bg-surface-red-default-dark dark:text-text-danger-default-dark"
                                                                }`}>
                                                                    {scan.status === "success" ? "\u2713" : "\u2717"}
                                                                </div>
                                                                <div className="min-w-0">
                                                                        <p className="truncate font-mono text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{scan.id}</p>
                                                                        {scan.name && (
                                                                            <p className="truncate text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">{scan.name}</p>
                                                                        )}
                                                                        <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">{scan.timestamp}</p>
                                                                    </div>
                                                            </div>
                                                            <span className={`shrink-0 text-[11px] font-semibold uppercase tracking-wide ${
                                                                scan.status === "success"
                                                                    ? "text-text-success-default-light dark:text-text-success-default-dark"
                                                                    : "text-text-danger-default-light dark:text-text-danger-default-dark"
                                                            }`}>
                                                                {scan.status === "success" ? t('attendance.done') : t('attendance.error')}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {scanTab === "manual" && (
                                    <div className="space-y-5">
                                        <div className="rounded-2xl border border-border-primary-default-light bg-bg-surface-secondary-default-light p-5 dark:border-border-primary-default-dark dark:bg-bg-surface-secondary-default-dark">
                                            <label className="mb-3 block text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
                                                {t('attendance.studentIdLabel')}
                                            </label>
                                            <div className="flex flex-col gap-2 sm:flex-row">
                                                <input
                                                    type="text"
                                                    value={manualId}
                                                    onChange={(e) => setManualId(e.target.value)}
                                                    onKeyDown={(e) => e.key === "Enter" && submitManualAttendance()}
                                                    placeholder={t('attendance.studentIdPlaceholder')}
                                                    className="w-full rounded-xl border border-border-primary-default-light bg-bg-surface-primary-default-light px-4 py-3 text-sm text-text-primary-default-light placeholder-text-secondary-default-light transition-all focus:border-border-accent-default-light focus:outline-none focus:ring-2 focus:ring-border-accent-default-light/20 dark:focus:ring-border-accent-default-dark/20 dark:border-border-primary-default-dark dark:bg-bg-surface-primary-default-dark dark:text-text-primary-default-dark dark:placeholder-text-secondary-default-dark dark:focus:border-border-accent-default-dark sm:flex-1"
                                                    autoFocus
                                                />
                                                <Button
                                                    type="button"
                                                    variant="primary"
                                                    onClick={submitManualAttendance}
                                                    disabled={!manualId.trim()}
                                                    className="w-full sm:w-fit"
                                                >
                                                    {t('attendance.record')}
                                                </Button>
                                            </div>
                                            <p className="mt-2 text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                                {t('attendance.manualHint')}
                                            </p>
                                        </div>

                                        {recentScans.length > 0 && (
                                            <div className="space-y-3 border-t border-border-primary-default-light pt-4 dark:border-border-primary-default-dark">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
                                                        {t('attendance.recentEntries')}
                                                    </h4>
                                                    <span className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                                        {t('attendance.recordedCount', { count: recentScans.filter(s => s.status === 'success').length })}
                                                    </span>
                                                </div>
                                                <div className="max-h-44 space-y-2 overflow-y-auto pe-1">
                                                    {recentScans.map((scan, idx) => (
                                                        <div
                                                            key={idx}
                                                            className={`flex items-center justify-between rounded-xl border px-4 py-2.5 transition-all ${
                                                                scan.status === "success"
                                                                    ? "border-border-success-default-light bg-bg-surface-green-default-light/15 dark:border-border-success-default-dark dark:bg-bg-surface-green-default-dark/15"
                                                                    : "border-border-danger-default-light bg-bg-surface-red-default-light/15 dark:border-border-danger-default-dark dark:bg-bg-surface-red-default-dark/15"
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                                                                    scan.status === "success"
                                                                        ? "bg-bg-surface-green-default-light text-text-success-default-light dark:bg-bg-surface-green-default-dark dark:text-text-success-default-dark"
                                                                        : "bg-bg-surface-red-default-light text-text-danger-default-light dark:bg-bg-surface-red-default-dark dark:text-text-danger-default-dark"
                                                                }`}>
                                                                    {scan.status === "success" ? "\u2713" : "\u2717"}
                                                                </div>
                                                                <div className="min-w-0">
                                                                        <p className="truncate font-mono text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{scan.id}</p>
                                                                        {scan.name && (
                                                                            <p className="truncate text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">{scan.name}</p>
                                                                        )}
                                                                        <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">{scan.timestamp}</p>
                                                                    </div>
                                                            </div>
                                                            <span className={`shrink-0 text-[11px] font-semibold uppercase tracking-wide ${
                                                                scan.status === "success"
                                                                    ? "text-text-success-default-light dark:text-text-success-default-dark"
                                                                    : "text-text-danger-default-light dark:text-text-danger-default-dark"
                                                            }`}>
                                                                {scan.status === "success" ? t('attendance.done') : t('attendance.error')}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </ModelOverlay>
                )}

                <h3 className="text-base font-semibold text-text-primary-default-light dark:text-text-primary-default-dark mb-4">{t('attendance.students')}</h3>
                <Table
                    role="instructor"
                    headers={[t('attendance.studentId'), t('attendance.studentName'), t('attendance.status'), t('attendance.checkinTime')]}
                    columnClassNames={["hidden sm:table-cell", "", "", ""]}
                    data={report.students.map(student => ({
                        studentId: <span className="text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark">{ar(student.studentCode)}</span>,
                        studentName: <span className="truncate block text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark max-w-[160px]">{student.studentName || student.studentFullName || getLocalizedField(student, 'fullName', i18n.language) || student.name || t('attendance.unknown')}</span>,
                        status: (() => {
                            let statusColor;
                            let label = student.status;
                            if (student.status === "Present") {
                                statusColor = "bg-bg-surface-green-default-light text-text-success-default-light dark:bg-bg-surface-green-default-dark dark:text-text-success-default-dark";
                                label = t('attendance.present');
                            } else if (student.status === "Absent") {
                                statusColor = "bg-bg-surface-red-default-light text-text-danger-default-light dark:bg-bg-surface-red-default-dark dark:text-text-danger-default-dark";
                                label = t('attendance.absent');
                            } else if (student.status === "NotRecorded") {
                                statusColor = "bg-bg-surface-amber-default-light text-text-warning-default-light dark:bg-bg-surface-amber-default-dark dark:text-text-warning-default-dark";
                                label = t('attendance.notRecorded');
                            } else {
                                statusColor = "bg-bg-surface-secondary-default-light text-text-secondary-default-light dark:bg-bg-surface-secondary-default-dark dark:text-text-secondary-default-dark";
                            }
                            return (
                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusColor}`}>
                                    {label}
                                </span>
                            );
                        })(),
                        checkinTime: <span className="text-sm text-text-primary-default-light dark:text-text-primary-default-dark">
                            {student.checkInTime ? new Date(student.checkInTime).toLocaleTimeString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' }) : "\u2014"}
                        </span>,
                    }))}
                    columnAlignments={["text-start", "text-start", "text-start", "text-center"]}
                    wrapInSection={false}
                    showHeaderActions={false}
                    showPagination={false}
                    showSelectionColumn={false}
                    showActionsColumn={false}
                />
            </div>
        );
    }

    // ─── SESSION LIST VIEW ───
    return (
        <div className="flex flex-col flex-1">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-text-primary-default-light dark:text-text-primary-default-dark">
                    {t('attendance.title')}
                </h2>
                <div className="flex items-center gap-3">
                    {!isInactive && (
                        <Button type="button" variant="primary" onClick={() => setIsCreateSessionOpen(true)} startIcon={<PlusIcon size={18} />}>
                            <span className="hidden sm:inline">{t('attendance.createSession')}</span>
                        </Button>
                    )}
                    <Button type="button" variant="secondary" onClick={() => navigate("excuses")} startIcon={<WarningIcon size={18} />}>
                        <span className="hidden sm:inline">{t('attendance.excuseRequests')}</span>
                    </Button>
                </div>
            </div>

            {/* Class selector */}
            {classes.length > 1 && (
                <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-semibold text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('attendance.classLabel')}:</span>
                    <div className="flex flex-wrap gap-2">
                        {classes.map((cls) => {
                            const cid = cls.classId || cls.id;
                            const isActive = Number(cid) === Number(selectedClassId);
                            const meta = {
                                className: cls.name || cls.className || `Class ${cid}`,
                                classType: cls.classTypeName || cls.classType || cls.type || null,
                            };
                            return (
                                <button
                                    key={cid}
                                    type="button"
                                    onClick={() => {
                                        setSelectedClassId(cid);
                                        navigate(`/instructor/courses/${courseId}/attendance`);
                                    }}
                                    className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
                                        isActive
                                            ? "border-border-accent-default-light bg-bg-fill-primary-default-light text-text-accent-default-light dark:border-border-accent-default-dark dark:bg-bg-fill-primary-default-dark dark:text-text-accent-default-dark"
                                            : "border-border-primary-default-light bg-bg-surface-secondary-default-light text-text-secondary-default-light hover:bg-bg-surface-secondary-hover-light dark:border-border-primary-default-dark dark:bg-bg-surface-secondary-default-dark dark:text-text-secondary-default-dark dark:hover:bg-bg-surface-secondary-hover-dark"
                                    }`}
                                >
                                    {meta.className}
                                    {meta.classType && (
                                        <span className="text-xs opacity-60">{meta.classType}</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {classes.length === 0 ? (
                <div className="flex flex-col flex-1 items-center justify-center min-h-[60vh] text-center">
                    <h2 className="text-lg font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{t('attendance.noClasses')}</h2>
                    <p className="mt-2 text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('attendance.noClassesDesc')}</p>
                </div>
            ) : isLoadingSessions ? (
                <CourseAttendanceSkeleton />
            ) : sessions.length === 0 ? (
                <div className="flex flex-col flex-1 items-center justify-center min-h-[60vh] text-center">
                    <h2 className="text-lg font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{t('attendance.noSessions')}</h2>
                    <p className="mt-2 text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('attendance.noSessionsDesc')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {sessions.map((s) => {
                        const rawSessionType = String(s.sessionType || "Lecture");
                        const sessionType = translateSessionType(t, rawSessionType);
                        const typeStyles = getClassTypeStyles(rawSessionType);

                        const sessionDate = s.date
                            ? new Date(s.date).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                            : t('attendance.unknownDate');

                        return (
                            <button
                                key={s.sessionId}
                                type="button"
                                onClick={() => {
                                    navigate(`/instructor/courses/${courseId}/attendance/${s.sessionId}`, { replace: true });
                                }}
                                className="group relative overflow-hidden rounded-3xl border border-border-primary-default-light bg-bg-surface-primary-default-light text-start shadow-sm shadow-shadow-light transition-all duration-300 hover:-translate-y-1 hover:border-border-accent-default-light hover:shadow-xl focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-border-accent-default-light/20 dark:focus:ring-border-accent-default-dark/20 dark:border-border-primary-default-dark dark:bg-bg-surface-primary-default-dark dark:shadow-shadow-dark dark:hover:border-border-accent-default-dark"
                            >
                                <div className={`absolute inset-x-0 top-0 h-1 bg-linear-to-r ${typeStyles.accent}`} />
                                <div className="flex h-full flex-col p-5">
                                    <div className="flex flex-1 flex-col items-start justify-between gap-3">
                                        <div className="flex w-full items-start justify-between gap-3">
                                            <div className="space-y-3">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {s.className ? (
                                                        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${typeStyles.pill}`}>
                                                            {ar(s.className)}
                                                        </span>
                                                    ) : null}
                                                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${typeStyles.badge}`}>
                                                        {sessionType}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold tracking-tight text-text-primary-default-light dark:text-text-primary-default-dark">
                                                        {ar((s.topic?.includes(" - ") ? s.topic.split(" - ")[0] : s.topic) || t('attendance.untitled'))}
                                                    </h3>
                                                    {s.topic?.includes(" - ") && (
                                                        <p className="mt-1 text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                                            {ar(s.topic.split(" - ").slice(1).join(" - "))}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-bg-surface-secondary-default-light text-text-accent-default-light transition-transform duration-300 group-hover:translate-x-1 dark:bg-bg-surface-secondary-default-dark dark:text-text-accent-default-dark">
                                                <QRCodeIcon className="h-5 w-5" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 grid grid-cols-2 gap-2">
                                        <div className="flex items-center gap-2 rounded-2xl border border-border-primary-default-light bg-bg-fill-secondary-default-light px-3 py-2.5 dark:border-border-primary-default-dark dark:bg-bg-fill-secondary-default-dark">
                                            <CalendarIcon className="h-4 w-4 shrink-0 text-text-accent-default-light dark:text-text-accent-default-dark" />
                                            <div className="min-w-0">
                                                <p className="text-xs font-medium uppercase tracking-[0.18em] text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('attendance.date')}</p>
                                                <p className="truncate text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{sessionDate}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 rounded-2xl border border-border-primary-default-light bg-bg-fill-secondary-default-light px-3 py-2.5 dark:border-border-primary-default-dark dark:bg-bg-fill-secondary-default-dark">
                                            <ClockIcon className="h-4 w-4 shrink-0 text-text-accent-default-light dark:text-text-accent-default-dark" />
                                            <div className="min-w-0">
                                                <p className="text-xs font-medium uppercase tracking-[0.18em] text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('attendance.time')}</p>
                                                <p className="truncate text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
                                                    {s.startTime
                                                        ? `${localizeTime(s.startTime)}${s.endTime ? ` - ${localizeTime(s.endTime)}` : ""}`
                                                        : "\u2014"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between rounded-2xl border border-border-primary-default-light bg-bg-fill-secondary-default-light px-4 py-2.5 dark:border-border-primary-default-dark dark:bg-bg-fill-secondary-default-dark">
                                        <div className="flex items-center gap-2">
                                            <UsersIcon className="h-4 w-4 text-text-accent-default-light dark:text-text-accent-default-dark" />
                                            <span className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
                                                {ar(s.presentCount ?? 0)} / {ar(s.totalStudents ?? 0)}
                                            </span>
                                            {s.totalStudents > 0 && (
                                                <div className="h-2 w-20 overflow-hidden rounded-full bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark">
                                                    <div
                                                        className="h-full rounded-full bg-text-accent-default-light transition-all duration-300 dark:bg-text-accent-default-dark"
                                                        style={{ width: `${Math.round((s.presentCount / s.totalStudents) * 100)}%` }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-accent-default-light dark:text-text-accent-default-dark">
                            <span className="hidden sm:inline">{t('attendance.takeAttendance')}</span>
                                            <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:scale-x-[-1]" />
                                        </span>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {isCreateSessionOpen && (
                <ModelOverlay onClose={() => { setIsCreateSessionOpen(false); setNewSession({ topic: "", description: "" }); }} maxWidth="max-w-lg">
                    <div className="relative w-full overflow-hidden rounded-3xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark shadow-[0_32px_80px_-12px_rgba(0,0,0,0.28)]">
                        <div className="flex items-center justify-between gap-4 border-b border-border-primary-default-light px-6 py-5 dark:border-border-primary-default-dark">
                            <h3 className="text-xl font-bold text-text-primary-default-light dark:text-text-primary-default-dark">{t('attendance.createSession')}</h3>
                            <button
                                type="button"
                                onClick={() => { setIsCreateSessionOpen(false); setNewSession({ topic: "", description: "" }); }}
                                className="rounded-lg border border-border-primary-default-light bg-bg-surface-secondary-default-light p-2.5 text-icon-secondary-default-light transition-colors hover:bg-bg-surface-secondary-hover-light dark:border-border-primary-default-dark dark:bg-bg-surface-secondary-default-dark dark:text-icon-secondary-default-dark dark:hover:bg-bg-surface-secondary-hover-dark"
                                aria-label={t('ui:header.close')}
                            >
                                <XIcon className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="px-6 py-6 space-y-4">
                            {classes.length > 1 && (
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{t('attendance.classLabel')} *</label>
                                    <select
                                        value={selectedClassId ?? ""}
                                        onChange={(e) => setSelectedClassId(Number(e.target.value))}
                                        className="w-full rounded-xl border border-border-primary-default-light bg-bg-surface-secondary-default-light px-4 py-3 text-sm text-text-primary-default-light focus:border-border-accent-default-light focus:outline-none focus:ring-2 focus:ring-border-accent-default-light/20 dark:focus:ring-border-accent-default-dark/20 dark:border-border-primary-default-dark dark:bg-bg-surface-secondary-default-dark dark:text-text-primary-default-dark dark:focus:border-border-accent-default-dark"
                                    >
                                        {classes.map((cls) => (
                                            <option key={cls.classId || cls.id} value={cls.classId || cls.id}>
                                                {cls.name || cls.className || `Class ${cls.classId || cls.id}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{t('attendance.sessionTitle')} *</label>
                                <input
                                    type="text"
                                    value={newSession.topic}
                                    onChange={(e) => setNewSession((prev) => ({ ...prev, topic: e.target.value }))}
                                    placeholder={t('attendance.sessionTitlePlaceholder')}
                                    className="w-full rounded-xl border border-border-primary-default-light bg-bg-surface-secondary-default-light px-4 py-3 text-sm text-text-primary-default-light focus:border-border-accent-default-light focus:outline-none focus:ring-2 focus:ring-border-accent-default-light/20 dark:focus:ring-border-accent-default-dark/20 dark:border-border-primary-default-dark dark:bg-bg-surface-secondary-default-dark dark:text-text-primary-default-dark dark:focus:border-border-accent-default-dark"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{t('attendance.sessionDescription')}</label>
                                <textarea
                                    value={newSession.description}
                                    onChange={(e) => setNewSession((prev) => ({ ...prev, description: e.target.value }))}
                                    placeholder={t('attendance.sessionDescriptionPlaceholder')}
                                    rows={3}
                                    className="w-full rounded-xl border border-border-primary-default-light bg-bg-surface-secondary-default-light px-4 py-3 text-sm text-text-primary-default-light focus:border-border-accent-default-light focus:outline-none focus:ring-2 focus:ring-border-accent-default-light/20 dark:focus:ring-border-accent-default-dark/20 dark:border-border-primary-default-dark dark:bg-bg-surface-secondary-default-dark dark:text-text-primary-default-dark dark:focus:border-border-accent-default-dark"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <Button type="button" variant="secondary" onClick={() => { setIsCreateSessionOpen(false); setNewSession({ topic: "", description: "" }); }}>{t('attendance.cancel')}</Button>
                                <Button type="button" variant="primary" onClick={handleCreateSession} disabled={creatingSession}>
                                    {creatingSession ? t('attendance.creating') : t('attendance.createSession')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </ModelOverlay>
            )}
        </div>
    );
}
