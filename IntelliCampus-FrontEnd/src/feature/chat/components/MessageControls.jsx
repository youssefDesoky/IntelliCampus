import { useState } from "react";
import { useTranslation } from 'react-i18next';
import {
  CopyIcon,
  CheckIcon,
  PenSquareIcon,
  PinIcon,
  UnPinIcon,
  TrashIcon,
} from "../../../components/ui/icons";

export default function MessageControls({
  onCopy,
  onEdit,
  onPin,
  onDelete,
  isPinned = false,
  isOwn = false,
}) {
  const { t } = useTranslation('chat');
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    onCopy?.();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <menu
      className="absolute end-0 w-44 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-xl shadow-lg z-50 py-1.5 flex flex-col m-0 p-0 shadow-gray-200/50 dark:shadow-black/20"
      role="menu"
    >
      <li role="none">
        <button
          onClick={handleCopy}
          role="menuitem"
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors text-start"
        >
          {copied ? (
            <CheckIcon size={16} className="text-green-500" />
          ) : (
            <CopyIcon size={16} />
          )}
          {copied ? t('copied') : t('copy')}
        </button>
      </li>
      {isOwn && <>
        <li role="none">
          <button
            onClick={onEdit}
            role="menuitem"
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors text-start"
          >
            <PenSquareIcon size={16} />
            {t('edit')}
          </button>
        </li>
        <li role="none">
          <button
            onClick={onPin}
            role="menuitem"
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors text-start"
          >
            {isPinned ? (
              <UnPinIcon size={16} className="text-gray-500" />
            ) : (
              <PinIcon size={16} className="text-gray-500" />
            )}
            {isPinned ? t('unpin') : t('pin')}
          </button>
        </li>
        {/* Divider */}
        <li role="none" className="my-1.5 border-t border-gray-100 dark:border-gray-700/80" />
        <li role="none">
          <button
            onClick={onDelete}
            role="menuitem"
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-start group"
          >
            <TrashIcon size={16} className="text-red-500 dark:text-red-400 group-hover:text-red-600" />
            {t('delete')}
          </button>
        </li>
      </>}
    </menu>
  );
}