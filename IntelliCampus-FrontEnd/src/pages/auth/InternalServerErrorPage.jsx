import { useTranslation } from 'react-i18next';
import { Link } from "react-router-dom";

function ServerCrashIllustration() {
  return (
    <svg
      viewBox="0 0 400 400"
      className="h-full w-full object-cover"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="serverGradLight" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef2f2" />
          <stop offset="100%" stopColor="#fee2e2" />
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill="url(#serverGradLight)" />
      <rect x="80" y="60" width="240" height="200" rx="16" fill="#ffffff" stroke="#fecaca" strokeWidth="2" />
      <rect x="100" y="80" width="200" height="12" rx="6" fill="#f87171" opacity="0.6" />
      <rect x="100" y="105" width="160" height="8" rx="4" fill="#fca5a5" opacity="0.4" />
      <rect x="100" y="125" width="180" height="8" rx="4" fill="#fca5a5" opacity="0.4" />
      <rect x="100" y="145" width="140" height="8" rx="4" fill="#fca5a5" opacity="0.4" />
      <circle cx="200" cy="210" r="24" fill="#fef2f2" stroke="#ef4444" strokeWidth="3" />
      <text x="200" y="218" textAnchor="middle" fill="#ef4444" fontSize="24" fontWeight="bold" fontFamily="monospace">!</text>

      <rect x="140" y="280" width="120" height="40" rx="8" fill="#fecaca" opacity="0.5" />
      <rect x="150" y="292" width="30" height="16" rx="3" fill="#f87171" opacity="0.4" />
      <rect x="195" y="292" width="30" height="16" rx="3" fill="#f87171" opacity="0.4" />

      <g opacity="0.15">
        <rect x="60" y="340" width="80" height="8" rx="4" fill="#ef4444" />
        <rect x="160" y="340" width="120" height="8" rx="4" fill="#ef4444" />
        <rect x="300" y="340" width="60" height="8" rx="4" fill="#ef4444" />
      </g>
    </svg>
  );
}

export default function InternalServerErrorPage() {
  const { t } = useTranslation('auth');
  return (
    <div className="min-h-screen overflow-hidden bg-bg-light dark:bg-bg-dark px-4 py-6 sm:px-6 lg:px-8">
      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl items-center justify-center">
        <div className="relative grid w-full overflow-hidden rounded-4xl border border-border-primary-default-light/80 bg-bg-surface-primary-default-light/90 shadow-2xl backdrop-blur dark:border-border-primary-default-dark/80 dark:bg-bg-surface-primary-default-dark/90 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="pointer-events-none absolute inset-0 rounded-4xl bg-linear-to-r/shorter from-bg-surface-primary-default-light/30 to-red-50/20 dark:from-bg-surface-primary-default-dark/30 dark:to-red-950/20" />
          <div className="flex flex-col justify-between gap-10 p-6 sm:p-8 lg:p-12">
            <div className="flex flex-row justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src="/static/images/IntelliCampusLogo.png"
                  alt={t('errorPage.logoAlt')}
                  className="h-16 w-16 object-contain sm:h-20 sm:w-20"
                />
                <div className="ms-3">
                  <p className="font-['Source_Sans_3'] text-xs uppercase tracking-[0.35em] text-text-secondary-active-light dark:text-text-secondary-active-dark">
                    IntelliCampus
                  </p>
                  <h1 className="font-['Playfair_Display'] text-2xl font-semibold text-text-primary-active-light dark:text-text-primary-active-dark sm:text-3xl">
                    {t('errorPage.500.title')}
                  </h1>
                </div>
              </div>
              <span className="h-fit inline-flex shrink-0 items-center rounded-full border border-red-400/30 bg-red-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-red-800 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-200">
                {t('errorPage.500.badge')}
              </span>
            </div>

            <div className="flex flex-col gap-6">
              <h2 className="max-w-xl font-['Playfair_Display'] text-4xl leading-tight text-text-primary-active-light dark:text-text-primary-active-dark sm:text-5xl">
                {t('errorPage.500.heading')}
              </h2>
              <p className="max-w-xl text-sm leading-7 text-text-secondary-active-light dark:text-text-secondary-active-dark sm:text-base">
                {t('errorPage.500.description')}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-md border border-border-primary-default-light bg-bg-fill-accent-default-light px-5 py-3 text-sm font-medium text-text-accent-active-light transition-colors hover:bg-bg-fill-primary-hover-light dark:border-border-primary-default-dark dark:bg-bg-fill-accent-default-dark dark:text-text-accent-active-dark dark:hover:bg-bg-fill-primary-hover-dark"
              >
                {t('errorPage.500.goToDashboard')}
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-md border border-border-primary-default-light bg-transparent px-5 py-3 text-sm font-medium text-text-primary-default-light transition-colors hover:bg-bg-fill-primary-hover-light dark:border-border-primary-default-dark dark:text-text-primary-default-dark dark:hover:bg-bg-fill-primary-hover-dark"
              >
                {t('errorPage.500.backToLogin')}
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-e-4xl sm:rounded-e-4xl">
            <div className="block absolute inset-0 h-full w-full object-cover dark:hidden">
              <ServerCrashIllustration />
            </div>
            <div className="hidden absolute inset-0 h-full w-full object-cover dark:block">
              <ServerCrashIllustration />
            </div>
            <div className="pointer-events-none absolute inset-0 rounded-e-4xl ring-1 ring-black/5 dark:ring-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}
