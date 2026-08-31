import { useState, useMemo } from "react";
import { useNavigate, useParams, useLocation, useOutletContext } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from 'react-i18next';
import { useError } from '../../../contexts/ErrorContext.jsx';
import { fetchInboxMessages, fetchSentMessages, deleteMessage, sendMessage } from "../../../api/messages";
import { ArrowRightIcon, TrashIcon, PaperPlaneIcon, EnvelopIcon, XIcon } from "../../../components/ui/icons";
import Button from "../../../components/ui/Button";
import TextArea from "../../../components/ui/TextArea";

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export default function MessageDetail() {
  const { t } = useTranslation('common');
  const { messageId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const outletContext = useOutletContext() || {};
  const user = outletContext.user;
  const currentUserId = user?.userId ?? null;
  const { showError } = useError();
  const queryClient = useQueryClient();
  const [showReply, setShowReply] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [sending, setSending] = useState(false);

  const threadFromState = useMemo(() => location.state?.thread, [location.state?.thread]);

  const { data: threads = [] } = useQuery({
    queryKey: ["inbox", currentUserId],
    queryFn: async () => {
      const [inboxData, sentData] = await Promise.all([
        fetchInboxMessages(),
        fetchSentMessages(),
      ]);
      const all = [...(Array.isArray(inboxData) ? inboxData : []), ...(Array.isArray(sentData) ? sentData : [])];
      const map = new Map();
      for (const t of all) {
        if (map.has(t.messageId)) {
          const existing = map.get(t.messageId);
          for (const r of t.replies || []) {
            if (!(existing.replies || []).some((er) => er.messageId === r.messageId)) {
              existing.replies = [...(existing.replies || []), r];
            }
          }
        } else {
          map.set(t.messageId, { ...t });
        }
      }
      return Array.from(map.values());
    },
    enabled: !!currentUserId,
    staleTime: 0,
  });

  const thread = useMemo(() => {
    const fromApi = threads.find((t) => String(t.messageId) === String(messageId)) || null;
    if (fromApi) return fromApi;
    return threadFromState || null;
  }, [threadFromState, threads, messageId]);

  const isSent = thread?.senderId === currentUserId;
  const personName = isSent
    ? thread?.recipientName || t('message.unknown')
    : thread?.senderName || t('message.unknown');
  const initials = getInitials(personName);

  const allReplies = thread?.replies || [];

  const sendMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      setShowReply(false);
      setReplyBody("");
      queryClient.invalidateQueries({ queryKey: ["inbox", currentUserId] });
    },
    onError: (err) => showError(err.message || t('message.sendFailed')),
  });

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyBody.trim() || !thread) return;
    const replyEmail = isSent ? thread?.recipientEmail : thread?.senderEmail;
    if (!replyEmail) { showError(t('message.cannotReply')); return; }
    setSending(true);
    sendMutation.mutate({
      recipientEmail: replyEmail,
      subject: thread.subject ? `Re: ${thread.subject}` : "",
      body: replyBody.trim(),
      parentMessageId: thread.messageId,
    }, { onSettled: () => setSending(false) });
  };

  const handleDelete = async () => {
    if (!thread) return;
    try {
      await deleteMessage(thread.messageId);
      queryClient.invalidateQueries({ queryKey: ["inbox", currentUserId] });
      navigate("/inbox");
    } catch (err) {
      showError(err.message || t('message.deleteFailed'));
    }
  };

  if (!thread) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-text-secondary-default-light dark:text-text-secondary-default-dark gap-3">
        <EnvelopIcon className="w-12 h-12 opacity-40" />
        <p className="text-sm">{t('message.notFound')}</p>
        <Button variant="secondary" onClick={() => navigate("/inbox")}>{t('message.backToInbox')}</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <button onClick={() => navigate("/inbox")} className="flex items-center gap-2 text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark hover:text-text-primary-active-light dark:hover:text-text-primary-active-dark transition-colors">
        <ArrowRightIcon className="w-4 h-4 rotate-180 rtl:scale-x-[-1]" />
        {t('message.backToInbox')}
      </button>

      <div className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark overflow-hidden">
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold bg-bg-fill-secondary-default-light dark:bg-bg-fill-secondary-default-dark">
                <span className="text-text-blue-default-light dark:text-text-blue-default-dark">{initials}</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-text-primary-active-light dark:text-text-primary-active-dark">{thread.subject || t('message.noSubject')}</h2>
                <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">
                  {isSent ? t('message.to') : t('message.from')}{personName} <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isSent ? "bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark text-text-accent-active-light dark:text-text-accent-active-dark" : "bg-bg-fill-secondary-default-light dark:bg-bg-fill-secondary-default-dark text-text-secondary-active-light dark:text-text-secondary-active-dark"}`}>{isSent ? t('message.sent') : t('message.received')}</span>
                </p>
                <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">{thread.sentAt || ""}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => setShowReply(!showReply)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark text-text-accent-active-light dark:text-text-accent-active-dark hover:opacity-85 transition-opacity">
                <ArrowRightIcon className="w-3 h-3 rotate-180 rtl:scale-x-[-1]" />
                {t('message.reply')}
              </button>
              <button onClick={handleDelete} className="p-1.5 rounded hover:bg-bg-fill-primary-hover-light dark:hover:bg-bg-fill-primary-hover-dark text-text-secondary-default-light dark:text-text-secondary-default-dark hover:text-red-500" title={t('delete')}>
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="border-t border-border-primary-default-light dark:border-border-primary-default-dark pt-4">
            <p className="text-sm text-text-primary-active-light dark:text-text-primary-active-dark whitespace-pre-wrap leading-relaxed">
              {thread.body || thread.preview || t('message.noContent')}
            </p>
          </div>

          {allReplies.length > 0 && (
            <div className="border-t border-border-primary-default-light dark:border-border-primary-default-dark pt-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('message.replies', { count: allReplies.length })}</h3>
              {allReplies.map((reply) => {
                const replyIsSent = reply.senderId === currentUserId;
                const replySenderName = reply.senderName || t('message.unknown');
                const replyName = replyIsSent ? t('message.you') : replySenderName;
                const replyInitials = getInitials(replyIsSent ? (user?.fullName || user?.name || t('message.you')) : replySenderName);
                return (
                  <div key={reply.messageId} className="flex items-start gap-3 p-3 rounded-lg bg-bg-fill-primary-default-light dark:bg-bg-fill-primary-default-dark">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-semibold bg-bg-fill-secondary-default-light dark:bg-bg-fill-secondary-default-dark shrink-0">
                      <span className="text-text-blue-default-light dark:text-text-blue-default-dark">{replyInitials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-text-secondary-active-light dark:text-text-secondary-active-dark">{replyName} <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${replyIsSent ? "bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark text-text-accent-active-light dark:text-text-accent-active-dark" : "bg-bg-fill-secondary-default-light dark:bg-bg-fill-secondary-default-dark text-text-secondary-active-light dark:text-text-secondary-active-dark"}`}>{replyIsSent ? t('message.sent') : t('message.received')}</span></span>
                        <span className="text-[10px] text-text-secondary-default-light dark:text-text-secondary-default-dark">{reply.sentAt || ""}</span>
                      </div>
                      <p className="text-sm text-text-primary-active-light dark:text-text-primary-active-dark mt-0.5">{reply.body || t('message.noContent')}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showReply && (
        <form onSubmit={handleReply} className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary-active-light dark:text-text-primary-active-dark">{t('message.reply')}</h3>
            <button type="button" onClick={() => { setShowReply(false); setReplyBody(""); }} className="p-1 rounded hover:bg-bg-fill-primary-hover-light dark:hover:bg-bg-fill-primary-hover-dark">
              <XIcon className="w-4 h-4 text-text-secondary-default-light dark:text-text-secondary-default-dark" />
            </button>
          </div>
          <TextArea
            minHeight={100}
            maxHeight={200}
            placeholder={t('message.replyPlaceholder')}
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark text-text-primary-active-light dark:text-text-primary-active-dark outline-none focus:border-text-blue-default-light dark:focus:border-text-blue-default-dark"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" type="button" onClick={() => { setShowReply(false); setReplyBody(""); }}>{t('cancel')}</Button>
            <Button variant="primary" type="submit" disabled={!replyBody.trim() || sending} loading={sending}>{t('message.sendReply')}</Button>
          </div>
        </form>
      )}
    </div>
  );
}
