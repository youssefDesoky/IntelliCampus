import { useTranslation } from 'react-i18next';

export default function BasePanel({ icon, title, onBack, children }) {
  const { t } = useTranslation('chat');
  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 py-3 bg-white dark:bg-gray-800 shrink-0">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center justify-center w-10 h-10 text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-100 transition-all active:scale-90"
            aria-label={t('backToChat')}
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 12L6 8l4-4" />
            </svg>
          </button>
        )}
        <div className="flex items-center gap-2.5 pe-4">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/40">
            {icon}
          </div>
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
            {title}
          </h2>
        </div>
      </div>
      {children}
    </div>
  );
}
