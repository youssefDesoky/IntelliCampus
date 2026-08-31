import React from "react";
import { useTranslation } from 'react-i18next';

export default function DefaultChatPanel({ onAddFriend, onCreateGroup, noMembers = false }) {
  const { t } = useTranslation('chat');
  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center bg-gray-50/50 dark:bg-gray-900/50 transition-colors duration-200">
      <div className="max-w-md flex flex-col items-center">
        
        {/* Animated Visual Focal Point */}
        <div className="relative mb-6 group">
          <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-500/10 blur-xl rounded-full group-hover:scale-110 transition-transform duration-500" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 border border-blue-500/20 dark:border-blue-400/30 flex items-center justify-center text-4xl shadow-sm">
            💬
          </div>
        </div>

        {/* Text Typography Hierarchy */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
          {t('welcome.title')}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed mb-8">
          {noMembers
            ? t('welcome.noMembers')
            : t('welcome.selectConversation')
          }
        </p>

        {/* Dynamic Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={() => onAddFriend?.()}
            className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition-all shadow-md shadow-blue-600/10 hover:shadow-blue-600/20 active:scale-[0.98]"
          >
            {t('welcome.addFriend')}
          </button>
          
          <button
            onClick={() => onCreateGroup?.()}
            className="inline-flex items-center justify-center px-5 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium text-sm rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 active:scale-[0.98] transition-all"
          >
            {t('welcome.createGroup')}
          </button>
        </div>

      </div>
    </div>
  );
}