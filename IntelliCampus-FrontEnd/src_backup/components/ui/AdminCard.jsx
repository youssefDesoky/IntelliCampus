import Button from "./Button";
import DropdownMenu from "./DropdownMenu";

export default function AdminCard({
  avatar, // string URL or JSX
  icon,
  title,
  subtitle,
  idLabel, // optional id string to show as `ID: ...`
  status, // { label, tone: 'success'|'warning'|'danger'|'neutral' }
  stats = [], // [{label, value}]
  meta = [],
  footerActions = [],
  menuActions = [],
  accent = "border-s-border-accent-default-light dark:border-s-border-accent-default-dark",
  className = "",
  children,
}) {
  const statusColors = {
    success: 'bg-bg-fill-success-default-light dark:bg-bg-fill-success-default-dark text-text-success-default-light dark:text-text-success-default-dark',
    warning: 'bg-bg-fill-warning-default-light dark:bg-bg-fill-warning-default-dark text-text-warning-default-light dark:text-text-warning-default-dark',
    danger: 'bg-bg-fill-danger-default-light dark:bg-bg-fill-danger-default-dark text-text-danger-default-light dark:text-text-danger-default-dark',
    neutral: 'bg-bg-fill-secondary-default-light dark:bg-bg-fill-secondary-default-dark text-text-secondary-active-light dark:text-text-secondary-active-dark'
  };

  return (
    <div className={`bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-lg ${accent} shadow-sm shadow-shadow-light hover:shadow-lg dark:hover:shadow-shadow-dark transition-shadow p-5 flex flex-col justify-between gap-4 ${className}`}>
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 shrink-0 rounded-full bg-bg-surface-accent-default-light dark:bg-bg-surface-accent-default-dark flex items-center justify-center text-base font-semibold text-text-accent-active-light dark:text-text-accent-active-dark overflow-hidden">
              {avatar ? (typeof avatar === 'string' ? <img src={avatar} alt={title} className="w-full h-full object-cover" /> : avatar) : (icon || <span className="uppercase">{(title || '?').charAt(0)}</span>)}
            </div>

            <div className="min-w-0">
              <div className="flex flex-col">
                  <h3 className="font-semibold text-base leading-tight truncate">{title}</h3>
                  <div className="flex items-center gap-3">
                    {subtitle && <span className="text-xs text-text-secondary-active-light dark:text-text-secondary-active-dark truncate">{subtitle}</span>}
                    {idLabel && <span className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark truncate">ID: {idLabel}</span>}
                  </div>
                </div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            {status && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[status.tone || 'neutral']}`}>
                {status.label}
              </span>
            )}

            {menuActions && menuActions.length > 0 && (
              <div className="relative">
                <DropdownMenu className="p-0" items={menuActions} />
              </div>
            )}
          </div>
        </div>

        {stats && stats.length > 0 && (
          <div className="flex items-center gap-3 mb-3">
            {stats.map((s, i) => (
              <div key={i} className="flex flex-col items-start">
                <span className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{s.value}</span>
                <span className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">{s.label}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-text-secondary-active-light dark:text-text-secondary-active-dark mb-3">
          {meta.map((m, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              {m.icon && <m.icon className="w-4 h-4" />}
              <span className={m.className || ''}>{m.label}</span>
            </div>
          ))}

          {children}
        </div>
      </div>

      {footerActions && footerActions.length > 0 && (
        <div className="flex items-center gap-2 pt-3 border-t border-border-primary-default-light dark:border-border-primary-default-dark">
          {footerActions.map((act, i) => (
            <Button key={i} variant={act.variant || 'secondary'} className={`flex-1 justify-center text-xs px-2 py-1.5 ${act.className || ''}`} onClick={act.onClick}>
              {act.icon && <act.icon className="w-4 h-4" />} {act.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
