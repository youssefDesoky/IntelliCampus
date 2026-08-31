import { useTranslation } from 'react-i18next';
import { PinIcon } from "../../../components/ui/icons";

export default function PinnedMessage({ message }) {
  const { t } = useTranslation('chat');
  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/4 px-3.5 py-3 mb-1">
      {/* Pin icon badge */}
      <div className="flex-shrink-0 mt-0.5 w-7 h-7 rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center">
        <PinIcon size={14} className="text-[var(--primary)]" />
      </div>

      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--primary)]">
          {t('pinned')}
        </span>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed truncate">
          {message}
        </p>
      </div>
    </div>
  );
}