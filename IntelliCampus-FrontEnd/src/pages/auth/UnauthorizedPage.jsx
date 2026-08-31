import { useTranslation } from 'react-i18next';
import { Link } from "react-router-dom";

export default function UnauthorizedPage() {
    const { t } = useTranslation('auth');
    return (
        <div className="min-h-screen overflow-hidden bg-bg-light dark:bg-bg-dark px-4 py-6 sm:px-6 lg:px-8">
            <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl items-center justify-center">

                <div className="relative grid w-full overflow-hidden rounded-4xl border border-border-primary-default-light/80 bg-bg-surface-primary-default-light/90 shadow-2xl backdrop-blur dark:border-border-primary-default-dark/80 dark:bg-bg-surface-primary-default-dark/90 lg:grid-cols-[1.05fr_0.95fr]">
                    <div className="pointer-events-none absolute inset-0 rounded-4xl bg-linear-to-r/shorter from-bg-surface-primary-default-light/30 to-blue-50/20 dark:from-bg-surface-primary-default-dark/30 dark:to-blue-950/20" />
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
                                        {t('errorPage.401.title')}
                                    </h1>
                                </div>
                            </div>
                            <span className="h-fit inline-flex shrink-0 items-center rounded-full border border-amber-400/30 bg-amber-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-amber-800 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-200">
                                {t('errorPage.401.badge')}
                            </span>
                        </div>

                        <div className="flex flex-col gap-6">
                            <h2 className="max-w-xl font-['Playfair_Display'] text-4xl leading-tight text-text-primary-active-light dark:text-text-primary-active-dark sm:text-5xl">
                                {t('errorPage.401.heading')}
                            </h2>
                            <p className="max-w-xl text-sm leading-7 text-text-secondary-active-light dark:text-text-secondary-active-dark sm:text-base">
                                {t('errorPage.401.description')}
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
                        <img
                            src="/static/images/UnAuthorized-light.png"
                            alt={t('errorPage.401.title')}
                            className="block absolute inset-0 h-full w-full object-cover shadow-2xl dark:hidden"
                        />
                        <img
                            src="/static/images/UnAuthorized-dark.png"
                            alt={t('errorPage.401.title')}
                            className="hidden absolute inset-0 h-full w-full object-cover shadow-2xl dark:block"
                        />
                        <div className="pointer-events-none absolute inset-0 rounded-e-4xl ring-1 ring-black/5 dark:ring-white/10" />
                    </div>
                </div>
            </div>
        </div>
    );
}