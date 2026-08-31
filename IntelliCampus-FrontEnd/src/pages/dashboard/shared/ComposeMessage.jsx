import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useError } from '../../../contexts/ErrorContext.jsx';
import { sendMessage } from "../../../api/messages";
import { PenSquareIcon, ArrowRightIcon, XIcon } from "../../../components/ui/icons";

export default function ComposeMessage() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const outletContext = useOutletContext() || {};
  const currentUserEmail = outletContext.user?.email ?? "";
  const { showError } = useError();
  const [recipientEmail, setRecipientEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!recipientEmail.trim() || !subject.trim() || !body.trim()) return;
    if (recipientEmail.trim().toLowerCase() === currentUserEmail.toLowerCase()) {
      showError(t('inbox.selfMessage'));
      return;
    }
    setSending(true);
    try {
      await sendMessage({ recipientEmail: recipientEmail.trim(), subject: subject.trim(), body: body.trim() });
      navigate("/inbox");
    } catch (err) {
      showError(err.message || t('inbox.sendFailed'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <PenSquareIcon className="w-6 h-6 text-text-blue-default-light dark:text-text-blue-default-dark" />
          <h1 className="text-2xl font-bold text-text-primary-active-light dark:text-text-primary-active-dark">
            {t('inbox.newMessage')}
          </h1>
        </div>
        <button
          onClick={() => navigate("/inbox")}
          className="p-2 rounded-lg text-text-secondary-default-light dark:text-text-secondary-default-dark hover:bg-bg-fill-primary-hover-light dark:hover:bg-bg-fill-primary-hover-dark transition-colors"
          aria-label={t('close')}
        >
          <XIcon className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSend} className="flex-1 flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary-active-light dark:text-text-secondary-active-dark mb-1">
            {t('compose.recipientEmail')}
          </label>
          <input
            type="email"
            placeholder={t('compose.recipientPlaceholder')}
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark text-text-primary-active-light dark:text-text-primary-active-dark outline-none focus:border-text-blue-default-light dark:focus:border-text-blue-default-dark"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary-active-light dark:text-text-secondary-active-dark mb-1">
            {t('compose.subject')}
          </label>
          <input
            type="text"
            placeholder={t('compose.subjectPlaceholder')}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark text-text-primary-active-light dark:text-text-primary-active-dark outline-none focus:border-text-blue-default-light dark:focus:border-text-blue-default-dark"
          />
        </div>

        <div className="flex-1 flex flex-col">
          <label className="block text-sm font-medium text-text-secondary-active-light dark:text-text-secondary-active-dark mb-1">
            {t('compose.message')}
          </label>
          <textarea
            placeholder={t('compose.messagePlaceholder')}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="flex-1 w-full px-3 py-2 text-sm rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark text-text-primary-active-light dark:text-text-primary-active-dark outline-none focus:border-text-blue-default-light dark:focus:border-text-blue-default-dark resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate("/inbox")}
            className="px-4 py-2 text-sm font-medium rounded-lg text-text-secondary-active-light dark:text-text-secondary-active-dark bg-bg-fill-primary-default-light dark:bg-bg-fill-primary-default-dark hover:bg-bg-fill-primary-hover-light dark:hover:bg-bg-fill-primary-hover-dark transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            disabled={sending || !recipientEmail.trim() || !subject.trim() || !body.trim()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-text-blue-default-light dark:bg-text-blue-default-dark text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {sending ? t('compose.sending') : t('compose.send')}
            <ArrowRightIcon className="w-4 h-4 rtl:scale-x-[-1]" />
          </button>
        </div>
      </form>
    </div>
  );
}
