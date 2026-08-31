import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

import Button from "../../../components/ui/Button";
import { ClockIcon, SandClockIcon, CheckIcon, PenSquareIcon, XIcon } from "../../../components/ui/icons";

const MINUTE = 60;

const PRESETS = [5, 10, 15, 25, 30, 45, 60];

export default function StudyTimer({className}) {
    const { t } = useTranslation('student');
    const [studyDuration, setStudyDuration] = useState(25 * MINUTE);
    const [breakDuration, setBreakDuration] = useState(5 * MINUTE);
    const [mode, setMode] = useState('focus');
    const [currTime, setCurrTime] = useState(25 * MINUTE);
    const [isRunning, setIsRunning] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [editStudy, setEditStudy] = useState(25);
    const [editBreak, setEditBreak] = useState(5);
    const intervalRef = useRef(null);

    const duration = mode === 'focus' ? studyDuration : breakDuration;
    const strokeOffset = duration > 0 ? ((duration - currTime) / duration) * 336 : 0;

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') setIsMenuOpen(false);
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    useEffect(() => {
        return () => clearInterval(intervalRef.current);
    }, []);

    useEffect(() => {
        if (currTime === 0) {
            const nextMode = mode === 'focus' ? 'break' : 'focus';
            const nextDuration = nextMode === 'focus' ? studyDuration : breakDuration;
            setMode(nextMode);
            setCurrTime(nextDuration);
        }
    }, [currTime]);

    const tick = () => {
        setCurrTime(prev => {
            if (prev <= 1) {
                clearInterval(intervalRef.current);
                setIsRunning(false);
                return 0;
            }
            return prev - 1;
        });
    };

    const handleStart = () => {
        if (isRunning) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
        } else {
            if (currTime <= 0) return;
            setIsRunning(true);
            tick();
            intervalRef.current = setInterval(tick, 1000);
        }
    };

    const applySettings = () => {
        const newStudy = Math.max(1, editStudy) * MINUTE;
        const newBreak = Math.max(1, editBreak) * MINUTE;
        setStudyDuration(newStudy);
        setBreakDuration(newBreak);
        clearInterval(intervalRef.current);
        setIsRunning(false);
        setMode('focus');
        setCurrTime(newStudy);
        setIsMenuOpen(false);
    };

    const openMenu = () => {
        setEditStudy(Math.floor(studyDuration / MINUTE));
        setEditBreak(Math.floor(breakDuration / MINUTE));
        setIsMenuOpen(prev => !prev);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`p-6 bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark rounded-lg flex flex-col justify-between ${className}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">{t("dashboard.studyTimer")}</h2>
          </div>
          {isMenuOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px]"
              onClick={(e) => { if (e.target === e.currentTarget) setIsMenuOpen(false); }}
            >
              <div className="w-full max-w-sm rounded-xl bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark shadow-2xl p-4">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-border-primary-default-light dark:border-border-primary-default-dark">
                  <h3 className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{t("dashboard.timerSettings")}</h3>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-1 rounded-md hover:bg-bg-fill-tertiary-hover-light dark:hover:bg-bg-fill-tertiary-hover-dark transition-colors"
                  >
                    <XIcon className="w-5 h-5 text-text-secondary-default-light dark:text-text-secondary-default-dark" />
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <ClockIcon className="w-4 h-4 text-text-accent-default-light dark:text-text-accent-default-dark" />
                      <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary-default-light dark:text-text-secondary-default-dark">{t("dashboard.studyTime")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditStudy(prev => Math.max(1, prev - 1))}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark hover:bg-bg-fill-tertiary-hover-light dark:hover:bg-bg-fill-tertiary-hover-dark transition-colors text-text-primary-default-light dark:text-text-primary-default-dark text-lg font-medium"
                      >
                        –
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={editStudy}
                        onChange={e => setEditStudy(Math.max(1, Number(e.target.value)))}
                        className="flex-1 text-center px-2 py-1.5 rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark text-sm font-medium [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                      <button
                        onClick={() => setEditStudy(prev => prev + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark hover:bg-bg-fill-tertiary-hover-light dark:hover:bg-bg-fill-tertiary-hover-dark transition-colors text-text-primary-default-light dark:text-text-primary-default-dark text-lg font-medium"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {PRESETS.map(p => (
                        <button
                          key={p}
                          onClick={() => setEditStudy(p)}
                          className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                            editStudy === p
                              ? 'border-text-accent-default-light dark:border-text-accent-default-dark bg-text-accent-default-light/10 dark:bg-text-accent-default-dark/10 text-text-accent-default-light dark:text-text-accent-default-dark'
                              : 'border-border-primary-default-light dark:border-border-primary-default-dark hover:bg-bg-fill-tertiary-hover-light dark:hover:bg-bg-fill-tertiary-hover-dark text-text-secondary-default-light dark:text-text-secondary-default-dark'
                          }`}
                        >
                          {p}m
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-border-primary-default-light dark:border-border-primary-default-dark pt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <SandClockIcon className="w-4 h-4 text-text-accent-default-light dark:text-text-accent-default-dark" />
                      <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary-default-light dark:text-text-secondary-default-dark">{t("dashboard.breakTime")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditBreak(prev => Math.max(1, prev - 1))}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark hover:bg-bg-fill-tertiary-hover-light dark:hover:bg-bg-fill-tertiary-hover-dark transition-colors text-text-primary-default-light dark:text-text-primary-default-dark text-lg font-medium"
                      >
                        –
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={editBreak}
                        onChange={e => setEditBreak(Math.max(1, Number(e.target.value)))}
                        className="flex-1 text-center px-2 py-1.5 rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark text-sm font-medium [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                      <button
                        onClick={() => setEditBreak(prev => prev + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark hover:bg-bg-fill-tertiary-hover-light dark:hover:bg-bg-fill-tertiary-hover-dark transition-colors text-text-primary-default-light dark:text-text-primary-default-dark text-lg font-medium"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {PRESETS.map(p => (
                        <button
                          key={p}
                          onClick={() => setEditBreak(p)}
                          className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                            editBreak === p
                              ? 'border-text-accent-default-light dark:border-text-accent-default-dark bg-text-accent-default-light/10 dark:bg-text-accent-default-dark/10 text-text-accent-default-light dark:text-text-accent-default-dark'
                              : 'border-border-primary-default-light dark:border-border-primary-default-dark hover:bg-bg-fill-tertiary-hover-light dark:hover:bg-bg-fill-tertiary-hover-dark text-text-secondary-default-light dark:text-text-secondary-default-dark'
                          }`}
                        >
                          {p}m
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={applySettings}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark text-text-accent-active-light dark:text-text-accent-active-dark text-sm font-semibold hover:bg-bg-surface-accent-hover-light dark:hover:bg-bg-surface-accent-hover-dark transition-colors"
                  >
                    <CheckIcon className="w-4 h-4" />
                    {t("dashboard.apply")}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="relative w-48 h-48 mx-auto mb-4">
            <svg viewBox="0 0 100 100" className="w-full h-full rotate-90">
              <rect x="8" y="8" width="84" height="84" rx="10" ry="10" fill="none" stroke="currentColor" strokeWidth="8" className="text-text-tertiary-default-light dark:text-text-tertiary-default-dark" />
              <rect x="8" y="8" width="84" height="84" rx="10" ry="10" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="336" strokeDashoffset={strokeOffset} strokeLinecap="round" className="text-text-accent-default-light dark:text-text-accent-default-dark transition-all duration-500" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-5xl font-bold">{formatTime(currTime)}</p>
              <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">
                {mode === 'focus' ? t("dashboard.focusMode") : t("dashboard.breakMode")}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 border-t pt-4 border-border-primary-default-light dark:border-border-primary-default-dark">
            <Button
              variant="secondary"
              onClick={openMenu}
            >
              <PenSquareIcon className="w-4 h-4" />
              {t("dashboard.edit")}
            </Button>
            <Button 
              className="bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark text-text-accent-active-light dark:text-text-accent-active-dark px-4 py-2 flex-1 rounded-lg hover:bg-bg-surface-accent-hover-light dark:hover:bg-bg-surface-accent-hover-dark transition duration-200"
              onClick={handleStart}
            >
              {isRunning ? t("dashboard.pause") : t("dashboard.start")}
            </Button>
          </div>
        </div>
    );
}
