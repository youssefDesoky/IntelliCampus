import { useTranslation } from 'react-i18next';

const STATUS_CONFIG = {
  online:  { color: "bg-emerald-400" },
};

export default function ChatUser({ user, onClick }) {
  const { t } = useTranslation('chat');
  const status = STATUS_CONFIG[user.status] ?? null;
  const unread = user.unread || 0;

  return (
    <div
      onClick={() => onClick?.(user)}
      className="
        group flex items-center gap-3 px-2 py-2 rounded-xl
        transition-all duration-200
        hover:bg-[var(--surface-hover)] active:bg-[var(--surface-active)]
      "
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {user.avatar ? (
          <img
            className="w-9 h-9 rounded-full object-cover ring-2 ring-[var(--border-subtle)]"
            src={user.avatar}
            alt={user.name}
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center ring-2 ring-[var(--border-subtle)]">
            <svg className="w-5 h-5 text-gray-500 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}

        {/* Status dot */}
        {status && (
          <span
            title={t('online')}
            className={`
              absolute -bottom-0.5 -end-0.5
              w-3 h-3 rounded-full ${status.color}
              border-2 border-[var(--bg-card,#1e2a3a)]
              transition-transform duration-200 group-hover:scale-110
            `}
          />
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[var(--text-primary)] truncate leading-tight">
          {user.name}
        </p>
        {status && (
          <p className="text-xs text-[var(--text-tertiary)] truncate leading-tight mt-0.5">
            {t('online')}
          </p>
        )}
      </div>

      {/* Unread badge */}
      {unread > 0 && (
        <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-blue-600 text-white text-[11px] font-bold leading-none shrink-0">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </div>
  );
}