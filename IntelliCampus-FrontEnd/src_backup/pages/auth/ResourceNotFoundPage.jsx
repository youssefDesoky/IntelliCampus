import { useTranslation } from 'react-i18next';
import { Link } from "react-router-dom";

function NotFoundIllustration() {
  return (
    <svg
      viewBox="0 0 400 400"
      className="h-full w-full object-cover"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="notFoundGradLight" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f0f9ff" />
          <stop offset="100%" stopColor="#e0f2fe" />
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill="url(#notFoundGradLight)" />
      <rect x="60" y="60" width="280" height="280" rx="20" fill="#ffffff" stroke="#bae6fd" strokeWidth="2" />

      <text x="200" y="200" textAnchor="middle" fill="#38bdf8" fontSize="120" fontWeight="bold" fontFamily="monospace">
        404
      </text>

      <text x="200" y="250" textAnchor="middle" fill="#94a3b8" fontSize="16" fontFamily="sans-serif">
        Not Found
      </text>

      <rect x="140" y="280" width="120" height="6" rx="3" fill="#e2e8f0" />

      <g opacity="0.1">
        <circle cx="100" cy="100" r="40" fill="#38bdf8" />
        <circle cx="310" cy="310" r="30" fill="#38bdf8" />
        <circle cx="300" cy="80" r="20" fill="#38bdf8" />
        <circle cx="80" cy="320" r="25" fill="#38bdf8" />
      </g>
    </svg>
  );
}

export default function ResourceNotFoundPage() {
  const { t } = useTranslation('auth');
  return (
    <div className="min-h-screen overflow-hidden bg-bg-light dark:bg-bg-dark px-4 py-6 sm:px-6 lg:px-8">
      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl items-center justify-center">
        <div className="relative grid w-full overflow-hidden rounded-4xl border border-border-primary-default-light/80 bg-bg-surface-primary-default-light/90 shadow-2xl backdrop-blur dark:border-border-primary-default-dark/80 dark:bg-bg-surface-primary-default-dark/90 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="pointer-events-none absolute inset-0 rounded-4xl bg-linear-to-r/shorter from-bg-surface-primary-default-light/30 to-sky-50/20 dark:from-bg-surface-primary-default-dark/30 dark:to-sky-950/20" />
          <div className="flex flex-col justify-between gap-10 p-6 sm:p-8 lg:p-12">
            <div className="flex flex-row justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src="/images/IntelliCampusLogo.png"
                  alt={t('errorPage.logoAlt')}
                  className="h-16 w-16 object-contain sm:h-20 sm:w-20"
                />
                <div className="ms-3">
                  <p className="font-['Source_Sans_3'] text-xs uppercase tracking-[0.35em] text-text-secondary-active-light dark:text-text-secondary-active-dark">
                    IntelliCampus
                  </p>
                  <h1 className="font-['Playfair_Display'] text-2xl font-semibold text-text-primary-active-light dark:text-text-primary-active-dark sm:text-3xl">
                    {t('errorPage.404.title')}
                  </h1>
                </div>
              </div>
              <span className="h-fit inline-flex shrink-0 items-center rounded-full border border-sky-400/30 bg-sky-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-sky-800 dark:border-sky-400/20 dark:bg-sky-500/10 dark:text-sky-200">
                {t('errorPage.404.badge')}
              </span>
            </div>

            <div className="flex flex-col gap-6">
              <h2 className="max-w-xl font-['Playfair_Display'] text-4xl leading-tight text-text-primary-active-light dark:text-text-primary-active-dark sm:text-5xl">
                {t('errorPage.404.heading')}
              </h2>
              <p className="max-w-xl text-sm leading-7 text-text-secondary-active-light dark:text-text-secondary-active-dark sm:text-base">
                {t('errorPage.404.description')}
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
              <NotFoundIllustration />
            </div>
            <div className="hidden absolute inset-0 h-full w-full object-cover dark:block">
              <NotFoundIllustration />
            </div>
            <div className="pointer-events-none absolute inset-0 rounded-e-4xl ring-1 ring-black/5 dark:ring-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}
